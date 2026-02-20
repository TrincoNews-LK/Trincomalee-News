# PowerShell Script to Update News Data
# Run this script after adding a new folder with news content.

$newsDir = "news"
$outputFile = "news_data.js"
$defaultImage = "https://images.unsplash.com/photo-1588528292866-51f228d70954?q=80&w=2070&auto=format&fit=crop"
$bt = [char]96 # Backtick character

$newsItems = @()

# Get all subdirectories in news/
if (Test-Path $newsDir) {
    # Sort descending so newest folders are processed first (optional, sorting happens in JS too)
    $dates = Get-ChildItem -Path $newsDir -Directory | Sort-Object Name -Descending
}
else {
    Write-Host "News directory not found!"
    exit
}

foreach ($dateDir in $dates) {
    $folderName = $dateDir.Name
    $dirPath = "$newsDir/$folderName"
    
    # Extract date from folder name (e.g., "2026-02-15(1)" -> "2026-02-15")
    if ($folderName -match "^(\d{4}-\d{2}-\d{2})") {
        $date = $matches[1]
    }
    else {
        # Fallback if folder name doesn't start with date, though user instructions say it should.
        $date = $folderName
    }
    
    # Find text file
    $txtFile = Get-ChildItem -Path $dateDir.FullName -Filter "*.txt" | Select-Object -First 1
    
    # Find image file
    $imgFile = Get-ChildItem -Path $dateDir.FullName -Include "*.jpg", "*.jpeg", "*.png", "*.webp" -Recurse | Select-Object -First 1

    $title = "News Update - $date"
    $contentRaw = "No content available."
    $image = $defaultImage

    if ($txtFile) {
        # Read content using UTF8 encoding for Sinhala support
        $rawContent = Get-Content -Path $txtFile.FullName -Raw -Encoding UTF8
        if ($rawContent) {
            $contentRaw = $rawContent
           
            # Get title from first line
            $lines = $contentRaw -split "`r`n"
            if ($lines.Length -eq 1) { $lines = $contentRaw -split "`n" }
           
            if ($lines.Count -gt 0) {
                $potentialTitle = $lines[0].Trim()
                if ($potentialTitle.Length -gt 0) {
                    $title = $potentialTitle
                }
            }
        }
    }
    
    # Escape content for JS Template Literal
    $safeContent = $contentRaw -replace "$bt", "\$bt"
    $safeContent = $safeContent -replace '\$\{', '\${' 

    if ($imgFile) {
        $image = "$dirPath/" + $imgFile.Name
    }

    $item = "    {
        id: `"$folderName`",
        date: `"$date`",
        title: `"$title`",
        image: `"$image`",
        content: $bt$safeContent$bt
    }"
    
    $newsItems += $item
}

# Join items
$joinedItems = $newsItems -join "," + [Environment]::NewLine

# Combine into JS file
$jsContent = "window.newsData = [" + [Environment]::NewLine + $joinedItems + [Environment]::NewLine + "];"
Set-Content -Path $outputFile -Value $jsContent -Encoding UTF8

Write-Host "Success! news_data.js has been updated with $($newsItems.Count) news items."
