const base = import.meta.env.VITE_API_BASE ?? "";

async function readError(response: Response): Promise<string> {
  try {
    const data = await response.json();
    if (data && typeof data.error === "string") return data.error;
  } catch {
    // The response was not JSON.
  }
  return "Something went wrong. Please try again.";
}

export async function postJson(path: string, body: unknown) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}

export async function postForm(path: string, body: FormData) {
  const response = await fetch(`${base}${path}`, {
    method: "POST",
    body,
  });
  if (!response.ok) throw new Error(await readError(response));
  return response.json();
}
