import eel
import Configuration
import sys
from deteccion.Video import VideoProcessing
from deteccion.Audio import AudioProcessing

if __name__ == "__main__":
    eel.init('web')
    eel.start('autoLogIn.html', size = (1210,789))