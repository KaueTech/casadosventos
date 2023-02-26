import { useField } from "@unform/core"
import clsx from "clsx"
import React, { useRef, useEffect, useState } from "react"

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  name: string
  label: string,
  options?: { value: string | number, label: string, hidden?: boolean }[]
}

export const Select = ({ name, label, options = [], ...rest }: SelectProps) => {
  const inputRef = useRef<HTMLSelectElement>()

  const { fieldName, defaultValue, registerField, error, clearError } = useField(name)

  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,

      getValue: ref => {
        return ref.current.value || ""
      },
      setValue: (ref, value) => {
        setValue(value || "")
        clearError()
      },
      clearValue: ref => {
        setValue(defaultValue || "")
        clearError()
      },
    })
  }, [fieldName, registerField, defaultValue])

  return (
    <div className="flex flex-col group w-full data-loading:animate-bounce ">
      <label
        htmlFor={fieldName}
        className={clsx("text-gray-600 font-light mb-1 text-xs group-focus-within:text-indigo-600 transition-colors duration-300", {
          "text-red-500": !!error
        })}
      >{label}</label>

      <select
        defaultValue={defaultValue}
        className={clsx("focus:shadow-sm w-full p-1.5 px-2 rounded-md outline-none text-sm text-gray-600 font-extralight bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed border border-gray-200 focus:m-0 focus:border-indigo-600 transition-all duration-300", {
          "border-red-500 text-red-500": !!error
        })}
        {...rest}
        ref={inputRef}
        onFocus={clearError}
        value={value}
        onChange={(e) => {
          setValue(e.target.value)
          rest.onChange?.(e)
        }}
      >
        {options.map((option, index) => (
          <option key={Date.now().toString() + index} value={option.value} className={option.hidden ? "hidden" : ""}>{option.label}</option>
        ))}

      </select>


    </div>


  )
}
