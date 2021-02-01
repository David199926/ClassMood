var state = true
function micro(){
    
    if(state){
    document.getElementById("micr-img").src="./src/microphone-with-slash-interface-symbol-for-mute-audio.svg"
    state= false
    }else{
        document.getElementById("micr-img").src="./src/microphone-black-shape.svg"
        state=true
    }
}