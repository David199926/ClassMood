import eel

control = False

@eel.expose
def run():
    changeVideoControl(True)
    print('Hi')

@eel.expose
def stop():
    changeVideoControl(False)
    print('Bye')

@eel.expose
def changeVideoControl(newValue):
    global control
    control = newValue if isinstance(newValue, bool) else control
    print('control has changed to ', control)