#!/bin/bash

# Start FastAPI backend on port 8000
echo "Starting FastAPI backend on port 8000..."
cd /home/runner/workspace
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --no-access-log > /tmp/fastapi.log 2>&1 &
FASTAPI_PID=$!
echo "FastAPI started with PID: $FASTAPI_PID"

# Start Express/Vite frontend on port 5000
echo "Starting Express/Vite frontend on port 5000..."
npm run dev &
VITE_PID=$!
echo "Vite started with PID: $VITE_PID"

# Wait for both processes
wait
