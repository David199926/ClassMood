import pyaudio

class Microphone:
    audio = pyaudio.PyAudio()

    def __init__(self, fs, frame_duration, device = '' ):
        self.fs = fs
        self.index = 0
        self.changeMicrophone(device) 
        self.chunk= int(self.fs * frame_duration /1000)

    def startRecording(self):
        try:
            self.stream = self.audio.open(format=pyaudio.paInt16, channels=1,
                    rate=self.fs, input=True,
                    frames_per_buffer=self.chunk,input_device_index = self.index)
        except Exception as e: print(f'Error creando stream de audio: {e}')
 
    def getFrame(self):
        try:
            # start Recording
            ret = self.stream.read(self.chunk)
            return ret
        except AttributeError:
            print('El stream de audio no ha sido inicializado')
        

    def changeMicrophone(self, device):
        numdevices = self.audio.get_host_api_info_by_index(0).get("deviceCount")
        for i in range(numdevices):
            if(self.audio.get_device_info_by_host_api_device_index(0, i).get('name').lower() in device.lower()):
                self.index = i
                print(f'{device} asignado como dispositivo de audio')
                return
        print('no se ha encontrado el dispositivo, se cargara el primero')
        self.index = 0
  
    def release(self):
        try:
            self.stream.stop_stream()
            self.stream.close()
        except AttributeError:
            print('se intento cerrar el stream sin haberlo creado')

'''
    def __del__(self):
        self.stream.stop_stream()
        self.stream.close()
        audio.terminate()
        '''