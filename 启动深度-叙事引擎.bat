@echo off
rem ============================================================
rem  Deep Narrative Engine launcher
rem  double-click = start (background, this window closes at once)
rem  with args    = foreground, Electron exit code is passed through
rem  args: --smoke  --dsh-check  --dsh-page=ID  --dsh-devtools
rem ============================================================
chcp 65001 >nul
setlocal EnableDelayedExpansion
pushd "%~dp0"

rem 0) some toolchains preset this: it turns electron.exe into plain node
set "ELECTRON_RUN_AS_NODE="

rem probe app: companion script _mkprobe.ps1 writes it to %TEMP%\dsh-elprobe
set "PROBE=%TEMP%\dsh-elprobe"
if not exist "%PROBE%\test.js" if exist "%~dp0_mkprobe.ps1" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0_mkprobe.ps1" >nul 2>nul

rem 1) project electron, accepted only if the probe really runs it
if exist "%~dp0node_modules\electron\dist\electron.exe" (
  set "EXE=%~dp0node_modules\electron\dist\electron.exe"
  call :VERIFY
  if defined EXE echo [info] electron: project !GOTV!
)

rem 2) otherwise borrow one from a sibling project (paths derived from %~dp0, never hard-coded)
if not defined EXE (
  for /d %%d in ("%~dp0..\*") do (
    if not defined EXE (
      if /i not "%%~fd"=="%~dp0." (
        if exist "%%d\node_modules\electron\dist\electron.exe" (
          set "EXE=%%d\node_modules\electron\dist\electron.exe"
          call :VERIFY
          if defined EXE echo [info] electron: sibling %%~nxd !GOTV!
        )
      )
    )
  )
)
if not defined EXE (
  for /d %%d in ("%~dp0..\..\*") do (
    if not defined EXE (
      if exist "%%d\node_modules\electron\dist\electron.exe" (
        set "EXE=%%d\node_modules\electron\dist\electron.exe"
        call :VERIFY
        if defined EXE echo [info] electron: sibling %%~nxd !GOTV!
      )
    )
  )
)

if not defined EXE (
  echo [ERROR] no runnable electron.exe found.
  echo Try: npm install
  popd
  pause
  exit /b 1
)

rem 3) no args = double-click: start in background, exit immediately
if "%~1"=="" (
  echo Starting Deep Narrative Engine ...
  start "" "%EXE%" .
  timeout /t 3 >nul 2>nul
  popd
  exit /b 0
)

rem 4) with args = foreground run, pass Electron exit code through
"%EXE%" . %*
set "CODE=%ERRORLEVEL%"
popd
exit /b %CODE%

rem ---- probe: an electron that cannot initialize dies before creating a window ----
rem note: its failure code is negative (0x80000003), so compare the value as text
:VERIFY
if not exist "%PROBE%\test.js" exit /b 0
set "OUT=%PROBE%\version.txt"
if exist "%OUT%" del "%OUT%" >nul 2>nul
pushd "%PROBE%"
"%EXE%" . >nul 2>nul
set "PRC=!ERRORLEVEL!"
set "GOTV="
if exist "%OUT%" for /f "usebackq delims=" %%v in ("%OUT%") do set "GOTV=%%v"
popd
rem the probe writes version.txt only when a real electron runtime came up
if not "!PRC!"=="0" set "EXE="
if not defined GOTV set "EXE="
exit /b 0
