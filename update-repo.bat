@echo off
echo Atualizando repositório BingoLive+...

git add .
if %errorlevel% neq 0 (
    echo Erro ao adicionar arquivos
    pause
    exit /b %errorlevel%
)

set /p commit_msg="Digite a mensagem do commit: "
git commit -m "%commit_msg%"
if %errorlevel% neq 0 (
    echo Erro ao criar commit
    pause
    exit /b %errorlevel%
)

git push
if %errorlevel% neq 0 (
    echo Erro ao enviar para o GitHub
    pause
    exit /b %errorlevel%
)

echo Repositório atualizado com sucesso!
pause 