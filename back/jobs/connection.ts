import { ConnectionOptions } from 'bullmq';

export function getBullMQConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const token = process.env.REDIS_TOKEN;

  const config: ConnectionOptions = {
    maxRetriesPerRequest: null,
  };

  if (token && url.startsWith('https://')) {
    const urlObj = new URL(url);
    config.host = urlObj.hostname;
    config.port = 443;
    config.username = 'default';
    config.password = token;
    config.tls = { rejectUnauthorized: false };
    return config;
  }

  if (token) {
    const urlObj = new URL(url);
    config.host = urlObj.hostname || 'localhost';
    config.port = urlObj.port ? parseInt(urlObj.port) : 6379;
    config.password = token;
    if (urlObj.username) {
      config.username = urlObj.username;
    }
  } else {
    const urlObj = new URL(url);
    config.host = urlObj.hostname || 'localhost';
    config.port = urlObj.port ? parseInt(urlObj.port) : 6379;
    if (urlObj.username) {
      config.username = urlObj.username;
    }
  }

  return config;
}
