import collections
import contextlib
import sys
import wave
import pyaudio
import numpy as np
#Detector de emociones en audio
from EmotionDetectorAudio import EmotionDetector
import keyboard

import webrtcvad

def frame_generator(frame_duration_ms, sample_rate, device):
    "generates audio frames from microfone"
    sample_format = pyaudio.paInt16
    channels = 1
    fs = sample_rate
    record_time_ms = frame_duration_ms
    chunk = int(fs * record_time_ms /1000)
    seconds = 10

    p = pyaudio.PyAudio()
    numdevices = p.get_host_api_info_by_index(0).get("deviceCount")
    for i in range(0, numdevices):
        if(p.get_device_info_by_host_api_device_index(0, i).get('name') in device):
            index = i
            break
    print(index)

    stream = p.open(format = sample_format, channels = channels, rate = fs, frames_per_buffer = chunk, input = True, input_device_index = index)
    print("Recording")
    while True:
        data = stream.read(chunk)
        yield data
        if keyboard.is_pressed('q'): break


    stream.stop_stream()
    stream.close()
    p.terminate
    print("stop recording")


    

def vad_collector(sample_rate, frame_duration_ms, padding_duration_ms, vad, device):
    """filtering out non-voiced audio frames
       Returns a generator that yields PCM audio data
    """
    num_padding_frames = int(padding_duration_ms / frame_duration_ms)
    ring_buffer = collections.deque(maxlen=num_padding_frames)
    #we have two states: TRIGGERED and NOTRIGGERED. We start in the NOTTRIGGERED state
    triggered = False

    voiced_frames = []
    for frame in frame_generator(frame_duration_ms, sample_rate, device):
        is_speech = vad.is_speech(frame, sample_rate)
        #sys.stdout.write('1' if is_speech else '0')

        if not triggered:
            ring_buffer.append((frame, is_speech))
            num_voiced = len([f for f, speech in ring_buffer if speech])
            #if we are not triggered and more than 90% of the frames in
            #the ring buffer are voiced frames, then enter the triggered state
            if num_voiced > 0.9 * ring_buffer.maxlen:
                triggered = True
                #sys.stdout.write('TRIGGERED')
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

    #if triggered:
        #sys.stdout.write('NOT TRIGGERED')
    sys.stdout.write('\n')
    # If we have any leftover voiced audio when we run out of input, yield it
    if voiced_frames:
        yield b''.join(voiced_frames)


def run(device):
    sample_rate = 16000
    vad = webrtcvad.Vad(3)
    segments = vad_collector(sample_rate, 30, 300, vad, device)
    #emotion detector
    detector = EmotionDetector('deteccion\Audio\modelAudio.sav')
    for i, segment in enumerate(segments):
        #convert to np.array dtype = float32
        input = np.frombuffer(segment, dtype = np.int16).astype(np.float32)/32767
        #pass to neural net
        output = detector.predict(input)
        print(output)
    
    return detector.history



