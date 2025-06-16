import axios from 'axios';

const port = process.env.WORKER_MANAGER_PORT || '8080';
const host = process.env.WORKER_MANAGER_HOST || 'localhost';
const ssl = process.env.SSL_ON === 'true';
const version = process.env.API_VERSION?.toLowerCase() || 'v1';

const protocol = ssl ? 'https' : 'http';

const httpClient = axios.create({
  baseURL: `${protocol}://${host}:${port}/${version}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default httpClient;
