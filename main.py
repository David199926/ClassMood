import eel
import json

CONF_FILE = "conf.json"

@eel.expose
def readConf():
    with open(CONF_FILE, 'r') as conf:
        return json.load(conf)

@eel.expose
def saveConf(data):
    with open(CONF_FILE, 'w') as conf:
        json.dump(data, conf, ensure_ascii= False)

if __name__ == "__main__":
    eel.init('web')
    eel.start('deteccion.html')