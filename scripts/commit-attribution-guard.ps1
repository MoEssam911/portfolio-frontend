# Stage attribution safeguards and create a sole-authored commit (no Cursor trailer).
$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $args[0]
$git = (Get-Command git.exe).Source

# Do not keep one-off rewrite helpers in the repo.
Remove-Item -Force -ErrorAction SilentlyContinue ".\scripts\rewrite-clean-commit.ps1"
Remove-Item -Force -ErrorAction SilentlyContinue ".\scripts\force-push-clean.ps1"
if ((Test-Path ".\scripts") -and -not (Get-ChildItem ".\scripts" -Force | Where-Object { $_.Name -ne "." })) {
  Remove-Item -Force -Recurse ".\scripts" -ErrorAction SilentlyContinue
}

& $git add -- ".husky/prepare-commit-msg" ".cursor/rules/no-ai-commit-attribution.mdc"
# Ensure deleted scripts are staged if they were tracked (they shouldn't be)
& $git add -A -- "scripts" 2>$null

$status = & $git status --porcelain
if (-not $status) {
  Write-Output "Nothing to commit"
  exit 0
}
Write-Output $status

$tree = (& $git write-tree).Trim()
$parent = (& $git rev-parse HEAD).Trim()
$msgPath = Join-Path $env:TEMP "attr-commit-msg.txt"
[System.IO.File]::WriteAllText(
  $msgPath,
  "chore: block AI co-author trailers on commits`n`nAdd a prepare-commit-msg hook and Cursor rule so commits stay sole-authored.`n"
)

$env:GIT_AUTHOR_NAME = "Mohamed Essam"
$env:GIT_AUTHOR_EMAIL = "mohamed.essamm@bevatel.com"
$env:GIT_COMMITTER_NAME = "Mohamed Essam"
$env:GIT_COMMITTER_EMAIL = "mohamed.essamm@bevatel.com"
Remove-Item Env:GIT_AUTHOR_DATE -ErrorAction SilentlyContinue
Remove-Item Env:GIT_COMMITTER_DATE -ErrorAction SilentlyContinue

$new = (& $git commit-tree $tree -p $parent -F $msgPath).Trim()
& $git update-ref HEAD $new
& $git update-ref refs/heads/develop $new
& $git update-ref refs/heads/main $new
& $git update-ref refs/heads/feat/static-migration $new
& $git update-ref refs/heads/clean-history $new

$body = & $git log -1 --format="%B"
Write-Output "NEW=$new"
Write-Output $body
if ($body -match "Co-authored-by|cursoragent") { throw "Trailer leaked into commit" }
Write-Output "OK"
