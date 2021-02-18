updateView();
function updateView() {
    html = '';
    if (model.app.currentPage == 'logIn') {html = logInView()}
    if (model.app.currentPage == 'createUser') {html = createUserView()}
    if (model.app.currentPage == 'chat') {html = chatView()}
    document.getElementById('app').innerHTML = html;
}


function logInView() {
    let html = '';
    html += `
    <div class="logInInputs">
    Email<input oninput="model.inputs.inputEmail = this.value"></input>
    Password<input oninput="model.inputs.inputPassword = this.value"></input>
    </div>
    <button onclick="logIn()">Log In</button>
    <hr>
    <button onclick="changePage('createUser')">Create User</button>
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
    getAllUsers()
    let html = ''; 
    html += `
    <div></div>
    `;
}