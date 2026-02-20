# PowerShell Script to Update History Data
$historyDir = "History"
$outputFile = "history_data.js"
$defaultImage = "https://images.unsplash.com/photo-1588528292866-51f228d70954?q=80&w=2070&auto=format&fit=crop"
$bt = [char]96 # Backtick character

$events = @()

if (Test-Path $historyDir) {
    $folders = Get-ChildItem -Path $historyDir -Directory
}
else {
    Write-Host "History directory not found!"
    if (!(Test-Path $outputFile)) {
        Set-Content -Path $outputFile -Value "window.historyData = [];" -Encoding UTF8
    }
    exit
}

foreach ($folder in $folders) {
    $folderName = $folder.Name
    $dirPath = "$historyDir/$folderName"
    
    # Find text file 
    $txtFile = Get-ChildItem -Path $folder.FullName -Filter "*.txt" | Select-Object -First 1
    
    # Find image file
    $imgFile = Get-ChildItem -Path $folder.FullName -Include "*.jpg", "*.jpeg", "*.png", "*.webp", "*.gif" -Recurse | Select-Object -First 1

    $title = $folderName
    $contentRaw = "No history available."
    $image = $defaultImage

    # Auto assign some history images if default
    if ($folderName -match "Fort") { $image = "https://upload.wikimedia.org/wikipedia/commons/e/e6/Fort_Fredrick_Trinco.jpg" }
    elseif ($folderName -match "Port") { $image = "https://images.unsplash.com/photo-1559599101-f09722fb4948?q=80&w=2074&auto=format&fit=crop" }
    elseif ($folderName -match "War") { $image = "https://images.unsplash.com/photo-1599939571322-792a326991f2?q=80&w=1965&auto=format&fit=crop" }
    elseif ($folderName -match "Temple") { $image = "https://images.unsplash.com/photo-1588528292866-51f228d70954?q=80&w=2070&auto=format&fit=crop" }

    if ($txtFile) {
        $rawContent = Get-Content -Path $txtFile.FullName -Raw -Encoding UTF8
        if ($rawContent) {
            $contentRaw = $rawContent
        }
    }
    
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
    
    $events += $item
}

$joinedItems = $events -join "," + [Environment]::NewLine
$jsContent = "window.historyData = [" + [Environment]::NewLine + $joinedItems + [Environment]::NewLine + "];"
Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Success! history_data.js has been updated with $($events.Count) events."
