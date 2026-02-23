$token = "sbp_80f518a01c1b59c24caddd7212bc3440dbb92fc7"
$ref   = "qomawqhxxqlyvbegvtih"

$functions = @(
  @{ name="approve-user";    verify_jwt=$true  },
  @{ name="validate-vat";    verify_jwt=$true  },
  @{ name="create-checkout"; verify_jwt=$true  },
  @{ name="stripe-webhook";  verify_jwt=$false },
  @{ name="get-orders";      verify_jwt=$true  },
  @{ name="get-order";       verify_jwt=$true  }
)

foreach ($fn in $functions) {
  $src = Get-Content "supabase\functions\$($fn.name)\index.ts" -Raw -Encoding UTF8

  # Build the payload as a hashtable and let ConvertTo-Json handle escaping
  $payload = [ordered]@{
    slug       = $fn.name
    name       = $fn.name
    body       = $src
    verify_jwt = $fn.verify_jwt
  } | ConvertTo-Json -Depth 5 -Compress

  # Try POST (create), fall back to PATCH (update)
  try {
    $result = Invoke-RestMethod `
      -Method POST `
      -Uri "https://api.supabase.com/v1/projects/$ref/functions" `
      -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
      -Body $payload `
      -ErrorAction Stop
    Write-Host "✅ Created: $($fn.name)  id=$($result.id)"
  } catch {
    # Function already exists — update with PATCH
    try {
      $result = Invoke-RestMethod `
        -Method PATCH `
        -Uri "https://api.supabase.com/v1/projects/$ref/functions/$($fn.name)" `
        -Headers @{ Authorization = "Bearer $token"; "Content-Type" = "application/json" } `
        -Body $payload `
        -ErrorAction Stop
      Write-Host "✅ Updated: $($fn.name)  id=$($result.id)"
    } catch {
      Write-Host "❌ Error on $($fn.name): $($_.ErrorDetails.Message)"
    }
  }
}
