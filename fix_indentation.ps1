# PowerShell script to fix indentation in App.jsx
$filePath = "d:\FSOCIETY\TrueNeed\src\App.jsx"
$content = Get-Content $filePath -Raw

# Replace all sections that need indentation (add 4 spaces to lines after section tags)
$content = $content -replace '(?m)^(      </section>\r?\n\r?\n      \{/\* )(.*?)( \*/}\r?\n      <section )', '          </section>`r`n`r`n          {/* $2 */}`r`n          <section '
$content = $content -replace '(?m)^(      <section [^>]+>\r?\n)(\s{8})<', '$1            <'

# Save the file
Set-Content $filePath $content -NoNewline
Write-Host "Indentation fixed successfully!"
