# Powershell script to create jinrou-maekawa-analyzer.xpi

if (Test-Path 'jinrou-maekawa-analyzer.xpi' ){
    Remove-Item 'jinrou-maekawa-analyzer.xpi'
}
if (Test-Path 'jinrou-maekawa-analyzer.zip' ){
    Remove-Item  'jinrou-maekawa-analyzer.zip'
}

Compress-Archive -Path 'src\*' -DestinationPath 'jinrou-maekawa-analyzer.zip'

Rename-Item 'jinrou-maekawa-analyzer.zip' 'jinrou-maekawa-analyzer.xpi'
