import * as Dialog from '@radix-ui/react-dialog';
import Image from 'next/image'
import { Container } from '../containers/Container';
import { Form } from '@unform/web'
import { FormHandles, SubmitHandler } from '@unform/core';
import { useEffect, useRef, useState } from 'react';
import { Input } from '../form/Input';
import { Select } from '../form/Select';
import { Button } from '../form/Button';
import { Estado } from '../form/Estado';
import { Cidade } from '../form/Cidade';
import axios from 'axios';
import { RadioGroup } from '../form/RadioGroup';

import { IContaBancaria, IContaBancariaSchema } from '../../interfaces/IContaBancaria';
import { ConfirmarAlert } from './ConfirmarAlert';
import { compararObjetos } from '../../utils/comparar';
import { ValidationError } from 'yup';
import ReactInputMask from 'react-input-mask';
import CurrencyInput from 'react-currency-input-field';


export type ContaBancariaDialogProps = {
  title: string,
  open: boolean,
  setOpen: (open: boolean) => void
  bancos: IContaBancaria[]
  deleteButton?: boolean
  onSubmit?: (pessoa: IContaBancaria) => void
  onDelete?: (pessoa: IContaBancaria) => void
  onClose?: (pessoa: IContaBancaria) => void
  initialData?: any,
}

export function ContaBancariaDialog(props: ContaBancariaDialogProps) {

  const formRef = useRef<FormHandles>(null)

  const [hasErrors, setHasErrors] = useState(false)

  const [noSaveAlertOpen, setNoSaveAlertOpen] = useState(false)
  const [confirmDeleteAlertOpen, setConfirmDeleteAlertOpen] = useState(false)

  function reset() {
    formRef.current?.setErrors({})
    formRef.current?.reset()
  }

  useEffect(() => {
    reset()
  }, [props.initialData])

  function handleClose(event) {
    const data = formRef.current.getData() as IContaBancaria
    data['id'] = props.initialData?.['id']

    if (!compararObjetos(props.initialData, data)) {
      event.preventDefault()
      setNoSaveAlertOpen(true)
    } else {
      props.onClose?.(data)
      reset()
    }
  }

  const handleSubmit: SubmitHandler<IContaBancaria> = async (data) => {
    try {
      formRef.current?.setErrors({})
      await IContaBancariaSchema.validate(data, {
        abortEarly: false
      })
      props.onSubmit?.({ ...data })
      props.setOpen(false)
      reset()

    } catch (error) {
      if (error instanceof ValidationError) {
        let validationErrors = {};

        error.inner.forEach(error => {
          validationErrors[error.path] = error.message;
        });

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
              props.onClose?.(formRef.current.getData() as IContaBancaria)
              reset()
            }}
          />

          <ConfirmarAlert
            title="Deseja deletar?"
            description={`Não será possível desfazer essa ação`}
            open={confirmDeleteAlertOpen}
            setOpen={setConfirmDeleteAlertOpen}
            onConfirm={() => {
              const data = formRef.current.getData() as IContaBancaria
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

              <Input
                name="id"
                label=""
                className='hidden'
              />

              <div className='flex space-x-2'>
                <Input
                  name="banco"
                  label="Nome do banco"
                />
                <Input
                  name="agencia"
                  label="Agência"
                />
              </div>

              <div className='flex space-x-2'>
                <Input
                  name="conta"
                  label="Nº da conta"
                />
                <Input
                  name="tipo"
                  label="Tipo de conta"
                />

                <Input
                  name="operacao"
                  label="Operação"
                />
              </div>

              <div className='flex space-x-2'>
                <Input
                  name="titular"
                  label="Titular"
                />
                <Input name="cpf" label="CPF" asChild>
                  <ReactInputMask mask="999.999.999-99" maskPlaceholder='' />
                </Input>

              </div>

              <div className='flex space-x-2'>

                <div className='w-24'>

                  <Input name="percentual" label="Percentual" selectAllOnFocus asChild
                    getValue={(ref) => {
                      return ref.current.getAttribute('data-value')
                    }}
                  >
                    <CurrencyInput
                      suffix="%"
                      decimalScale={2}
                      decimalsLimit={2}
                      groupSeparator=''
                      allowNegativeValue={false}
                      onValueChange={(_, __, { float }) => {
                        formRef.current.getFieldRef('percentual').current?.setAttribute('data-value', float || "")
                      }}
                    />
                  </Input>
                </div>

                <Input
                  name="contato"
                  label="Contato"
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
