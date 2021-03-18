"""This is the video detector module
class VideoDetector instaces initialize a convolutional neural network
model for emotion recognition from facial expressions. features are extrated
from 48x48 images from faces, then feed in a keras CNN model
imported from .H5 file
"""



import os

import tensorflow as tf
import cv2
import numpy as np


class VideoDetector:

    # Anger -> 0
    # Disgust -> 1
    # Fear -> 2
    # Happiness -> 3
    # Sadness -> 4
    # Surprise -> 5
    # Neutral -> 6

    # Certainty of prediction
    CERTAINTY = 0.75

    def __init__(self, file_name=None):
        route = os.path.join('deteccion', 'Video',
                             'haarcascade_frontalface_default.xml')
        self.face_cascade = cv2.CascadeClassifier(route)
        if file_name is not None:
            with open(file_name, 'r') as model:
                self.loaded_model = tf.keras.models.model_from_json(
                    model.read())

    def load_weights(self, file_name):
        self.loaded_model.load_weights(file_name).expect_partial()
        self.loaded_model.compile(
            loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    def detect_face(self, input, to_gray_scale=False):
        if to_gray_scale:
            input = cv2.cvtColor(input, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(input, 1.3, 5)
        return faces[0] if len(faces) > 0 else None

    def predict(self, input):
        input = cv2.cvtColor(input, cv2.COLOR_BGR2GRAY)
        face_detection = self.detect_face(input)
        # No se detectó ninguna cara
        if face_detection is None:
            return None
        x, y, w, h = face_detection
        face = cv2.resize(
            input[y: y + h, x: x + w], (48, 48), cv2.INTER_AREA).reshape(1, 48, 48, 1)
        # convertir imagen en tensor para evitar retraicing
        face = tf.convert_to_tensor(face, dtype=tf.uint8)
        prediction = self.loaded_model.predict(face)
        confidence = prediction.max()
        emotion = np.argmax(prediction)
        return emotion if confidence >= self.CERTAINTY else None
