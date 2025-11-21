@echo off
echo.
echo ====================================================
echo   Authentication Fix Script
echo ====================================================
echo.
echo This script will help fix authentication issues:
echo   - Cookie expiration has been fixed (7 days/30 days)
echo   - Redirect URI has been corrected
echo   - Backend has been restarted automatically
echo.
echo NEXT STEPS:
echo.
echo 1. Clear your browser cookies:
echo    - Press F12 to open DevTools
echo    - Go to Application ^> Cookies ^> http://localhost:5173
echo    - Delete 'accessToken' and 'refreshToken' cookies
echo    - Refresh the page
echo.
echo 2. Try logging in again
echo.
echo 3. If Google OAuth fails, update Google Cloud Console:
echo    - Go to: https://console.cloud.google.com/apis/credentials
echo    - Select your OAuth 2.0 Client ID
echo    - Under "Authorized redirect URIs", ensure you have:
echo      * http://localhost:5173/auth/callback/google
echo    - Save changes and wait 5 minutes for propagation
echo.
echo ====================================================
echo.
pause
