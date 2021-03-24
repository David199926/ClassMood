# -*- mode: python ; coding: utf-8 -*-

block_cipher = None


a = Analysis(['ClassMood.py'],
             pathex=['C:\\Python38\\Libsite-packages\\sklearn', 'D:\\U\\TESIS\\Codigos\\Componentes\\DesktopApp\\ClassMood'],
             binaries=[],
             datas=[('C:\\Python38\\lib\\site-packages\\eel\\eel.js', 'eel'), ('web', 'web'), ('C:\\Python38\\Lib\\site-packages\\librosa\\util\\example_data', 'librosa\\util\\example_data'), ('deteccion/Video/model.json', 'deteccion/Video'), ('deteccion/Video/haarcascade_frontalface_default.xml', 'deteccion/Video'), ('deteccion/Video/pesos/pesos_23.01.2021-14_17_21.H5.data-00000-of-00001', 'deteccion/Video/pesos'), ('deteccion/Video/pesos/pesos_23.01.2021-14_17_21.H5.index', 'deteccion/Video/pesos'), ('deteccion/Audio/modelAudio.sav', 'deteccion/Audio')],
             hiddenimports=['bottle_websocket'],
             hookspath=[],
             runtime_hooks=[],
             excludes=[],
             win_no_prefer_redirects=False,
             win_private_assemblies=False,
             cipher=block_cipher,
             noarchive=False)
pyz = PYZ(a.pure, a.zipped_data,
             cipher=block_cipher)
exe = EXE(pyz,
          a.scripts,
          [],
          exclude_binaries=True,
          name='ClassMood',
          debug=False,
          bootloader_ignore_signals=False,
          strip=False,
          upx=True,
          console=False , icon='Icon.ico')
coll = COLLECT(exe,
               a.binaries,
               a.zipfiles,
               a.datas,
               strip=False,
               upx=True,
               upx_exclude=[],
               name='ClassMood')
