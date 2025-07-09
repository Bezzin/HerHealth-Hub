#!/bin/bash

# HerHealth Hub - UI Version 2 Development Server
# This script starts the development server with the enhanced UI v2

echo "🚀 Starting HerHealth Hub with Enhanced UI v2..."
echo "📱 UI Version: v2 (Enhanced - client_v2 folder)"
echo "🎨 Features: Teal color palette, improved components, professional healthcare design"
echo ""

# Create a symbolic link to point client to client_v2 for development
if [ -L client_original ]; then
  echo "ℹ️  Backup already exists"
else
  echo "📦 Creating backup of original client folder..."
  mv client client_original
fi

if [ -L client ]; then
  rm client
fi

echo "🔗 Creating symbolic link to client_v2..."
ln -sf client_v2 client

echo "▶️  Starting development server..."
NODE_ENV=development tsx server/index.ts