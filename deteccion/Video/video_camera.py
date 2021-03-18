"""This is the camenra module
display and prepare camera devices,
camenra instances can return video frames from
video streams 
"""


import cv2


class VideoCamera:

    def start_capture(self):
        """Start video capture"""
        self.video = cv2.VideoCapture(0)

    def release(self):
        """release video resources"""
        try:
            self.video.release()
        except AttributeError:
            print('video no definido')

    def get_frame(self):
        """Return raw video frame in numpy array form"""
        success, image = self.video.read()
        if not success:
            raise ExternalCameraUsageError()
        return image

    def get_bytes(self, img):
        """Return image array compressed using JPEG format"""
        _, jpeg = cv2.imencode('.jpg', img)
        return jpeg.tobytes()


# Exceptions
class ExternalCameraUsageError(Exception):

    def __init__(self, message='Could not open video source, another app is probably using camera', *args, **kwargs):
        super().__init__(*args, **kwargs)
