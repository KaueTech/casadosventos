import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image'
import { Container } from '../containers/Container';
import { Form } from '@unform/web'
import { FormHandles, SubmitHandler } from '@unform/core';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../form/Input';
import { Select as FormSelect } from '../form/Select';
import Select from 'react-select';
import { Button } from '../form/Button';
import { Estado } from '../form/Estado';
import { Cidade } from '../form/Cidade';
import axios from 'axios';
import { RadioGroup } from '../form/RadioGroup';

import { ConfirmarAlert } from './ConfirmarAlert';
import { compararObjetos } from '../../utils/comparar';
import { ValidationError } from 'yup';
import ReactInputMask from 'react-input-mask';
import { CDUData, PessoaSchema } from '../../modelos/cdu';


export type PessoaDialogProps = {
  title: string,
  open: boolean,
  setOpen: (open: boolean) => void
  pessoas: CDUData['pessoas']
  deleteButton?: boolean
  onSubmit?: (pessoa: CDUData['pessoas'][0]) => void
  onDelete?: (pessoa: CDUData['pessoas'][0]) => void
  onClose?: (pessoa: CDUData['pessoas'][0]) => void
  initialData?: CDUData['pessoas'][0],
}

export function PessoaDialog(props: PessoaDialogProps) {

  const formRef = useRef<FormHandles>(null)

  const [tipo, setTipo] = useState(props.initialData?.tipo || "")
  const [estado, setEstado] = useState(props.initialData?.estado || "")
  const [estado_civil, setEstadoCivil] = useState(props.initialData?.estado_civil || "")

  const [hasErrors, setHasErrors] = useState(false)

  const [noSaveAlertOpen, setNoSaveAlertOpen] = useState(false)
  const [confirmDeleteAlertOpen, setConfirmDeleteAlertOpen] = useState(false)

  function reset() {
    setTipo(props.initialData?.tipo ?? "")
    setEstado(props.initialData?.estado ?? "")
    setEstadoCivil(props.initialData?.estado_civil ?? "")
    formRef.current?.setErrors({})
    formRef.current?.reset()
  }

  useEffect(() => {
    reset()
  }, [props.initialData])

  function handleClose(event) {
    const data = formRef.current.getData() as CDUData['pessoas'][0]
    data['id'] = props.initialData?.['id']

    if (!compararObjetos(props.initialData, data)) {
      event.preventDefault()
      setNoSaveAlertOpen(true)
    } else {
      props.onClose?.(data)
      reset()
    }
  }

  const handleSubmit: SubmitHandler<CDUData['pessoas'][0]> = async (data) => {
    try {
      formRef.current?.setErrors({})
      await PessoaSchema.validate(data, {
        abortEarly: false
      })
      props.onSubmit?.(data)
      props.setOpen(false)
      reset()

    } catch (error) {
      if (error instanceof ValidationError) {
        let validationErrors = {};

        error.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });

        console.log(validationErrors)
        formRef.current.setErrors(validationErrors);
        setHasErrors(true)

        setTimeout(() => {
          setHasErrors(false)
        }, 500)
      }
    }
  }

  return (
    <Dialog.Root
      open={props.open}
      onOpenChange={props.setOpen}

    >
      <Dialog.Portal>
        <Dialog.Overlay className="bg-black opacity-50 data-[state=open]:animate-overlayShow data-[state=closed]:animate-overlayHide fixed inset-0"
        />
        <Dialog.Content
          className="data-[state=open]:animate-contentShow data-[state=closed]:pointer-events-none data-[state=closed]:animate-contentHide z-40 fixed top-[50%] left-[50%] w-[35rem] translate-x-[-50%] translate-y-[-50%] focus:outline-none"
          onInteractOutside={handleClose}
          onPointerCancel={handleClose}
          onEscapeKeyDown={handleClose}
        >
          <ConfirmarAlert
            title="Deseja fechar sem salvar?"
            description='As alterações serão perdidas se fechar a janela'
            open={noSaveAlertOpen}
            setOpen={setNoSaveAlertOpen}
            onConfirm={() => {
              props.setOpen(false)
              props.onClose?.(formRef.current.getData() as CDUData['pessoas'][0])
              reset()
            }}
          />

          <ConfirmarAlert
            title="Deseja mesmo deletar?"
            description={`Os dados de ${props.initialData?.nome} serão apagados.`}
            open={confirmDeleteAlertOpen}
            setOpen={setConfirmDeleteAlertOpen}
            onConfirm={() => {
              const data = formRef.current.getData() as CDUData['pessoas'][0]
              props.setOpen(false)
              props.onClose?.(data)
              props.onDelete?.(data)
            }}
          />

          <Container title={props.title} data-error={hasErrors} className='data-[error=true]:animate-shake'>
            <Form
              ref={formRef}
              onSubmit={handleSubmit}
              initialData={props.initialData}

              className="w-full p-2 space-y-1.5">

              <div className='-mb-5'>
                <RadioGroup
                  name="tipo"
                  options={[
                    { label: "Cedente", value: "cedente" },
                    { label: "Representante", value: "representante" },
                  ]}

                  onChange={(value) => setTipo(value)}
                />
              </div>

              <Input
                name="id"
                label=""
                className='hidden'
              />

              {tipo == 'representante' && <Input
                name="motivo_representante"
                label="Motivo de representação"
              />}

              <Input
                name="nome"
                label="Nome completo"
              />
              <div className='flex space-x-2'>
                <Input name="cpf" label="CPF" asChild>
                  <ReactInputMask mask="999.999.999-99" maskPlaceholder='' />
                </Input>

                <Input
                  name="rg"
                  label="Identidade"
                />

                <Input
                  name="expeditor"
                  label="Expeditor"
                />

                <Input
                  name="uf"
                  label="UF"
                />
              </div>

              <div className='flex space-x-2'>
                <Input
                  name="nacionalidade"
                  label="Nacionalidade"
                />
                <Input
                  name="profissao"
                  label="Profissão"
                />
              </div>

              {tipo == "cedente" &&
                <div className='flex space-x-2'>
                  <FormSelect
                    name='estado_civil'
                    label='Estado civil'
                    options={[
                      { value: "", label: "Selecione...", hidden: true },
                      { value: "solteiro", label: "Solteiro(a)" },
                      { value: "casado", label: "Casado(a)" },
                      { value: "divorciado", label: "Divorciado(a)" },
                      { value: "viuvo", label: "Viúvo(a)" },
                    ]}
                    onChange={(e) => {
                      if (estado_civil != "casado")
                        formRef.current?.setFieldValue("conjugue", "")

                      setEstadoCivil(e.target.value)
                    }}
                  />


                  <FormSelect
                    name='conjugue'
                    label='Cônjuge'
                    disabled={estado_civil != "casado"}

                    options={estado_civil === "casado" ? [
                      { value: "", label: "Selecione...", hidden: true },
                      ...props.pessoas.map((pessoa) => {
                        return { value: pessoa.id, label: pessoa.nome }
                      }).filter(p => p.value != props.initialData?.id)
                    ] : [{ value: "", label: "Selecione...", hidden: true },]}
                  />
                </div>
              }

              <Input
                name="endereco"
                placeholder='Rua, número, complemento, bairro'
                label="Endereço"
              />

              <div className='flex space-x-2'>
                <div className='w-72'>
                  <Input name="cep" label="CEP" placeholder='EX: 123456-000' asChild
                    onChange={(e) => {
                      const currentCep = e.target.value

                      if (currentCep.length == 9) {
                        axios.get(`https://brasilapi.com.br/api/cep/v1/${currentCep}`).then(response => {
                          if (response.status == 200) {
                            setEstado(response.data.state)

                            formRef.current?.setFieldValue("estado", response.data.state)

                            let totalMs = 0

                            var interval = setInterval(() => {
                              let isLoading = !!formRef.current.getFieldRef("cidade").current?.getAttribute("data-loading")


                              if (!isLoading) {
                                formRef.current.setFieldValue("cidade", response.data.city.toUpperCase())
                                clearInterval(interval)
                                return
                              }

                              if (totalMs >= 10000) {
                                clearInterval(interval)
                              }
                              totalMs += 200
                            }, 200)
                          }
                        })

                      } else {
                        setEstado("")
                        formRef.current?.setFieldValue("estado", "")
                        formRef.current?.setFieldValue("cidade", "")
                      }
                    }}
                  >
                    <ReactInputMask mask="99999-999" maskPlaceholder='' />
                  </Input>
                </div>

                <Estado
                  name="estado"
                  label="Estado"
                  onChange={() => {
                    setEstado(formRef.current?.getFieldValue("estado"))
                    formRef.current?.setFieldValue("cidade", "")
                  }}
                />

                <Cidade
                  name="cidade"
                  label="Cidade"
                  siglaUF={estado || props.initialData?.estado}
                />
              </div>

              <div className='space-x-1 flex  pt-3'>

                {props.deleteButton && <Button
                  text="Deletar"
                  className='bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-md'
                  onClick={() => {
                    setConfirmDeleteAlertOpen(true)
                  }}
                />}

                <Button
                  text="Restaurar"
                  className='bg-gray-500 hover:bg-gray-600 active:bg-gray-700 text-white rounded-md'
                  onClick={() => {
                    if (!compararObjetos(props.initialData, formRef.current.getData())) {
                      reset()
                    }
                  }}
                />

                <Button
                  text="Salvar"

                  className='bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-md'
                  onClick={() => formRef.current?.submitForm()}
                />
              </div>
            </Form>
          </Container>
        </Dialog.Content>
      </Dialog.Portal >
    </Dialog.Root >
  )
}
