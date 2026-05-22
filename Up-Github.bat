@echo off
echo ==============================================
echo DAY CODE LEN GITHUB
echo ==============================================
echo.
echo Buoc 1: Vao trang https://github.com/new de tao 1 Repository moi.
echo Ghi ten Repo la Secret-Hitler-Viet-Hoa (roi keo xuong an nut mau xanh Create Repository).
echo.
echo Buoc 2: Sau khi tao xong, copy duong link cua Repo.
echo Vi du: https://github.com/Tencuaban/Secret-Hitler-Viet-Hoa.git
echo.
set /p gitlink="Dan (Paste) duong link cua ban vao day roi an Enter: "
echo.

echo Dang day code len...
set PATH=D:\laragon\bin\git\bin;%PATH%
git remote add origin %gitlink%
git branch -M main
git push -u origin main

echo.
echo Hoan thanh! Bay gio ban co the quay lai Render.com de lam tiep.
pause
