//obtener el usuario
let user = JSON.parse(sessionStorage.getItem("user"));
//setear el nombre del usuario en el menu lateral
document.getElementById("userName").innerHTML = user.Nombre+' '+user.Apellido;
//obtener la sesión actual (si existe)
let url = 'http://localhost:3000/';
$.get(url + 'available', { Correo: user.Correo }, (data)=>{
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
            document.getElementById("currentSessionStartTime").innerHTML = timeFormatter(new Date(session.HoraInicio));
            document.getElementById("currentSessionEndTime").innerHTML = timeFormatter(new Date(session.HoraFinal));
        })
        
    }
});
//obtener las proximas sesiones
$.get(url + 'upcoming', { Correo: user.Correo }, (data)=>{
    if(data.length === 0){
        $("#nextSessionsContainer").append('<span class="o-no-next-sessions">No hay sesiones agendadas</span>')
    }
    else{
        console.log(typeof data[0].HoraInicio)
        for(session of data){
            $("#nextSessionsContainer").append(`
                <div class="o-session">
                    <div class="o-session-header">
                        <span class="o-session-title" id="sessionGroupName">${session.NombreCurso}</span>
                        <span class="o-session-group" id="sessionGroupNumber">Grupo ${session.NumeroGrupo}</span>
                    </div>
                    <div class="o-session-time">
                        <span>Inicio:&nbsp;<span id="sessionStartTime">${timeFormatter(new Date(session.HoraInicio))}</span></span>
                        <span>Fin:&nbsp;<span id="sessioneNDTime">${timeFormatter(new Date(session.HoraFinal))}</span></span>
                    </div>
                </div>
            `)
        }
    }
})

function timeFormatter(time){
    return `${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')} ${time.getHours()> 12? 'PM': 'AM'}`
}

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
var cameraState=true
var microState=true
function camera(){

    if(cameraState) {
        document.getElementById('camera-icon').src= './src/NoCamera.png'
        cameraState=false
    }
    else{
        document.getElementById('camera-icon').src= './src/Camera.png'
        cameraState=true
    }
}
function micro(){

    if(microState) {
        document.getElementById('micro-icon').src= './src/NoMicrophone.png'
        microState=false
    }
    else{
        document.getElementById('micro-icon').src= './src/Microphone.png'
        microState=true
    }
}
