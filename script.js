
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

function getAllUsers() {
    model.users = []
    db.collection('users').get()
        .then((user) => {
            user.forEach((doc) => {
                model.users.push({
                    uid: doc.data().uid,
                    email: doc.data().email,
                    chatsWith: doc.data().chatsWith,
                })
            })
        })
}



// her lagrer jeg [uid]: chatId.
//altså uid er den jeg lagrer
//Når man henter chat id leter man etter sin egen påloggede id i andre users chatsWith.
//
function checkIfUserHasCorrespondingChatId(uid) {
    console.log(`Dette er den du er logget inn med ${firebase.auth().currentUser.uid}
                 
    Dette er den du trykket på ${uid}`)
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
            console.log('Det finnes en chatId')
            openChatWithUid(chosenUserObject, loggedInUserUid)
            break;
        } else {
            console.log('Objektet har ikke id du leter etter')
            createChatIdAndStoreItWithBothUsers(loggedInUserUid, clickedUid)
        }
    }
}

//Den må slutte å loope hvis den finner!!



//denne skal bare lage og lagre chatId hos begge users
//du må finne ut hvordan du skal lage chat og lagre, og skjekke ved å logge inn fra flere brukere.
function createChatIdAndStoreItWithBothUsers(loggedInUserUid, uid) {
    console.log(loggedInUserUid, uid)
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

    console.log(uid)
    var loggedInUserObj = {};
    var uidObj = {};
   db.collection('users').doc(loggedInUserUid).get().then((user) => {
       loggedInUserObj = user.data().chatsWith;
       loggedInUserObj[uid] = doc.id;
       console.log(loggedInUserObj)
       db.collection('users').doc(loggedInUserUid).set({
           chatsWith: loggedInUserObj,
           email: user.data().email,
           uid: user.data().uid
       })
   })
   db.collection('users').doc(uid).get().then((user) => {
       uidObj = user.data().chatsWith
       uidObj[loggedInUserUid] = doc.id
       console.log(uidObj)
       db.collection('users').doc(uid).set({
        chatsWith: uidObj,
        email: user.data().email,
        uid: user.data().uid
       })
   })
    
}



//denne finner fram chatId
//Denne fungerer fra flere brukere!!!
function openChatWithUid(array, loggedInUserUid) {
    var chatId = '';
    for (let currentUid in array) {
        if (currentUid == loggedInUserUid) {
            chatId = array[currentUid]
        }
    }
    console.log(`Dette er chatIden du prøver å hente frem ${chatId}` )
}


function checkIfObjectIsEmpty(obj) {
    return Object.keys(obj).length === 0;
}