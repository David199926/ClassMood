//obtener el usuario
let user = JSON.parse(sessionStorage.getItem("user"));
//setear el nombre del usuario en el menu lateral
document.getElementById("userName").innerHTML = user.Nombre+' '+user.Apellido;
//obtener la sesión actual (si existe)
let url = 'https://classmood-appserver.herokuapp.com/';
$.get(url + 'available', { Correo: user.Correo }, (data)=>{
    if(data.length === 0){
        document.getElementById("mainContainer").innerHTML = `
        <div class="o-nosession-content">
            <span>No hay sesiones disponibles</span>
            <img src="./src/NoSession.png" alt="NoSession">
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
//funcion para dar formato a los objetos Date
function timeFormatter(time){
    return `${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')} ${time.getHours()> 12? 'PM': 'AM'}`
}

//función para cerrar sesión
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

//funcion para activar/desactivar camara
function camera(){
    var cameraControl = document.getElementById('cameraControl');
    let state = !JSON.parse(cameraControl.dataset.state);
    if(state){
        eel.run();
        document.getElementById("cameraIcon").src = './src/Camera.png';
        document.getElementById("cameraText").innerHTML = "Desactivar";
        cameraControl.dataset.state = state;
    }
    else{
        eel.stop()(_=>{
            document.getElementById("cameraIcon").src = './src/NoCamera.png';
            document.getElementById("cameraText").innerHTML = "Activar";
            cameraControl.dataset.state = state;
            cleanVideoPlaceHolder();
            
        })
    }
}

//funcion para activar/desactivar micrófono
function micro(){
    var microControl = document.getElementById('microControl');
    let state = !JSON.parse(microControl.dataset.state);
    //setear imagen
    document.getElementById("microIcon").src = state? './src/Microphone.png' : './src/NoMicrophone.png';
    document.getElementById("microText").innerHTML = state? "Silenciar" : "Activar";
    microControl.dataset.state = state;
    
}

//funcion para el boton de mostrar/ocultar emociones detectadas
function emotion(){
    var emotionControl = document.getElementById('emotionControl');
    let state = !JSON.parse(emotionControl.dataset.state)
    //setear imagen
    document.getElementById("emotionIcon").src = state? './src/Emotions.png' : './src/NoEmotions.png';
    emotionControl.dataset.state = state
}

//funcion del boton de comenzar/terminar captura de emociones
function detectionEvent(caller){
    let state = caller.dataset.state === "stopped"? "started": "stopped";
    if(state === "started"){
        eel.run()
        caller.innerHTML = "Terminar";
        caller.dataset.state = state;
    }
    else if(state === "stopped"){
        eel.stop()(_=>{
            caller.innerHTML = "Comenzar";
            caller.dataset.state = state;
            cleanVideoPlaceHolder();
        })
    } 
    else throw Error;
}

//funcion para limpiar el contenedor de video
function cleanVideoPlaceHolder(){
    document.getElementById('videoCapture').src = "./src/dummy.png"
}

//funcion llamada por python para mostrar captura de video
eel.expose(transmitVideo);
function transmitVideo(blob){
    document.getElementById('videoCapture').src = "data:image/jpeg;base64," + blob
}