import dotenv from 'dotenv';
dotenv.config();

function getEnvVar(name: string, required = true, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value as string;
}

export const config = {
  MONGO_URI: getEnvVar('MONGO_URI'),
  JWT_SECRET: getEnvVar('JWT_SECRET'),
  PORT: parseInt(getEnvVar('PORT', false, '5000'), 10),
  CLIENT_URL: getEnvVar('CLIENT_URL', false, 'http://localhost:5173'),
}; 