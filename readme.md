Firestore med autentication

lage modell og firestore [Done]
lage liste med alle users [Done]
skjekke om det finnes en chat []
kunne lage en chat om den ikke finnes []
åpne og høre på realtime på chatten som er valgt []
få det til å se pent ut []
Lage resten av siden,  alla intern person database []
forskjellige views med hoved updateView []

lage promises som resolver med informasjon??



hente alle users og lage en index, kan ikke hente alle users uten å bruke admin sdk, som er node server basert.

dataoppsett firestore:
users -> user.doc ->    email
                        uid
                        chatsWith -> otherUserUid -> chat doc.id

chats -> doc.id ->      users -> user1, user2
                        message1 -> from: user uid
                                    message: 'Hei'
                        message2 -> from: otherUser uid
                                    message: 'Halla'


onLoad:
    getAllUsers:
    admin auth()
    db.collection('users').doc(auth.uid).add()
    .then((doc) => {
    db.collection('users').doc(doc.id)update({
        uid: auth.id
        email: auth.email
        chatsWith: {},
    })
        chatswith er ett objekt med string otherUserUid: chat.doc.id
        (kanskje når man henter at queryer firestore hvor chosenUid != ''?)


login:
    onAuthStateChanged -> bytte vindu(enten chat eller en landingsside)
    if (user) {
        updateView()
    }



openChat(chosenUid):
    lete igjennom users -> user.doc -> chatsWith -> chosenUid -> chat doc.id
    if (chatsWith !include(chosenUid) { createChatId(chosenUid)}
    else {
        onssnapshot(currentUid.chatsWith.chosenUid -> doc.id)
        populate chat with onSnapshot
    }



createChatId(chosenUid):
    currentUid = firebase.auth.currentUser
    db.collection('chats').add()
    .then(() => {
        storeChatId([doc.id], [chosenUid], [currentUid])
    })

                      
storeChatId([doc.id], [chosenUid], [currentUid]):

    db.collection('chats').doc([doc.id]).update({
        message1: ''
        users: chosenUid, currentUid
    })

    db.collection('users').doc([chosenUid].doc.id).update({
        chatsWith: [currentUid]: [doc.id]
    })

    db.collection('users').doc([currentUid].doc.id).update({
        chatsWith: [chosenUid]: [doc.id]
    })