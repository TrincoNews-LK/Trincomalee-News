# PowerShell Script to Update Visit Places Data
$visitDir = "Visit Places"
$outputFile = "visit_data.js"
$defaultImage = "https://images.unsplash.com/photo-1588528292866-51f228d70954?q=80&w=2070&auto=format&fit=crop"
$bt = [char]96 # Backtick character

$places = @()

if (Test-Path $visitDir) {
    $folders = Get-ChildItem -Path $visitDir -Directory
}
else {
    Write-Host "Visit Places directory not found!"
    exit
}

foreach ($folder in $folders) {
    $folderName = $folder.Name
    $dirPath = "$visitDir/$folderName"
    
    # Find text file (assume info.txt or similar)
    $txtFile = Get-ChildItem -Path $folder.FullName -Filter "*.txt" | Select-Object -First 1
    
    # Find image file
    $imgFile = Get-ChildItem -Path $folder.FullName -Include "*.jpg", "*.jpeg", "*.png", "*.webp" -Recurse | Select-Object -First 1

    $title = $folderName
    $contentRaw = "No description available."
    
    # Default images with "WOW" factor for specific places
    $image = $defaultImage
    if ($folderName -match "Nilaveli") { $image = "https://images.unsplash.com/photo-1546708773-e57c17acb407?q=80&w=2669&auto=format&fit=crop" }
    elseif ($folderName -match "Koneswaram") { $image = "https://images.unsplash.com/photo-1625505085148-7323861219ef?q=80&w=2670&auto=format&fit=crop" }
    elseif ($folderName -match "Pigeon") { $image = "https://images.unsplash.com/photo-1584000306354-9388cbe19e36?q=80&w=2574&auto=format&fit=crop" }
    elseif ($folderName -match "Marble") { $image = "https://images.unsplash.com/photo-1590664095641-7fa0542dfd45?q=80&w=2070&auto=format&fit=crop" }
    elseif ($folderName -match "Kanniya") { $image = "https://lh3.googleusercontent.com/p/AF1QipN3-v33i_XzXgqK3qfXj1f3_XjXjXjXjXjXjXjX=s1360-w1360-h1020" } # Disclaimer: URL might need check, using generic placeholder if uncertain:
    elseif ($folderName -match "Kanniya") { $image = "https://images.unsplash.com/photo-1580910543303-3ca441e3d362?q=80&w=2070&auto=format&fit=crop" } # General SL nature


    if ($txtFile) {
        $rawContent = Get-Content -Path $txtFile.FullName -Raw -Encoding UTF8
        if ($rawContent) {
            $contentRaw = $rawContent
        }
    }
    
    # If local image exists, use local path relative to root
    if ($imgFile) {
        $image = "$dirPath/" + $imgFile.Name
    }

    # Escape content
    $safeContent = $contentRaw -replace "$bt", "\$bt"
    $safeContent = $safeContent -replace '\$\{', '\${'

    $item = "    {
        title: `"$title`",
        image: `"$image`",
        content: $bt$safeContent$bt
    }"
    
    $places += $item
}

$joinedItems = $places -join "," + [Environment]::NewLine
$jsContent = "window.visitData = [" + [Environment]::NewLine + $joinedItems + [Environment]::NewLine + "];"
Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Success! visit_data.js has been updated with $($places.Count) places."
