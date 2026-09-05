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
      if (response.status === 404) {
        message = 'The API endpoint was not found (404). Please verify serverless API route deployment.';
        code = 'NOT_FOUND';
      } else if (response.status === 405) {
        message = 'Method not allowed (405). Route rejected POST request.';
        code = 'METHOD_NOT_ALLOWED';
      } else if (response.status === 500) {
        message = 'Internal server error (500). Please check server logs.';
        code = 'INTERNAL_ERROR';
      } else if (response.status === 502 || response.status === 503 || response.status === 504) {
        message = 'Server is currently unavailable or timed out. Please try again.';
        code = 'NETWORK_ERROR';
      }
    }
    throw new ApiError(message, response.status, code);
  }

  return response.json() as Promise<T>;
}
