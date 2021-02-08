import pickle
import numpy as np
import librosa
from datetime import datetime
import collections
import contextlib
import sys
import wave
import pyaudio

import webrtcvad


class EmotionDetector:

    def __init__(self, modelPath):
        with open(modelPath, 'rb') as file:
            self.loadedModel = pickle.load(file) 
        self.history = []
        
        self.emotions = ["angry", "disgust", "fear", "happy", "sad", "surprised", "neutral"]

    def predict(self, x):
        features = self._features(X = x, mfcc = True, chroma = True, mel = True, fs = True).reshape(1,180)
        output = self.loadedModel.predict(features)[0]
        #add result to history
        i = self.emotions.index(output)
        self.history.append((datetime.now().strftime("%H:%M:%S"), str(i)))
        return output
    
    
    def _features(self, X, mfcc, chroma, mel,fs):
        result = np.array([])
        if mfcc:
            mfccs = np.mean(librosa.feature.mfcc(y = X, sr = fs, n_mfcc=40).T, axis = 0)
            result = np.hstack((result, mfccs))
        if chroma:
            stft = np.abs(librosa.stft(X))
            chroma = np.mean(librosa.feature.chroma_stft(S=stft, sr=fs).T,axis=0)
            result=np.hstack((result, chroma))
        if mel:
            mel = np.mean(librosa.feature.melspectrogram(X, sr=fs).T,axis=0)
            result=np.hstack((result, mel))
        return result
    
    def vad_collector(self,sample_rate, frame_duration_ms, padding_duration_ms, vad,generated_frame):
        """filtering out non-voiced audio frames
        Returns a generator that yields PCM audio data
        """
        num_padding_frames = int(padding_duration_ms / frame_duration_ms)
        ring_buffer = collections.deque(maxlen=num_padding_frames)
        #we have two states: TRIGGERED and NOTRIGGERED. We start in the NOTTRIGGERED state
        triggered = False

        voiced_frames = []
        for frame in generated_frame:
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
