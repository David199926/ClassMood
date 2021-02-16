import eel
from deteccion.Audio.AudioDetector import AudioDetector
from deteccion.Audio.Microphone import Microphone
import collections
import webrtcvad
import numpy as np
from datetime import datetime

processingControl = False
control = False
detector = None
#frecuencia de muestreo del audio
fs = 16000
#duracion de los frames de audio en milisegundos (10 || 20 || 30)
frameDuration = 10
#duracion del padding de audio en milisegundos
paddingDuration = 300
#detector de habla en audio
vad = webrtcvad.Vad(3)
microphone = Microphone(fs, frameDuration)

def vad_collector(fs, frameDuration, paddingDuration, audioStream):
    """filtering out non-voiced audio frames
    Returns a generator that yields PCM audio data
    """
    num_padding_frames = int(paddingDuration / frameDuration)
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    #we have two states: TRIGGERED and NOTRIGGERED. We start in the NOTTRIGGERED state
    triggered = False
    voiced_frames = []

    for frame in audioStream:  
      is_speech = vad.is_speech(frame, fs)

      if not triggered:
          ring_buffer.append((frame, is_speech))
          num_voiced = len([f for f, speech in ring_buffer if speech])
          #if we are not triggered and more than 90% of the frames in
          #the ring buffer are voiced frames, then enter the triggered state
          if num_voiced > 0.9 * ring_buffer.maxlen:
              triggered = True
              #we want to yield all the audio we see from now
              #until we are NOTTRIGGERED, but we have to start with the
              #audio that's already in the ring buffer
              for f, s in ring_buffer:
                  voiced_frames.append(f)
              ring_buffer.clear()

      else:
          #We are in the TRIGGERED state, so collect the audio data
          #and add it to the ring buffer
          voiced_frames.append(frame)
          ring_buffer.append((frame, is_speech))
          num_unvoiced = len([f for f, speech in ring_buffer if not speech])
          #If more than 90% of the frames in the ring buffer are unvoiced
          #then enter NOTTRIGGERED and yield collected audio
          if num_unvoiced > 0.9 * ring_buffer.maxlen:
              #sys.stdout.write('NOT TRIGGERED')
              triggered = False
              yield b''.join(voiced_frames)
              ring_buffer.clear()
              voiced_frames = []

      # If we have any leftover voiced audio when we run out of input, yield it
      if voiced_frames:
        yield b''.join(voiced_frames)


@eel.expose
def changeDevice(device):
    microphone.changeMicrophone(device)


def loadDetector():
    #detector de emociones en habla
    detector = AudioDetector('deteccion\Audio\modelAudio.sav')


def capture(): 
    while control:
        yield microphone.getFrame()
        

def processing(audioStream):
    voicedSegments = vad_collector(fs, frameDuration, paddingDuration, audioStream)
    for segment in voicedSegments:
        if not processingControl: break
        #convertir a np.array dtype = float32
        input = np.frombuffer(segment, dtype = np.int16).astype(np.float32)/32767
        '''
        emotion = detector.predict(input)
        if emotion is not None: 
                eel.processEmotion([
                    datetime.now().strftime("%H:%M:%S"),
                    str(emotion)
                ])()'''


def transmit():
    audioStream = capture()
    processing(audioStream)
    #visualizacion del audio en js
    for frame in audioStream:
        eel.transmitAudio()()
    

@eel.expose
def startRecording(device, processingFlag = False):
    global control
    control = True
    changeAudioProcessing(processingFlag)
    loadDetector()
    #setear el dispositivo
    changeDevice(device)
    #iniciar la captura de audio
    global microphone
    microphone.startRecording()
    transmit()
    

@eel.expose
def stopAudioRecording():
    global control
    control = False
    changeAudioProcessing(False)
    #liberar recurso del microfono
    global microphone
    microphone.release()
    

@eel.expose
def changeAudioProcessing(newValue):
    global processingControl
    if not isinstance(newValue, bool): return
    #si va a iniicar el procesamiento debo estar transmitiendo
    processingControl = newValue and control
    print(f'nuevo estado {processingControl}')
        
    


