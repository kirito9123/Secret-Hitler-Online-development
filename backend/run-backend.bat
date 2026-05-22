@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-18.0.2
set PATH=%JAVA_HOME%\bin;%PATH%
set DEBUG_MODE=1

echo Using JAVA_HOME=%JAVA_HOME%
echo DEBUG_MODE=%DEBUG_MODE%

call gradlew.bat run
