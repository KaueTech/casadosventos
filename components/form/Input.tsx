import { Slot } from "@radix-ui/react-slot"
import { useField } from "@unform/core"
import clsx from "clsx"
import React, { useRef, useEffect, memo } from "react"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  name: string
  label: string,
  selectAllOnFocus?: boolean,
  getValue?: (ref) => String
  setValue?: (ref, value) => void
  asChild?: boolean
}

const InputComponent = ({ name, label, onFocus, selectAllOnFocus, asChild, getValue, setValue, ...rest }: InputProps) => {

  const inputRef = useRef<HTMLInputElement>()

  const { fieldName, defaultValue, registerField, error, clearError } = useField(name)

  useEffect(() => {
    inputRef.current.setAttribute('data-value', defaultValue)

    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: ref => {
        if (getValue) {
          return getValue(ref)
        }
        return ref.current?.value || ""
      },
      setValue: (ref, value) => {
        if (setValue) {
          setValue(ref, value)
        } else {
          ref.current.value = value || ""
        }
        clearError()
      },
      clearValue: ref => {
        if (setValue) {
          setValue(ref, defaultValue ?? "")
        } else {
          ref.current.value = defaultValue ?? ""
        }

        clearError()
      }
    })
  }, [fieldName, registerField, defaultValue]);

  const Component = asChild ? Slot : 'input'

  return (

    <div className="flex flex-col group w-full">
      <label
        htmlFor={fieldName}

        className={clsx("text-gray-600 font-light mb-1 text-xs group-focus-within:text-indigo-600 transition-colors duration-300", {
          "text-red-500": !!error
        })}

      >{label}</label>

      <Component
        type="text"
        data-error={!!error}
        defaultValue={defaultValue}
        className="focus:shadow-sm focus:scale-105 w-full p-1.5 px-2 rounded-md outline-none text-sm text-gray-600 font-light bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-200 focus:m-0 focus:border-indigo-600 transition-all duration-300 data-[error=true]:border-red-500 data-[error=true]:text-red-500"
        {...rest}
        onFocus={(event) => {
          if (selectAllOnFocus) {
            inputRef.current.select()
          }
          clearError()
          onFocus?.(event)
        }}
        ref={inputRef}
      />


    </div>


  )
}

export const Input = memo(InputComponent)
