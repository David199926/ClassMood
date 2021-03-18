/**
 * funcion para obtener la sesion actual (si existe)
 * @param {object} user 
 */
function getCurrentSession(user) {
    //obtener la sesión actual (si existe)
    let url = 'https://classmood-appserver.herokuapp.com/available';
    $.get(url, { Correo: user.Correo }, (data) => {
        if (data.length === 0) {
            eel.stopVideoTransmition()(_ => {
                eel.stopAudioRecording()(_ => {
                    document.getElementById("mainContainer").innerHTML = `
                    <div class="o-nosession-content">
                        <span>No hay sesiones disponibles</span>
                        <img src="./src/NoSession.png" alt="NoSession">
                    </div>`;
                })
            })
        }
        else {
            let session = data[0];
            if (sessionStorage.getItem('currentSession') == null) {
                //si no hay sesiones en curso
                $('#mainContainer').load('deteccion.html', _ => {
                    document.getElementById("titleDetection").innerHTML = session.NombreCurso;
                    document.getElementById("groupDetection").innerHTML = `Grupo ${session.NumeroGrupo}`;
                    document.getElementById('sessionDuration').innerHTML = `${timeFormatter(new Date(session.HoraInicio))}&nbsp--&nbsp${timeFormatter(new Date(session.HoraFinal))}`;
                    sessionStorage.setItem('currentSession', JSON.stringify(session));
                    //seteo un timer para actualizar la pagina cuando haya acabado la sesion
                    setTimeout(_ => {
                        eel.stopVideoTransmition()(_ => {
                            eel.stopAudioRecording()(_ => {
                                //remover la ultima sesion de la memoria
                                sessionStorage.removeItem('currentSession');
                                location.href = 'index.html#modalBackground';
                            })

                        })
                    }, Math.abs(new Date(session.HoraFinal).getTime() - new Date().getTime()));
                    getDevices().then(res => {
                        //una vez configurados los dispositivos podemos empezar la captura de audio y video
                        eel.startVideoTransmition();
                        eel.startAudioRecording(JSON.parse(sessionStorage.getItem('conf')).mic);
                    }).catch(error => {
                        console.log('error gestionando dispositivos', error);
                        if (error.message === 'Could not start video source') {
                            verifyCameraUsage();
                        }

                    });
                })
            }
        }
    });
}

/**
 * funcion para obtener las sesiones próximas (si existen)
 * @param {object} user 
 */
function getUpcomingSessions(user) {
    document.getElementById('sessionsPlaceholder').innerHTML = "";
    let url = 'https://classmood-appserver.herokuapp.com/upcoming'
    $.get(url, { Correo: user.Correo }, (data) => {
        if (data.length === 0) {
            $("#sessionsPlaceholder").append('<span class="o-no-next-sessions">No hay sesiones agendadas</span>');
        }
        else {
            for (session of data) {
                $("#sessionsPlaceholder").append(`
                    <div class="o-session">
                        <div class="o-session-header">
                            <span class="o-session-title" id="sessionGroupName">${session.NombreCurso}</span>
                            <span class="o-session-group" id="sessionGroupNumber">Grupo ${session.NumeroGrupo}</span>
                        </div>
                        <div class="o-upsession-time">
                            <span id="sessionStartTime">${timeFormatter(new Date(session.HoraInicio))}</span>&nbsp--&nbsp
                            <span id="sessioneNDTime">${timeFormatter(new Date(session.HoraFinal))}</span>
                        </div>
                    </div>`);
            }
        }
    })
}

/**
 * funcion para recargar las sesiones
 */
function reloadSessions() {
    let user = JSON.parse(sessionStorage.getItem("user"));
    getUpcomingSessions(user);
    getCurrentSession(user);
}

if (sessionStorage.getItem('currentSession') !== null) sessionStorage.removeItem('currentSession')
//obtener el usuario
let user = JSON.parse(sessionStorage.getItem("user"));
//setear el nombre del usuario en el menu lateral
document.getElementById("userName").innerHTML = user.Nombre + ' ' + user.Apellido;
getCurrentSession(user);
getUpcomingSessions(user);

/**
 * funcion para dar formato a los objetos Date
 * @param {object} time 
 */
function timeFormatter(time) {
    return `${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')} ${time.getHours() > 12 ? 'PM' : 'AM'}`
}

/**
 * función para cerrar sesión
 */
function logOut() {
    sessionStorage.removeItem("user");
    //terminar la transmision
    eel.stopVideoTransmition()(_ => {
        eel.stopAudioRecording()(_ => {
            //remover los datos del usuario en el archivo se configuracion
            eel.readConf()(conf => {
                conf.user.email = "";
                conf.user.password = "";
                conf.user.code = "";
                eel.saveConf(conf)(_ => {
                    location.href = "LogIn.html"
                })
            })
        })

    })

}

//shortcuts de teclado

//sincronizacion de teclado
Mousetrap.bind('ctrl+s', e => {
    e.preventDefault();
    reloadSessions();
});

//toggle de camera
Mousetrap.bind('ctrl+c', e => {
    e.preventDefault();
    let device = document.getElementById('cameraToggle');
    camera(device);
});

//toggle de mic
Mousetrap.bind('ctrl+m', e => {
    e.preventDefault();
    let device = document.getElementById('micToggle');
    microphone(device);
});

//toggle de emociones
Mousetrap.bind('ctrl+e', e => {
    e.preventDefault();
    emotion();
});

//toggle para iniciar deteccion
Mousetrap.bind('ctrl+d', e => {
    e.preventDefault();
    detectionEvent(document.getElementById('detectionController'))
});

