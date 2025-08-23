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
    uvicorn.run(app, host="0.0.0.0", port=port)
