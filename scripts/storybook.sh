#!/bin/bash

# HerHealth Hub - Storybook Development Server
# This script starts Storybook for component development

echo "📚 Starting Storybook for HerHealth Hub UI v2..."
echo "🎨 Features: Component playground, design system documentation"
echo "🌐 Will be available at: http://localhost:6006"
echo ""

cd client_v2 && npx storybook dev -p 6006