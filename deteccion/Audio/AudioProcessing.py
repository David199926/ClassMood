import eel
from deteccion.Audio.AudioDetector import AudioDetector
from deteccion.Audio.Microphone import Microphone
import collections
import webrtcvad
import numpy as np
from datetime import datetime
import sys
import time

processingControl = False
control = False
detector = None
# frecuencia de muestreo del audio
fs = 16000
# duracion de los frames de audio en milisegundos (10 || 20 || 30)
frameDuration = 30
# duracion del padding de audio en milisegundos
paddingDuration = 300
# detector de habla en audio
vad = webrtcvad.Vad(3)
microphone = Microphone(fs, frameDuration)
#umbral de potencia de señal de audio
powerThreshold = 2e-4


@eel.expose
def changeDevice(device):
    microphone.changeMicrophone(device)


def loadDetector():
    # detector de emociones en habla
    global detector
    detector = AudioDetector('deteccion\Audio\modelAudio.sav')


def capture():
    while control:
        yield microphone.getFrame()


def detectVoiced():
    global processingControl
    # procesamiento del habla
    num_padding_frames = int(paddingDuration / frameDuration)
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    # we have two states: TRIGGERED and NOTRIGGERED. We start in the NOTTRIGGERED state
    triggered = False
    voiced_frames = []
  
    for frame in capture():
        # transmitir frame de audio
        transmit(frame)
        #solo se procesa el frame si el flag esta activado
        if not processingControl: continue

        is_speech = vad.is_speech(frame, fs)
        if not triggered:
            ring_buffer.append((frame, is_speech))
            num_voiced = len([f for f, speech in ring_buffer if speech])
            # eel.barSounds(triggered)()
            if num_voiced > 0.9 * ring_buffer.maxlen:
                triggered = True
                for f, s in ring_buffer:
                    voiced_frames.append(f)
                ring_buffer.clear()
        else:
            eel.barSounds(True)()
            voiced_frames.append(frame)
            # eel.barSounds(triggered)()
            ring_buffer.append((frame, is_speech))
            num_unvoiced = len([f for f, speech in ring_buffer if not speech])
            if num_unvoiced > 0.9 * ring_buffer.maxlen:
                triggered = False
                eel.barSounds(False)()
                yield b''.join(voiced_frames)
                ring_buffer.clear()
                voiced_frames = []

    
    # If we have any leftover voiced audio when we run out of input, yield it
    if voiced_frames:
        yield b''.join(voiced_frames)


def processing():
    
    for segment in detectVoiced():
        # convertir a np.array dtype = float32
        input = np.frombuffer(segment, dtype=np.int16).astype(np.float32)/32767
        emotion = detector.predict(input)
        print(emotion)
        if emotion is not None: 
                eel.processEmotion([
                    datetime.now().strftime("%H:%M:%S"),
                    str(emotion)
                ])()       
                    


def transmit(frame):
    # visualizacion del audio en js
    frame = np.frombuffer(frame, dtype=np.int16).astype(np.float32)
    signaled = np.mean(frame**2) > ((2**16)/2)**2*powerThreshold
    eel.transmitAudio(1 if signaled else 0)()


@eel.expose
def startAudioRecording(device, processingFlag=False):
    global control
    control = True
    changeAudioProcessing(processingFlag)
    loadDetector()
    # setear el dispositivo
    changeDevice(device)
    # iniciar la captura de audio
    global microphone
    microphone.startRecording()
    processing()


@eel.expose
def stopAudioRecording():
    global control
    control = False
    changeAudioProcessing(False)
    # liberar recurso del microfono
    global microphone
    microphone.release()


@eel.expose
def changeAudioProcessing(newValue):
    global processingControl
    if not isinstance(newValue, bool):
        return
    # si va a iniicar el procesamiento debo estar transmitiendo
    processingControl = newValue and control
