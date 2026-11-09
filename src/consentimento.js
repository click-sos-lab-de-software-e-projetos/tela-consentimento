const PADRAO_TOKEN = /^[A-Za-z0-9_-]{32,64}$/;

export class ErroLinkInvalido extends Error {}
export class ErroRede extends Error {}

export function lerToken(hash) {
  const parametros = new URLSearchParams((hash || "").replace(/^#/, ""));
  const token = parametros.get("token");
  return token && PADRAO_TOKEN.test(token) ? token : null;
}

export function criarApi(urlBase, fetchFn = globalThis.fetch.bind(globalThis)) {
  const base = urlBase.replace(/\/+$/, "");

  async function postar(caminho, corpo) {
    let resposta;
    try {
      resposta = await fetchFn(`${base}/api/v1/consentimento/${caminho}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(corpo),
      });
    } catch (erro) {
      throw new ErroRede("Sem conexão com o servidor.", { cause: erro });
    }
    if (resposta.status === 404 || resposta.status === 422) {
      throw new ErroLinkInvalido("Link inválido ou expirado.");
    }
    if (!resposta.ok) {
      throw new ErroRede(`Erro ${resposta.status} no servidor.`);
    }
    return resposta.json();
  }

  return {
    verPedido: (token) => postar("pedido", { token }),
    responder: async (token, aceito) => (await postar("resposta", { token, aceito })).status,
  };
}

export function montarTextoPedido({ nome_contato, nome_solicitante }) {
  const primeiroNome = nome_solicitante.trim().split(/\s+/)[0];
  return {
    saudacao: `Olá, ${nome_contato}!`,
    pedido: `${nome_solicitante} quer cadastrar você como contato de emergência no Click S.O.S.`,
    explicacao:
      `Quando ${primeiroNome} acionar o S.O.S, você vai receber uma mensagem no WhatsApp ` +
      "com a localização em tempo real. Você pode recusar agora sem nenhum problema.",
  };
}
