import { getToken } from '@vercel/connect';

export async function getApiKeyToken(): Promise<string> {
  const envToken = import.meta.env.VITE_VERCEL_CONNECT_TOKEN || '';
  if (envToken) {
    return envToken;
  }

  try {
    const token = await getToken('api-key/my-api');
    if (token) {
      return token;
    }
  } catch {
    return import.meta.env.VITE_VERCEL_CONNECT_TOKEN || '';
  }

  return import.meta.env.VITE_VERCEL_CONNECT_TOKEN || '';
}
