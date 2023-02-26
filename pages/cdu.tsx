import { PessoasContainer } from "../components/containers/PessoasContainer"
import { Form } from '@unform/web'
import { useRef, useState } from 'react'
import { FormHandles, SubmitHandler } from '@unform/core'
import { ImovelRural } from '../components/containers/ImovelRural'
import { Pagamento } from '../components/containers/Pagamento'
import { Assinatura } from '../components/containers/Assinatura'
import { ContasBancariasContainer } from '../components/containers/ContasBancariasContainer'
import { AssinaturaSchema, CDUData, gerarCDU, ImovelRuralSchema, PagamentoSchema } from "../modelos/cdu"
import * as Yup from 'yup';
import { Button } from "../components/form/Button"

interface FormData {
  imovel: CDUData['imovel'],
  pagamento: CDUData['pagamento']
  assinatura: CDUData['assinatura']
}

const schema = Yup.object({
  imovel: ImovelRuralSchema,
  pagamento: PagamentoSchema,
  assinatura: AssinaturaSchema
})

const initialData = {
  imovel: {
    tipo: "posse",
    area: {
      tipo: 'total'
    }
  },
  pagamento: {
    valor: "1200",
    extenso: "hum mil e duzentos reais"
  },
} as FormData

export default function CDU() {
  const formRef = useRef<FormHandles>(null)

  const [containerErrors, setContainerErrors] = useState({})

  const [pessoas, setPessoas] = useState<CDUData['pessoas']>([{
    id: '0',
    nome: 'Kauê Victor Oliveira Dias',
    nacionalidade: 'brasileiro',
    profissao: 'programador',
    rg: '5.720.287',
    expeditor: 'SDS',
    uf: 'PE',
    cpf: '131.297.664-05',
    estado: 'PB',
    cep: '58180-000',
    cidade: 'PEDRA LAVRADA'
  } as CDUData['pessoas'][0]])

  const [contasBancarias, setContasBancarias] = useState<CDUData['contasBancarias']>([])

  const handleSubmit: SubmitHandler<FormData> = async data => {


    try {

      await schema.validate(data, {
        abortEarly: false
      })

      gerarCDU({
        ...data,
        pessoas,
        contasBancarias
      })

    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        let validationErrors = {}

        error.inner.forEach(e => {
          validationErrors[e.path] = e.message
        })

        console.log(validationErrors)

        const containerErrorsList = {}

        Object.keys(validationErrors).forEach(key => {
          containerErrorsList[key.split('.')[0]] = true
        })

        setContainerErrors(containerErrorsList)

        setTimeout(() => {
          setContainerErrors({})
        }, 500)

        formRef.current.setErrors(validationErrors)

      }
    }

  }

  const reset = () => {
    formRef.current?.reset()
  }

  return (
    <Form
      ref={formRef}
      onSubmit={handleSubmit}
      initialData={initialData}
      className={`flex flex-col my-16 w-[35rem]`}
    >
      <div className="space-y-4 flex flex-col items-center justify-center">

        <PessoasContainer pessoas={pessoas} setPessoas={setPessoas} />
        <ImovelRural form={formRef} initialData={initialData.imovel} data-error={containerErrors['imovel']} className="data-[error=true]:animate-shake" />
        <ContasBancariasContainer contasBancarias={contasBancarias} setContasBancarias={setContasBancarias} />
        <Pagamento form={formRef} data-error={containerErrors['pagamento']} className="data-[error=true]:animate-shake" />
        <Assinatura form={formRef} data-error={containerErrors['assinatura']} className="data-[error=true]:animate-shake" />
      </div>

      <div className='space-y-1 mt-5 w-full'>
        <Button
          text="Gerar"
          data-error={Object.keys(containerErrors).length > 0}
          className='bg-indigo-600 data-[error=true]:animate-shake data-[error=true]:cursor-not-allowed hover:bg-indigo-700 active:bg-indigo-800 shadow-lg text-white rounded-2xl'
          onClick={() => formRef.current.submitForm()}
        />

        <Button
          text="Resetar"
          className='bg-gray-500 hover:bg-gray-600 active:bg-gray-700 shadow-lg text-white rounded-2xl'
          onClick={() => reset()}
        />
      </div>

    </Form>
  )
}
