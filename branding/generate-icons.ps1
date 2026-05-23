# Generate favicons, Apple touch icon, PWA icons, and OG image from icon-source.png
Add-Type -AssemblyName System.Drawing

$src = Join-Path $PSScriptRoot "icon-source.png"
$out = Join-Path (Split-Path $PSScriptRoot -Parent) "public"  # public/ at project root

if (-not (Test-Path -LiteralPath $src)) { Write-Error "icon-source.png not found"; exit 1 }

$source = [System.Drawing.Image]::FromFile($src)
$sW = $source.Width; $sH = $source.Height

# Pad with the source's own background colour (sampled from the corners) so
# letterbox bars on the wide OG image blend instead of clashing.
$probe = New-Object System.Drawing.Bitmap $source
$corners = @(
    $probe.GetPixel(0, 0),
    $probe.GetPixel($sW - 1, 0),
    $probe.GetPixel(0, $sH - 1),
    $probe.GetPixel($sW - 1, $sH - 1)
)
$rAvg = [int](($corners | ForEach-Object { $_.R } | Measure-Object -Average).Average)
$gAvg = [int](($corners | ForEach-Object { $_.G } | Measure-Object -Average).Average)
$bAvg = [int](($corners | ForEach-Object { $_.B } | Measure-Object -Average).Average)
$probe.Dispose()
$pad = [System.Drawing.Color]::FromArgb(255, $rAvg, $gAvg, $bAvg)
"pad colour sampled: R=$rAvg G=$gAvg B=$bAvg"

function Save-Resized {
    param([int]$canvasW, [int]$canvasH, [string]$outFile)
    $bmp = New-Object System.Drawing.Bitmap $canvasW, $canvasH
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $g.Clear($pad)

    # Scale source to fit within canvas preserving aspect; center
    $scale = [Math]::Min($canvasW / $sW, $canvasH / $sH)
    $w = [int]($sW * $scale)
    $h = [int]($sH * $scale)
    $x = [int](($canvasW - $w) / 2)
    $y = [int](($canvasH - $h) / 2)
    $g.DrawImage($source, $x, $y, $w, $h)

    $bmp.Save($outFile, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose(); $bmp.Dispose()
    "wrote $outFile ($canvasW x $canvasH)"
}

# Square icons (padded with sampled background colour to square)
Save-Resized 16  16  (Join-Path $out "favicon-16.png")
Save-Resized 32  32  (Join-Path $out "favicon-32.png")
Save-Resized 48  48  (Join-Path $out "favicon-48.png")
Save-Resized 180 180 (Join-Path $out "apple-touch-icon.png")
Save-Resized 192 192 (Join-Path $out "icon-192.png")
Save-Resized 512 512 (Join-Path $out "icon-512.png")

# og-image.png is hand-designed and managed directly in public/.
# Intentionally NOT regenerated here — drop a new version into public/ when
# updating the share card. To match the icons, also copy that file over
# branding/icon-source.png before re-running this script.

$source.Dispose()
