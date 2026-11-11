// Endereço do backend. No desenvolvimento vem do env.js gerado por backend/scripts/run.sh;
// no deploy, troque o padrão abaixo pelo endereço do Render.
export const API_BASE_URL = globalThis.CLICK_SOS_ENV?.API_BASE_URL ?? "http://localhost:8000";
