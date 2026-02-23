$token = "sbp_80f518a01c1b59c24caddd7212bc3440dbb92fc7"
$ref   = "qomawqhxxqlyvbegvtih"

# Step 1: List existing functions
Write-Host "=== Existing functions on project ===" 
try {
  $list = Invoke-RestMethod `
    -Method GET `
    -Uri "https://api.supabase.com/v1/projects/$ref/functions" `
    -Headers @{ Authorization = "Bearer $token" } `
    -ErrorAction Stop
  if ($list.Count -eq 0) {
    Write-Host "(none)"
  } else {
    $list | ForEach-Object { Write-Host "  - $($_.slug) [id=$($_.id)]" }
  }
} catch {
  Write-Host "GET error: $($_.ErrorDetails.Message)"
}

# Step 2: Try creating one test function and print full raw response
Write-Host ""
Write-Host "=== Attempting to create 'get-order' ===" 
$src = Get-Content "supabase\functions\get-order\index.ts" -Raw -Encoding UTF8

$payloadObj = [ordered]@{
  slug       = "get-order"
  name       = "get-order"
  body       = $src
  verify_jwt = $true
}
$payload = $payloadObj | ConvertTo-Json -Depth 10 -Compress

try {
  $r = Invoke-RestMethod `
    -Method POST `
    -Uri "https://api.supabase.com/v1/projects/$ref/functions" `
    -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
    -Body $payload `
    -ErrorAction Stop
  Write-Host "POST OK:"
  $r | ConvertTo-Json
} catch {
  $status = $_.Exception.Response.StatusCode.value__
  $errBody = $_.ErrorDetails.Message
  Write-Host "POST FAILED (HTTP $status): $errBody"
}
