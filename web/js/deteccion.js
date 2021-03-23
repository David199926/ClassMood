// emotions' images 
const emotionImgs = [
    'enojado.png',
    'disgusto.png',
    'miedo.png',
    'feliz.png',
    'triste.png',
    'sorpresa.png',
    'neutral.png',
];

// emotions's colors
const emotionColors = {
    anger: '#FFB09C',
    disgust: '#DDFFD5',
    fear: '#FBD1FF',
    hapiness: '#FFF7AB',
    sadness: '#C2ECFF',
    sorprise: '#FFC9D8',
}

// hide external video usage warning on app load
$('#oExternalVideoUsage').hide();

// close device menus when user clicks out of them
$(document).click(function (event) {
    let target = $(event.target);
    if (!target.closest('#dispCamera').length && !target.closest('#dispMicro').length) {
        hideDevices();
    }
})

navigator.mediaDevices.ondevicechange =
    /**
     * draw available devices after device change
     */
    function (event) {
        navigator.mediaDevices.enumerateDevices().then(
            (devices) => {
                paintDevices(devices);
            }
        )
    }

/**
 * Reloads app after external video usage warning
 * @param {HTMLElement} me Button with onclick
 */
function reload(me) {
    me.disabled = true;
    // checks if warning was produced by the app itself
    let cameraControl = document.getElementById('cameraToggle');
    if (JSON.parse(cameraControl.dataset.state)) {
        /* if this is the case, close video stream
        to avoid repeating the error */
        camera(cameraControl);
    }
    location.reload();
}

/**
 * Toggles video transmition
 * @param {HTMLElement} cameraControl HTML toggle button
 */
function camera(cameraControl) {
    let state = !JSON.parse(cameraControl.dataset.state);
    let started = document.getElementById('detectionController').dataset.state === 'started';
    if (state) {
        changeCameraControl(cameraControl, state);
        eel.start_video_transmition(started);
    }
    else {
        eel.stop_video_transmition()(() => {
            cleanVideoPlaceHolder();
            changeCameraControl(cameraControl, state);
        })
    }
}

/**
 * Toggles audio recording
 * @param {HTMLElement} microControl HTML toggle button
 */
function microphone(microControl) {
    let state = !JSON.parse(microControl.dataset.state);
    let started = document.getElementById('detectionController').dataset.state === 'started';
    if (state) {
        changeMicrophoneControl(microControl, state)
        let device = JSON.parse(sessionStorage.getItem('conf')).mic
        eel.start_audio_recording(device, started)
    }
    else {
        eel.stop_audio_recording()(_ => {
            cleanAudioIndicator();
            changeMicrophoneControl(microControl, state);
        })
    }
}


/**
 * Changes camera control appearance
 * @param {HTMLElement} cameraControl HTML toggle button
 * @param {boolean} state active/inactive camera appearance
 */
function changeCameraControl(cameraControl, state) {
    document.getElementById('cameraIcon').src = state ? './src/Camera.png' : './src/NoCamera.png';
    cameraControl.dataset.state = state;
}

/**
 * Changes microphone control appearance
 * @param {HTMLElement} microControl HTML toggle button
 * @param {boolean} microState active/inactive microphone appearance
 */
function changeMicrophoneControl(microControl, state) {
    document.getElementById('microIcon').src = state ? './src/Microphone.png' : './src/NoMicrophone.png';
    microControl.dataset.state = state;
}

/**
 * Gets and shows audio and video devices
 */
async function getDevices() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then((mediaStream) => {
            let tracks = mediaStream.getTracks();
            // close video and audio streams to avoid conflicts with Python
            tracks.forEach((track) => {
                track.stop()
            });
            navigator.mediaDevices.enumerateDevices().then((devices) => {
                // get devices stored in configuration info
                let { camera, mic } = JSON.parse(sessionStorage.getItem('conf'));
                paintDevices(devices, { camera, mic });
                resolve();
            }).catch((err) => {
                reject(err)
            });
        }).catch((err) => {
            reject(err)
        });
    });
}

/**
 * Draws devices list
 * @param {object} devices 
 * @param {object} preSelectedDevices
 */
function paintDevices(devices, preSelectedDevices) {
    let audioOptions = document.getElementById('MdevicesContainer');
    let videoOptions = document.getElementById('CdevicesContainer');
    // remove all options
    $('.o-select-option').remove();
    devices.forEach((device) => {
        let label = device.kind === 'audioinput' ? device.label : device.label.split('(')[0].trim();
        let option = document.createElement('div');

        // set option attributes
        option.setAttribute('id', device.deviceId);
        option.setAttribute('class', 'o-select-option');
        option.setAttribute('data-type', device.kind === 'audioinput' ? 'mic' : 'camera');
        option.setAttribute('onclick', 'selectOption(this)');
        // set option label
        text = document.createElement('span');
        text.setAttribute('class', 'o-select-option-Text');
        text.innerHTML = label;
        // create and hide option's checks icons
        img = document.createElement('img');
        img.setAttribute('src', './src/Chulo.png');
        img.setAttribute('class', 'o-chulo-device');
        img.setAttribute('id', 'chulo' + device.deviceId);
        img.setAttribute('hidden', true);

        // append label and check to option container
        option.append(text);
        option.append(img);

        if (device.kind === 'audioinput') {
            audioOptions.append(option);
        } else if (device.kind === 'videoinput') {
            videoOptions.append(option);
        }
        // if option is a preselected device, select it
        if (preSelectedDevices.camera === label) {
            delete preSelectedDevices.camera;
            selectOption(option, false);
        }
        if (preSelectedDevices.mic === label) {
            delete preSelectedDevices.mic;
            selectOption(option, false);
        }
    });
    // if preselected devices are not found, select first devices in the list 
    Object.keys(preSelectedDevices).forEach((type) => {
        selectOption(document.querySelector(`[data-type = ${type}]`))
    });
}

/**
 * Hides/shows microphone devices menu
 */
function displayMicroDevices() {
    let state = document.getElementById('MdevicesContainer').hidden;
    document.getElementById('MdevicesContainer').hidden = !state;
    document.getElementById('CdevicesContainer').hidden = true;
}

/**
 * Hides/shows camera devices menu
 */
function toggleCameraDevices() {
    let state = document.getElementById('CdevicesContainer').hidden;
    document.getElementById('CdevicesContainer').hidden = !state;
    document.getElementById('MdevicesContainer').hidden = true;
}

/**
 * Hides camera and microphone menus
 */
function hideDevices() {
    document.getElementById('CdevicesContainer').hidden = true;
    document.getElementById('MdevicesContainer').hidden = true;
}

/**
 * Selects a device (camera or microphone)
 * @param {HTMLElement} option device to be selected (camera or microphone)
 * @param {boolean} save whether to save the device in configuration or not (default value is true)
 */
function selectOption(option, save = true) {
    let options = document.querySelectorAll(`[data-type='${option.dataset.type}']`);
    let chulos = document.querySelectorAll(`[data-type='${option.dataset.type}'] img.o-chulo-device`);
    // remove selected style from all options
    for (each of options) {
        each.classList.remove('o-yes-selected');
    };
    // hide check icons from all options
    for (img of chulos) {
        img.hidden = true;
    }
    // add selected style to selected option
    option.classList.add('o-yes-selected');
    // show check icon for selected option
    document.getElementById(`chulo${option.id}`).hidden = false;

    // change device in Python
    if (option.dataset.type === 'mic') {
        eel.change_device(option.children[0].innerHTML)
    }

    // save in configuration
    if (!save) { return null };
    let conf = JSON.parse(sessionStorage.getItem('conf'));
    if (['camera', 'mic'].includes(option.dataset.type)) {
        conf[option.dataset.type] = option.children[0].innerHTML;
        sessionStorage.setItem('conf', JSON.stringify(conf));
    }
    eel.save_conf(conf);
}

/**
 * Starts/ends emotion detection in audio and video
 * @param {HTMLElement} caller button that calls the function
 */
function detectionEvent(caller) {
    let state = caller.dataset.state === 'stopped' ? 'started' : 'stopped';
    eel.change_video_processing(state === 'started')(() => {
        eel.change_audio_processing(state === 'started')(() => {
            caller.dataset.state = state;
            caller.innerHTML = state === 'started' ? 'Terminar' : 'Comenzar';
            caller.classList.add(state === 'started' ? 'o-btn-primary' : 'o-btn-secundary')
            caller.classList.remove(state === 'started' ? 'o-btn-secundary' : 'o-btn-primary')
        });
        if (state === 'stopped') {
            cleanVideoPlaceHolder();
        }
    });
}

/**
 * Cleans video placeholder
 */
function cleanVideoPlaceHolder() {
    document.getElementById('videoCapture').src = './src/dummy.png';
}

/**
 * Cleans the audio indicator
 */
function cleanAudioIndicator() {
    document.getElementById('audioToggle').style.borderColor = 'transparent';
}

/**
 * Shows comment's length (< 200)
 */
function commentLengthIndicator() {
    let comment = document.getElementById('emotionComment');
    let commentLengthIndicator = document.getElementById('commentLengthIndicator');
    commentLengthIndicator.innerHTML = `${comment.value.length}/${comment.maxLength}`;
    commentLengthIndicator.style.color = comment.value.length === comment.maxLength ? '#FF0000' : '#000000';
}

/**
 * Selects an emotion for emotion registration
 * @param {HTMLElement} element image element clicked
 */
function selectEmotion(element) {
    document.getElementById('commentSection').style.backgroundColor = emotionColors[element.id];
    $('.o-emotions-modal-emotion-container img').removeClass('o-emotion-selected');
    $(element).addClass('o-emotion-selected');
    $(element).parent().attr('data-emotion', element.id);
}

/**
 * Shows a floating emoji for the detected emotion
 * @param {Number} emotion 
 */
function showEmotion(emotion) {
    let particle = document.createElement('img');
    particle.classList.add('o-emotion-particle');
    particle.src = `./src/emotions/${emotionImgs[emotion]}`;
    $(particle).css('left', getRoundInteger(0, $('#particleContainer').width()));
    $('#particleContainer').append(particle);
    $(particle).animate({
        top: '-100%',
        opacity: 0,
    }, getRoundInteger(5000, 8000), () => {
        $(particle).remove();
    });
}

/**
 * Generates random integers from min to max
 * @param {Number} min 
 * @param {Number} max 
 */
function getRoundInteger(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Sends a detected emotion to ClassMood app server
 * 
 * llama a success cuando la operacion ha sido exitosa
 * @param {Object} emotion 
 * @param {function(): any} success call this function if emotion have been send successfully
 */
function submitEmotion(emotion, success = () => { }) {
    //enviar
    let url = 'https://classmood-appserver.herokuapp.com/submit';
    let data = {
        emotions: [emotion],
        studentCode: JSON.parse(sessionStorage.getItem('user')).Codigo,
        sessionCode: JSON.parse(sessionStorage.getItem('currentSession'))._id,
    }
    $.post(url, data, () => {
        success(Number(emotion[1]));
    }).fail(() => {
        throw new Error('Error al subir los datos')
    })
}

// exposed functions

eel.expose(transmitAudio)
/**
 * Shows audio signal indicator
 * @param {number} show whether if shows indicator or not
 */
function transmitAudio(show) {
    document.getElementById('audioToggle').style.borderColor = show ? '#00ff00' : 'transparent';
}

eel.expose(transmitVideo);
/**
 * Shows video capture in HTML video placeholder
 * @param {String} blob 
 */
function transmitVideo(blob) {
    document.getElementById('videoCapture').src = 'data:image/jpeg;base64,' + blob;
}

eel.expose(verifyCameraUsage)
/**
* Shows external video usage warning to user
*/
function verifyCameraUsage() {
    $('#oExternalVideoUsage').show();
}

eel.expose(processEmotion);
/**
 * Process a detected emotion
 * @param {any} emotion detected emotion
 */
function processEmotion(emotion) {
    if (sessionStorage.getItem('currentSession') === null) {
        return null;
    }
    submitEmotion(emotion, showEmotion);
}



