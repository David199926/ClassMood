import eel
import deteccion.Audio.AudioAnalizer as AudioAnalizer
import deteccion.Audio.EmotionDetectorAudio as EmotionDetectorAudio

detector= EmotionDetectorAudio(r'deteccion\Audio\modelAudio.sav')

FrameDurtion=1
fs=44100

@eel.expose
def run(detector):
  detector.predict()
