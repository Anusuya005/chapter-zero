const API =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8080";

export async function apiFetch(
  path,
  options = {}
) {
  const token =
    localStorage.getItem("chapterZeroToken");

  const headers = new Headers(
    options.headers || {}
  );

  if (
    options.body &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json"
    );
  }

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return fetch(
    `${API}${path}`,
    {
      ...options,
      headers,
    }
  );
}

export function apiUrl(path) {
  return `${API}${path}`;
}

export default API;