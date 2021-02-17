import tensorflow as tf
import cv2
import numpy as np
import os

class VideoDetector:
    #Enojo -> 0
    #Disgusto -> 1
    #Miedo -> 2
    #Felicidad -> 3
    #Tristeza -> 4
    #Sorpresa -> 5
    #Neutral -> 6

    #certeza de considerar a una predicción como confiable
    __certainty = 0.75

    def __init__(self, fileName = None):
        route = os.path.join('deteccion', 'Video', 'haarcascade_frontalface_default.xml')
        self.faceCascade = cv2.CascadeClassifier(route)
        if fileName is not None:
            with open(fileName, 'r') as model:
                self.loadedModel = tf.keras.models.model_from_json(model.read())

    def loadWeights(self, fileName):
        self.loadedModel.load_weights(fileName).expect_partial()
        self.loadedModel.compile(
            loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])

    def detectFace(self, input, toGrayScale = False):
        if toGrayScale: input = cv2.cvtColor(input, cv2.COLOR_BGR2GRAY)
        faces = self.faceCascade.detectMultiScale(input, 1.3, 5)
        return faces[0] if len(faces) > 0 else None

    def predict(self, input):
        input = cv2.cvtColor(input, cv2.COLOR_BGR2GRAY)
        faceDetection = self.detectFace(input)
        #No se detectó ninguna cara
        if faceDetection is None: return None
        x,y,w,h = faceDetection
        face = cv2.resize(
            input[y: y + h, x: x + w], (48, 48), cv2.INTER_AREA).reshape(1, 48, 48, 1)
        #convertir imagen en tensor para evitar retraicing
        face = tf.convert_to_tensor(face, dtype=tf.uint8)
        prediction = self.loadedModel.predict(face)
        confidence = prediction.max()
        emotion = np.argmax(prediction)
        return emotion if confidence >= self.__certainty else None

