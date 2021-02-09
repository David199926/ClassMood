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
        return image

    def getBytes(self, img):
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()