// hide loading page
$('#loadingPanel').hide();


/**
 * Shows/hide password
 */
function toggleVisibility() {
    let password = document.getElementById('password');
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    document.getElementById('eye').src = type === 'text' ? 'src/eye_closed.png' : 'src/eye.png';
}

/**
 * Sends a request to ClassMood app server to validate user identity
 * if user is registered, it will be redirected to user's home screen
 */
function logIn() {
    let email = document.getElementById('email').value.trim();
    let password = document.getElementById('password').value.trim();
    // if fields are not filled
    if (email === '' || password === '') {
        document.getElementById('validationError').innerHTML = 'Llena ambos campos para poder iniciar sesion';
        return null;
    }
    // if email is not empty, add the UAO domain if it doesnt have it
    if (email.match(/@uao.edu.co/) === null) {
        email += '@uao.edu.co';
    }
    $('#loadingPanel').show()
    const url = 'https://classmood-appserver.herokuapp.com/login';
    $.get(url, { email, password, encrypt: true }, (response) => {
        // if password is incorrect
        if (response.error === 'wrong password') {
            $('#loadingPanel').hide()
            document.getElementById('validationError').innerHTML = 'La contraseña que ingresaste es incorrecta. Inténtalo de nuevo';
            return null;
        }
        // if user is not registered
        if (response.error === 'user not found') {
            $('#loadingPanel').hide()
            document.getElementById('validationError').innerHTML = 'El usuario que ingresaste no está registrado. Inténtalo de nuevo';
            return null;
        }
        // there's no errors
        sessionStorage.setItem('user', JSON.stringify(response.student));
        eel.read_conf()((conf) => {
            conf.user.email = email;
            conf.user.password = response.student.Contrasena;
            conf.user.code = response.student.Codigo;
            // save configuration in session storage
            sessionStorage.setItem('conf', JSON.stringify(conf));
            eel.save_conf(conf)(_ => {
                window.location.href = 'index.html';
            });
        })
    }).fail(() => {
        // sever doesn't respond
        document.getElementById('validationError').innerHTML = 'Error de conexión. Inténtalo más tarde';
    });
}

// press enter to login when filling email field
$('#email').keyup((event) => {
    if (event.keyCode == 13) {
        $('#logInButton').click();
    }
})

// press enter to login when filling password field
$('#password').keyup((event) => {
    if (event.keyCode == 13) {
        $('#logInButton').click()
    }
})

