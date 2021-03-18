"""This is the configuration module
provides read and write operations for conf.json, automatically located in Documents folders (for all OS)
"""


import os
import json

import eel


CONF_TEMPLATE = {
    "user": {
        "email": "",
        "password": "",
        "code": "",
        },
    "camera": "",
    "mic": "",
    }

FILES_PATH = os.path.join(os.path.expanduser('~'), "Documents", "ClassMood")
CONF_FILE_PATH = os.path.join(FILES_PATH, "conf.json")


def set_conf_files():
    """Creates conf.json file in user's Documents folder"""
    try:
        os.mkdir(FILES_PATH)
    except:
        pass
    finally:
        save_conf(CONF_TEMPLATE)


@eel.expose
def read_conf():
    """Returns dictionary with configuration data
    if conf is not found, returns configuration template
    """
    try:
        with open(CONF_FILE_PATH, 'r') as conf:
            return json.load(conf)
    except FileNotFoundError:
        set_conf_files()
        return CONF_TEMPLATE


@eel.expose
def save_conf(data):
    """Saves configuration data in conf.json file"""
    with open(CONF_FILE_PATH, 'w+') as conf:
        json.dump(data, conf, ensure_ascii=False)
