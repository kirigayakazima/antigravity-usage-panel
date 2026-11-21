param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidateSet('list', 'backup', 'switch', 'prepare-add', 'restore-only', 'clear-active', 'delete')]
    [string]$Action,

    [Parameter(Position = 1)]
    [string]$Email = '',

    [Parameter(Position = 2)]
    [string]$CurrentEmail = '',

    [Parameter()]
    [string]$MetaPath = ''
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch {}

if (-not $MetaPath) {
    $MetaPath = Join-Path $env:USERPROFILE '.dsh\antigravity-usage\panel-vault-meta.json'
}

$ActiveTarget = 'gemini:antigravity'
$VaultPrefix = 'agy-panel-vault:'
$ScopeFile = Join-Path $env:APPDATA 'Antigravity\credential-user-scope'
$AppPath = Join-Path $env:LOCALAPPDATA 'Programs\antigravity\Antigravity.exe'
$LogFile = Join-Path (Split-Path -Parent $MetaPath) 'vault.log'

function Write-VaultLog([string]$msg) {
    try {
        $dir = Split-Path -Parent $LogFile
        if ($dir -and -not (Test-Path -LiteralPath $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
        $line = "[$([DateTime]::Now.ToString('yyyy-MM-dd HH:mm:ss'))] $msg`r`n"
        [System.IO.File]::AppendAllText($LogFile, $line, [System.Text.UTF8Encoding]::new($false))
    } catch {}
}

Add-Type -TypeDefinition @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;

public class AgyWinCredVault {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public uint Flags;
        public uint Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public uint CredentialBlobSize;
        public IntPtr CredentialBlob;
        public uint Persist;
        public uint AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredRead(string target, uint type, uint reservedFlag, out IntPtr credentialPtr);

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredWrite(ref CREDENTIAL userCredential, uint flags);

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredDelete(string target, uint type, uint flags);

    [DllImport("advapi32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CredEnumerate(string filter, uint flags, out uint count, out IntPtr credentialsPtr);

    [DllImport("advapi32.dll", SetLastError = true)]
    public static extern void CredFree(IntPtr cred);

    public class VaultItem {
        public string TargetName { get; set; }
        public string UserName { get; set; }
        public uint BlobSize { get; set; }
    }

    public static bool Exists(string target) {
        IntPtr ptr;
        if (!CredRead(target, 1, 0, out ptr)) return false;
        CredFree(ptr);
        return true;
    }

    public static List<VaultItem> ListByFilter(string filter) {
        var result = new List<VaultItem>();
        uint count;
        IntPtr credsPtr;
        if (!CredEnumerate(filter, 0, out count, out credsPtr)) {
            int err = Marshal.GetLastWin32Error();
            if (err == 1168) return result; // ERROR_NOT_FOUND
            throw new Exception("CredEnumerate failed with Win32 error " + err);
        }
        try {
            int ptrSize = IntPtr.Size;
            for (uint i = 0; i < count; i++) {
                IntPtr itemPtr = Marshal.ReadIntPtr(credsPtr, (int)(i * ptrSize));
                var c = Marshal.PtrToStructure<CREDENTIAL>(itemPtr);
                result.Add(new VaultItem {
                    TargetName = c.TargetName,
                    UserName = c.UserName ?? "",
                    BlobSize = c.CredentialBlobSize
                });
            }
        } finally {
            CredFree(credsPtr);
        }
        return result;
    }

    public static uint CopyCredential(string sourceTarget, string destTarget) {
        IntPtr srcPtr;
        if (!CredRead(sourceTarget, 1, 0, out srcPtr)) {
            int err = Marshal.GetLastWin32Error();
            throw new Exception("Source credential not found: " + sourceTarget + " (err=" + err + ")");
        }
        try {
            var src = Marshal.PtrToStructure<CREDENTIAL>(srcPtr);
            byte[] blob = new byte[src.CredentialBlobSize];
            if (src.CredentialBlobSize > 0 && src.CredentialBlob != IntPtr.Zero) {
                Marshal.Copy(src.CredentialBlob, blob, 0, (int)src.CredentialBlobSize);
            }

            IntPtr destBlobPtr = IntPtr.Zero;
            try {
                if (blob.Length > 0) {
                    destBlobPtr = Marshal.AllocHGlobal(blob.Length);
                    Marshal.Copy(blob, 0, destBlobPtr, blob.Length);
                }
                var dst = new CREDENTIAL {
                    Flags = 0,
                    Type = 1, // CRED_TYPE_GENERIC
                    TargetName = destTarget,
                    Comment = src.Comment,
                    CredentialBlobSize = (uint)blob.Length,
                    CredentialBlob = destBlobPtr,
                    Persist = src.Persist > 0 ? src.Persist : 2u, // CRED_PERSIST_LOCAL_MACHINE
                    AttributeCount = 0,
                    Attributes = IntPtr.Zero,
                    TargetAlias = src.TargetAlias,
                    UserName = string.IsNullOrEmpty(src.UserName) ? "antigravity" : src.UserName
                };
                if (!CredWrite(ref dst, 0)) {
                    int err = Marshal.GetLastWin32Error();
                    throw new Exception("CredWrite failed for " + destTarget + " (err=" + err + ")");
                }
                return dst.CredentialBlobSize;
            } finally {
                if (destBlobPtr != IntPtr.Zero) Marshal.FreeHGlobal(destBlobPtr);
            }
        } finally {
            CredFree(srcPtr);
        }
    }

    public static bool DeleteCredential(string target) {
        if (CredDelete(target, 1, 0)) return true;
        int err = Marshal.GetLastWin32Error();
        if (err == 1168) return false; // ERROR_NOT_FOUND
        throw new Exception("CredDelete failed for " + target + " (err=" + err + ")");
    }
}
'@

function Load-Meta {
    if (-not (Test-Path -LiteralPath $MetaPath)) { return @{} }
    try {
        $raw = Get-Content -LiteralPath $MetaPath -Raw -Encoding UTF8
        if (-not $raw) { return @{} }
        $obj = $raw | ConvertFrom-Json
        $map = @{}
        if ($obj) {
            foreach ($prop in $obj.PSObject.Properties) {
                $map[$prop.Name] = @{
                    scope   = $prop.Value.scope
                    savedAt = $prop.Value.savedAt
                }
            }
        }
        return $map
    } catch {
        return @{}
    }
}

function Save-Meta([hashtable]$map) {
    $dir = Split-Path -Parent $MetaPath
    if ($dir -and -not (Test-Path -LiteralPath $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $json = $map | ConvertTo-Json -Depth 4
    if (-not $json) { $json = '{}' }
    [System.IO.File]::WriteAllText($MetaPath, $json, [System.Text.UTF8Encoding]::new($false))
}

function Backup-Account([string]$acctEmail) {
    $norm = $acctEmail.Trim().ToLowerInvariant()
    if (-not $norm) { throw 'Email is required for backup' }
    if (-not [AgyWinCredVault]::Exists($ActiveTarget)) {
        throw 'Active Antigravity credential not found in Windows Credential Manager'
    }
    $target = $VaultPrefix + $norm
    $size = [AgyWinCredVault]::CopyCredential($ActiveTarget, $target)
    $scope = ''
    if (Test-Path -LiteralPath $ScopeFile) {
        $scope = (Get-Content -LiteralPath $ScopeFile -Raw -Encoding UTF8).Trim()
    }
    $meta = Load-Meta
    $meta[$norm] = @{
        scope   = $scope
        savedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
    }
    Save-Meta $meta
    return @{ email = $norm; blobSize = $size; savedAt = $meta[$norm].savedAt; hasScope = [bool]$scope }
}

function Stop-AntigravityProcesses {
    Write-VaultLog 'Stopping Antigravity and language_server processes...'
    $clients = @(Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue)
    foreach ($c in $clients) {
        if ($c.MainWindowHandle -ne [IntPtr]::Zero) {
            try { [void]$c.CloseMainWindow() } catch {}
        }
    }
    $deadline = [DateTime]::UtcNow.AddMilliseconds(1500)
    while ([DateTime]::UtcNow -lt $deadline) {
        $alive = @(Get-Process -Name 'Antigravity' -ErrorAction SilentlyContinue)
        if ($alive.Count -eq 0) { break }
        Start-Sleep -Milliseconds 150
    }
    Stop-Process -Name 'Antigravity' -Force -ErrorAction SilentlyContinue
    Stop-Process -Name 'language_server' -Force -ErrorAction SilentlyContinue
    Start-Sleep -Milliseconds 500
    Write-VaultLog 'Processes stopped.'
}

function Start-AntigravityApp {
    if (Test-Path -LiteralPath $AppPath) {
        if (-not $env:HTTP_PROXY)  { $env:HTTP_PROXY  = 'http://127.0.0.1:7890' }
        if (-not $env:HTTPS_PROXY) { $env:HTTPS_PROXY = 'http://127.0.0.1:7890' }
        if (-not $env:ALL_PROXY)   { $env:ALL_PROXY   = 'http://127.0.0.1:7890' }
        if (-not $env:NO_PROXY)    { $env:NO_PROXY    = 'localhost,127.0.0.1' }
        Start-Process -FilePath $AppPath
        return $true
    }
    return $false
}

function Restore-TargetCredential([string]$targetEmail) {
    $norm = $targetEmail.Trim().ToLowerInvariant()
    if (-not $norm) { throw 'Target email is required' }
    $vaultTarget = $VaultPrefix + $norm
    if (-not [AgyWinCredVault]::Exists($vaultTarget)) {
        throw "No backed-up credential found for $norm"
    }
    $size = [AgyWinCredVault]::CopyCredential($vaultTarget, $ActiveTarget)
    $meta = Load-Meta
    $targetMeta = $meta[$norm]
    if ($targetMeta -and $targetMeta.scope) {
        $scopeDir = Split-Path -Parent $ScopeFile
        if ($scopeDir -and -not (Test-Path -LiteralPath $scopeDir)) {
            New-Item -ItemType Directory -Path $scopeDir -Force | Out-Null
        }
        [System.IO.File]::WriteAllText($ScopeFile, [string]$targetMeta.scope, [System.Text.UTF8Encoding]::new($false))
    } elseif (Test-Path -LiteralPath $ScopeFile) {
        Remove-Item -LiteralPath $ScopeFile -Force -ErrorAction SilentlyContinue
    }
    return $size
}

try {
    switch ($Action) {
        'list' {
            $items = [AgyWinCredVault]::ListByFilter($VaultPrefix + '*')
            $meta = Load-Meta
            $out = @()
            foreach ($item in $items) {
                if ($item.TargetName.StartsWith($VaultPrefix)) {
                    $em = $item.TargetName.Substring($VaultPrefix.Length).ToLowerInvariant()
                    $m = $meta[$em]
                    $out += @{
                        email    = $em
                        blobSize = $item.BlobSize
                        savedAt  = if ($m) { $m.savedAt } else { $null }
                        hasScope = if ($m -and $m.scope) { $true } else { $false }
                    }
                }
            }
            $hasActive = [AgyWinCredVault]::Exists($ActiveTarget)
            @{ ok = $true; hasActive = $hasActive; items = $out } | ConvertTo-Json -Depth 4 -Compress
        }

        'backup' {
            $res = Backup-Account $Email
            @{ ok = $true; backup = $res } | ConvertTo-Json -Depth 4 -Compress
        }

        'switch' {
            $targetEmail = $Email.Trim().ToLowerInvariant()
            if (-not $targetEmail) { throw 'Target email is required' }
            Write-VaultLog "Switch requested -> $targetEmail (current: $CurrentEmail)"
            $cur = $CurrentEmail.Trim().ToLowerInvariant()
            if ($cur -and $cur -ne $targetEmail -and [AgyWinCredVault]::Exists($ActiveTarget)) {
                try {
                    [void](Backup-Account $cur)
                    Write-VaultLog "Backed up current account $cur before switching."
                } catch {}
            }

            Stop-AntigravityProcesses

            $size = Restore-TargetCredential $targetEmail
            Write-VaultLog "Restored credential for $targetEmail ($size bytes)."

            $launched = Start-AntigravityApp
            Write-VaultLog "Relaunched Antigravity: $launched"
            @{ ok = $true; switchedTo = $targetEmail; blobSize = $size; launched = $launched } | ConvertTo-Json -Depth 4 -Compress
        }

        'restore-only' {
            $targetEmail = $Email.Trim().ToLowerInvariant()
            $size = Restore-TargetCredential $targetEmail
            @{ ok = $true; switchedTo = $targetEmail; blobSize = $size } | ConvertTo-Json -Depth 4 -Compress
        }

        'clear-active' {
            [void][AgyWinCredVault]::DeleteCredential($ActiveTarget)
            if (Test-Path -LiteralPath $ScopeFile) {
                Remove-Item -LiteralPath $ScopeFile -Force -ErrorAction SilentlyContinue
            }
            @{ ok = $true } | ConvertTo-Json -Depth 4 -Compress
        }

        'prepare-add' {
            $cur = $CurrentEmail.Trim().ToLowerInvariant()
            Write-VaultLog "Prepare-add requested (current: $cur)"
            $backedUp = $null
            if ($cur -and [AgyWinCredVault]::Exists($ActiveTarget)) {
                $backedUp = Backup-Account $cur
                Write-VaultLog "Backed up current account $cur."
            }

            Stop-AntigravityProcesses

            [void][AgyWinCredVault]::DeleteCredential($ActiveTarget)
            if (Test-Path -LiteralPath $ScopeFile) {
                Remove-Item -LiteralPath $ScopeFile -Force -ErrorAction SilentlyContinue
            }
            Write-VaultLog "Cleared local active credential and scope."

            $launched = Start-AntigravityApp
            Write-VaultLog "Relaunched Antigravity for new sign-in: $launched"
            @{ ok = $true; backedUp = $backedUp; launched = $launched } | ConvertTo-Json -Depth 4 -Compress
        }

        'delete' {
            $targetEmail = $Email.Trim().ToLowerInvariant()
            if (-not $targetEmail) { throw 'Email is required' }
            $removed = [AgyWinCredVault]::DeleteCredential($VaultPrefix + $targetEmail)
            $meta = Load-Meta
            if ($meta.ContainsKey($targetEmail)) {
                $meta.Remove($targetEmail)
                Save-Meta $meta
            }
            @{ ok = $true; removed = $removed; email = $targetEmail } | ConvertTo-Json -Depth 4 -Compress
        }
    }
} catch {
    @{ ok = $false; error = $_.Exception.Message } | ConvertTo-Json -Depth 4 -Compress
    exit 1
}
