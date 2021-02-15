
function logIn(){
    let email = document.getElementById("email").value
    let password = document.getElementById("password").value
    //si no ingresa los datos
    if(email === "" || password === "") return document.getElementById("validationError").innerHTML = "Llena ambos campos para poder iniciar sesion";
    //mostrar pantalla de carga
    toggleLoadingPage(true);
    const url = 'https://classmood-appserver.herokuapp.com/login'
    $.get(url, {Correo: email, Contrasena: password, Type: 'normal'}, (data)=>{
        
        //si la contraseña es incorrecta
        if(data === "wrong password"){
            //ocultar pantalla de carga
            toggleLoadingPage(false)
            return  document.getElementById("validationError").innerHTML = "La contraseña que ingresaste es incorrecta. Inténtalo de nuevo";
        } 
        //si el usuario no esta registrado
        if(data === "no found"){
            //ocultar pantalla de carga
            toggleLoadingPage(false)
            return document.getElementById("validationError").innerHTML = "El usuario que ingresaste no está registrado. Inténtalo de nuevo";
        } 
        //si no hay errores
        sessionStorage.setItem("user", JSON.stringify(data));
        eel.readConf()((conf)=>{
            conf.user.email = email;
            conf.user.password = data.Contrasena;
            conf.user.code = data.Codigo;
            //guardar configuracion en variables de sesion
            sessionStorage.setItem('conf', JSON.stringify(conf));
            eel.saveConf(conf)(_=>{
                window.location.href = "index.html";
            });
        })
    }).fail(_=>{
        //si el servidor no responde
        document.getElementById("validationError").innerHTML = "Error de conexión. Inténtalo más tarde";
    });
}

//evento al presionar enter
$("#email").keyup((event)=>{
    if(event.keyCode == 13) $('#logInButton').click()
})
$("#password").keyup((event)=>{
    if(event.keyCode == 13) $('#logInButton').click()
})

/**
 * funcion para mostrar/ocultar el panel de carga
 * @param {bool} bool si es true se muestra la pantalla, de lo contrario se oculta
 */
function toggleLoadingPage(bool){
    document.getElementById('loadingPanel').style.display = bool? "flex": "none";
}