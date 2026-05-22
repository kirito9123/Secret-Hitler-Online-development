@echo off
echo ==============================================
echo KHOI DONG SECRET HITLER LOCAL
echo ==============================================

echo [1/2] Dang khoi dong Backend Java...
start "Backend (Java)" cmd /k "cd backend && run-backend.bat"

echo [2/2] Dang khoi dong Frontend React...
start "Frontend (React)" cmd /k "cd frontend && set PATH=D:\laragon\bin\nodejs\node-v18;%PATH% && npm run devLocal"

echo.
echo ==============================================
echo HUONG DAN CHOI CHUNG QUA RADMIN VPN / HAMACHI
echo ==============================================
echo 1. NEU CHOI MOT MINH TREN MAY NAY:
echo    Trinh duyet se tu dong mo http://localhost:3000 sau 10 giay.
echo.
echo 2. NEU MUON BAN BE CHOI CHUNG TU XA:
echo    - Vao Radmin VPN lay IP cua ban (VD: 26.12.34.56).
echo    - Gui link cho ban be: http://(IP-cua-ban):3000
echo    - NHO TAT WINDOWS FIREWALL (Tuong lua) de ban be co the ket noi vao.
echo ==============================================
echo.

echo Dang mo trinh duyet tren may ban (Vui long doi khoang 10 giay cho server khoi dong xong)...
timeout /t 10
start http://localhost:3000
