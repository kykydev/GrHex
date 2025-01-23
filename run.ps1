# Définir le chemin du script Node.js
$scriptPath = ".\backend\App.js"

# Vérifier si Node.js est installé
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "Node.js n'est pas installé ou n'est pas dans le PATH." -ForegroundColor Red
    exit 1
}

# Vérifier si le fichier App.js existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "Le fichier App.js n'existe pas à l'emplacement spécifié : $scriptPath" -ForegroundColor Red
    exit 1
}

# Exécuter le script Node.js
# Write-Host "Démarrage du backend..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "node" -ArgumentList $scriptPath -Wait