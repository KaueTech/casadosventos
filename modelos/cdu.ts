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
      text(`, ${pessoa.nacionalidade}, ${pessoa.profissao}, portador da Carteira de Identidade nº `),
      text(`${pessoa.rg} ${pessoa.expeditor}/${pessoa.uf}`, [['b']]),
      text(', inscrito no C.P.F/MF. sob o nº '),
      text(pessoa.cpf, [['b']]),
      text(`, residente e domiciliado(a) no(a) ${pessoa.endereco}, Município de ${pessoa.cidade}, ${estadosCompletos.find(e => e.value === pessoa.estado)?.label}, CEP: ${pessoa.cep}`),
      text(', contato telefônico: ;'),
    ].join('')
  }

  let pessoasParagraph = paragraph([
    ...cedentes.map(cedente => {
      let content = montarParagrafoPessoa(cedente)

      if (cedente.conjugue) {
        const conjugue = data.pessoas.find(p => p.id === cedente.conjugue)

        if (conjugue) {
          content += text(' casado em regime de comunhão parcial de bens com ')
          content += montarParagrafoPessoa(conjugue)
        }
      }
      return content
    }),

    text(' doravante designado simplesmente '),
    text('CEDENTE;', [['b']]),

    representantes.length > 0 ? (data.pessoas.filter(p => p.tipo == 'cedente').length > 1 ? text(" são representados na forma de a Rogo, por: ") : text(" sendo representado na forma de a Rogo, por: ")) : "",

    representantes.map(representante => {
      return montarParagrafoPessoa(representante)
    }).join('')
  ])

  const imovel = paragraph([
    text('(i) O '),
    text('CEDENTE', [['b']]),
    text(' é senhor e/ou possuidor do imóvel rural denominado '),
    text(`“${data.imovel.nome}“`, [['b']]),
    text(`, situada no município de ${data.imovel.cidade}/${estadosCompletos.find(e => e.value === data.imovel.estado)?.label}, com área total de `),
    text(`${data.imovel.area.total.valor.replace(",0000", "")} (${data.imovel.area.total.extenso})`, [['b']]) + text(", "),
    data.imovel.tipo == 'posse' ?
      text('POSSE', [['b']]) + text(', com limites e confrontantes de acordo com a respectiva planta. (“ÁREA“);')
      : text(`registrada no ${data.imovel.cartorio.entidade}, sob o nº ${data.imovel.cartorio.matricula}, Livro ${data.imovel.cartorio.livro}, com limites e confrontantes de acordo com a respectiva matrícula supracitada(“ÁREA”);`)
  ])

  const area = paragraph([
    text('(ii) a '),
    text('CESSIONÁRIA', [['b']]),
    text(' tem interesse em utilizar o Imóvel acima descrito,(“ÁREA”), '),
    data.imovel.area.tipo === 'parcial' ?
      text('cujo interesse e objeto deste contrato se limita somente a uma área parcial equivalente a ') + text(`${data.imovel.area.parcial.valor.replace(",0000", '')} (${data.imovel.area.parcial.extenso})`, [['b']]) + text(' conforme planta contida no ANEXO l, ')
      : '',
    text('para os fins específicos de, em um primeiro momento, nela desenvolver e pesquisar o seu potencial eólico, podendo nela instalar torres meteorológicas e/ou anemométricas, equipamentos de medições eólicas, manutenção e controle (“Período Pré-Operacional”) e, caso as pesquisas sejam positivas, nela instalar e operar parques eólicos, através da instalação de aerogeradores, subestações elevadoras de tensão (SE), centro de operação, acessos, redes de média tensão (RMT) e tudo mais que for necessário para a geração de energia eólica, inclusive linhas de transmissão elétrica, linhas de comunicação aérea e subterrânea, de transformadores elétricos, telecomunicações, estradas, canteiros de obra, bem como de fábrica de torres para aerogeradores, tudo a ser implantado pela '),
    text('CESSIONÁRIA', [['b']]),
    text(', de acordo com suas necessidades (“Usina Eólica”);')
  ])

  const dadosBancariosDeTerceiros = data.contasBancarias.some(conta => !cedentes.some(cedente => cedente.cpf == conta.cpf))

  const dadosBancariosParagrafo = paragraph([
    text('Parágrafo 5º', [['b']]),
    text(' - O pagamento da contraprestação será feito via depósito bancário,'),

    dadosBancariosDeTerceiros ?
      text(' na(s) conta(s) de terceiro(s) e proporção(ões) abaixo especificada, desde já indicado e autorizado pelo ') + text('CEDENTE', [['b']]) + text(', valendo os correspondentes comprovantes de depósitos como recibo de pagamento.')
      : text(' na(s) conta(s) e proporção (ões) abaixo especificadas, valendo os correspondentes comprovantes de depósitos como recibo de pagamento.')
  ])

  const bancos = table(
    [
      tableRow([
        tableCell(paragraph([text('Dados bancários', [['b']])], [['jc', 'center']]), [['vAlign', 'center']]),
        tableCell(paragraph([text('Percentual', [['b']])], [['jc', 'center']]), [['vAlign', 'center']]),
      ], [['trHeight', '600']]),

      ...data.contasBancarias.map(contaBancaria => {
        return tableRow([
          tableCell(
            paragraph([
              text(`Banco: ${contaBancaria.banco}`),
              breakLine(),
              text(`Agência: ${contaBancaria.agencia}`),
              breakLine(),
              text(`Tipo de conta: ${contaBancaria.tipo}`),
              breakLine(),
              text(`Operação: ${contaBancaria.operacao}`),
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
