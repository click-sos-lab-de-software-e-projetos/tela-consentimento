import { API_BASE_URL } from "./config.js";
import { ErroLinkInvalido, criarApi, lerToken, montarTextoPedido } from "./consentimento.js";

const api = criarApi(API_BASE_URL);
const telas = document.querySelectorAll("[data-tela]");
const token = lerToken(window.location.hash);

function mostrar(nome) {
  telas.forEach((tela) => {
    tela.hidden = tela.dataset.tela !== nome;
  });
  const titulo = document.querySelector(`[data-tela="${nome}"] h1`);
  titulo?.focus();
}

function limparTokenDaUrl() {
  history.replaceState(null, "", window.location.pathname + window.location.search);
}

function tratarErro(erro, repetir) {
  if (erro instanceof ErroLinkInvalido) {
    limparTokenDaUrl();
    mostrar("invalido");
    return;
  }
  document.getElementById("tentar-novamente").onclick = repetir;
  mostrar("erro");
}

async function carregarPedido() {
  mostrar("carregando");
  try {
    const texto = montarTextoPedido(await api.verPedido(token));
    document.getElementById("saudacao").textContent = texto.saudacao;
    document.getElementById("texto-pedido").textContent = texto.pedido;
    document.getElementById("texto-explicacao").textContent = texto.explicacao;
    mostrar("pedido");
  } catch (erro) {
    tratarErro(erro, carregarPedido);
  }
}

async function responder(aceito) {
  mostrar("carregando");
  try {
    const status = await api.responder(token, aceito);
    limparTokenDaUrl();
    mostrar(status === "ACEITO" ? "aceito" : "recusado");
  } catch (erro) {
    tratarErro(erro, () => responder(aceito));
  }
}

document.getElementById("aceitar").addEventListener("click", () => responder(true));
document.getElementById("recusar").addEventListener("click", () => responder(false));

if (token) {
  carregarPedido();
} else {
  mostrar("invalido");
}
