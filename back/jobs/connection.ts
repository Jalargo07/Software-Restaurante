import { ConnectionOptions } from 'bullmq';

export function getBullMQConnection(): ConnectionOptions {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const token = process.env.REDIS_TOKEN;

  const config: ConnectionOptions = {
    maxRetriesPerRequest: null,
  };

  if (token && url.startsWith('https://')) {
    // Upstash REST URL → TCP URL
    const urlObj = new URL(url);
    config.host = urlObj.hostname;
    config.port = 6380;
    config.username = 'default';
    config.password = token;
    config.tls = { rejectUnauthorized: false };
    return config;
  }

  if (url.startsWith('rediss://')) {
    // URL TLS directa (Upstash TCP, Render Redis TLS)
    const urlObj = new URL(url);
    config.host = urlObj.hostname || 'localhost';
    config.port = urlObj.port ? parseInt(urlObj.port) : 6380;
    config.username = urlObj.username || 'default';
    config.password = token || urlObj.password;
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
