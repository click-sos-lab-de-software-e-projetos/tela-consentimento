// Endereço do backend. No desenvolvimento vem do env.js gerado por backend/scripts/run.sh;
// sem ele, a página aberta em localhost usa o backend local e, publicada (GitHub Pages), o do Render.
export const API_PRODUCAO = "https://backend-l97v.onrender.com";
export const API_LOCAL = "http://localhost:8000";

export function escolherApiBase(env, hostname) {
  if (env?.API_BASE_URL) return env.API_BASE_URL;
  return hostname === "localhost" || hostname === "127.0.0.1" ? API_LOCAL : API_PRODUCAO;
}

export const API_BASE_URL = escolherApiBase(globalThis.CLICK_SOS_ENV, globalThis.location?.hostname);
