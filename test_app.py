import json
import unittest
from unittest import mock
from app import app

class TestAlertmanagerProxy(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True
    
    def test_get_instances(self):
        response = self.app.get('/api/instances')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertTrue(len(data) > 0)
    
    @mock.patch('app.requests.get')
    def test_list_silences_single_instance(self, mock_get):
        # Mock the response from Alertmanager
        mock_response = mock.Mock()
        mock_response.json.return_value = [{"id": "123", "status": {"state": "active"}}]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        response = self.app.get('/api/silences?instance=Instance+1')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, list)
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]['id'], '123')
    
    @mock.patch('app.requests.get')
    def test_list_silences_all_instances(self, mock_get):
        # Mock the response from Alertmanager
        mock_response = mock.Mock()
        mock_response.json.return_value = [{"id": "123", "status": {"state": "active"}}]
        mock_response.raise_for_status.return_value = None
        mock_get.return_value = mock_response
        
        response = self.app.get('/api/silences')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIsInstance(data, dict)
        self.assertTrue('Instance 1' in data)
        self.assertTrue('Instance 2' in data)
    
    @mock.patch('app.requests.post')
    def test_create_silence(self, mock_post):
        # Mock the response from Alertmanager
        mock_response = mock.Mock()
        mock_response.json.return_value = {"silenceId": "123"}
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        silence_data = {
            "comment": "Test silence",
            "createdBy": "test_user",
            "startsAt": "2023-01-01T00:00:00Z",
            "endsAt": "2023-01-02T00:00:00Z",
            "matchers": [
                {"name": "severity", "value": "critical", "isRegex": False}
            ]
        }
        
        response = self.app.post(
            '/api/silence?instance=Instance+1',
            data=json.dumps(silence_data),
            content_type='application/json'
        )
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('Instance 1', data)
        self.assertEqual(data['Instance 1']['status'], 'success')
    
    @unittest.skip("Skip until frontend build is available")
    def test_serve_frontend(self):
        # This test will only pass if the build directory exists
        # In CI environments, we might skip this test
        response = self.app.get('/')
        self.assertIn(response.status_code, [200, 404])  # 404 is acceptable if build dir doesn't exist

if __name__ == '__main__':
    unittest.main()