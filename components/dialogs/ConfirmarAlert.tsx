import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';

export interface ConfirmarAlertProps {
  open: boolean,
  setOpen: (value: boolean) => void
  title?: string,
  description?: string,
  onConfirm?: Function,
  onCancel?: Function
}

export const ConfirmarAlert = (props: ConfirmarAlertProps) => (
  <AlertDialog.Root
    open={props.open}
  >
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="bg-black opacity-50 data-[state=open]:animate-overlayShow z-50 data-[state=closed]:animate-overlayHide fixed inset-0" />
      <AlertDialog.Content className="data-[state=open]:animate-contentShow rounded-2xl z-50 transition-all data-[state=closed]:animate-contentHide fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <AlertDialog.Title className="text-gray-600 m-0 text-[17px] font-medium">
          {props.title}
        </AlertDialog.Title>
        <AlertDialog.Description className="text-gray-600 mt-4 mb-5 text-[15px] leading-normal">
          {props.description}
        </AlertDialog.Description>
        <div className="flex justify-end gap-[25px]">
          <AlertDialog.Cancel asChild>
            <button
              className="text-white hover:bg-gray-600 active:bg-gray-700 border-2 bg-gray-500 border-gray-500 transition-all focus:border-black inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-normal leading-none outline-none"
              onClick={() => {
                props.onCancel?.()
                props.setOpen(false)
              }}
            >
              Cancelar
            </button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild onClick={() => {
            props.onConfirm?.()
            props.setOpen(false)
          }}>
            <button
              className="text-white bg-indigo-600  hover:bg-indigo-700 border-2 border-transparent transition-colors duration-300 focus:border-black inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-normal leading-none outline-none"

            >
              Confirmar
            </button>
          </AlertDialog.Action>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
);
