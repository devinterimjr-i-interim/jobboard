// lib/simpleRateLimit.ts
const requests: Record<string, number[]> = {};

export function rateLimit(ip: string, max = 10, windowMs = 60_000) {
  const now = Date.now();

  if (!requests[ip]) requests[ip] = [];

  // Supprime les timestamps trop vieux
  requests[ip] = requests[ip].filter(ts => ts > now - windowMs);

  if (requests[ip].length >= max) {
    return false; // Limite atteinte
  }

  requests[ip].push(now);
  return true; // Requête autorisée
}
