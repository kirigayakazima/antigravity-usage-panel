$ErrorActionPreference = 'Stop'
try {
    $projectRoot = Split-Path -Parent $PSScriptRoot
    Set-Location -LiteralPath $projectRoot
    $node = (Get-Command node -ErrorAction Stop).Source
    $appPath = Join-Path $env:LOCALAPPDATA 'Programs\antigravity\Antigravity.exe'
    if (-not (Test-Path -LiteralPath $appPath)) { throw "未找到反重力客户端: $appPath" }
    if (-not (Test-Path -LiteralPath (Join-Path $projectRoot 'node_modules\@electron\asar\package.json'))) {
        Write-Host '[1/4] 安装所需依赖...'
        & npm.cmd ci
        if ($LASTEXITCODE -ne 0) { throw '依赖安装失败。' }
    }

    Write-Host '[1/4] 关闭反重力客户端，释放安装文件...'
    $clients = @(Get-Process Antigravity -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $appPath })
    foreach ($client in $clients) { [void]$client.CloseMainWindow() }
    foreach ($client in $clients) {
        if (-not $client.WaitForExit(3000)) { Stop-Process -Id $client.Id -Force -ErrorAction SilentlyContinue }
    }

    Write-Host '[2/4] 校验、注入并安装...'
    & $node (Join-Path $PSScriptRoot 'inject-install.mjs')
    if ($LASTEXITCODE -ne 0) { throw '注入失败，已停止后续启动。请查看上方错误。' }

    Write-Host '[3/4] 检查后台监控服务...'
    $daemonPath = Join-Path $projectRoot 'daemon.mjs'
    $listener = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort 19388 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($listener) {
        $owner = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)" -ErrorAction SilentlyContinue
        if ($owner.Name -eq 'node.exe' -and $owner.CommandLine -and
            $owner.CommandLine.TrimEnd().TrimEnd('"').EndsWith($daemonPath, [StringComparison]::OrdinalIgnoreCase)) {
            Write-Host '正在重启本项目的后台服务以加载更新...'
            $stoppedDaemon = Stop-Process -Id $listener.OwningProcess -PassThru
            if (-not $stoppedDaemon.WaitForExit(3000)) { throw '后台服务未能退出。' }
        }
    }
    function Test-Daemon {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri 'http://127.0.0.1:19388/api/ping' -TimeoutSec 1
            return $response.StatusCode -eq 200
        } catch { return $false }
    }
    if (-not (Test-Daemon)) {
        Start-Process -FilePath $node -ArgumentList ('"' + $daemonPath + '"') -WorkingDirectory $projectRoot -WindowStyle Hidden
        for ($attempt = 0; $attempt -lt 10; $attempt++) {
            Start-Sleep -Milliseconds 500
            if (Test-Daemon) { break }
        }
        if (-not (Test-Daemon)) { throw '后台服务未通过健康检查，请查看 crash.txt。' }
    }

    Write-Host '[4/4] 启动反重力客户端...'
    Start-Process -FilePath $appPath
    Write-Host '安装与启动步骤已完成。客户端界面加载后可检查顶栏额度胶囊。'
    exit 0
} catch {
    Write-Host ('安装失败: ' + $_.Exception.Message) -ForegroundColor Red
    exit 1
}

