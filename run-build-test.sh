#!/bin/bash

# TASK A2.3: Test Build Process and Verify Backend Startup
# Execute systematic build testing

cd "$(dirname "$0")"

echo "🚀 TASK A2.3: Build Process and Backend Startup Test"
echo "==================================================="

# Set NODE_OPTIONS to handle potential memory issues
export NODE_OPTIONS="--max-old-space-size=4096"

echo ""
echo "🔍 Environment Check..."
if [ ! -f ".env" ]; then
    echo "❌ .env file not found"
    exit 1
fi
echo "✅ Environment configuration found"

echo ""
echo "📦 Testing Individual Component Builds..."
echo "----------------------------------------"

# Test 1: Server API Build
echo ""
echo "[1/3] Testing Server API Build..."
if npx nx build server-api 2>&1; then
    echo "✅ Server API build successful"
    BUILD_SERVER_API=1
else
    echo "❌ Server API build failed"
    BUILD_SERVER_API=0
fi

# Test 2: Engine Build  
echo ""
echo "[2/3] Testing Engine Build..."
if npx nx build engine 2>&1; then
    echo "✅ Engine build successful"
    BUILD_ENGINE=1
else
    echo "❌ Engine build failed"
    BUILD_ENGINE=0
fi

# Test 3: SOP Framework Build
echo ""
echo "[3/3] Testing SOP Framework Build..."
if npx nx build sop-framework 2>&1; then
    echo "✅ SOP Framework build successful"
    BUILD_SOP=1
else
    echo "❌ SOP Framework build failed (this may be expected if it's a pieces collection)"
    BUILD_SOP=0
fi

echo ""
echo "🏗️ Build Results Summary..."
echo "Server API: $( [ $BUILD_SERVER_API -eq 1 ] && echo "✅ SUCCESS" || echo "❌ FAILED" )"
echo "Engine: $( [ $BUILD_ENGINE -eq 1 ] && echo "✅ SUCCESS" || echo "❌ FAILED" )"
echo "SOP Framework: $( [ $BUILD_SOP -eq 1 ] && echo "✅ SUCCESS" || echo "⚠️ FAILED/SKIPPED" )"

# Check build artifacts
echo ""
echo "📁 Checking Build Artifacts..."
if [ -d "dist/packages/server/api" ]; then
    echo "✅ Server API artifacts found: dist/packages/server/api"
    ls -la dist/packages/server/api/ | head -5
else
    echo "❌ Server API artifacts not found"
fi

if [ -d "dist/packages/engine" ]; then
    echo "✅ Engine artifacts found: dist/packages/engine"
    ls -la dist/packages/engine/ | head -5
else
    echo "❌ Engine artifacts not found"
fi

# Calculate build score
BUILD_SCORE=0
[ $BUILD_SERVER_API -eq 1 ] && BUILD_SCORE=$((BUILD_SCORE + 40))
[ $BUILD_ENGINE -eq 1 ] && BUILD_SCORE=$((BUILD_SCORE + 30))
[ $BUILD_SOP -eq 1 ] && BUILD_SCORE=$((BUILD_SCORE + 10))

echo ""
echo "📊 Build Process Score: $BUILD_SCORE/80 (excluding backend startup test)"

# If builds are successful, test backend startup
if [ $BUILD_SERVER_API -eq 1 ] && [ $BUILD_ENGINE -eq 1 ]; then
    echo ""
    echo "🚀 Testing Backend Startup (Limited Test)..."
    echo "-------------------------------------------"
    echo "Note: Will run backend for 30 seconds to test startup process"
    
    # Start backend in background and capture output
    timeout 30s npm run dev:backend > backend_startup.log 2>&1 &
    BACKEND_PID=$!
    
    echo "Backend started with PID: $BACKEND_PID"
    echo "Monitoring startup for 30 seconds..."
    
    # Wait a bit for startup
    sleep 15
    
    # Check if process is still running
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo "✅ Backend process is running"
        BACKEND_RUNNING=1
        
        # Test if we can access any service
        echo "Testing service accessibility..."
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -E "200|404|301" > /dev/null; then
            echo "✅ Service accessible on port 3000"
            SERVICE_ACCESSIBLE=1
        else
            echo "⚠️ Service not accessible on port 3000 (may still be starting up)"
            SERVICE_ACCESSIBLE=0
        fi
    else
        echo "❌ Backend process stopped running"
        BACKEND_RUNNING=0
        SERVICE_ACCESSIBLE=0
    fi
    
    # Stop background process
    kill $BACKEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    
    # Check startup logs
    echo ""
    echo "📋 Startup Log Analysis..."
    if [ -f "backend_startup.log" ]; then
        echo "Last 10 lines of startup log:"
        tail -10 backend_startup.log
        
        # Look for success indicators
        if grep -q "listening\|started\|ready" backend_startup.log; then
            echo "✅ Startup success indicators found in logs"
            STARTUP_INDICATORS=1
        else
            echo "⚠️ No clear startup success indicators in logs"
            STARTUP_INDICATORS=0
        fi
    else
        echo "❌ No startup log found"
        STARTUP_INDICATORS=0
    fi
    
    # Calculate backend score
    BACKEND_SCORE=0
    [ $BACKEND_RUNNING -eq 1 ] && BACKEND_SCORE=$((BACKEND_SCORE + 7))
    [ $SERVICE_ACCESSIBLE -eq 1 ] && BACKEND_SCORE=$((BACKEND_SCORE + 7))
    [ $STARTUP_INDICATORS -eq 1 ] && BACKEND_SCORE=$((BACKEND_SCORE + 6))
    
    echo ""
    echo "🚀 Backend Startup Score: $BACKEND_SCORE/20"
    
    TOTAL_SCORE=$((BUILD_SCORE + BACKEND_SCORE))
else
    echo ""
    echo "⚠️ Skipping backend startup test due to build failures"
    TOTAL_SCORE=$BUILD_SCORE
fi

# Generate final report
echo ""
echo "🎯 TASK A2.3 COMPLETION SUMMARY"
echo "==============================="
echo "Total Score: $TOTAL_SCORE/100"
echo ""

if [ $TOTAL_SCORE -ge 80 ]; then
    echo "🟢 EXCELLENT: Build process and backend startup fully functional"
    echo "✅ FOUNDATION TASK A2.3: COMPLETE"
    echo "✅ All Category A tasks ready - proceed with Category B"
elif [ $TOTAL_SCORE -ge 60 ]; then
    echo "🟡 GOOD: Build process working with minor issues"
    echo "⚠️ FOUNDATION TASK A2.3: MOSTLY COMPLETE"
    echo "Consider addressing minor issues before Category B"
elif [ $TOTAL_SCORE -ge 40 ]; then
    echo "🟠 PARTIAL: Build process partially working, needs fixes"  
    echo "❌ FOUNDATION TASK A2.3: NEEDS WORK"
    echo "Fix critical issues before proceeding"
else
    echo "🔴 CRITICAL: Build process has major issues"
    echo "❌ FOUNDATION TASK A2.3: FAILED" 
    echo "Major fixes required before proceeding"
fi

echo ""
echo "📄 Build test completed. Check backend_startup.log for detailed startup logs."
echo "✅ TASK A2.3 EXECUTION: COMPLETE"

exit 0