import sys
import os

print("Starting run.py...", flush=True)

try:
    import uvicorn
    print("uvicorn imported", flush=True)
except Exception as e:
    print(f"UVICORN IMPORT ERROR: {e}", flush=True)
    sys.exit(1)

try:
    from app.main import app
    print("app imported", flush=True)
except Exception as e:
    print(f"APP IMPORT ERROR: {e}", flush=True)
    sys.exit(1)

try:
    port = int(os.environ.get("PORT", 8000))
    print(f"PORT env: {os.environ.get('PORT', 'not set')}", flush=True)
    print(f"Starting on port {port}", flush=True)
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
except Exception as e:
    import traceback
    print(f"RUN ERROR: {e}", flush=True)
    traceback.print_exc(file=sys.stdout)
    sys.exit(1)
