# Native Windows PowerShell HTTP Server (Zero Dependencies)
param([int]$Port = 8080)

$folder = $PSScriptRoot
if (-not $folder) { $folder = Get-Location }

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")

try {
    $listener.Start()
} catch {
    Write-Host "Port $Port is in use or blocked. Trying port 8081..." -ForegroundColor Yellow
    $Port = 8081
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add("http://localhost:$Port/")
    $listener.Start()
}

$url = "http://localhost:$Port/Mechanical_Suite_Dashboard.html"
Write-Host ""
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  Mechanical System Calculations Suite Server Running!" -ForegroundColor Green
Write-Host "  URL: $url" -ForegroundColor White
Write-Host "  Press Ctrl+C in this window to stop the server." -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Start-Process $url

$mimeMap = @{
    ".html" = "text/html; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".json" = "application/json; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".svg"  = "image/svg+xml"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $response.Headers.Add("Access-Control-Allow-Origin", "*")
        $response.Headers.Add("Cache-Control", "no-cache, no-store, must-revalidate")

        $localPath = $request.Url.LocalPath.TrimStart('/')
        if (-not $localPath) { $localPath = "Mechanical_Suite_Dashboard.html" }
        $decodedPath = [System.Uri]::UnescapeDataString($localPath)
        $filePath = Join-Path $folder $decodedPath

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $contentType = $mimeMap[$ext]
            if (-not $contentType) { $contentType = "application/octet-stream" }
            $response.ContentType = $contentType

            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $response.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("File not found: $decodedPath")
            $response.ContentLength64 = $errBytes.Length
            $response.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }
        $response.OutputStream.Close()
    }
} finally {
    $listener.Stop()
    $listener.Close()
}
