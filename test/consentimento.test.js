import { test } from "node:test";
import assert from "node:assert/strict";

import { ErroLinkInvalido, ErroRede, criarApi, lerToken, montarTextoPedido } from "../src/consentimento.js";

const TOKEN = "a".repeat(43);

test("lerToken pega o token do fragmento", () => {
  assert.equal(lerToken(`#token=${TOKEN}`), TOKEN);
});

test("lerToken devolve null sem token ou com fragmento vazio", () => {
  assert.equal(lerToken(""), null);
  assert.equal(lerToken("#"), null);
  assert.equal(lerToken("#token="), null);
  assert.equal(lerToken("#outra=coisa"), null);
});

test("lerToken recusa caracteres fora do base64url", () => {
  assert.equal(lerToken("#token=abc<script>"), null);
});

function fetchFalso(status, corpo) {
  const chamadas = [];
  const fn = async (url, opcoes) => {
    chamadas.push({ url, opcoes });
    return { ok: status >= 200 && status < 300, status, json: async () => corpo };
  };
  return { fn, chamadas };
}

test("verPedido envia o token no corpo, nunca na URL", async () => {
  const { fn, chamadas } = fetchFalso(200, { nome_contato: "Bruno", nome_solicitante: "Ana Souza" });
  const api = criarApi("https://api.example.com/", fn);

  const pedido = await api.verPedido(TOKEN);

  assert.deepEqual(pedido, { nome_contato: "Bruno", nome_solicitante: "Ana Souza" });
  assert.equal(chamadas[0].url, "https://api.example.com/api/v1/consentimento/pedido");
  assert.ok(!chamadas[0].url.includes(TOKEN));
  assert.equal(chamadas[0].opcoes.method, "POST");
  assert.deepEqual(JSON.parse(chamadas[0].opcoes.body), { token: TOKEN });
});

test("responder envia token e aceito", async () => {
  const { fn, chamadas } = fetchFalso(200, { status: "RECUSADO" });
  const api = criarApi("https://api.example.com", fn);

  const resultado = await api.responder(TOKEN, false);

  assert.equal(resultado, "RECUSADO");
  assert.equal(chamadas[0].url, "https://api.example.com/api/v1/consentimento/resposta");
  assert.deepEqual(JSON.parse(chamadas[0].opcoes.body), { token: TOKEN, aceito: false });
});

test("404 vira ErroLinkInvalido", async () => {
  const api = criarApi("https://api.example.com", fetchFalso(404, {}).fn);
  await assert.rejects(api.verPedido(TOKEN), ErroLinkInvalido);
});

test("422 também vira ErroLinkInvalido", async () => {
  const api = criarApi("https://api.example.com", fetchFalso(422, {}).fn);
  await assert.rejects(api.responder(TOKEN, true), ErroLinkInvalido);
});

test("500 e falha de rede viram ErroRede", async () => {
  const api500 = criarApi("https://api.example.com", fetchFalso(500, {}).fn);
  await assert.rejects(api500.verPedido(TOKEN), ErroRede);

  const semRede = criarApi("https://api.example.com", async () => {
    throw new TypeError("Failed to fetch");
  });
  await assert.rejects(semRede.verPedido(TOKEN), ErroRede);
});

test("montarTextoPedido usa o primeiro nome de quem pediu", () => {
  const texto = montarTextoPedido({ nome_contato: "Bruno", nome_solicitante: "Ana Souza Lima" });

  assert.equal(texto.saudacao, "Olá, Bruno!");
  assert.match(texto.pedido, /^Ana Souza Lima quer cadastrar você como contato de emergência/);
  assert.match(texto.explicacao, /Quando Ana acionar o S\.O\.S/);
});
