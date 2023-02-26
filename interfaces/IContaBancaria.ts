import * as Yup from 'yup';

export interface IContaBancaria {
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
}

export const IContaBancariaSchema = Yup.object<IContaBancaria>().shape({
  cpf: Yup.string().required().min(14).max(14),
  banco: Yup.string().required(),
  conta: Yup.string().required(),
  agencia: Yup.string().required(),
  titular: Yup.string().required(),
  operacao: Yup.string().required(),
  contato: Yup.string(),
  percentual: Yup.string().required(),
  tipo: Yup.string().required()
})
