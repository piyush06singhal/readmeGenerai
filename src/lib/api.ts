export class ApiError extends Error {
  status?: number;
  code?: string;

  constructor(message: string, status?: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;
    let code: string | undefined;
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
      if (body?.code) code = body.code;
    } catch {
      // ignore — fall back to generic message
    }
    throw new ApiError(message, response.status, code);
  }

  return response.json() as Promise<T>;
}
