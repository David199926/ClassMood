"""This is the microphone module
display and prepare microphone devices, setting attributes 
such as device name, sample frequency and frame duration
configured microphone instances can return audio frames from
audio streams 
"""


import pyaudio


class Microphone:
    audio = pyaudio.PyAudio()

    def __init__(self, fs, frame_duration, device=''):
        self.fs = fs
        self.index = 0
        self.change_microphone(device)
        self.chunk = int(self.fs * frame_duration / 1000)

    def start_recording(self):
        """Opens audio stream with instance params"""
        try:
            self.stream = self.audio.open(format=pyaudio.paInt16, channels=1,
                                          rate=self.fs, input=True,
                                          frames_per_buffer=self.chunk, input_device_index=self.index)
        except Exception as e:
            print(f'Error creating audio stream: {e}')

    def get_frame(self):
        """Return binary audio frame from audio stream"""
        try:
            frame = self.stream.read(self.chunk)
            return frame
        except AttributeError:
            print('Audio stream is not initialiized')

    def change_microphone(self, device):
        """Changes microphone device to 'device'"""
        print(f'buscando {device}')
        numdevices = self.audio.get_host_api_info_by_index(
            0).get("deviceCount")

        for i in range(numdevices):
            if (self.audio.get_device_info_by_host_api_device_index(
                0, i).get('name').lower() in device.lower()):
                # 'device' was found
                self.index = i
                print(f'{device} asigned as audio device')
                return

        print("Couldn't find device, default will be used")
        self.index = 0

    def release(self):
        """Close all audio stream resources"""
        try:
            self.stream.stop_stream()
            self.stream.close()
        except AttributeError:
            print('You tried to close the stream without creating it')
