#!/usr/bin/env python3
"""
XYQO Contract Reader - Railway Entry Point
Simple entry point that imports the main FastAPI app
"""

import os
from app.main import app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting server on {host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")
