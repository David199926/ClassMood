//imagenes de las emociones
const emotionImgs = ['enojado.png', 'disgusto.png', 'miedo.png', 'feliz.png', 'triste.png', 'sorpresa.png', 'neutral.png'];

/**
 * evento para cerrar menus de duspositivos al hacer clicl fuera
 */
$(document).click(function(event){
    let target = $(event.target);
    if(!target.closest('#dispCamera').length && !target.closest('#dispMicro').length){
        hideDevices();
    }
})

/**
 * evento para re pintar los dispositivos cuando hay un cambio
 */
navigator.mediaDevices.ondevicechange = function(event){
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        paintDevices(devices);
    })
}

/**
 * funcion para activar/desactivar transmision de video
 * @param {HTMLElement} cameraControl
 */
function camera(cameraControl) {
    let state = !JSON.parse(cameraControl.dataset.state);
    let started = document.getElementById('detectionController').dataset.state === "started";    
    if(state){
        changeCameraControl(cameraControl, state);
        eel.startTransmition(started)
    }
    else{
        eel.stopTransmition()(_=>{
            cleanVideoPlaceHolder();
            changeCameraControl(cameraControl, state);
        })
    }

}

/**
 * 
 * @param {HTMLElement} microControl 
 * 
 */
function microphone(microControl){
    let state = !JSON.parse(microControl.dataset.state);
    let started = document.getElementById('detectionController').dataset.state === "started";
    if(state){
       micro(microControl,state)
     
   
    }
   }
   

/**
 * funcion para cambiar la apariencia del control de camara
 * @param {HTMLElement} cameraControl 
 * @param {boolean} state 
 */
function changeCameraControl(cameraControl, state) {
    document.getElementById("cameraIcon").src = state ? './src/Camera.png' : './src/NoCamera.png';
    cameraControl.dataset.state = state;
}

/**
 * funcion para activar/desactivar micrófono
 * @param {HTMLElement} microControl 
 * @param {boolean} microState
 */
function micro(microControl,microState) {
    let state = !JSON.parse(microControl.dataset.state);
    //setear imagen
    document.getElementById("microIcon").src = stamicroStatete ? './src/Microphone.png' : './src/NoMicrophone.png';
    microControl.dataset.state = microState;
}

/**
 * funcion para el boton de mostrar/ocultar emociones detectadas
 */
function emotion() {
    var emotionControl = document.getElementById('emotionControl');
    let state = !JSON.parse(emotionControl.dataset.state)
    //setear imagen
    document.getElementById("emotionIcon").src = state ? './src/Emotions.png' : './src/NoEmotions.png';
    emotionControl.dataset.state = state
}


/**
 * funcion para obtener y mostrar los dispositivos
 */
async function getDevices() {
    return new Promise((resolve, reject) =>{
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(mediaStream=>{
            let tracks = mediaStream.getTracks();
            //cerrar los flujos de los dispositivos para que no se genere conflicto con python
            tracks.forEach(track => {track.stop()});
            navigator.mediaDevices.enumerateDevices().then(function (devices) {
                //obtengo los dispositivos guardados en configuracion
                let {camera, mic} = JSON.parse(sessionStorage.getItem('conf'));
                paintDevices(devices,  {camera, mic});
                resolve();
            }).catch(err => {reject(err)});
        }).catch(err => {reject(err)});
    });
}

/**
 * funcion para pintar la lista de dispositivos
 * @param {object} devices 
 * @param {object} preSelectedDevices dispositivos que deberán pintarse como seleccionados
 */
function paintDevices(devices, preSelectedDevices){
    let audioOptions = document.getElementById("MdevicesContainer");
    let videoOptions = document.getElementById("CdevicesContainer");
    //borrar opciones anteriores
    $('.o-select-option').remove();
    devices.forEach((device) => {
        let label = device.kind === "audioinput"? device.label : device.label.split("(")[0].trim();
        let option = document.createElement("div");
        // se crea el contenedor del texto y el chulo
        option.setAttribute('id', device.deviceId)
        option.setAttribute('class', 'o-select-option')
        option.setAttribute('data-id', device.deviceId)
        option.setAttribute('data-type', device.kind ==="audioinput" ? 'mic': 'camera')
        option.setAttribute('onclick', "selectOption(this)")
        // se crea el texto
        text = document.createElement('span')
        text.setAttribute('id', 'selectOptionText')
        text.setAttribute('class', 'o-select-option-Text')
        text.innerHTML = label;
        // se crea y se oculta el chulo por defecto
        img = document.createElement('img')
        img.setAttribute('src', './src/Chulo.png')
        img.setAttribute('class', 'o-chulo-device')
        img.setAttribute('id', 'chulo' + device.deviceId)
        img.setAttribute('hidden', true)
        // se agregan el texto mas el chulo al contendor
        option.append(text)
        option.append(img)
        if(device.kind === "audioinput"){
            // se agrega el contendor al select de opciones
            audioOptions.append(option)
        }else if(device.kind === "videoinput"){
            // se agrega el contendor al select de opciones
            videoOptions.append(option)
        }
        //si es una opcion preseleccionada, se marca
        if(preSelectedDevices.camera === label){
            delete preSelectedDevices.camera;
            selectOption(option, false);
        }
        if(preSelectedDevices.mic === label){
            delete preSelectedDevices.mic;
            selectOption(option, false);
        }
    })
    //si los dispositivos preseleccionados no fueron encontrados se seleccionaran los primeros
    Object.keys(preSelectedDevices).forEach(type =>{
        selectOption(document.querySelector(`[data-type = ${type}]`))
    })
}


/**
 * funcion toggle para el menú de opciones de los dispositivos de microfono
 */
function displayMicroDevices() {
    let state = document.getElementById('MdevicesContainer').hidden;
    document.getElementById('MdevicesContainer').hidden = !state;
    document.getElementById('CdevicesContainer').hidden = true;
}

function toggleCameraDevices() {
    let state = document.getElementById('CdevicesContainer').hidden;
    document.getElementById('CdevicesContainer').hidden = !state;
    document.getElementById('MdevicesContainer').hidden = true;
}

/**
 * funcion para ocultar el menú de opciones de los dispostivos 
 */
function hideDevices(){
    document.getElementById('CdevicesContainer').hidden = true;
    document.getElementById('MdevicesContainer').hidden = true;
}

/**
 * funcion para seleccionar un dispositivo (camara o microfono)
 * @param {HTMLElement} option 
 * @param {boolean} save flag para guardar el dispositivo en configuracion (por defecto igual a true)
 */
function selectOption(option, save = true) {
   let options = document.querySelectorAll(`[data-type="${option.dataset.type}"]`);
   //se remueven los estilos de opcion seleccionada
   for(each of options) { each.classList.remove('o-yes-selected') };
   //se esconden los chulos
   let chulos = document.querySelectorAll(`[data-type="${option.dataset.type}"] img.o-chulo-device`);
   for (img of chulos) { img.hidden = true }
   //se cambia el estilo de la opcion seleccionada
   option.classList.add('o-yes-selected');
   document.getElementById(`chulo${option.dataset.id}`).hidden = false;
   
   //guardar en configuracion
   if(!save) return;
    let conf = JSON.parse(sessionStorage.getItem('conf'));
    if(['camera', 'mic'].includes(option.dataset.type)){
        conf[option.dataset.type] = option.children[0].innerHTML;
    }
    eel.saveConf(conf);
}

/**
 * funcion del boton de comenzar/terminar captura de emociones
 * @param {HTMLElement} caller 
 */
function detectionEvent(caller) {
    let state = caller.dataset.state === "stopped" ? "started" : "stopped";
    eel.run('72b4d17e4322f0a25e32156db8f176fe6725f1afc0da7e46fea7cd1669d7c696')
    eel.changeProcessing(state === "started")(_=>{
        caller.dataset.state = state;
        caller.innerHTML = state === "started"? "Terminar": "Comenzar";
        caller.classList.add(state === "started"? "o-btn-primary" : "o-btn-secundary")
        caller.classList.remove(state === "started"? "o-btn-secundary" : "o-btn-primary")
        if(state === "stopped") cleanVideoPlaceHolder();
    })
}

/**
 * funcion para limpiar el contenedor de video
 */
function cleanVideoPlaceHolder() {
    document.getElementById('videoCapture').src = "./src/dummy.png"
}

eel.expose(transmitVideo);
/**
 * funcion llamada por python para mostrar captura de video
 * @param {String} blob 
 */
function transmitVideo(blob) {
    document.getElementById('videoCapture').src = "data:image/jpeg;base64," + blob
}

eel.expose(processEmotion);
/**
 * funcion llamada por python para procesar una emocion detectada
 * @param {any} emotion 
 */
function processEmotion(emotion) {
    if (sessionStorage.getItem('currentSession') == null) return;
    submitEmotion(emotion, JSON.parse(emotionControl.dataset.state)? showEmotion: undefined);
}

/**
 * Muestra un emoji flotante de la emocion detectada
 * @param {Number} emotion 
 */
function showEmotion(emotion) {
    let particle = document.createElement('img');
    particle.classList.add('o-emotion-particle')
    particle.src = `./src/emotions/${emotionImgs[emotion]}`
    $(particle).css("left", getRoundInteger(0, $('#particleContainer').width()))
    $('#particleContainer').append(particle)
    $(particle).animate({
        top: "-100%",
        opacity: 0
    }, getRoundInteger(5000, 8000), _ => {
        $(particle).remove()
    })
}


/**
 * funcion para generar numeros aleatorios entre min y max
 * @param {Number} min 
 * @param {Number} max 
 */
function getRoundInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * funcion para enviar al servidor una emocion detectada,
 * llama a success cuando la operacion ha sido exitosa
 * @param {Object} emotion 
 * @param {Function} success 
 */
function submitEmotion(emotion, success = _=>{}) {
    //enviar
    let url = "https://classmood-appserver.herokuapp.com/submit"
    let data = {
        Emotions: [emotion],
        CodigoEstudiante: JSON.parse(sessionStorage.getItem('user')).Codigo,
        CodigoSesion: JSON.parse(sessionStorage.getItem('currentSession'))._id
    }
    $.post(url, data, ()=>{
        console.log('Send!!');
        success(Number(emotion[1]));
    }).fail(()=>{
        throw new Error('Error al subir los datos')
    })
}