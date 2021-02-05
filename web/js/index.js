//imagenes de las emociones
emotionImgs = ['enojado.png', 'disgusto.png', 'miedo.png', 'feliz.png', 'triste.png', 'sorpresa.png', 'neutral.png']

//obtener el usuario
let user = JSON.parse(sessionStorage.getItem("user"));
//setear el nombre del usuario en el menu lateral
document.getElementById("userName").innerHTML = user.Nombre + ' ' + user.Apellido;
//obtener la sesión actual (si existe)
let url = 'https://classmood-appserver.herokuapp.com/';
$.get(url + 'available', { Correo: user.Correo }, (data) => {
    if (data.length === 0) {
        document.getElementById("mainContainer").innerHTML = `
        <div class="o-nosession-content">
            <span>No hay sesiones disponibles</span>
            <img src="./src/NoSession.png" alt="NoSession">
        </div>`;
    }
    else {
        $('#mainContainer').load('deteccion.html', _ => {
            //insertar informacion de la sesion
            let session = data[0];
            document.getElementById("titleDetection").innerHTML = session.NombreCurso;
            document.getElementById("groupDetection").innerHTML = `Grupo ${session.NumeroGrupo}`;
            document.getElementById("currentSessionStartTime").innerHTML = timeFormatter(new Date(session.HoraInicio));
            document.getElementById("currentSessionEndTime").innerHTML = timeFormatter(new Date(session.HoraFinal));
            sessionStorage.setItem('currentSession', JSON.stringify(session))
            getDevices()
        })

    }
});
//obtener las proximas sesiones
$.get(url + 'upcoming', { Correo: user.Correo }, (data) => {
    if (data.length === 0) {
        $("#nextSessionsContainer").append('<span class="o-no-next-sessions">No hay sesiones agendadas</span>')
    }
    else {
        for (session of data) {
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
function timeFormatter(time) {
    return `${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')} ${time.getHours() > 12 ? 'PM' : 'AM'}`
}

//función para cerrar sesión
function logOut() {
    sessionStorage.removeItem("user");
    eel.readConf()(conf => {
        conf.user.email = "";
        conf.user.password = "";
        conf.user.code = "";
        eel.saveConf(conf)(_ => {
            location.href = "LogIn.html"
        })
    })
}

//funcion para activar/desactivar camara
function camera() {
    let cameraControl = document.getElementById('cameraControl');
    let state = !JSON.parse(cameraControl.dataset.state);
    let started = document.getElementById('detectionController').dataset.state === "started";
    if (started) {
        if (state) {
            eel.run();
        }
        else {
            eel.stop()(_ => {
                changeCameraControl(cameraControl, state)
                cleanVideoPlaceHolder();
                return
            })
        }
    }
    changeCameraControl(cameraControl, state)
}

function changeCameraControl(cameraControl, state) {
    document.getElementById("cameraIcon").src = state ? './src/Camera.png' : './src/NoCamera.png';
    document.getElementById("cameraText").innerHTML = state ? "Desactivar" : "Activar";
    cameraControl.dataset.state = state;
}

//funcion para activar/desactivar micrófono
function micro() {
    var microControl = document.getElementById('microControl');
    let state = !JSON.parse(microControl.dataset.state);
    //setear imagen
    document.getElementById("microIcon").src = state ? './src/Microphone.png' : './src/NoMicrophone.png';
    document.getElementById("microText").innerHTML = state ? "Silenciar" : "Activar";
    microControl.dataset.state = state;

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

// obtener los dispositivos
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

// mostrar el menú de opciones de los dispositivos de microfono
function displayMicroDevices() {
    var MdevicesControl = document.getElementById('dispMicro')
    let state = !JSON.parse(MdevicesControl.dataset.state)
    document.getElementById('MdevicesContainer').hidden = state;
    MdevicesControl.dataset.state = state
    var CdevicesControl = document.getElementById('dispCamera')
    document.getElementById('CdevicesContainer').hidden = true
    CdevicesControl.dataset.state = 'true'
}

// mostrar el menú de opciones de los dispositivos de camara
function displayCameraDevices() {
    var CdevicesControl = document.getElementById('dispCamera')
    let state = !JSON.parse(CdevicesControl.dataset.state)
    document.getElementById('CdevicesContainer').hidden = state;
    CdevicesControl.dataset.state = state
    var MdevicesControl = document.getElementById('dispMicro')
    document.getElementById('MdevicesContainer').hidden = true
    MdevicesControl.dataset.state = 'true'
}

// funcion para mantener seleccionada la opcion
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

//funcion del boton de comenzar/terminar captura de emociones
function detectionEvent(caller) {
    let state = caller.dataset.state === "stopped" ? "started" : "stopped";
    if (state === "started") {
        eel.run()
        caller.innerHTML = "Terminar";
        caller.dataset.state = state;
    }
    else if (state === "stopped") {
        eel.stop()(_ => {
            caller.innerHTML = "Comenzar";
            caller.dataset.state = state;
            cleanVideoPlaceHolder();
        })
    }
    else throw new Error('Valor del caller diferente a stoopes o started');
}

//funcion para limpiar el contenedor de video
function cleanVideoPlaceHolder() {
    document.getElementById('videoCapture').src = "./src/dummy.png"
}

//funcion llamada por python para mostrar captura de video
eel.expose(transmitVideo);
function transmitVideo(blob) {
    document.getElementById('videoCapture').src = "data:image/jpeg;base64," + blob
}

//funcion llamada por python para procesar una emocion detectada
eel.expose(processEmotion);
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