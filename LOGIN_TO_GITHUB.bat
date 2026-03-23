@echo off
title GitHub Login Setup
color 0B

echo ====================================================
echo  GITHUB ONE-TIME LOGIN SETUP
echo ====================================================
echo.
echo Please wait, opening GitHub Login...
echo A browser window will open shortly. Please click "Authorize github"
echo.

"C:\Program Files\GitHub CLI\gh.exe" auth login --hostname github.com -p https --web

echo.
echo Setting up permissions for Git...
"C:\Program Files\GitHub CLI\gh.exe" auth setup-git

echo.
echo ====================================================
echo  ALL DONE!
echo  You are totally set up. Now you can run RUN_UPDATE.bat
echo ====================================================
pause
exit
