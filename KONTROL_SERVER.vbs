Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
currentDir = fso.GetParentFolderName(WScript.ScriptFullName)
batFile = currentDir & "\KONTROL_SERVER.bat"
WshShell.Run "cmd.exe /c """ & batFile & """", 1, False
