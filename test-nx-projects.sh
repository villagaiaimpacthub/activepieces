#!/bin/bash

echo "🔍 Testing NX Project Discovery"
echo "=============================="

cd "$(dirname "$0")"

if ! command -v npx &> /dev/null; then
    echo "❌ npx not available"
    exit 1
fi

echo "✅ npx available"

# Test basic nx commands
echo ""
echo "📋 Available NX Projects:"
npx nx show projects 2>&1

echo ""
echo "📋 Project Details for server-api:"
npx nx show project server-api 2>&1

echo ""
echo "📋 Project Details for engine:"  
npx nx show project engine 2>&1

echo ""
echo "🎯 NX Configuration Test Complete"