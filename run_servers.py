#!/usr/bin/env python3
"""
Run both FastAPI backend and npm frontend together
"""
import subprocess
import sys
import signal
import time

def signal_handler(sig, frame):
    print('\nShutting down servers...')
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

# Start FastAPI backend
print("Starting FastAPI backend on port 8000...")
backend = subprocess.Popen(
    ["python", "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT
)

# Wait a bit for backend to start
time.sleep(2)

# Start npm frontend
print("Starting npm frontend on port 5000...")
frontend = subprocess.Popen(
    ["npm", "run", "dev"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT
)

print("\n✅ Both servers started!")
print("Backend: http://localhost:8000")
print("Frontend: http://localhost:5000")
print("\nPress Ctrl+C to stop both servers\n")

# Keep running and monitor processes
try:
    while True:
        # Check if processes are still running
        if backend.poll() is not None:
            print("⚠️  Backend crashed! Restarting...")
            backend = subprocess.Popen(
                ["python", "-m", "uvicorn", "api.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT
            )
        
        if frontend.poll() is not None:
            print("⚠️  Frontend crashed! Restarting...")
            frontend = subprocess.Popen(
                ["npm", "run", "dev"],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT
            )
        
        time.sleep(1)
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend.terminate()
    frontend.terminate()
    backend.wait()
    frontend.wait()
    print("Servers stopped")
