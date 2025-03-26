from flask import Flask, request, jsonify, Response, send_from_directory
import requests
import json
import os
from datetime import datetime
import logging
import config

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('alertmanager-proxy')

app = Flask(__name__, static_folder='frontend/build', static_url_path='')

# Get Alertmanager URLs from config
ALERTMANAGER_URLS = config.ALERTMANAGER_URLS

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    """Serve the React frontend"""
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

@app.route('/api/instances', methods=['GET'])
def get_instances():
    """Return a list of configured Alertmanager instances."""
    return jsonify(list(ALERTMANAGER_URLS.keys()))

@app.route('/api/silences', methods=['GET'])
def list_silences():
    """
    List silences for a given instance.
    Query parameters:
      - instance: the instance name (if not provided, returns combined results)
      - username & password: optional credentials for basic auth
      - filter: optional filter string (e.g. 'createdBy=joe' or 'matchers=~cluster=prod')
    """
    instance = request.args.get('instance')
    username = request.args.get('username')
    password = request.args.get('password')
    filter_string = request.args.get('filter', '')
    auth = (username, password) if username and password else None
    
    logger.info(f"Requesting silences from instance: {instance if instance else 'all'}")

    if instance:
        base_url = ALERTMANAGER_URLS.get(instance)
        if not base_url:
            return jsonify({'error': 'Invalid instance'}), 400
        try:
            url = f"{base_url}/silences"
            if filter_string:
                url += f"?{filter_string}"
            r = requests.get(url, auth=auth)
            r.raise_for_status()
            return jsonify(r.json())
        except Exception as e:
            logger.error(f"Error fetching silences from {instance}: {str(e)}")
            return jsonify({'error': str(e)}), 500
    else:
        results = {}
        for name, base_url in ALERTMANAGER_URLS.items():
            try:
                url = f"{base_url}/silences"
                if filter_string:
                    url += f"?{filter_string}"
                r = requests.get(url, auth=auth)
                r.raise_for_status()
                results[name] = r.json()
            except Exception as e:
                logger.error(f"Error fetching silences from {name}: {str(e)}")
                results[name] = {'error': str(e)}
        return jsonify(results)

@app.route('/api/silence/<silence_id>', methods=['GET'])
def get_silence(silence_id):
    """
    Get a specific silence by ID.
    Query parameters:
      - instance: the instance name (required)
      - username & password: optional credentials for basic auth
    """
    instance = request.args.get('instance')
    username = request.args.get('username')
    password = request.args.get('password')
    auth = (username, password) if username and password else None

    if not instance:
        return jsonify({'error': 'Instance parameter is required'}), 400

    base_url = ALERTMANAGER_URLS.get(instance)
    if not base_url:
        return jsonify({'error': 'Invalid instance'}), 400

    try:
        r = requests.get(f"{base_url}/silence/{silence_id}", auth=auth)
        r.raise_for_status()
        return jsonify(r.json())
    except Exception as e:
        logger.error(f"Error fetching silence {silence_id} from {instance}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/silence/<silence_id>', methods=['DELETE'])
def delete_silence(silence_id):
    """
    Delete a specific silence by ID.
    Query parameters:
      - instance: the instance name (required)
      - username & password: optional credentials for basic auth
    """
    instance = request.args.get('instance')
    username = request.args.get('username')
    password = request.args.get('password')
    auth = (username, password) if username and password else None

    if not instance:
        return jsonify({'error': 'Instance parameter is required'}), 400

    base_url = ALERTMANAGER_URLS.get(instance)
    if not base_url:
        return jsonify({'error': 'Invalid instance'}), 400

    try:
        r = requests.delete(f"{base_url}/silence/{silence_id}", auth=auth)
        r.raise_for_status()
        return jsonify({'status': 'success', 'message': f'Silence {silence_id} deleted'})
    except Exception as e:
        logger.error(f"Error deleting silence {silence_id} from {instance}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/silences/download', methods=['GET'])
def download_silences():
    """
    Download silences from a specific Alertmanager instance as a JSON attachment.
    Query parameters:
      - instance: the instance name (required)
      - username & password: optional basic auth credentials
    """
    instance = request.args.get('instance')
    username = request.args.get('username')
    password = request.args.get('password')
    auth = (username, password) if username and password else None

    if not instance:
        return jsonify({'error': 'Instance parameter is required'}), 400

    base_url = ALERTMANAGER_URLS.get(instance)
    if not base_url:
        return jsonify({'error': 'Invalid instance'}), 400

    try:
        r = requests.get(f"{base_url}/silences", auth=auth)
        r.raise_for_status()
        silences = r.json()
        
        # Add metadata to the export
        export_data = {
            'metadata': {
                'exported_from': instance,
                'export_date': datetime.now().isoformat(),
                'count': len(silences)
            },
            'silences': silences
        }
        
        json_data = json.dumps(export_data, indent=2)
        timestamp = datetime.now().strftime('%Y%m%d-%H%M%S')
        filename = f"silences-{instance}-{timestamp}.json"
        
        return Response(
            json_data,
            mimetype='application/json',
            headers={'Content-Disposition': f'attachment;filename={filename}'}
        )
    except Exception as e:
        logger.error(f"Error downloading silences from {instance}: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/silence', methods=['POST'])
def create_silence():
    """
    Create a new silence in one or more Alertmanager instances.
    Query parameters:
      - instance: comma-separated instance names (if omitted, creates in all)
      - username & password: optional credentials for basic auth
    """
    instance_param = request.args.get('instance')
    username = request.args.get('username')
    password = request.args.get('password')
    auth = (username, password) if username and password else None

    try:
        silence = request.get_json()
        if not silence:
            return jsonify({'error': 'Empty request body'}), 400
    except Exception as e:
        return jsonify({'error': f'Error parsing JSON: {str(e)}'}), 400

    # Determine target instances
    target_instances = []
    if instance_param:
        instance_names = [name.strip() for name in instance_param.split(',')]
        for name in instance_names:
            if name in ALERTMANAGER_URLS:
                target_instances.append(name)
            else:
                return jsonify({'error': f'Invalid instance: {name}'}), 400
    else:
        target_instances = list(ALERTMANAGER_URLS.keys())

    results = {}
    for inst in target_instances:
        base_url = ALERTMANAGER_URLS[inst]
        try:
            r = requests.post(f"{base_url}/silences", json=silence, auth=auth)
            r.raise_for_status()
            results[inst] = {'status': 'success', 'response': r.json()}
            logger.info(f"Created silence in {inst}: {r.json()}")
        except Exception as e:
            logger.error(f"Error creating silence in {inst}: {str(e)}")
            results[inst] = {'status': 'error', 'error': str(e)}
    
    return jsonify(results)

@app.route('/api/silences/upload', methods=['POST'])
def upload_silences():
    """
    Upload silences to one or more Alertmanager instances.
    Query parameters:
      - instance: comma-separated instance names (if omitted, uploads to all)
      - username & password: optional credentials for basic auth
      - remove_id: "true" to remove the 'id' field from each silence before uploading
    The request body should be a JSON list of silence objects or an object with a 'silences' array.
    """
    instance_param = request.args.get('instance')
    username = request.args.get('username')
    password = request.args.get('password')
    auth = (username, password) if username and password else None
    remove_id = request.args.get('remove_id', 'false').lower() == 'true'

    try:
        data = request.get_json()
        
        # Handle both formats: direct list or {silences: [...]}
        if isinstance(data, dict) and 'silences' in data:
            silences = data['silences']
        else:
            silences = data
            
        if not isinstance(silences, list):
            return jsonify({'error': 'Expected a JSON list of silences or an object with a silences array'}), 400
    except Exception as e:
        return jsonify({'error': f'Error parsing JSON: {str(e)}'}), 400

    # Determine target instances
    target_instances = []
    if instance_param:
        instance_names = [name.strip() for name in instance_param.split(',')]
        for name in instance_names:
            if name in ALERTMANAGER_URLS:
                target_instances.append(name)
            else:
                return jsonify({'error': f'Invalid instance: {name}'}), 400
    else:
        target_instances = list(ALERTMANAGER_URLS.keys())

    results = {}
    for inst in target_instances:
        base_url = ALERTMANAGER_URLS[inst]
        results[inst] = []
        for silence in silences:
            silence_copy = silence.copy()
            if remove_id:
                silence_copy.pop('id', None)
            try:
                r = requests.post(f"{base_url}/silences", json=silence_copy, auth=auth)
                r.raise_for_status()
                results[inst].append({'status': 'success', 'response': r.json()})
                logger.info(f"Uploaded silence to {inst}: {r.json()}")
            except Exception as e:
                logger.error(f"Error uploading silence to {inst}: {str(e)}")
                results[inst].append({'status': 'error', 'error': str(e), 'silence': silence_copy})
    return jsonify(results)

@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Not found"}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    # Check if frontend build exists, if not, warn the user
    if not os.path.exists(app.static_folder):
        logger.warning("Frontend build directory not found. Run 'npm run build' in the frontend directory first.")
    
    # Log configured instances
    logger.info(f"Configured Alertmanager instances: {list(ALERTMANAGER_URLS.keys())}")
    
    # Run the application
    app.run(host=config.HOST, port=config.PORT, debug=config.DEBUG)