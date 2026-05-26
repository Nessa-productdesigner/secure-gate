type HeaderSource =
  | { headers: Headers }
  | { headers: Record<string, string | string[] | undefined> };

function readHeader(
  headers: Headers | Record<string, string | string[] | undefined>,
  name: string
): string | undefined {
  if (headers instanceof Headers) {
    return headers.get(name) ?? undefined;
  }

  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return value[0];
  return value;
}

export function getClientIp(req: HeaderSource): string {
  const forwarded = readHeader(req.headers, "x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }

  return readHeader(req.headers, "x-real-ip") ?? "unknown";
}
