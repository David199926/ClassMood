import eel
import json
import os
confTemplate = {"user": {"email": "", "password": "", "code": ""}}
FILES_PATH = os.path.join(os.path.expanduser('~'), "Documents", "ClassMood")
CONF_FILE = os.path.join(FILES_PATH, "conf.json")

def setConfFiles():
    try:
        os.mkdir(FILES_PATH)
    except: pass
    finally:
        saveConf(confTemplate)


@eel.expose
def readConf():
    try:
        with open(CONF_FILE, 'r') as conf:
            return json.load(conf)
    except FileNotFoundError:
        setConfFiles()
        return confTemplate


@eel.expose
def saveConf(data):
    with open(CONF_FILE, 'w+') as conf:
        json.dump(data, conf, ensure_ascii=False)
