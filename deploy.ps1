# HMC Project Dashboard — deploy + sync script
# Run from anywhere: just double-click or call from PowerShell

$source  = "C:\Users\hmcwi\AppData\Roaming\Claude\local-agent-mode-sessions\82d14404-d5fb-42d9-963c-04029c2833f2\ee300c65-4627-472c-b52a-ceb37f5b14b6\local_e281d8c5-2b32-417d-9732-df2d4dfddaa1\outputs\project-dashboard"
$repo    = "D:\HM365C OneDrive\OneDrive - howardmcohen.com\HMC WRITE NOW\helpful-dragon"

Write-Host "`n→ Copying latest files from Claude outputs..." -ForegroundColor Cyan
Copy-Item "$source\index.html"               "$repo\index.html" -Force
Copy-Item "$source\netlify.toml"             "$repo\netlify.toml" -Force
Copy-Item "$source\netlify\functions\notion.js" "$repo\netlify\functions\notion.js" -Force

Set-Location $repo

Write-Host "→ Deploying to Netlify..." -ForegroundColor Cyan
netlify deploy --prod
if ($LASTEXITCODE -ne 0) { Write-Host "Netlify deploy failed." -ForegroundColor Red; exit 1 }

Write-Host "→ Committing to GitHub..." -ForegroundColor Cyan
git add -A
$msg = Read-Host "Commit message (or press Enter for default)"
if (-not $msg) { $msg = "Dashboard update $(Get-Date -Format 'yyyy-MM-dd')" }
git commit -m $msg
git push

Write-Host "`n✓ Done — deployed and synced to GitHub.`n" -ForegroundColor Green
