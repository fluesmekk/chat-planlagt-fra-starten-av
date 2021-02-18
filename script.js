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
}

function getAllUsers() {
    
}