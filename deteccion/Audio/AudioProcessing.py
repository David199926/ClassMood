import eel
import deteccion.Audio.Microphone as Microphone
# import deteccion.Audio.AudioDetector as AudioDetector
from deteccion.Audio.AudioDetector import EmotionDetector
from deteccion.Audio.Microphone import Microphone
import collections
import sys
import webrtcvad
import numpy as np


@eel.expose
def run(device):
    sample_rate = 16000
    vad = webrtcvad.Vad(3)
    segments = vad_collector(sample_rate, 30, 300, vad, '72b4d17e4322f0a25e32156db8f176fe6725f1afc0da7e46fea7cd1669d7c696')
    #emotion detector
    detector = EmotionDetector('deteccion\Audio\modelAudio.sav')
        #convert to np.array dtype = float32
    input = np.frombuffer(bytes(segments), dtype = np.int16).astype(np.float32)/32767
    #pass to neural net
    output = detector.predict(input)
    print(output)
    
    return detector.history

def vad_collector(sample_rate, frame_duration_ms, padding_duration_ms, vad,device):
      """filtering out non-voiced audio frames
      Returns a generator that yields PCM audio data
      """
      num_padding_frames = int(padding_duration_ms / frame_duration_ms)
      ring_buffer = collections.deque(maxlen=num_padding_frames)
      #we have two states: TRIGGERED and NOTRIGGERED. We start in the NOTTRIGGERED state
      triggered = False
      Microphones = Microphone(device,sample_rate,frame_duration_ms)
      voiced_frames = None
      frame = Microphones.getFrame()
      is_speech = vad.is_speech(frame, sample_rate)

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
                  voiced_frames = f
              ring_buffer.clear()

      else:
          #We are in the TRIGGERED state, so collect the audio data
          #and add it to the ring buffer
          voiced_frames = frame
          ring_buffer.append((frame, is_speech))
          num_unvoiced = len([f for f, speech in ring_buffer if not speech])
          #If more than 90% of the frames in the ring buffer are unvoiced
          #then enter NOTTRIGGERED and yield collected audio
          if num_unvoiced > 0.9 * ring_buffer.maxlen:
              #sys.stdout.write('NOT TRIGGERED')
              triggered = False
              yield voiced_frames
              ring_buffer.clear()
              voiced_frames = []

      #if triggered:
      #sys.stdout.write('NOT TRIGGERED')
      sys.stdout.write('\n')
      # If we have any leftover voiced audio when we run out of input, yield it
      if voiced_frames:
        yield voiced_frames

