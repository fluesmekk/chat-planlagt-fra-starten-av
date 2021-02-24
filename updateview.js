firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        getMeetings()
        getAllUsers()
        model.app.currentUser = user.uid;
        model.app.currentPage = 'loggedIn'
    } else {
        model.app.currentPage = 'logIn'
        updateView()
        
    }
})

function updateView() {
    html = '';
    if (model.app.currentPage == 'logIn') { html = logInView() }
    if (model.app.currentPage == 'createUser') { html = createUserView() }
    if (model.app.currentPage == 'loggedIn') { html = chatView() }
    document.getElementById('app').innerHTML = html;
    
    var scrollBar = document.querySelector('.currentChat');
    scrollBar.scrollTop = scrollBar.scrollHeight - scrollBar.clientHeight;
}


function logInView() {
    let html = '';
    html += `
    <div class="background">
        <div class="logInInputs">
        Email<input oninput="model.inputs.inputEmail = this.value"></input>
        Password<input oninput="model.inputs.inputPassword = this.value"></input>
        <br>
        <button onclick="logIn()">Log In</button>
        <br>
        <button onclick="changePage('createUser')">Create User</button>
        </div>
    </div>
    `;


    return html;
}

function createUserView() {
    let html = '';
    html += `
    <div class="logInInputs">
    Email<input oninput="model.inputs.inputEmail = this.value"></input>
    Password<input oninput="model.inputs.inputPassword = this.value"></input>
    </div>
    <button onclick="createUser()">Create User</button>
    
    `;
    return html;
}



function chatView() {
    var userList = '';
    let html = '';
    for (let i = 0; i < model.users.length; i++) {
        if (model.users[i].uid != firebase.auth().currentUser.uid) {
            if (i % 2 == 1) {
                userList += `
                <div class="roundNumber chatPerson" onclick="checkIfUserHasCorrespondingChatId('${model.users[i].uid}')">${returnNameFromEmail(model.users[i].email)}</div>
                `;
            } else {
                userList += `
                <div class="nonRoundNumber chatPerson" onclick="checkIfUserHasCorrespondingChatId('${model.users[i].uid}')">${returnNameFromEmail(model.users[i].email)}</div>
                `;
            }
            
        }

    }
    
    html += `
    ${createNavBar() || ''}
    <div class="chat" style="${model.app.currentChatReciever == '' ? '' : 'transform:translate(-10.5%)'}">
    <div class="chatTalkingTo">${returnEmailAdress(model.app.currentChatReciever) || ''}${model.app.currentChatReciever ? '<button class="button" onclick="openOrCloseChat(); detachListener()">x</button>' : ''}</div>
    ${createCurrentChat() || ''}
    <div class="chatBar" style="${model.app.currentChatReciever ? 'display:none' : ''}">
    <div class="openChatButton" ${model.app.chatOpen ? 'onclick="openOrCloseChat(); detachListener();"' : 'onclick="openOrCloseChat()"'}>${model.app.chatOpen ? 'Lukk Chat' : 'Åpne Chat'}</div>
    <div class="${model.app.chatOpen ? 'visible' : 'hidden'}">
    
    ${userList || ''}
    
    </div>
    </div>
    </div>
    `;
    return html;
    // document.getElementById('app').innerHTML = html;

}

function createCurrentChat() {


    let html = '';
    let innerHtml = '';
    let inputHtml = '';
    for (let i = 0; i < model.chat.length; i++) {
        if (model.chat[i].from == model.app.currentUser) {
            innerHtml += `<form class="messageFromCurrentUser messageTxt"><div class="messageFromSelf">${model.chat[i].messageTxt}</div></form>`;  
        } else {
            innerHtml += `<div class="messageFromOtherUser messageTxt"><div class="messageFromOther">${model.chat[i].messageTxt}</div></div>`
        }
        
    }
    
        inputHtml = `<div class="inputChatAndButton"><input size="24" oninput="model.inputs.inputMessage = this.value"><button onclick="sendMessage()"><</button></div>`
  

 
    html = `<div style="${model.app.currentChatReciever ? 'display:block' : 'display:none'}" class="currentChat">${innerHtml}
            ${inputHtml}
            </div>`
    
    return html;
}

function infoForToday() {
    var meetingHtml = '';
    for (let i = 0; i < model.meetings.length; i++) {
        meetingHtml += `<div class="meetingInfo">${model.meetings[i].agenda} ${getDateAndTime(model.meetings[i].timeEnd)}</div>`
    }
    let html = '';
    html += `
    <div class="centerPage">
        <div class="meetingsForTheDay centerPageItem">
            Møter
            <div class="centerInfoBlock">
            ${meetingHtml}
            </div>
        </div>
        <div class="wineLotto centerPageItem">
            Vin-Lotteri
            <div class="centerInfoBlock">
            Vi trekker på fredag kl 12.00
            </div>
        </div>
        <div class="teamBulletinForTheDay centerPageItem">
            Team-bulletin
            <div class="centerInfoBlock">
            Vi skal vise frem første utkast av Appen på tirsdag.
            </div>
        </div>
        <div class="centerPageItem">
            123
            <div class="centerInfoBlock">
            </div>
        </div>
    </div>
    `;
    return html;
}

function createNavBar() {
    let html = ``;
    html = `
    <div class="navbar">
                <div class="navbarElements">
                    <img width="40" src="https://img.pngio.com/logo-business-png-free-logo-businesspng-transparent-images-business-logo-png-900_760.png">
                    <div class="navElement">Hjem</div>
                    <div class="navElement">Møter</div>

                </div>
        </div>
    <div class="mainpage">
        <div class="navbarHorizontal">
            <div class="userInfo">Hei, ${returnEmailAdress(model.app.currentUser)} <img width="23" src="${findProfilePicture(model.app.currentUser)}"></div>
        </div>
        ${infoForToday()}
    </div>
    `
    return html;
}