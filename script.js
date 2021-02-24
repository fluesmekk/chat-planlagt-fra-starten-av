function returnNameFromEmail(email) {
    var splitArray = email.split(/[@]/g)
    var name = splitArray[0];
    const nameCapitalized = name.charAt(0).toUpperCase() + name.slice(1)
    return nameCapitalized;
}

function returnEmailAdress(uid) {
    for (let i = 0; i < model.users.length; i++) {
        if (model.users[i].uid == uid) {
            return returnNameFromEmail(model.users[i].email)
        }
    }
}

function findProfilePicture(uid) {
    for (let i = 0; i < model.users.length; i++) {
        if (model.users[i].uid == uid) {
            return model.users[i].profileImage
        }
    }
}

function getDateAndTime(dateString) {
    var date = new Date(dateString * 1000).toLocaleDateString();
    var time = new Date(dateString * 1000).toLocaleTimeString()
    return `${date} ${time}`;
}
