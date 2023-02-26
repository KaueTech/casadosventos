export function removerVazios(objeto) {
  const novoObjeto = {}

  for (let chave in objeto) {
    const valor = objeto[chave]

    if (typeof valor === 'object' && valor !== null) {
      novoObjeto[chave] = removerVazios(novoObjeto[chave])
    } else if (!(!valor && typeof valor !== 'number')) {
      novoObjeto[chave] = valor
    }
  }

  return novoObjeto
}
export function compararObjetos(objeto1, objeto2) {
  const objeto1_limpo = removerVazios(objeto1)
  const objeto2_limpo = removerVazios(objeto2)

  if (Object.keys(objeto1_limpo).length != Object.keys(objeto2_limpo).length) {
    return false
  } else if (Object.keys(objeto1_limpo).length == 0) {
    return true
  }

  for (let chave in objeto1_limpo) {
    if (!objeto2_limpo.hasOwnProperty(chave) || objeto2_limpo[chave] !== objeto1_limpo[chave]) {
      return false
    }
  }

  return true

}
