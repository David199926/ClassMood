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
// cambiar la imagen de la camara al activar/desactivar
function camera(){
    var cameraControl = document.getElementById('cameraControl');
    let state = !JSON.parse(cameraControl.dataset.state)
    //setear imagen
    document.getElementById("cameraIcon").src = state? './src/Camera.png' : './src/NoCamera.png';
    document.getElementById("cameraText").innerHTML = state? "Desactivar" : "Activar";
    cameraControl.dataset.state = state
}
// cambiar la imagen del microno al activar/desactivar
function micro(){
    var microControl = document.getElementById('microControl');
    let state = !JSON.parse(microControl.dataset.state)
    //setear imagen
    document.getElementById("microIcon").src = state? './src/Microphone.png' : './src/NoMicrophone.png';
    document.getElementById("microText").innerHTML = state? "Silenciar" : "Activar";
    microControl.dataset.state = state
    
}
// cambiar la imagen de la emocion al activar/desactivar
function emotion(){
    var emotionControl = document.getElementById('emotionControl');
    let state = !JSON.parse(emotionControl.dataset.state)
    //setear imagen
    document.getElementById("emotionIcon").src = state? './src/Emotions.png' : './src/NoEmotions.png';
    emotionControl.dataset.state = state
}
// obtener los dispositivos
function getDevices(){
    audioOptions = document.getElementById("MdevicesContainer");
    videoOptions = document.getElementById("CdevicesContainer");
    
    navigator.mediaDevices.enumerateDevices().then(function(devices){
        devices.forEach((device)=>{
            let label = device.label
            if (device.kind === "audioinput"){
                option = document.createElement("div");
                // se crea el contenedor del texto y el chulo
                option.setAttribute('id',device.deviceId)
                option.setAttribute('class','o-select-option')
                option.setAttribute('data-id',device.deviceId)
                option.setAttribute('onclick',"selectOption('"+device.deviceId+"','micro')")
                // se crea el texto
                text = document.createElement('span')
                text.setAttribute('id','selectOptionText')
                text.setAttribute('class','o-select-option-Text')
                text.innerHTML = label;
                // se crea y se oculta el chulo por defecto
                img= document.createElement('img')
                img.setAttribute('src','./src/Chulo.png')
                img.setAttribute('class','o-chulo-device')
                img.setAttribute('id','chulo'+device.deviceId)
                img.setAttribute('hidden',true)
                // se agregan el texto mas el chulo al contendor
                option.append(text)
                option.append(img)
                // se agrega el contendor al select de opciones
                audioOptions.append(option)
            }else if(device.kind === "videoinput"){
                label = label.split("(")[0].trim() //only device name
                // se crea el contenedor del chulo y el texto
                option = document.createElement("div");
                option.setAttribute('id',device.deviceId)
                option.setAttribute('class','o-selectC-option')
                option.setAttribute('data-id',device.deviceId)
                // se crea el texto
                text = document.createElement('span')
                text.setAttribute('id','selectOptionText')
                text.setAttribute('class','o-select-option-Text')
                text.innerHTML = label;
                option.setAttribute('onclick',"selectOption('"+device.deviceId+"','camera')")
                // se agrega la imagen del chulo y se esconde por defecto
                img= document.createElement('img')
                img.setAttribute('src','./src/Chulo.png')
                img.setAttribute('class','o-chulo-device')
                img.setAttribute('id','chulo'+device.deviceId)
                img.setAttribute('hidden',true)
                // se agregan el chulo mas el texto al contenedor
                option.append(text)
                option.append(img)
                // se agrega el contendor al select de opciones
                videoOptions.append(option)
            }
        })
    }).catch(function(err) {
        console.log(err.name + ": " + err.message);
      });
}

// mostrar el menú de opciones de los dispositivos de microfono
function displayMicroDevices(){
    var MdevicesControl = document.getElementById('dispMicro')
    let state = !JSON.parse(MdevicesControl.dataset.state)
    document.getElementById('MdevicesContainer').hidden= state ? true:false;  
    MdevicesControl.dataset.state=state       
    
}
// mostrar el menú de opciones de los dispositivos de camara
function displayCameraDevices(){
    var CdevicesControl = document.getElementById('dispCamera')
    let state = !JSON.parse(CdevicesControl.dataset.state)
    document.getElementById('CdevicesContainer').hidden= state ? true:false;
    CdevicesControl.dataset.state=state          
}
// funcion para mantener seleccionada la opcion
function selectOption(id,type){
    if (type === "micro") {
        // se esconden todos los fondos
        let elements = document.getElementsByClassName('o-select-option')
        for(el of elements){el.style.backgroundColor='#1F1F1F';el.style.color='#8A8A8A'}
        // se esconden todos los chulos
        let img = document.getElementsByClassName('o-chulo-device')
        for(im of img){im.hidden=true}
        // se obtienes la opcion escogida y su chulo
        let option = document.getElementById(id)
        let imgOption= document.getElementById('chulo'+id)
        // se pintan el fondo, la letra y el chulo se hace visible
        imgOption.hidden=false
        option.style.backgroundColor = '#2E8AE5'
        option.style.color = 'white'
    }else if(type === "camera"){
        // se esconden todos los fondos
        let elements = document.getElementsByClassName('o-selectC-option')
        for(el of elements){el.style.backgroundColor='#1F1F1F';el.style.color='#8A8A8A'}
        // se esconden todos los chulos
        let img = document.getElementsByClassName('o-chulo-device')
        for(im of img){im.hidden=true}
        // se obtienes la opcion escogida y su chulo
        let option = document.getElementById(id)
        let imgOption= document.getElementById('chulo'+id)
        // se pintan el fondo, la letra y el chulo se hace visible
        imgOption.hidden=false
        option.style.backgroundColor = '#2E8AE5'
        option.style.color = 'white'
    }
}