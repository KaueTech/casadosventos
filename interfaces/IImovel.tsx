export interface IImovel {
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
}
