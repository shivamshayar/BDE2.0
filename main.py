import uvicorn
import os

if __name__ == "__main__":
    # Run FastAPI on port 8000 (frontend Vite server uses port 5000)
    port = int(os.getenv("API_PORT", 8000))
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )
