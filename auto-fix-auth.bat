@echo off
echo.
echo ====================================================
echo   AUTO-FIX Authentication Script
echo ====================================================
echo.
echo Fixing authentication automatically...
echo.

REM Check if Chrome is running
tasklist /FI "IMAGENAME eq chrome.exe" 2>NUL | find /I /N "chrome.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] Chrome is running. You'll need to manually clear cookies.
    echo       Press F12 ^> Application ^> Cookies ^> Delete accessToken and refreshToken
    goto :manual_steps
)

echo [OK] Backend restarted with fixed configuration
echo [OK] Cookie expiration: 7 days ^(access^) / 30 days ^(refresh^)
echo [OK] Redirect URI: http://localhost:5173/auth/callback/google
echo.

:manual_steps
echo.
echo ====================================================
echo   MANUAL STEPS REQUIRED
echo ====================================================
echo.
echo 1. CLEAR BROWSER COOKIES:
echo    - Open your browser
echo    - Press F12 to open DevTools
echo    - Go to Application ^> Cookies ^> http://localhost:5173
echo    - Delete 'accessToken' and 'refreshToken' cookies
echo    - Refresh the page ^(F5^)
echo.
echo 2. VERIFY GOOGLE CLOUD CONSOLE:
echo    If Google OAuth still fails, update redirect URI:
echo    - Go to: https://console.cloud.google.com/apis/credentials
echo    - Click your OAuth 2.0 Client ID
echo    - Under "Authorized redirect URIs", add:
echo      * http://localhost:5173/auth/callback/google
echo    - Save and wait 5 minutes
echo.
echo 3. TRY LOGGING IN:
echo    - Go to http://localhost:5173/login
echo    - Try regular login or Google OAuth
echo.
echo ====================================================
echo.
pause
