import eel
from deteccion.Video.VideoCamera import VideoCamera
from deteccion.Video.VideoDetector import VideoDetector
import time
from datetime import datetime
import base64

control = False
camera = VideoCamera()
detector = None
emotions = ['Enojo', 'Disgusto', 'Miedo', 'Felicidad', 'Tristeza', 'Sorpresa', 'Neutral']
#intervalo de procesamiento (segundos)
dt = 1
t0 = 0
 

def loadDetector():
    global detector
    detector = VideoDetector(r'deteccion\Video\model.json')
    detector.loadWeights(r'deteccion\Video\pesos\pesos_23.01.2021-14_17_21.H5')

@eel.expose
def run():
    loadDetector()
    changeVideoControl(True)
    #iniciar la captura de video
    global camera
    camera.startCapture()
    transmit()
    
    
def capture():
    #inicializar intervalo de procesamiento
    t0 = time.time()
    while control:
        frame = camera.getFrame()
        processing(frame)
        yield frame


def processing(frame):
    global t0
    #deteccion de emocion
    if detector is not None and time.time() - t0 >= dt:
        emotion = detector.predict(frame)
        t0 = time.time()
        if emotion is not None: print(emotions[emotion])
    

def transmit():
    output = capture()
    for image in output:
        blob = base64.b64encode(camera.getBytes(image))
        blob = blob.decode("utf-8")
        eel.transmitVideo(blob)()


@eel.expose
def stop():
    changeVideoControl(False)
    #liberar recurso de camara
    global camera
    camera.release()
    

@eel.expose
def changeVideoControl(newValue):
    global control
    control = newValue if isinstance(newValue, bool) else control
    