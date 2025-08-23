#!/usr/bin/env python3
"""
XYQO Contract Reader - Railway Entry Point
Optimized entry point for Railway deployment
"""

import os
import sys
import logging

# Configure logging early
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    """Main entry point with error handling"""
    try:
        logger.info("=== XYQO Backend Starting ===")
        
        # Railway configuration first
        port = int(os.environ.get("PORT", 8000))
        host = "0.0.0.0"
        
        logger.info(f"Port: {port}, Host: {host}")
        
        # Check environment variables but don't fail
        openai_key = os.getenv("OPENAI_API_KEY")
        allowed_origins = os.getenv("ALLOWED_ORIGINS", "*")
        
        logger.info(f"OpenAI Key: {'SET' if openai_key else 'NOT SET'}")
        logger.info(f"CORS Origins: {allowed_origins}")
        
        logger.info("Importing FastAPI app...")
        
        # Import app
        from app.main import app
        
        logger.info("FastAPI app imported successfully")
        logger.info(f"Starting uvicorn server on {host}:{port}")
        
        import uvicorn
        uvicorn.run(
            app, 
            host=host, 
            port=port, 
            log_level="info",
            access_log=True
        )
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        import traceback
        logger.error(traceback.format_exc())
        sys.exit(1)

if __name__ == "__main__":
    main()
