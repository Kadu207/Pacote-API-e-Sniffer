# Publicar no GitHub

## Pré-requisitos

1. Conta em [github.com](https://github.com)
2. [Git](https://git-scm.com/) instalado
3. [GitHub CLI](https://cli.github.com/) (`gh`) — opcional, mas facilita

Autenticar o `gh` (uma vez):

```powershell
gh auth login
```

## Opção A — GitHub CLI (recomendado)

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"

git init
git add .
git commit -m "Initial commit: Pacote API e Sniffer"

gh repo create system-api-sniffer --public --source=. --remote=origin --push
```

Repositório privado:

```powershell
gh repo create system-api-sniffer --private --source=. --remote=origin --push
```

## Opção B — Site do GitHub (manual)

1. GitHub → **New repository** → nome: `system-api-sniffer` → Create (sem README).
2. No PC:

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"
git init
git add .
git commit -m "Initial commit: Pacote API e Sniffer"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/system-api-sniffer.git
git push -u origin main
```

## Atualizar depois

```powershell
cd "C:\Users\carlo\OneDrive\Área de Trabalho\Projetos DEV\Pacote API e Sniffer"
git pull
git add .
git commit -m "feat: descreva a melhoria"
git push
```

## Cursor

Abra esta pasta no Cursor (`File → Open Folder`). Após `git pull`, o pacote fica atualizado.
