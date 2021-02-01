let user = JSON.parse(sessionStorage.getItem("user"));
//setear el nombre del usuario en el menu lateral
document.getElementById("userName").innerHTML = user.Nombre+' '+user.Apellido;

function logOut(){
    sessionStorage.removeItem("user");
    eel.readConf()(conf =>{
        conf.user.email = "";
        conf.user.password = "";
        conf.user.code = "";
        eel.saveConf(conf)(_=>{
            location.href = "LogIn.html"
        })
    })
}

