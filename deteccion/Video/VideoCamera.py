import cv2

class VideoCamera:
    def __init__(self):
        self.video = cv2.VideoCapture(0)

    def __del__(self):
        self.video.release()

    def getFrame(self):
        success, image = self.video.read()
        return image

    def getBytes(self, img):
        ret, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()