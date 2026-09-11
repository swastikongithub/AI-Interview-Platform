#!/usr/bin/env bash
set -e

echo "🚀 AI Interview Platform — Single-Command Local Development Startup"
echo "===================================================================="

# 1. Check for Supabase CLI
if command -v supabase &> /dev/null; then
  SUPABASE_CMD="supabase"
elif npx supabase --version &> /dev/null; then
  SUPABASE_CMD="npx supabase"
else
  echo "❌ Error: Supabase CLI is not installed or available via npx."
  echo "Please install it via: npm i -D supabase  OR  npm install -g supabase"
  echo "See documentation: https://supabase.com/docs/guides/local-development/cli/getting-started"
  exit 1
fi

echo "✅ Supabase CLI detected ($SUPABASE_CMD)"

# 2. Start local Supabase CLI stack (Postgres + GoTrue Auth + Studio + Kong)
echo "⚡ Starting local Supabase stack..."
$SUPABASE_CMD start

# 3. Start Frontend, Backend API, and Redis containers via Docker Compose
echo "🐳 Starting Docker Compose stack (Frontend, Backend API, Redis)..."
docker compose -f docker/docker-compose.yml up -d --build

# 4. Print Summary Table of Service URLs
echo ""
echo "===================================================================="
echo "🎉 All services are up and running!"
echo "===================================================================="
echo "🖥️  Frontend Web Portal        : http://localhost:3000"
echo "⚙️  Backend Express API        : http://localhost:4000"
echo "🎨  Supabase Studio Dashboard  : http://127.0.0.1:54323"
echo "🌐  Supabase API (Kong)        : http://127.0.0.1:54321"
echo "🗄️  PostgreSQL Connection String : postgresql://postgres:postgres@127.0.0.1:54322/postgres"
echo "📦  Redis Cache                : redis://localhost:6379"
echo "===================================================================="
echo "💡 To stop local services, run: $SUPABASE_CMD stop && docker compose -f docker/docker-compose.yml down"
