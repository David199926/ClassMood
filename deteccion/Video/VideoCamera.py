import cv2

class VideoCamera:
    def startCapture(self):
        self.video = cv2.VideoCapture(0)

    def release(self):
        try:
            self.video.release()
        except AttributeError:
            print('video no definido')

    def getFrame(self):
        success, image = self.video.read()
        if not success: raise ExternalCameraUsageError()
        return image

    def getBytes(self, img):
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()


#Excepciones 
class ExternalCameraUsageError(Exception):
    def __init__(self, message = 'Could not open video source, another app is probably using camera',*args, **kwargs):
        super().__init__(*args, **kwargs)