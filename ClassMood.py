import eel
import Configuration
import sys
sys.path.append('deteccion\Video')
sys.path.append('deteccion\Audio')
import VideoProcessing
import AudioProcessing
from deteccion.Video import VideoProcessing

if __name__ == "__main__":
    eel.init('web')
    eel.start('autoLogIn.html', size = (1210,789))