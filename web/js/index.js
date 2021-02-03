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
            getDevices()
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

function camera(){
    var cameraControl = document.getElementById('cameraControl');
    let state = !JSON.parse(cameraControl.dataset.state)
    //setear imagen
    document.getElementById("cameraIcon").src = state? './src/Camera.png' : './src/NoCamera.png';
    document.getElementById("cameraText").innerHTML = state? "Desactivar" : "Activar";
    cameraControl.dataset.state = state
}

function micro(){
    var microControl = document.getElementById('microControl');
    let state = !JSON.parse(microControl.dataset.state)
    //setear imagen
    document.getElementById("microIcon").src = state? './src/Microphone.png' : './src/NoMicrophone.png';
    document.getElementById("microText").innerHTML = state? "Silenciar" : "Activar";
    microControl.dataset.state = state
    
}

function emotion(){
    var emotionControl = document.getElementById('emotionControl');
    let state = !JSON.parse(emotionControl.dataset.state)
    //setear imagen
    document.getElementById("emotionIcon").src = state? './src/Emotions.png' : './src/NoEmotions.png';
    emotionControl.dataset.state = state
}

function getDevices(){
    audioOptions = document.getElementById("MdevicesContainer");
    videoOptions = document.getElementById("CdevicesContainer");
    
    navigator.mediaDevices.enumerateDevices().then(function(devices){
        devices.forEach((device)=>{
            let label = device.label
            if (device.kind === "audioinput"){
                option = document.createElement("div");
                option.setAttribute('id','selectOption')
                option.setAttribute('class','o-select-option')
                text = document.createElement('span')
                text.setAttribute('id','selectOptionText')
                text.setAttribute('class','o-select-option-Text')
                text.innerHTML = label;
                option.value = device.deviceId
                option.append(text)
                audioOptions.append(option)
            }else if(device.kind === "videoinput"){
                label = label.split("(")[0].trim() //only device name
                option = document.createElement("div");
                option.setAttribute('id','selectCameraOption')
                option.setAttribute('class','o-select-option')
                text = document.createElement('span')
                text.setAttribute('id','selectOptionText')
                text.setAttribute('class','o-select-option-Text')
                text.innerHTML = label;
                option.value = device.deviceId
                option.append(text)
                videoOptions.append(option)
            }
        })
    }).catch(function(err) {
        console.log(err.name + ": " + err.message);
      });
}

function displayMicroDevices(){
    var MdevicesControl = document.getElementById('dispMicro')
    let state = !JSON.parse(MdevicesControl.dataset.state)
    document.getElementById('MdevicesContainer').hidden= state ? true:false;          
    MdevicesControl.dataset.state=state
}
function displayCameraDevices(){
    var CdevicesControl = document.getElementById('dispCamera')
    let state = !JSON.parse(CdevicesControl.dataset.state)
    document.getElementById('CdevicesContainer').hidden= state ? true:false;          
    CdevicesControl.dataset.state=state
}