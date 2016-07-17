@echo off 
pushd "%~dp0../../redist/" 
call "ParaEngineClient.exe" single="false" mc="true" noupdate="true" dev="%~dp0" mod="GitUploader" isDevEnv="true" world="worlds/DesignHouse/MyWorld"  
popd 
