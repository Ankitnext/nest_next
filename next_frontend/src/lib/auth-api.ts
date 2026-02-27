const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type AuthPayload = {
  email: string;
  password: string;
  name?: string;
};

export async function loginRequest(payload: AuthPayload): Promise<{ token: string }> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: payload.email,
      password: payload.password,
    }),
  });

  const data = (await response.json()) as { token?: string; message?: string };
  if (!response.ok || !data.token) {
    throw new Error(data.message ?? "Login failed");
  }

  return { token: data.token };
}

export async function registerRequest(payload: AuthPayload): Promise<{ token: string }> {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    }),
  });

  const data = (await response.json()) as { token?: string; message?: string };
  if (!response.ok || !data.token) {
    throw new Error(data.message ?? "Registration failed");
  }

  return { token: data.token };
}

