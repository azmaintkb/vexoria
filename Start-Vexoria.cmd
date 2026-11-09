@echo off
cd /d "%~dp0"
echo Vexoria storefront: http://localhost:5173
echo Vexoria admin: http://localhost:5173/admin
echo Local admin password: vexoria-local-preview
echo Keep this window open while using the store. Press Ctrl+C to stop.
npm.cmd run dev
pause
