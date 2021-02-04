import eel
from  VideoCamera import VideoCamera
import base64

control = False
camera = None

@eel.expose
def run():
    global camera
    camera = VideoCamera()
    changeVideoControl(True)
    transmit()
    
    
def capture():
    while control:
        frame = camera.getFrame()
        yield processing(frame)


def processing(frame):
    return frame


def transmit():
    output = capture()
    for image in output:
        blob = base64.b64encode(camera.getBytes(image))
        blob = blob.decode("utf-8")
        eel.transmitVideo(blob)()


@eel.expose
def stop():
    changeVideoControl(False)
    

@eel.expose
def changeVideoControl(newValue):
    global control
    control = newValue if isinstance(newValue, bool) else control
    