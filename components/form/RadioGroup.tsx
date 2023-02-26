import { useField } from "@unform/core"
import { memo, useEffect, useRef, useState } from "react"
import { Radio } from "./Radio"

type RadioGroupProps = JSX.IntrinsicElements['div'] & {
  name: string,
  options: {
    label: string,
    value: string
  }[],

  onChange?: (value: any, oldValue: any) => void
}

const RadioGroupComponent = ({ name, options, onChange, ...rest }: RadioGroupProps) => {
  const inputRef = useRef<HTMLDivElement>()
  const { fieldName, defaultValue, registerField, error, clearError } = useField(name)
  const [value, setValue] = useState<string>(defaultValue)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: ref => {
        return ref.current?.getAttribute('data-value') || ""
      },
      setValue: (ref, value) => {
        if (ref.current) {
          const oldValue = ref.current.getAttribute("data-value")

          if (oldValue != value) {
            setValue(value)
            clearError()
            ref.current.setAttribute('data-value', value)
            onChange?.(value, oldValue)
          }
        }
      },
      clearValue: ref => {
        if (ref.current) {
          const oldValue = ref.current.getAttribute('data-value')
          const value = defaultValue || ""

          if (oldValue != value) {
            ref.current.setAttribute('data-value', value)
            setValue(value)
            onChange?.(value, oldValue)
            clearError()
          }
        }
      },
    })
  }, [fieldName, registerField, defaultValue])


  return (
    <div data-value={value} ref={inputRef} className="w-full flex justify-center space-x-2">
      {options.map((option, index) => {
        return (
          <Radio
            key={index}
            label={option.label}
            data-value={option.value}
            selected={option.value == value}
            error={error}
            onClick={() => {
              const oldValue = inputRef.current.getAttribute("data-value")

              if (oldValue != option.value) {
                inputRef.current.setAttribute('data-value', option.value)
                setValue(option.value)
                onChange?.(option.value, value)
              }

              clearError()
            }}
          />
        )
      })}
    </div>
  )
}

export const RadioGroup = memo(RadioGroupComponent)
