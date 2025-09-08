@echo off
chcp 65001 >nul
echo 正在处理下载的i18n文件...
echo.

:: 检查是否提供了ZIP文件路径
if "%1"=="" (
    echo 使用方法: extract-downloaded-files.bat "ZIP文件路径"
    echo 例如: extract-downloaded-files.bat "C:\Downloads\i18n-files.zip"
    pause
    exit /b 1
)

:: 检查ZIP文件是否存在
if not exist "%1" (
    echo 错误: 找不到文件 %1
    pause
    exit /b 1
)

:: 获取当前脚本所在目录
set "SCRIPT_DIR=%~dp0"
set "DOWNLOADED_DIR=%SCRIPT_DIR%languages"

:: 创建临时解压目录
set "TEMP_EXTRACT=%TEMP%\i18n_extract_%RANDOM%"
mkdir "%TEMP_EXTRACT%" 2>nul

echo 正在解压文件到临时目录...
:: 使用PowerShell解压ZIP文件
powershell -Command "Expand-Archive -Path '%1' -DestinationPath '%TEMP_EXTRACT%' -Force"

if %ERRORLEVEL% neq 0 (
    echo 错误: 解压失败
    rmdir /s /q "%TEMP_EXTRACT%" 2>nul
    pause
    exit /b 1
)

echo 正在复制文件到languages目录...

:: 确保languages目录存在
if not exist "%DOWNLOADED_DIR%" mkdir "%DOWNLOADED_DIR%"

:: 复制version.json和language-list.json
if exist "%TEMP_EXTRACT%\version.json" (
    copy "%TEMP_EXTRACT%\version.json" "%DOWNLOADED_DIR%\" >nul
    echo ✓ 已复制 version.json
)

if exist "%TEMP_EXTRACT%\language-list.json" (
    copy "%TEMP_EXTRACT%\language-list.json" "%DOWNLOADED_DIR%\" >nul
    echo ✓ 已复制 language-list.json
)

:: 复制languages目录下的所有JSON文件
if exist "%TEMP_EXTRACT%\languages" (
    for %%f in ("%TEMP_EXTRACT%\languages\*.json") do (
        copy "%%f" "%DOWNLOADED_DIR%\" >nul
        echo ✓ 已复制 %%~nxf
    )
)

:: 清理临时目录
rmdir /s /q "%TEMP_EXTRACT%" 2>nul

echo.
echo 🎉 文件处理完成！
echo 所有语言文件已更新到 languages 目录
echo.
echo 提示: 如果前端开发服务器正在运行，页面应该会自动重新加载
echo.
pause