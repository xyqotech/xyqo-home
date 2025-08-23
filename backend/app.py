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
        # Validate critical environment variables
        openai_key = os.getenv("OPENAI_API_KEY")
        if not openai_key:
            logger.error("CRITICAL: OPENAI_API_KEY not set")
            sys.exit(1)
        
        logger.info("Environment validated, importing FastAPI app...")
        
        # Import app after env validation
        from app.main import app
        
        # Railway configuration
        port = int(os.environ.get("PORT", 8000))
        host = "0.0.0.0"
        
        logger.info(f"Starting XYQO Backend on {host}:{port}")
        
        import uvicorn
        uvicorn.run(
            app, 
            host=host, 
            port=port, 
            log_level="info",
            access_log=True,
            workers=1,
            timeout_keep_alive=30
        )
        
    except Exception as e:
        logger.error(f"Startup failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
