//imagenes de las emociones
const emotionImgs = ['enojado.png', 'disgusto.png', 'miedo.png', 'feliz.png', 'triste.png', 'sorpresa.png', 'neutral.png']

/**
 * funcion para activar/desactivar transmision de video
 * @param {HTMLElement} cameraControl
 * @param {HTMLElement} microControl 
 * @param {String} id
 */
function camera(cameraControl,microControl,id) {
    let state = !JSON.parse(cameraControl.dataset.state);
    let microState = !JSON.parse(microControl.dataset.state)
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
    if(microState){
        micro(microControl,microState)
        eel.run(id)
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
function getDevices() {
    audioOptions = document.getElementById("MdevicesContainer");
    videoOptions = document.getElementById("CdevicesContainer");

    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        devices.forEach((device) => {
            let label = device.label
            if (device.kind === "audioinput") {
                option = document.createElement("div");
                // se crea el contenedor del texto y el chulo
                option.setAttribute('id', device.deviceId)
                option.setAttribute('class', 'o-select-option')
                option.setAttribute('data-id', device.deviceId)
                option.setAttribute('onclick', "selectOption('" + device.deviceId + "','micro')")
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
                // se agrega el contendor al select de opciones
                audioOptions.append(option)
            } else if (device.kind === "videoinput") {
                label = label.split("(")[0].trim() //only device name
                // se crea el contenedor del chulo y el texto
                option = document.createElement("div");
                option.setAttribute('id', device.deviceId)
                option.setAttribute('class', 'o-selectC-option')
                option.setAttribute('data-id', device.deviceId)
                // se crea el texto
                text = document.createElement('span')
                text.setAttribute('id', 'selectOptionText')
                text.setAttribute('class', 'o-select-option-Text')
                text.innerHTML = label;
                option.setAttribute('onclick', "selectOption('" + device.deviceId + "','camera')")
                // se agrega la imagen del chulo y se esconde por defecto
                img = document.createElement('img')
                img.setAttribute('src', './src/Chulo.png')
                img.setAttribute('class', 'o-chulo-device')
                img.setAttribute('id', 'chulo' + device.deviceId)
                img.setAttribute('hidden', true)
                // se agregan el chulo mas el texto al contenedor
                option.append(text)
                option.append(img)
                // se agrega el contendor al select de opciones
                videoOptions.append(option)
            }
        })
    }).catch(function (err) {
        console.log(err.name + ": " + err.message);
    });
}

/**
 * funcion para mostrar el menú de opciones de los dispositivos de microfono
 */
function displayMicroDevices() {
    var MdevicesControl = document.getElementById('dispMicro')
    let state = !JSON.parse(MdevicesControl.dataset.state)
    document.getElementById('MdevicesContainer').hidden = state;
    MdevicesControl.dataset.state = state
    var CdevicesControl = document.getElementById('dispCamera')
    document.getElementById('CdevicesContainer').hidden = true
    CdevicesControl.dataset.state = 'true'
}

/**
 * funcion para mostrar el menú de opciones de los dispositivos de camara
 */
function displayCameraDevices() {
    var CdevicesControl = document.getElementById('dispCamera')
    let state = !JSON.parse(CdevicesControl.dataset.state)
    document.getElementById('CdevicesContainer').hidden = state;
    CdevicesControl.dataset.state = state
    var MdevicesControl = document.getElementById('dispMicro')
    document.getElementById('MdevicesContainer').hidden = true
    MdevicesControl.dataset.state = 'true'
}

/**
 * funcion para mantener seleccionada la opcion
 * @param {String} id 
 * @param {String} type 
 */
function selectOption(id, type) {
    if (type === "micro") {
        // se esconden todos los fondos
        let elements = document.getElementsByClassName('o-select-option')
        for (el of elements) { el.classList.remove('o-yes-selected') }
        // se esconden todos los chulos
        let img = document.getElementsByClassName('o-chulo-device')
        for (im of img) { im.hidden = true }
        // se obtienes la opcion escogida y su chulo
        let option = document.getElementById(id)
        let imgOption = document.getElementById('chulo' + id)
        // se pintan el fondo, la letra y el chulo se hace visible
        imgOption.hidden = false
        option.classList.add('o-yes-selected')
    } else if (type === "camera") {
        // se esconden todos los fondos
        let elements = document.getElementsByClassName('o-selectC-option')
        for (el of elements) { el.classList.remove('o-yes-selected') }
        // se esconden todos los chulos
        let img = document.getElementsByClassName('o-chulo-device')
        for (im of img) { im.hidden = true }
        // se obtienes la opcion escogida y su chulo
        let option = document.getElementById(id)
        let imgOption = document.getElementById('chulo' + id)
        // se pintan el fondo, la letra y el chulo se hace visible
        imgOption.hidden = false
        option.classList.add('o-yes-selected')
    }
    
}

/**
 * funcion del boton de comenzar/terminar captura de emociones
 * @param {HTMLElement} caller 
 */
function detectionEvent(caller) {
    let state = caller.dataset.state === "stopped" ? "started" : "stopped";
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
    if (JSON.parse(emotionControl.dataset.state)){
        //enviar la deteccion y mostrar en pantalla
        submitEmotion(emotion, showEmotion)
    }else{
        //enviar la deteccion y no mostrar en pantalla
        submitEmotion(emotion)
    }
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
        console.log('Send!!')
        success(Number(emotion[1]))
    }).fail(()=>{
        throw new Error('Error al subir los datos')
    })
}