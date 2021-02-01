//obtener el usuario
let user = JSON.parse(sessionStorage.getItem("user"));
//setear el nombre del usuario en el menu lateral
document.getElementById("userName").innerHTML = user.Nombre+' '+user.Apellido;
//obtener la sesión actual (si existe)
let url = 'http://localhost:3000/available';
$.get(url, { Correo: user.Correo }, (data)=>{
    if(data.length === 0){
        document.getElementById("mainContainer").innerHTML = `
        <div class="o-nosession-content">
            <span>No hay sesiones disponibles</span>
            <img src="src/NoSession.svg" alt="NoSession">
        </div>`;
    }
    else{
        $('#mainContainer').load('deteccion.html', _=>{
            //insertar informacion de la sesion
            let session = data[0];
            document.getElementById("titleDetection").innerHTML = session.NombreCurso;
            document.getElementById("groupDetection").innerHTML = `Grupo ${session.NumeroGrupo}`;
            let horaInicio = new Date(session.HoraInicio);
            let horaFinal = new Date(session.HoraFinal);
            console.log(horaInicio)
            document.getElementById("currentSessionStartTime").innerHTML = `${horaInicio.getHours() % 12 || 12}:${horaInicio.getMinutes().toString().padStart(2, '0')} ${horaInicio.getHours()> 12? 'PM': 'AM'}`;
            document.getElementById("currentSessionEndTime").innerHTML = `${horaFinal.getHours() % 12 || 12}:${horaFinal.getMinutes().toString().padStart(2, '0')} ${horaFinal.getHours()> 12? 'PM': 'AM'}`;
        })
        
    }
})


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

