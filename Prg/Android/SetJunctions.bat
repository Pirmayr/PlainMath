@echo off
SET SAWDRIVE=%~d0
SET SAWSUBPATH=%~p0

echo Switching to %SAWBRANCH% ...

if exist "%SAWDRIVE%\%SAWBRANCH%\assets" junction -d "%SAWDRIVE%\%SAWBRANCH%\assets"

junction "%SAWDRIVE%\%SAWBRANCH%\assets" "%SAWDRIVE%\%SAWBRANCH%\..\..\Web"

goto successHandler

:errorHandler
echo Error! File path check failed.
goto end

:successHandler
echo Success!
goto end

:end

SET SAWDRIVE=
SET SAWSUBPATH=
