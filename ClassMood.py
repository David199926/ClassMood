import sys

import eel

import configuration
from deteccion.Video import video_processing
from deteccion.Audio import audio_processing


if __name__ == "__main__":
    eel.init('web')
    eel.start('autoLogIn.html', size=(1210, 789), mode='chrome')
