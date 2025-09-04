#!/bin/bash

cd "$(dirname "$0")"

echo "🚀 Testing Server API Build"
echo "=========================="

# Check if project exists
if ! npx nx show project server-api >/dev/null 2>&1; then
    echo "❌ Server API project not found"
    exit 1
fi

echo "✅ Server API project found"

# Set memory options
export NODE_OPTIONS="--max-old-space-size=4096"

echo ""
echo "📦 Building Server API..."

# Run build and capture output
if npx nx build server-api 2>&1; then
    echo "✅ Server API build completed successfully"
    BUILD_SUCCESS=1
else
    echo "❌ Server API build failed"
    BUILD_SUCCESS=0
fi

# Check build artifacts
echo ""
echo "📁 Checking Build Artifacts..."
if [ -d "dist/packages/server/api" ]; then
    echo "✅ Server API artifacts found: dist/packages/server/api"
    echo "Contents:"
    ls -la dist/packages/server/api/ | head -10
else
    echo "❌ Server API artifacts not found at dist/packages/server/api"
fi

echo ""
echo "🎯 Build Test Result: $( [ $BUILD_SUCCESS -eq 1 ] && echo "✅ SUCCESS" || echo "❌ FAILED" )"

exit $BUILD_SUCCESS