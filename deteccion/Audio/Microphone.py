import pyaudio

class Microphone:
    audio = pyaudio.PyAudio()

    def __init__(self, device, fs, frame_duration):
        self.fs = fs
        self.changeMicrophone(device) 
        self.chunk= int(self.fs * frame_duration /1000)
        self.stream = audio.open(format=pyaudio.paInt16, channels=2,
                rate=self.fs, input=True,
                frames_per_buffer=self.chunk,input_device_index = index)
    
    def __del__(self):
        self.stream.stop_stream()
        self.stream.close()
        audio.terminate()


    def getFrame(self):
        # start Recording
        return stream.read(self.chunk)
        

    def changeMicrophone(self, device):
        numdevices = audio.get_host_api_info_by_index(0).get("deviceCount")
        for i in range(0, numdevices):
            if(audio.get_device_info_by_host_api_device_index(0, i).get('name') in device):
                self.index = i
                break