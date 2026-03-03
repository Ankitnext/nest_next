const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";

type LoginPayload = { email: string; password: string };
type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  role?: string;
  vendor_store?: string;
  phone?: string;
  vehicle_type?: string;
};

export async function loginRequest(payload: LoginPayload): Promise<{ token: string; role: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: payload.email, password: payload.password }),
  });
  const data = (await res.json()) as { token?: string; role?: string; message?: string };
  if (!res.ok || !data.token) throw new Error(data.message ?? "Login failed");
  return { token: data.token, role: data.role ?? "user" };
}

export async function registerRequest(payload: RegisterPayload): Promise<{ token: string; role: string }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name:         payload.name,
      email:        payload.email,
      password:     payload.password,
      role:         payload.role,
      vendor_store: payload.vendor_store,
      phone:        payload.phone,
      vehicle_type: payload.vehicle_type,
    }),
  });
  const data = (await res.json()) as { token?: string; role?: string; message?: string };
  if (!res.ok || !data.token) throw new Error(data.message ?? "Registration failed");
  return { token: data.token, role: data.role ?? "user" };
}
