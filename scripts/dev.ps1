# AI Interview Platform — Single-Command Local Development Startup (PowerShell)
$ErrorActionPreference = "Stop"

Write-Host "🚀 AI Interview Platform — Single-Command Local Development Startup" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

# 1. Check for Supabase CLI
$SupabaseCmd = ""
if (Get-Command "supabase" -ErrorAction SilentlyContinue) {
    $SupabaseCmd = "supabase"
} elseif (Get-Command "npx" -ErrorAction SilentlyContinue) {
    # Verify npx supabase works
    try {
        npx --no-install supabase --version | Out-Null
        $SupabaseCmd = "npx supabase"
    } catch {
        $SupabaseCmd = "npx supabase"
    }
}

if ($SupabaseCmd -eq "") {
    Write-Host "❌ Error: Supabase CLI is not installed or available via npx." -ForegroundColor Red
    Write-Host "Please install it via: npm i -D supabase  OR  npm install -g supabase" -ForegroundColor Yellow
    Write-Host "See documentation: https://supabase.com/docs/guides/local-development/cli/getting-started" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Supabase CLI detected ($SupabaseCmd)" -ForegroundColor Green

# 2. Start local Supabase CLI stack (Postgres + GoTrue Auth + Studio + Kong)
Write-Host "⚡ Starting local Supabase stack..." -ForegroundColor Yellow
if ($SupabaseCmd -eq "supabase") {
    supabase start
} else {
    npx supabase start
}

# 3. Start Frontend, Backend API, and Redis containers via Docker Compose
Write-Host "🐳 Starting Docker Compose stack (Frontend, Backend API, Redis)..." -ForegroundColor Yellow
docker compose -f docker/docker-compose.yml up -d --build

# 4. Print Summary Table of Service URLs
Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "🎉 All services are up and running!" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "🖥️  Frontend Web Portal        : http://localhost:3000" -ForegroundColor White
Write-Host "⚙️  Backend Express API        : http://localhost:4000" -ForegroundColor White
Write-Host "🎨  Supabase Studio Dashboard  : http://127.0.0.1:54323" -ForegroundColor White
Write-Host "🌐  Supabase API (Kong)        : http://127.0.0.1:54321" -ForegroundColor White
Write-Host "🗄️  PostgreSQL Connection String : postgresql://postgres:postgres@127.0.0.1:54322/postgres" -ForegroundColor White
Write-Host "📦  Redis Cache                : redis://localhost:6379" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "💡 To stop local services, run: $SupabaseCmd stop ; docker compose -f docker/docker-compose.yml down" -ForegroundColor Cyan
