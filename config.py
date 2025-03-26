import os

# Default configuration
DEBUG = os.getenv('FLASK_ENV', 'development') == 'development'
HOST = os.getenv('HOST', '0.0.0.0')
PORT = int(os.getenv('PORT', 5000))

# Alertmanager instances can be configured from environment variables
# Format: AM_INSTANCE_NAME=url (e.g., AM_PRODUCTION=http://alertmanager-prod:9093/api/v2)
def get_alertmanager_urls():
    configured_urls = {}
    
    # Add hard-coded instances by default (can be overridden by environment variables)
    configured_urls = {
        "Instance 1": "http://alertmanager-instance1:9093/api/v2",
        "Instance 2": "http://alertmanager-instance2:9093/api/v2",
    }
    
    # Override with environment variables if provided
    for key, value in os.environ.items():
        if key.startswith('AM_'):
            instance_name = key[3:].replace('_', ' ')
            configured_urls[instance_name] = value
    
    return configured_urls

# Get Alertmanager URLs
ALERTMANAGER_URLS = get_alertmanager_urls()

# Logging configuration
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')