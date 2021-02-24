
function signOut() {
    auth.signOut().then(() => {
        console.log('Signed Out')
    })
}

function changePage(p) {
    model.app.currentPage = p;
    updateView();
}



function logIn() {
    var email = model.inputs.inputEmail;
    var password = model.inputs.inputPassword;
    auth.signInWithEmailAndPassword(email, password)
        .then((userInfo) => {
            model.app.currentUser = userInfo.user;
            console.log('Logged in')
            model.app.currentPage = 'loggedIn'
            updateView()
        })
}

function createUser() {
    var email = model.inputs.inputEmail;
    var password = model.inputs.inputPassword;
    auth.createUserWithEmailAndPassword(email, password)
        .then((userInfo) => {
            db.collection('users').doc(userInfo.user.uid).set({
                email: userInfo.user.email,
                uid: userInfo.user.uid,
                chatsWith: {},
            })
        })
}

async function getAllUsers() {
    model.app.currentUser = firebase.auth().uid
    model.users = []
    var users = await db.collection('users').get()
    for (let user of users.docs) {
        model.users.push({
            uid: user.data().uid,
            email: user.data().email,
            chatsWith: user.data().chatsWith,
            profileImage: user.data().profileImage,
        })
    }
    updateView();
}


async function getMeetings() {
    model.meetings = [];
    db.collection('meetings').get()
    .then((meeting) => {
        meeting.forEach((meet) => {
            model.meetings.push({
                agenda: meet.data().agenda,
                timeStart: meet.data().timeStart.seconds,
                timeEnd: meet.data().timeEnd.seconds,
            })
        })
    })
}



//Nedenfor er det funksjoner for å hente frem chats.


// her lagrer jeg [uid]: chatId.
//altså uid er den jeg lagrer
//Når man henter chat id leter man etter sin egen påloggede id i andre users chatsWith.
//
function checkIfUserHasCorrespondingChatId(uid) {
    var chosenUserObject = {};
    db.collection('users').doc(uid).get()
        .then((doc) => {
            chosenUserObject = doc.data().chatsWith;
            storeAllUidsInArray(chosenUserObject, uid);
            
        })
    //sender videre i funksjon så man har asynkronitet
}

//Det finnes ett objekt men den går videre for det. Finn ut av dette.
//Jeg må lagre en chat id i chatswith (uiden jeg trykker på)
//Firestore update resetter verdien på objektet, enten så må jeg endre filsystemet eller lage en 
//funksjon som lagrer verdien fra før av og legger det til i ett nytt objekt som da lastes opp igjen.


// hentet ut chatsWith, nå må man gå igjennom denne og se om egen uid finnes i venstre siden av stringsa i objektet.
async function storeAllUidsInArray(chosenUserObject, clickedUid) {
    var objEmpty = checkIfObjectIsEmpty(chosenUserObject)
    var loggedInUserUid = await firebase.auth().currentUser.uid

    if (objEmpty) {
        console.log('Ingen ChatIds, lager en chatId')
        createChatIdAndStoreItWithBothUsers(loggedInUserUid, clickedUid)
    }
    

    var arrayOfUids = [];
    for (let uid in chosenUserObject) {
        arrayOfUids.push(uid);
    }
    for (let uid of arrayOfUids) {
        if (uid == loggedInUserUid) {
            openChatWithUid(chosenUserObject, loggedInUserUid, clickedUid)
            break;
        } else {
            createChatIdAndStoreItWithBothUsers(loggedInUserUid, clickedUid)
        }
    }
}

//Den må slutte å loope hvis den finner!!



//denne skal bare lage og lagre chatId hos begge users
//du må finne ut hvordan du skal lage chat og lagre, og skjekke ved å logge inn fra flere brukere.
function createChatIdAndStoreItWithBothUsers(loggedInUserUid, uid) {
    console.log('Lager en chat')
    db.collection('chats').add({
        users: [loggedInUserUid, uid],
        chat: {},
    })
    .then((doc) => {
        storeChatIdsInUserChatsWith(loggedInUserUid, uid, doc)
    })
}


//her lagrer man chatId dokumentets id
//lag en dynamisk funskjon som legger til en string uid - chatId i chatsWith objektet
//enklere å hente begge verdier på nytt også legge til inne i denne funksjonen
function storeChatIdsInUserChatsWith(loggedInUserUid, uid, doc) {

    var loggedInUserObj = {};
    var uidObj = {};
   db.collection('users').doc(loggedInUserUid).get().then((user) => {
       loggedInUserObj = user.data().chatsWith;
       loggedInUserObj[uid] = doc.id;
       db.collection('users').doc(loggedInUserUid).set({
           chatsWith: loggedInUserObj,
           email: user.data().email,
           uid: user.data().uid
       })
   })
   db.collection('users').doc(uid).get().then((user) => {
       uidObj = user.data().chatsWith
       uidObj[loggedInUserUid] = doc.id
       db.collection('users').doc(uid).set({
        chatsWith: uidObj,
        email: user.data().email,
        uid: user.data().uid
       })
   })
    
}



//denne finner fram chatId
//Denne fungerer fra flere brukere!!!
function openChatWithUid(array, loggedInUserUid, clickedUid) {
    var chatId = '';
    for (let currentUid in array) {
        if (currentUid == loggedInUserUid) {
            chatId = array[currentUid]
        }
    }
    listenToChat(chatId, clickedUid)
    console.log(`Henter chat id: ${chatId}` )
}


function checkIfObjectIsEmpty(obj) {
    return Object.keys(obj).length === 0;
}


function openOrCloseChat() {
    if (model.app.chatOpen == true) {
        model.app.chatOpen = false 
        model.chat = [];
        model.app.currentChatReciever = '';
    } else {
        model.app.chatOpen = true
    }

    
    updateView();
}



function listenToChat(chatId, clickedUid) {
    model.app.currentChatReciever = clickedUid
    model.app.currentChat = chatId;
    db.collection('chats').doc(chatId).collection('messages').orderBy('sent')
    .onSnapshot((querySnapshot) => {
        model.chat = [];
        querySnapshot.forEach((doc) => {
            model.chat.push({
                from: doc.data().from,
                messageTxt: doc.data().messageTxt,
                sent: doc.data().sent,
            })
        })
        updateView();
    })
    
}

function detachListener() {
    console.log('Unsubscribing from chat')
    var unsubscribe = db.collection('chats').onSnapshot()
    unsubscribe();
}

function sendMessage() {
    
    var time = firebase.firestore.Timestamp.fromDate(new Date());
    var message = model.inputs.inputMessage;
    db.collection('chats').doc(model.app.currentChat).collection('messages').add({
        from: model.app.currentUser,
        messageTxt: message,
        sent: time,
    })
    console.log(message)
}