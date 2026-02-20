@echo off
powershell -ExecutionPolicy Bypass -File update_news.ps1
powershell -ExecutionPolicy Bypass -File update_visit_places.ps1
powershell -ExecutionPolicy Bypass -File update_history.ps1
pause
