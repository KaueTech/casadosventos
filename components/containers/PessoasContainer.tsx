import { Container } from "./Container"
import Image from 'next/image'
import { Dispatch, SetStateAction, useEffect, useState } from "react"

import { PessoaDialog } from "../dialogs/PessoaDialog";
import { compararObjetos } from "../../utils/comparar";
import { CDUData } from "../../modelos/cdu";

const DEFAULT_INITIAL_DATA = {
  tipo: 'cedente',
  nacionalidade: 'brasileiro',
} as CDUData['pessoas'][0]
export type PessoasContainerProps = {
  pessoas: CDUData['pessoas'],
  setPessoas: Dispatch<SetStateAction<CDUData['pessoas']>>
}

export function PessoasContainer({ pessoas, setPessoas }: PessoasContainerProps) {
  const [pessoaDialog, setPessoaDialog] = useState(false)
  const [currentPessoa, setCurrentPessoa] = useState<CDUData['pessoas'][0]>(null)

  const isEditing = currentPessoa && !compararObjetos({ ...DEFAULT_INITIAL_DATA, id: currentPessoa.id }, currentPessoa)

  useEffect(() => {
    if (currentPessoa) {
      setPessoaDialog(true)
    }
  }, [currentPessoa])

  return (
    <>
      <PessoaDialog
        open={pessoaDialog}
        setOpen={setPessoaDialog}
        pessoas={pessoas}

        initialData={currentPessoa}

        title={
          isEditing ?
            "Editar pessoa"
            : "Adicionar pessoa"
        }
        deleteButton={isEditing}

        onSubmit={(data) => {
          const newPessoas: CDUData['pessoas'] = [...pessoas.filter(p => p.id != data.id && p.id !== data.conjugue), data]

          if (data.conjugue) {
            newPessoas.push({ ...pessoas.find(p => p.id === data.conjugue), conjugue: data.id, estado_civil: data.estado_civil })
          }

          setPessoas(newPessoas)
        }}

        onDelete={(data) => {
          setPessoas(pessoas.filter(p => p.id != data.id && p.cpf != data.cpf && p.rg != data.rg))
        }}

        onClose={() => {
          setTimeout(() => {
            setCurrentPessoa(null)
          }, 300);
        }}
      />

      <Container title="Pessoas">
        <div
          className="absolute select-none bottom-4 shadow-lg right-4 rounded-full cursor-pointer bg-indigo-600 h-10 w-10 flex justify-center items-center hover:bg-indigo-700 active:bg-indigo-800 transition-colors outline-none"
          onClick={() => {
            setCurrentPessoa({ ...DEFAULT_INITIAL_DATA, id: Date.now().toString() })
          }}
        >
          <Image src="/Plus.svg" alt="" width={24} height={24} priority />
        </div>

        <div className="w-full space-y-2 select-none flex flex-col ">
          {pessoas.length == 0 && <div className="w-full p-4" key={Date.now()} />}
          {pessoas.map(
            (pessoa, index) => {
              return (
                <div
                  key={pessoa.id}
                  className="w-full bg-gray-100 p-4 py-3 rounded-md flex justify-start items- cursor-pointer hover:bg-gray-200 active:bg-gray-300 transition-colors duration-300"
                  onClick={() => {
                    setCurrentPessoa(pessoa)
                  }}

                >
                  <Image
                    src="/IdentificationCard.svg"
                    alt=""
                    width={30}
                    height={30}
                    priority
                  />
                  <div className="flex flex-col items-left justify-self-center select-text leading-5 ml-1">
                    <span className="ml-1 text-gray-500 text-sm font-semibold">{`${pessoa.nome} (${pessoa.tipo})`}</span>
                    <div className="font-normal ml-1 text-gray-500 text-xs space-x-2 ">
                      <span>
                        <b>CPF: </b>{pessoa.cpf}
                      </span>
                      <span>
                        <b>RG: </b>{pessoa.rg}
                      </span>
                    </div>
                  </div>

                </div>

              )
            }
          )}
        </div>
      </Container>
    </>
  )
}
