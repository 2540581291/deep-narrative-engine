@echo off
cd /d "%~dp0"

taskkill /F /IM electron.exe >/dev/null 2>nul

cls
echo =====================================
echo   深度叙事引擎 - AI 成人内容创作
echo =====================================
echo.
echo   [1] 启动运行模式
echo   [2] 生成本地包
echo   [3] 生成安装包
echo   [4] 安装依赖
echo   [5] 退出
echo.
choice /c 12345 /n /m "请选择 [1-5]: "

if errorlevel 5 exit /b
if errorlevel 4 goto install
if errorlevel 3 goto dist
if errorlevel 2 goto pack
if errorlevel 1 goto start

:start
start /min "" npx electron .
exit

:pack
npx electron-builder --dir
exit

:dist
npx electron-builder --win portable
exit

:install
npm install
exit
