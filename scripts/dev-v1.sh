#!/bin/bash

# HerHealth Hub - UI Version 1 Development Server
# This script starts the development server with the original UI

echo "🚀 Starting HerHealth Hub with Original UI v1..."
echo "📱 UI Version: v1 (Original - client folder)"
echo "🎨 Features: Original design and components"
echo ""

# Restore original client folder if it was backed up
if [ -L client ]; then
  echo "🔗 Removing symbolic link..."
  rm client
fi

if [ -d client_original ]; then
  echo "📦 Restoring original client folder..."
  mv client_original client
else
  echo "⚠️  Original client folder not found - may already be restored"
fi

echo "▶️  Starting development server..."
NODE_ENV=development tsx server/index.ts