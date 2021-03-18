"""This is the video processing module
this module communicates with front-end javascript to perform
facial expression emotion recognition.
The main operations of this module are: video capture, processing
and transmition.
Instantiates Camera object and VideoDetector object
"""


import os
from datetime import datetime
import time

import base64

import eel
from deteccion.Video.video_camera import VideoCamera
from deteccion.Video.video_camera import ExternalCameraUsageError
from deteccion.Video.video_detector import VideoDetector


_processing_control = False
_control = False
_camera = VideoCamera()
_detector = None
# processing interval (seconds)
DT = 1
_t0 = 0


def _load_detector():
    global _detector
    _detector = VideoDetector(os.path.join('deteccion', 'Video', 'model.json'))
    _detector.load_weights(os.path.join('deteccion', 'Video',
                                       'pesos', 'pesos_23.01.2021-14_17_21.H5'))


def _capture():
    # initialize processing interval
    _t0 = time.time()
    while _control:
        try:
            frame = _camera.get_frame()
            if _processing_control:
                _processing(frame)
            yield frame
        except ExternalCameraUsageError:
            # notify the user that camera is being used by other application
            eel.verifyCameraUsage()()


def _processing(frame):
    global _t0
    # emotion detection
    if _detector is not None and time.time() - _t0 >= DT:
        emotion = _detector.predict(frame)
        _t0 = time.time()
        if emotion is not None:
            eel.processEmotion([
                datetime.now().strftime("%H:%M:%S"),
                str(emotion)
            ])()


def _transmit():
    output = _capture()
    for image in output:
        blob = base64.b64encode(_camera.get_bytes(image))
        blob = blob.decode("utf-8")
        eel.transmitVideo(blob)()


@eel.expose
def start_video_transmition(processing_flag=False):
    """Start video transmition using Camera instance"""
    global _control
    _control = True
    change_video_processing(processing_flag)
    _load_detector()
    # start video capture
    global _camera
    _camera.start_capture()
    _transmit()


@eel.expose
def stop_video_transmition():
    """Stop video recording,
    release camera video resources"""
    global _control
    _control = False
    change_video_processing(False)
    # release camera resources
    global _camera
    _camera.release()


@eel.expose
def change_video_processing(new_value):
    global _processing_control
    if not isinstance(new_value, bool):
        return None
    # must be transmiting to start processing
    _processing_control = new_value and _control
