# SM3 Alertmanager Silence Manager

A modern, clean and intuitive web application for managing Prometheus Alertmanager silences across multiple instances.

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/yourusername/sm3-alertmanager/ci.yml?branch=main)
![Docker Pulls](https://img.shields.io/docker/pulls/yourusername/sm3-alertmanager)
![License](https://img.shields.io/github/license/yourusername/sm3-alertmanager)

## Features

- **Multi-Instance Support**: Manage silences across multiple Alertmanager instances
- **Create and Edit Silences**: Intuitive interface for creating and editing silences
- **Bulk Operations**: Apply silences to multiple instances at once
- **Import/Export**: Backup and restore silences between instances
- **Modern UI**: Clean, responsive interface with dark mode support
- **Authentication Support**: Optional basic auth support for Alertmanager instances

## Screenshots

<details>
<summary>Click to view screenshots</summary>

*Screenshots will be added soon*

</details>

## Installation

### Using Docker (Recommended)

The easiest way to run SM3 Alertmanager is using Docker:

```bash
docker run -p 5000:5000 yourusername/sm3-alertmanager:latest
```

You can also use Docker Compose:

```bash
# Clone the repository
git clone https://github.com/yourusername/sm3-alertmanager.git
cd sm3-alertmanager

# Start with Docker Compose
docker-compose up -d
```

### Manual Installation

#### Prerequisites

- Python 3.8+
- Node.js 16+
- npm 7+

#### Backend Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/sm3-alertmanager.git
   cd sm3-alertmanager
   ```

2. Create a virtual environment and install dependencies:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. Configure your Alertmanager instances:
   Edit the `ALERTMANAGER_URLS` dictionary in `app.py` to include your Alertmanager instances.

#### Frontend Setup

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Build the frontend:
   ```bash
   npm run build
   ```

## Running the Application

### Docker

When using Docker, the application is available at `http://localhost:5000` after running the container.

### Manual

1. Start the backend server:
   ```bash
   python app.py
   ```

2. For development, you can run the frontend in development mode:
   ```bash
   cd frontend
   npm start
   ```

3. For production, build the frontend and let the Flask server serve it:
   ```bash
   cd frontend
   npm run build
   cd ..
   python app.py
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5000
   ```

## Configuration

### Environment Variables

The following environment variables can be set:

- `FLASK_ENV`: Set to `production` or `development`
- `FLASK_APP`: Set to `app.py`
- `PORT`: The port to run the server on (default: 5000)

### Alertmanager Instances

Edit the `ALERTMANAGER_URLS` dictionary in `app.py`:

```python
ALERTMANAGER_URLS = {
    "Production": "http://alertmanager-prod:9093/api/v2",
    "Staging": "http://alertmanager-stage:9093/api/v2",
    "Development": "http://alertmanager-dev:9093/api/v2",
}
```

Alternatively, you can modify the app to read from environment variables or a configuration file.

## Development

### Running Tests

#### Backend
```bash
pip install pytest
pytest
```

#### Frontend
```bash
cd frontend
npm test
```

### CI/CD Pipeline

This repository includes GitHub Actions workflows for:
- Linting and testing the backend code
- Linting and testing the frontend code
- Building the Docker image

## Security

This application supports basic authentication for Alertmanager instances. Credentials are stored in browser local storage.

For production use, consider:
- Serving via HTTPS
- Implementing proper authentication
- Setting up a reverse proxy
- Not using this as a public-facing service unless properly secured

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT