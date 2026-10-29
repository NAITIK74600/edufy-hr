Add-Type -AssemblyName System.Drawing

function Create-PwaIcon($size, $outputPath, $isMaskable = $false) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background gradient or solid deep brand teal
    $bgColor = [System.Drawing.ColorTranslator]::FromHtml("#006E6F")
    $bgBrush = New-Object System.Drawing.SolidBrush($bgColor)
    $g.FillRectangle($bgBrush, 0, 0, $size, $size)

    # Rounded inner square badge if not maskable
    if (-not $isMaskable) {
        $cornerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#0A2328"))
        $g.FillRectangle($cornerBrush, [int]($size * 0.05), [int]($size * 0.05), [int]($size * 0.9), [int]($size * 0.9))
    }

    # Draw centered Logo if exists
    $logoPath = Resolve-Path "public\elythra-edufyitech-logo.png"
    if (Test-Path $logoPath) {
        $logo = [System.Drawing.Bitmap]::FromFile($logoPath)
        
        # Scale logo to fit nicely in center
        $targetW = [int]($size * 0.75)
        $targetH = [int]($targetW * ($logo.Height / $logo.Width))
        if ($targetH -gt ($size * 0.5)) {
            $targetH = [int]($size * 0.5)
            $targetW = [int]($targetH * ($logo.Width / $logo.Height))
        }
        $x = [int](($size - $targetW) / 2)
        $y = [int](($size - $targetH) / 2)

        $g.DrawImage($logo, $x, $y, $targetW, $targetH)
        $logo.Dispose()
    }

    # Save PNG
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "Created $outputPath ($size x $size)"
}

Create-PwaIcon 192 "public\icon-192.png" $false
Create-PwaIcon 512 "public\icon-512.png" $false
Create-PwaIcon 512 "public\icon-maskable-512.png" $true

