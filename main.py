import eel
import json

CONF_FILE = "conf.json"

@eel.expose
def readConf():
    with open(CONF_FILE) as conf: pass

@eel.expose
def writeConf(): pass

if __name__ == "__main__":
    eel.init('web')
    eel.start('login.html')