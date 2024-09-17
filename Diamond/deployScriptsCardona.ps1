# Define the base command and network
$baseCommand = "npx hardhat run .\scripts\deploy"
$network = "--network cardona"

# Loop through the deploy scripts from deploy2.js to deploy17.js
for ($i = 2; $i -le 21; $i++) {
    $scriptName = "$i.js"
    $command = "$baseCommand$scriptName $network"
    Write-Output "Executing: $command"
    Invoke-Expression $command
    # Optionally add a delay between commands to ensure each deployment completes before starting the next
    Start-Sleep -Seconds 2
}

Write-Output "All deployment scripts executed."

