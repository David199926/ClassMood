/**
 * funcion para obtener la sesion actual (si existe)
 * @param {object} user 
 */
function getCurrentSession(user) {
    //obtener la sesión actual (si existe)
    let url = 'https://classmood-appserver.herokuapp.com/available';
    $.get(url, { Correo: user.Correo }, (data) => {
        if (data.length === 0) {
            eel.stopTransmition()(_=>{
                document.getElementById("mainContainer").innerHTML = `
                <div class="o-nosession-content">
                    <span>No hay sesiones disponibles</span>
                    <img src="./src/NoSession.png" alt="NoSession">
                </div>`;
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
                    let displacement = 0;
                    setTimeout(_ => {
                        eel.stopTransmition()(_ => {
                            //remover la ultima sesion de la memoria
                            sessionStorage.removeItem('currentSession');
                            location.href = 'index.html#modalBackground';
                        })
                    }, Math.abs(new Date(session.HoraFinal).getTime() - new Date().getTime()) + displacement);
                    getDevices(eel.startTransmition);
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

if(sessionStorage.getItem('currentSession') !== null) sessionStorage.removeItem('currentSession')
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
    eel.readConf()(conf => {
        conf.user.email = "";
        conf.user.password = "";
        conf.user.code = "";
        eel.saveConf(conf)(_ => {
            location.href = "LogIn.html"
        })
    })
}
