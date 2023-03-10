import { estadosCompletos } from "../components/form/Estado"
import { breakLine, generateDocument, paragraph, table, tableCell, tableRow, text } from "../utils/xml_word"
import * as Yup from 'yup';

export const PessoaSchema = Yup.object({
  tipo: Yup.string().required(),
  nome: Yup.string().required().min(3),
  cpf: Yup.string().required().length(14),
  rg: Yup.string().required(),
  expeditor: Yup.string().required(),
  uf: Yup.string().required(),
  estado_civil: Yup.string(),
  nacionalidade: Yup.string().required(),
  profissao: Yup.string().required(),
  conjugue: Yup.string(),
  endereco: Yup.string().required(),
  cep: Yup.string().required().length(9),
  estado: Yup.string().required(),
  cidade: Yup.string().required(),

  motivo_representante: Yup.string().when('tipo', ([tipo], field) => {
    return tipo === 'representante' ? field.required() : field
  }),
})

export const ImovelRuralSchema = Yup.object({
  tipo: Yup.string().required().oneOf(['posse', 'matricula']),
  nome: Yup.string().required(),
  estado: Yup.string().required().oneOf(estadosCompletos.map(estado => estado.value)),
  cidade: Yup.string().required(),
  area: Yup.object({
    tipo: Yup.string().required().oneOf(['total', 'parcial']),
    total: Yup.object({
      valor: Yup.string().required(),
      extenso: Yup.string().required(),
    }),
    parcial: Yup.object().when('tipo', ([tipo], field) => {
      return tipo === 'parcial' ? Yup.object({
        valor: Yup.string().required(),
        extenso: Yup.string().required(),
      }) : field
    })
  }),


  cartorio: Yup.object().when('tipo', ([tipo], field) => {
    return tipo != 'matricula' ? field : Yup.object({
      entidade: Yup.string().required(),
      livro: Yup.string().required(),
      folha: Yup.string().required(),
      matricula: Yup.string().required(),
    })
  })
})


export const PagamentoSchema = Yup.object({
  valor: Yup.string().required(),
  extenso: Yup.string().required()
})

export const AssinaturaSchema = Yup.object({
  estado: Yup.string().required().oneOf(estadosCompletos.map(estado => estado.value)),
  cidade: Yup.string().required(),
})

export type CDUData = {
  pessoas: {
    id: string,
    tipo: "cedente" | "representante",
    nome: string,
    cpf: string,
    estado_civil: string,
    conjugue: string,
    rg: string,
    uf: string,
    expeditor: string,
    nacionalidade: string,
    profissao: string,
    endereco: string,
    cep: string,
    estado: string,
    cidade: string,
    motivo_representante: string

  }[],

  contasBancarias: {
    id: string,
    percentual: string,
    banco: string,
    agencia: string,
    conta: string,
    tipo: string,
    operacao: string,
    titular: string,
    cpf: string,
    contato: string
  }[],

  imovel: {
    tipo: "posse" | "matricula",
    nome: string,
    estado: string,
    cidade: string,
    area: {
      tipo: "total" | "parcial",
      total: {
        valor: string,
        extenso: string,
      },
      parcial: {
        valor: string,
        extenso: string,
      }
    },
    cartorio: {
      entidade: string,
      livro: string,
      folha: string,
      matricula: string,
    }
  },

  pagamento: {
    valor: string,
    extenso: string,
  },

  assinatura: {
    estado: string,
    cidade: string,
  }
}

export function gerarCDU(data: CDUData) {

  const representantes = data.pessoas.filter(p => p.tipo == 'representante')
  const cedentes: CDUData['pessoas'] = []

  data.pessoas.forEach(pessoa => {
    if (pessoa.tipo === 'cedente' && !cedentes.some(p => p.conjugue === pessoa.id)) {
      cedentes.push(pessoa)
    }
  })


  function montarParagrafoPessoa(pessoa: CDUData['pessoas'][0]) {
    return [
      text(pessoa.nome.toUpperCase(), [['b']]),
      text(`, ${pessoa.nacionalidade}, ${pessoa.profissao}, portador da Carteira de Identidade n?? `),
      text(`${pessoa.rg} ${pessoa.expeditor}/${pessoa.uf}`, [['b']]),
      text(', inscrito no C.P.F/MF. sob o n?? '),
      text(pessoa.cpf, [['b']]),
      text(`, residente e domiciliado(a) no(a) ${pessoa.endereco}, Munic??pio de ${pessoa.cidade}, ${estadosCompletos.find(e => e.value === pessoa.estado)?.label}, CEP: ${pessoa.cep}`),
      text(', contato telef??nico: ;'),
    ].join('')
  }

  let pessoasParagraph = paragraph([
    ...cedentes.map(cedente => {
      let content = montarParagrafoPessoa(cedente)

      if (cedente.conjugue) {
        const conjugue = data.pessoas.find(p => p.id === cedente.conjugue)

        if (conjugue) {
          content += text(' casado em regime de comunh??o parcial de bens com ')
          content += montarParagrafoPessoa(conjugue)
        }
      }
      return content
    }),

    text(' doravante designado simplesmente '),
    text('CEDENTE;', [['b']]),

    representantes.length > 0 ? (data.pessoas.filter(p => p.tipo == 'cedente').length > 1 ? text(" s??o representados na forma de a Rogo, por: ") : text(" sendo representado na forma de a Rogo, por: ")) : "",

    representantes.map(representante => {
      return montarParagrafoPessoa(representante)
    }).join('')
  ])

  const imovel = paragraph([
    text('(i) O '),
    text('CEDENTE', [['b']]),
    text(' ?? senhor e/ou possuidor do im??vel rural denominado '),
    text(`???${data.imovel.nome}???`, [['b']]),
    text(`, situada no munic??pio de ${data.imovel.cidade}/${estadosCompletos.find(e => e.value === data.imovel.estado)?.label}, com ??rea total de `),
    text(`${data.imovel.area.total.valor.replace(",0000", "")} (${data.imovel.area.total.extenso})`, [['b']]) + text(", "),
    data.imovel.tipo == 'posse' ?
      text('POSSE', [['b']]) + text(', com limites e confrontantes de acordo com a respectiva planta. (?????REA???);')
      : text(`registrada no ${data.imovel.cartorio.entidade}, sob o n?? ${data.imovel.cartorio.matricula}, Livro ${data.imovel.cartorio.livro}, com limites e confrontantes de acordo com a respectiva matr??cula supracitada(?????REA???);`)
  ])

  const area = paragraph([
    text('(ii) a '),
    text('CESSION??RIA', [['b']]),
    text(' tem interesse em utilizar o Im??vel acima descrito,(?????REA???), '),
    data.imovel.area.tipo === 'parcial' ?
      text('cujo interesse e objeto deste contrato se limita somente a uma ??rea parcial equivalente a ') + text(`${data.imovel.area.parcial.valor.replace(",0000", '')} (${data.imovel.area.parcial.extenso})`, [['b']]) + text(' conforme planta contida no ANEXO l, ')
      : '',
    text('para os fins espec??ficos de, em um primeiro momento, nela desenvolver e pesquisar o seu potencial e??lico, podendo nela instalar torres meteorol??gicas e/ou anemom??tricas, equipamentos de medi????es e??licas, manuten????o e controle (???Per??odo Pr??-Operacional???) e, caso as pesquisas sejam positivas, nela instalar e operar parques e??licos, atrav??s da instala????o de aerogeradores, subesta????es elevadoras de tens??o (SE), centro de opera????o, acessos, redes de m??dia tens??o (RMT) e tudo mais que for necess??rio para a gera????o de energia e??lica, inclusive linhas de transmiss??o el??trica, linhas de comunica????o a??rea e subterr??nea, de transformadores el??tricos, telecomunica????es, estradas, canteiros de obra, bem como de f??brica de torres para aerogeradores, tudo a ser implantado pela '),
    text('CESSION??RIA', [['b']]),
    text(', de acordo com suas necessidades (???Usina E??lica???);')
  ])

  const dadosBancariosDeTerceiros = data.contasBancarias.some(conta => !cedentes.some(cedente => cedente.cpf == conta.cpf))

  const dadosBancariosParagrafo = paragraph([
    text('Par??grafo 5??', [['b']]),
    text(' - O pagamento da contrapresta????o ser?? feito via dep??sito banc??rio,'),

    dadosBancariosDeTerceiros ?
      text(' na(s) conta(s) de terceiro(s) e propor????o(??es) abaixo especificada, desde j?? indicado e autorizado pelo ') + text('CEDENTE', [['b']]) + text(', valendo os correspondentes comprovantes de dep??sitos como recibo de pagamento.')
      : text(' na(s) conta(s) e propor????o (??es) abaixo especificadas, valendo os correspondentes comprovantes de dep??sitos como recibo de pagamento.')
  ])

  const bancos = table(
    [
      tableRow([
        tableCell(paragraph([text('Dados banc??rios', [['b']])], [['jc', 'center']]), [['vAlign', 'center']]),
        tableCell(paragraph([text('Percentual', [['b']])], [['jc', 'center']]), [['vAlign', 'center']]),
      ], [['trHeight', '600']]),

      ...data.contasBancarias.map(contaBancaria => {
        return tableRow([
          tableCell(
            paragraph([
              text(`Banco: ${contaBancaria.banco}`),
              breakLine(),
              text(`Ag??ncia: ${contaBancaria.agencia}`),
              breakLine(),
              text(`Tipo de conta: ${contaBancaria.tipo}`),
              breakLine(),
              text(`Opera????o: ${contaBancaria.operacao}`),
              breakLine(),
              text(`Titular: ${contaBancaria.titular}`, [['b']]),
              breakLine(),
              text(`CPF: ${contaBancaria.cpf}`, [['b']]),
              breakLine(),
              text(`Contato: ${contaBancaria.contato}`),
            ], [['jc', 'left']]),

            [['vAlign', 'center']]
          ),
          tableCell(
            paragraph([
              text(`${contaBancaria.percentual}%`)
            ], [['jc', 'center']]),

            [['vAlign', 'center']]
          )

        ], [['trHeight', '2600']])
      })
    ], { colsWidth: [8000, 2000] }
  )

  const dataAtual = new Date();
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }).replace(' de ', ' de ');
  const nomeDocumento = `${dataAtual.getTime().toString().slice(0, -3)}.docx`

  const assinatura_a_rogo_representantes = [
    ...representantes.map((representante, index) => {
      return [
        index === 0 ? breakLine() + text('a rogo: ') : '',
        text(representante.nome),
        breakLine(),
        text(`CPF: ${representante.cpf}${index === representantes.length - 1 ? '.' : ';'}`),
      ].join('')
    })
  ].join('')

  const assinaturas_cedentes = paragraph([
    ...(data.pessoas.filter(p => p.tipo == 'cedente')).map((cedente, index) => {
      return [
        breakLine(index === 0 ? 2 : 3),
        text('_____________________________________________________'),
        breakLine(),
        text(cedente.nome.toUpperCase(), [['b']]),
        breakLine(),
        text(`CPF: ${cedente.cpf}`),
        assinatura_a_rogo_representantes
      ].join('')
    })
  ], [['jc', 'left']])

  const dadosPreencherModelo = {
    cedentes: pessoasParagraph,
    imovel,
    area,
    dadosBancariosParagrafo,
    bancos,
    assinaturas_cedentes,
    importancia_anual: `${data.pagamento.valor} (${data.pagamento.extenso})`,
    assinatura: `${data.assinatura.cidade}/${data.assinatura.estado}, ${dataFormatada}`
  }

  generateDocument('/modelos/cdu.docx', dadosPreencherModelo, nomeDocumento)
}
