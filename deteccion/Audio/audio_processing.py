"""This is the audio processing module
this module communicates with front-end javascript to perform
voice emotion recognition.
The main operations of this module are: audio capture, voice detection
processing and transmition.
Instantiates Microphone object and AudioDetector object
"""


import sys
import time
import os
import collections
from datetime import datetime

import eel
import webrtcvad
import numpy as np

from deteccion.Audio.audio_detector import AudioDetector
from deteccion.Audio.microphone import Microphone


_processing_control = False
_control = False
_detector = None
# frecuencia de muestreo del audio
FS = 16000
# duracion de los frames de audio en milisegundos (10 || 20 || 30)
FRAME_DURATION = 30
# duracion del padding de audio en milisegundos
PADDING_DURATION = 300
# detector de habla en audio
_vad = webrtcvad.Vad(3)
_microphone = Microphone(FS, FRAME_DURATION)
# umbral de potencia de señal de audio
POWER_THRESHOLD = 2e-4


@eel.expose
def change_device(device):
    """Changes microphone device to 'device'"""
    _microphone.change_microphone(device)


def _load_detector():
    global _detector
    _detector = AudioDetector(os.path.join(
        'deteccion', 'Audio', 'modelAudio.sav'))


def _capture():
    while _control:
        yield _microphone.get_frame()


def _detect_voiced():
    global _processing_control
    num_padding_frames = int(PADDING_DURATION / FRAME_DURATION)
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    # we have two states: TRIGGERED and NOTRIGGERED. We start in the NOTTRIGGERED state
    triggered = False
    voiced_frames = []

    for frame in _capture():
        # transmit audio frame to js
        _transmit(frame)
        # only process frame if _processing_control flag is True
        if not _processing_control:
            continue

        is_speech = _vad.is_speech(frame, FS)
        if not triggered:
            ring_buffer.append((frame, is_speech))
            num_voiced = len([f for f, speech in ring_buffer if speech])
            if num_voiced > 0.9 * ring_buffer.maxlen:
                triggered = True
                for f, s in ring_buffer:
                    voiced_frames.append(f)
                ring_buffer.clear()
        else:
            voiced_frames.append(frame)
            ring_buffer.append((frame, is_speech))
            num_unvoiced = len([f for f, speech in ring_buffer if not speech])
            if num_unvoiced > 0.9 * ring_buffer.maxlen:
                triggered = False
                yield b''.join(voiced_frames)
                ring_buffer.clear()
                voiced_frames = []

    # If we have any leftover voiced audio when we run out of input, yield it
    if voiced_frames:
        yield b''.join(voiced_frames)


def _processing():
    for segment in _detect_voiced():
        # convert to np.array dtype = float32
        input = np.frombuffer(segment, dtype=np.int16).astype(
            np.float32) / 32767
        emotion = _detector.predict(input)
        if emotion is not None:
            eel.processEmotion([
                datetime.now().strftime("%H:%M:%S"),
                str(emotion)
            ])()


def _transmit(frame):
    # audio visualization in js
    frame = np.frombuffer(frame, dtype=np.int16).astype(np.float32)
    signaled = np.mean(frame ** 2) > ((2**16) / 2)**2 * POWER_THRESHOLD
    eel.transmitAudio(1 if signaled else 0)()


@eel.expose
def start_audio_recording(device, processing_flag=False):
    """Use microphone instance to start audio recording,
    process microphone output"""
    global _control
    _control = True
    change_audio_processing(processing_flag)
    _load_detector()
    # set device to 'device'
    change_device(device)
    # start microphone recording
    global _microphone
    _microphone.start_recording()
    _processing()


@eel.expose
def stop_audio_recording():
    """Stop audio recording,
    release microphone's audio resources"""
    global _control
    _control = False
    change_audio_processing(False)
    # release microphone resources
    global _microphone
    _microphone.release()


@eel.expose
def change_audio_processing(new_value):
    """Stop/start audio processing according to new_value"""
    global _processing_control
    if not isinstance(new_value, bool):
        return None
    # must be transmiting to start processing
    _processing_control = new_value and _control
