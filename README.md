# tela-consentimento

Página pública do **Click S.O.S** em que o contato de emergência aceita ou recusa receber alertas.

HTML, CSS e JavaScript puros, sem etapa de build e sem dependências.

## Como funciona

1. No app, quem cadastrou o contato toca em "Enviar pedido de consentimento". O backend gera um link de uso único, válido por 7 dias:
   `https://<esta página>/#token=<token>`
2. O contato abre o link. O token fica no fragmento (`#`), então o navegador não o envia ao servidor que hospeda a página.
3. A página chama `POST /api/v1/consentimento/pedido` com `{ "token" }` e mostra quem fez o pedido.
4. "Aceito" ou "Não aceito" chama `POST /api/v1/consentimento/resposta` com `{ "token", "aceito" }`. Depois disso o link deixa de valer e o token é removido da barra de endereço.

Telas: carregando, pedido, aceito, recusado, link inválido ou expirado, e erro de conexão com "Tentar novamente".

## Rodar localmente

```bash
npm start          # python3 -m http.server 5500
npm test           # node --test (Node 20+)
```

No backend, configure:

```
CORS_ORIGIN_REGEX=^http://localhost:5500$
CONSENTIMENTO_URL_BASE=http://localhost:5500/
```

O endereço do backend fica em `src/config.js` (`API_BASE_URL`, padrão `http://localhost:8000`). Com `backend/scripts/run.sh local` (ou `dev`), o script sobe esta página na porta 5500 e gera `env.js` (ignorado pelo Git) com o endereço do backend do perfil.

## Deploy (Render, plano gratuito)

1. Crie um **Static Site** apontando para este repositório. Build command vazio e publish directory `.`.
2. Antes, troque `API_BASE_URL` em `src/config.js` pelo endereço do backend no Render.
3. No backend, configure:
   - `CONSENTIMENTO_URL_BASE=https://<site>.onrender.com/`
   - `CORS_ORIGIN_REGEX=^https://<site>\.onrender\.com$` (junte com as outras origens usando `|`, se houver).

## Estrutura

- `index.html`: as telas, uma `<section data-tela>` por estado.
- `src/consentimento.js`: lógica pura (ler o token, chamar a API, montar os textos), testada em `test/`.
- `src/app.js`: liga a lógica ao DOM.
- `src/config.js`: endereço da API.
