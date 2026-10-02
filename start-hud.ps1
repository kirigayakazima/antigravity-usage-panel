# Antigravity Quota Floating Capsule HUD Launcher
$ErrorActionPreference = "SilentlyContinue"

# 1. Check daemon status
try {
    $ping = Invoke-RestMethod -Uri "http://127.0.0.1:19388/api/ping" -TimeoutSec 1
} catch {
    $ping = $null
}

if (-not $ping -or -not $ping.ok) {
    Write-Host "[HUD Launcher] Starting quota daemon in background..." -ForegroundColor Cyan
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    Start-Process -FilePath "node" -ArgumentList "daemon.mjs" -WorkingDirectory $scriptDir -WindowStyle Hidden
    Start-Sleep -Milliseconds 1200
}

# 2. Locate browser (Edge preferred, then Chrome)
$edgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)

$chromePaths = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
)

$browserExe = $null
foreach ($p in ($edgePaths + $chromePaths)) {
    if (Test-Path $p) {
        $browserExe = $p
        break
    }
}

if (-not $browserExe) {
    Write-Host "[HUD Launcher] Browser not found, opening default browser..." -ForegroundColor Yellow
    Start-Process "http://127.0.0.1:19388/hud"
    exit
}

# 3. Calculate position at top-right of screen
Add-Type -AssemblyName System.Windows.Forms
$screenWidth = [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width
$posX = [Math]::Max(100, $screenWidth - 340)
$posY = 24

# 4. Launch minimal app mode window
$appUrl = "http://127.0.0.1:19388/hud"
$procArgs = @(
    "--app=$appUrl",
    "--window-size=295,48",
    "--window-position=$posX,$posY",
    "--disable-features=TranslateUI",
    "--disable-extensions"
)

$proc = Start-Process -FilePath $browserExe -ArgumentList $procArgs -PassThru

# 5. Make Always on Top via User32 API
$code = @'
using System;
using System.Runtime.InteropServices;
public class WinTop {
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
    public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_SHOWWINDOW = 0x0040;
    public static bool MakeTopMost(IntPtr hWnd) {
        if (hWnd == IntPtr.Zero) return false;
        return SetWindowPos(hWnd, HWND_TOPMOST, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW);
    }
}
'@
Add-Type -TypeDefinition $code -Language CSharp -ErrorAction SilentlyContinue

Start-Sleep -Milliseconds 800
if ($proc -and $proc.MainWindowHandle -ne [IntPtr]::Zero) {
    [WinTop]::MakeTopMost($proc.MainWindowHandle) | Out-Null
} else {
    Get-Process -Name msedge, chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*反重力*" -or $_.MainWindowTitle -like "*HUD*" } | ForEach-Object {
        if ($_.MainWindowHandle -ne [IntPtr]::Zero) {
            [WinTop]::MakeTopMost($_.MainWindowHandle) | Out-Null
        }
    }
}

Write-Host "[HUD Launcher] Antigravity Quota HUD is active and pinned on top." -ForegroundColor Green
