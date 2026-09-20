import os
import sys

# Ensure root directory is in python path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Configure test environment defaults
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("ALLOW_LOCAL_DEMO", "true")

import apps.api.app.security as sec
sec.ALLOW_LOCAL_DEMO = True
