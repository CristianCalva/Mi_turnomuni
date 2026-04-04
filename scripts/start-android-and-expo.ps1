param(
  [string]$AVD = 'Pixel_4',
  [int]$MaxWaitSeconds = 180
)

# Detectar Android SDK desde local.properties o variables de entorno
$sdkFromProps = $null
$localProps = Join-Path -Path (Split-Path -Parent $PSScriptRoot) -ChildPath 'android\local.properties'
if (Test-Path $localProps) {
  $lines = Get-Content $localProps | ForEach-Object { $_.Trim() }
  foreach ($l in $lines) { if ($l -match '^sdk.dir=(.+)$') { $sdkFromProps = $Matches[1].Trim() -replace '/','\\'; break } }
}

$envVal = ($env:ANDROID_SDK_ROOT | ForEach-Object { $_ })
# Evitar valores booleanos/incorrectos (p.ej. 'True' heredado de entornos)
if ($envVal -and $envVal.Trim().Length -gt 0 -and $envVal.Trim().ToLower() -ne 'true') {
  $ANDROID_SDK_ROOT = $envVal
} elseif ($env:ANDROID_HOME) {
  $ANDROID_SDK_ROOT = $env:ANDROID_HOME
} elseif ($sdkFromProps) {
  $ANDROID_SDK_ROOT = $sdkFromProps
} else {
  $ANDROID_SDK_ROOT = 'C:\Users\COMPUTER\AppData\Local\Android\Sdk'
}
Write-Host "Usando ANDROID_SDK_ROOT=$ANDROID_SDK_ROOT"

$emulatorExe = Join-Path $ANDROID_SDK_ROOT 'emulator\emulator.exe'
$adbExe = Join-Path $ANDROID_SDK_ROOT 'platform-tools\adb.exe'

if (-not (Test-Path $emulatorExe)) { Write-Error "No se encontró emulator.exe en $emulatorExe"; exit 1 }
if (-not (Test-Path $adbExe)) { Write-Error "No se encontró adb.exe en $adbExe"; exit 1 }

# Arrancar AVD si no está ya corriendo
$devices = & $adbExe devices | Select-String '^emulator-' -Quiet
if ($devices) { Write-Host 'Emulador ya detectado por adb'; } else {
  Write-Host "Arrancando AVD '$AVD'..."
  Start-Process -FilePath $emulatorExe -ArgumentList "-avd", $AVD -WindowStyle Minimized -PassThru | Out-Null
}

# Esperar a que aparezca el dispositivo y que el sistema esté listo
$start = Get-Date
while ((Get-Date) -lt $start.AddSeconds($MaxWaitSeconds)) {
  $list = & $adbExe devices
  if ($list -match 'emulator-\d+') {
    $id = ($list -split "\r?\n" | Where-Object { $_ -match '^emulator-\d+' } | Select-Object -First 1).Split()[0]
    Write-Host "Emulador detectado: $id. Comprobando boot..."
    try {
      $boot = & $adbExe -s $id shell getprop sys.boot_completed 2>$null
      if ($boot -and $boot.Trim() -eq '1') { Write-Host 'Emulador completamente arrancado.'; break }
    } catch { }
  }
  Start-Sleep -Seconds 2
}

# Verificación final
$list2 = & $adbExe devices
if (-not ($list2 -match 'emulator-\d+')) { Write-Error 'No se detectó emulador en adb después del tiempo de espera.'; exit 1 }

# Lanzar Expo (en el directorio que llama al script)
Write-Host 'Lanzando `npx expo run:android` (usa el mismo terminal para ver logs)...'
# Ejecuta en shell para que interaccione con el usuario (npm/Expo requiere TTY)
cmd /c "cd /d %CD% && npx expo run:android"

