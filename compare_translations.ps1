$en = Get-Content -Raw 'src/messages/en.json' | ConvertFrom-Json
$ar = Get-Content -Raw 'src/messages/ar.json' | ConvertFrom-Json

$enKeys = $en | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | Sort-Object
$arKeys = $ar | Get-Member -MemberType NoteProperty | Select-Object -ExpandProperty Name | Sort-Object

Write-Host "=== Translation Keys Comparison ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Keys in en.json but missing in ar.json:" -ForegroundColor Yellow
$missingInAr = $enKeys | Where-Object { $_ -notin $arKeys }
if ($missingInAr) {
    $missingInAr | ForEach-Object { Write-Host "  - $_" }
} else {
    Write-Host "  (None - all keys present)" -ForegroundColor Green
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Total keys in en.json: $($enKeys.Count)"
Write-Host "  Total keys in ar.json: $($arKeys.Count)"
Write-Host "  Missing keys in ar.json: $($missingInAr.Count)"
