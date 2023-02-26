import { Container } from "./Container"
import Image from 'next/image'
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { compararObjetos } from "../../utils/comparar";
import { IContaBancaria } from "../../interfaces/IContaBancaria";
import { ContaBancariaDialog, ContaBancariaDialogProps } from "../dialogs/ContaBancariaDialog";

export type ContasBancariasContainerProps = {
  contasBancarias: IContaBancaria[],
  setContasBancarias: Dispatch<SetStateAction<IContaBancaria[]>>
}

export function ContasBancariasContainer({ contasBancarias, setContasBancarias }: ContasBancariasContainerProps) {

  const [contaBancariaDialog, setContaBancariaDialog] = useState(false)
  const [currentContaBancaria, setCurrentContaBancaria] = useState<IContaBancaria>(null)

  const defaultInitialData = {
    percentual: (20).toString()
  } as IContaBancaria

  const isEditing = currentContaBancaria && !compararObjetos({ ...defaultInitialData, id: currentContaBancaria.id }, currentContaBancaria)

  useEffect(() => {
    if (currentContaBancaria) {
      setContaBancariaDialog(true)
    }
  }, [currentContaBancaria])

  return (
    <Container title="Dados bancários">
      <ContaBancariaDialog
        open={contaBancariaDialog}
        setOpen={setContaBancariaDialog}
        bancos={contasBancarias}

        initialData={currentContaBancaria}

        title={
          isEditing ?
            "Editar dados bancários"
            : "Adicionar dados bancários"
        }
        deleteButton={isEditing}

        onSubmit={(data) => {
          setContasBancarias([...contasBancarias.filter(p => p.id != data.id && p.cpf != data.cpf), data])
        }}

        onDelete={(data) => {
          setContasBancarias(contasBancarias.filter(p => p.id != data.id && p.cpf != data.cpf))
        }}

        onClose={() => {
          setTimeout(() => {
            setCurrentContaBancaria(null)
          }, 300);
        }}
      />
      <div
        className="absolute select-none bottom-4 shadow-lg right-4 rounded-full cursor-pointer bg-indigo-600 h-10 w-10 flex justify-center items-center hover:bg-indigo-700 active:bg-indigo-800 transition-colors outline-none"
        onClick={() => {
          setCurrentContaBancaria({ ...defaultInitialData, id: Date.now().toString() })
        }}
      >
        <Image src="/Plus.svg" alt="" width={24} height={24} priority />
      </div>

      <div className="w-full space-y-2 select-none flex flex-col ">
        {contasBancarias.length == 0 && <div className="w-full p-4" />}
        {contasBancarias.map(
          (banco) => {
            return (
              <div
                key={banco.id}
                className="w-full bg-gray-100 p-4 py-3 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition-colors duration-300"
                onClick={() => {
                  setCurrentContaBancaria(banco)
                }}

              >
                <div className="flex">
                  <Image
                    src="/IdentificationCard.svg"
                    alt=""
                    width={30}
                    height={30}
                    priority
                  />
                  <div className="flex flex-col items-left justify-self-center select-text leading-5 ml-1">
                    <span className="ml-1 text-gray-500 text-sm font-semibold">{banco.titular}</span>
                    <div className="font-normal ml-1 text-gray-500 text-xs space-x-2 ">
                      <span>
                        {banco.banco}
                      </span>
                      <span>
                        <b>Agência: </b>{banco.agencia}
                      </span>
                      <span>
                        <b>Conta: </b>{banco.conta}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-gray-600 font-light pr-2">
                  {banco.percentual}%
                </span>



              </div>

            )
          }
        )}
      </div>
    </Container>
  )
}
