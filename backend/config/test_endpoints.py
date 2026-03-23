from django.test import TestCase, Client


class HealthCheckTest(TestCase):
    """Tests for the /api/v1/health/ endpoint."""

    def setUp(self):
        self.client = Client()

    def test_health_check_returns_200(self):
        """Health check endpoint should return HTTP 200."""
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, 200)

    def test_health_check_returns_json(self):
        """Health check endpoint should return JSON with status ok."""
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response['Content-Type'], 'application/json')
        data = response.json()
        self.assertEqual(data['status'], 'ok')

    def test_health_check_allows_get(self):
        """Health check endpoint should respond to GET requests."""
        response = self.client.get('/api/v1/health/')
        self.assertEqual(response.status_code, 200)


class ConfigViewTest(TestCase):
    """Tests for the /api/v1/config/ endpoint."""

    def setUp(self):
        self.client = Client()

    def test_config_returns_200(self):
        """Config endpoint should return HTTP 200."""
        response = self.client.get('/api/v1/config/')
        self.assertEqual(response.status_code, 200)

    def test_config_returns_api_version(self):
        """Config endpoint should include apiVersion."""
        response = self.client.get('/api/v1/config/')
        data = response.json()
        self.assertEqual(data['apiVersion'], 'v1')

    def test_config_returns_features(self):
        """Config endpoint should include feature flags."""
        response = self.client.get('/api/v1/config/')
        data = response.json()
        self.assertIn('features', data)
        self.assertIn('dictionarySearch', data['features'])
