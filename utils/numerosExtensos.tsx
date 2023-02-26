import extenso from "extenso";

export function realPorExtenso(valor: string | number) {
  const reais = typeof valor == "string" ? Number(valor) : valor;

  let resultado = extenso(reais, {
    locale: "br",
    mode: "currency",
    currency: {
      type: "BRL"
    }
  })

  let resultadoTokens = resultado.split(' ')
  if (resultadoTokens[0] == "mil") {
    resultadoTokens[0] = 'hum mil'
  } else if (resultadoTokens[0] == 'um') {
    resultadoTokens[0] = "hum"
  }

  return resultadoTokens.join(' ')
}

export function hectaresPorExtenso(hectares) {
  const hectaresInteiro = Math.floor(hectares);
  const hectaresDecimais = hectares - hectaresInteiro;
  const ares = hectaresDecimais * 100;
  let aresInteiro = Math.floor(ares);
  let centiares = Math.round((ares - aresInteiro) * 100);

  if (centiares === 100) {
    centiares = 0;
    aresInteiro += 1;
  }

  let resultado = '';
  if (hectaresInteiro > 0) {
    //realPorExtenso(hectaresInteiro).replace(' de reais', "").replace(" real", '').replace(' reais', '')
    resultado += `${extenso(hectaresInteiro, { locale: 'br' })} ${hectaresInteiro === 1 ? 'hectare' : 'hectares'}`;
  }
  if (aresInteiro > 0) {
    if (resultado) {
      resultado += centiares ? ', ' : ' e ';
    }
    resultado += `${extenso(aresInteiro, { locale: 'br' })} ${aresInteiro === 1 ? 'are' : 'ares'}`;
  }
  if (centiares > 0) {
    if (resultado) {
      resultado += ' e ';
    }
    resultado += `${extenso(centiares, { locale: 'br' })} ${centiares === 1 ? 'centiare' : 'centiares'}`;
  }

  return resultado;
}
