@echo off
REM -----------------------------------------------------------------------------
REM  Copyright (c) TM Forum. All rights reserved.
REM
REM  Licensed under the Apache License, Version 2.0 (the "License");
REM  you may not use this file except in compliance with the License.
REM  You may obtain a copy of the License at
REM
REM      http://www.apache.org/licenses/LICENSE-2.0
REM
REM  Unless required by applicable law or agreed to in writing, software
REM  distributed under the License is distributed on an "AS IS" BASIS,
REM  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
REM  See the License for the specific language governing permissions and
REM  limitations under the License.
REM -----------------------------------------------------------------------------

REM Move to the directory containing this script
cd /d "%~dp0"

REM --- Clean up reports folder
if exist reports (
    rmdir /s /q reports
)
mkdir reports

REM --- Optional base URL argument
if not "%~1"=="" (
    set TEST_BASE_URL=%~1
)

REM --- Ensure Docker network 'tmf' exists
docker network inspect tmf >nul 2>&1
if errorlevel 1 (
    docker network create tmf >nul
)

REM --- Get UID/GID equivalents (Windows typically ignores these but kept for compatibility)
for /f "tokens=2 delims==;" %%I in ('wmic useraccount where name^="%USERNAME%" get sid /value ^| find "="') do set USER_SID=%%I

REM --- Start CTK container detached
for /f "delims=" %%i in ('docker compose run -d ctk') do set CTK_CONTAINER=%%i

if "%CTK_CONTAINER%"=="" (
    echo Failed to start CTK container.
    exit /b 1
)

REM --- Stream logs and wait for completion
echo Running CTK container: %CTK_CONTAINER%
docker logs -f "%CTK_CONTAINER%" 
docker wait "%CTK_CONTAINER%" > "%TEMP%\ctk_exit_code.txt"

set /p EXIT_CODE=<"%TEMP%\ctk_exit_code.txt"
del "%TEMP%\ctk_exit_code.txt" >nul 2>&1

REM --- Check report file
set REPORT_PATH=reports\htmlResults.html

if not exist "%REPORT_PATH%" (
    echo Report file "%REPORT_PATH%" does not exist. Exiting.
    docker rm -f "%CTK_CONTAINER%" >nul 2>&1
    exit /b 1
)

REM --- Open report in default browser
start "" "%REPORT_PATH%"

REM --- Cleanup container
docker rm -f "%CTK_CONTAINER%" >nul 2>&1
exit /b %EXIT_CODE%