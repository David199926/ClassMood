const user = JSON.parse(sessionStorage.getItem('user'));

if (sessionStorage.getItem('currentSession') !== null) {
    sessionStorage.removeItem('currentSession')
}
// set user name in side menu
document.getElementById('userName').innerHTML = user.Nombre + ' ' + user.Apellido;
getCurrentSession(user);
getUpcomingSessions(user);


/**
 * Sends request to ClassMood app server looking for current sessions
 * @param {object} user 
 */
function getCurrentSession(user) {
    let url = 'https://classmood-appserver.herokuapp.com/available';
    $.get(url, { email: user.Correo }, (data) => {
        console.log('hola')
        if (data.length === 0) {
            eel.stop_video_transmition()(() => {
                eel.stop_audio_recording()(() => {
                    document.getElementById('mainContainer').innerHTML = `
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
                // if there's no current session running in the app
                $('#mainContainer').load('deteccion.html', () => {
                    document.getElementById('titleDetection').innerHTML = session.NombreCurso;
                    document.getElementById('groupDetection').innerHTML = `Grupo ${session.NumeroGrupo}`;
                    document.getElementById('sessionDuration').innerHTML = 
                    `${timeFormatter(new Date(session.HoraInicio))} -- ${timeFormatter(new Date(session.HoraFinal))}`;
                    sessionStorage.setItem('currentSession', JSON.stringify(session));
                    // set timer to reload app when session is over
                    setTimeout(() => {
                        eel.stop_video_transmition()(() => {
                            eel.stop_audio_recording()(() => {
                                sessionStorage.removeItem('currentSession');
                                location.href = 'index.html#modalBackground';
                            })
                        })
                    }, Math.abs(new Date(session.HoraFinal).getTime() - new Date().getTime()));

                    getDevices().then(res => {
                        // once devices are configured, we can start audio and video capture
                        eel.start_video_transmition();
                        eel.start_audio_recording(JSON.parse(sessionStorage.getItem('conf')).mic);
                    }).catch((error) => {
                        console.log('error with device handling', error);
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
 * Sends request to ClassMood app server looking for upcoming sessions
 * @param {object} user 
 */
function getUpcomingSessions(user) {
    document.getElementById('sessionsPlaceholder').innerHTML = '';
    let url = 'https://classmood-appserver.herokuapp.com/upcoming'
    $.get(url, { email: user.Correo }, (data) => {
        if (data.length === 0) {
            $('#sessionsPlaceholder').append('<span class="o-no-next-sessions">No hay sesiones agendadas</span>');
        }
        else {
            for (session of data) {
                $('#sessionsPlaceholder').append(`
                    <div class="o-session">
                        <div class="o-session-header">
                            <span class="o-session-title" id="sessionGroupName">${session.NombreCurso}</span>
                            <span class="o-session-group" id="sessionGroupNumber">Grupo ${session.NumeroGrupo}</span>
                        </div>
                        <div class="o-upsession-time">
                            <span id="sessionStartTime">${timeFormatter(new Date(session.HoraInicio))}</span>&nbsp--&nbsp
                            <span id="sessioneNDTime">${timeFormatter(new Date(session.HoraFinal))}</span>
                        </div>
                    </div>`
                );
            }
        }
    })
}

/**
 * Reloads current and upcoming sessions
 */
function reloadSessions() {
    getUpcomingSessions(user);
    getCurrentSession(user);
}

/**
 * Formats date objects
 * @param {object} time 
 */
function timeFormatter(time) {
    return `${time.getHours() % 12 || 12}:${time.getMinutes().toString().padStart(2, '0')} ${time.getHours() > 12 ? 'PM' : 'AM'}`
}

/**
 * LogOut function
 */
function logOut() {
    sessionStorage.removeItem('user');
    // stop audio recording and video transmition
    eel.stop_video_transmition()(() => {
        eel.stop_audio_recording()(() => {
            // remove user data from conf file
            eel.read_conf()(conf => {
                conf.user.email = '';
                conf.user.password = '';
                conf.user.code = '';
                eel.save_conf(conf)(() => {
                    location.href = 'LogIn.html'
                })
            })
        })
    })
}

// Keyboard shortcuts

// sync sessions with server
Mousetrap.bind('ctrl+s', (e) => {
    e.preventDefault();
    reloadSessions();
});

// camera toggle
Mousetrap.bind('ctrl+c', (e) => {
    e.preventDefault();
    let device = document.getElementById('cameraToggle');
    camera(device);
});

// microphone toggle
Mousetrap.bind('ctrl+m', (e) => {
    e.preventDefault();
    let device = document.getElementById('micToggle');
    microphone(device);
});

// emotion toggle
Mousetrap.bind('ctrl+e', (e) => {
    e.preventDefault();
    emotion();
});

// start/stop detection toggle
Mousetrap.bind('ctrl+d', (e) => {
    e.preventDefault();
    detectionEvent(document.getElementById('detectionController'))
});
