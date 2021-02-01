var state = true
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


function micro(){
    
    if(state){
    document.getElementById("micr-img").src="./src/microphone-with-slash-interface-symbol-for-mute-audio.svg"
    state= false
    }else{
        document.getElementById("micr-img").src="./src/microphone-black-shape.svg"
        state=true
    }
}