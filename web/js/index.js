/**
 * funcion para obtener la sesion actual (si existe)
 * @param {object} user 
 */
function getCurrentSession(user) {
    //obtener la sesión actual (si existe)
    let url = 'https://classmood-appserver.herokuapp.com/available';
    $.get(url, { Correo: user.Correo }, (data) => {
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
                document.getElementById('sessionDuration').innerHTML = `${timeFormatter(new Date(session.HoraInicio))}--${timeFormatter(new Date(session.HoraFinal))}`;
                sessionStorage.setItem('currentSession', JSON.stringify(session))
                getDevices()
                eel.startTransmition(false)
            })

        }
    });
}

/**
 * funcion para obtener las sesiones próximas (si existen)
 * @param {object} user 
 */
function getUpcomingSessions(user) {
    let url = 'https://classmood-appserver.herokuapp.com/upcoming'
    $.get(url, { Correo: user.Correo }, (data) => {
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
}

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
