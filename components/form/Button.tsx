type ButtonProps = JSX.IntrinsicElements['div'] & {
  text: string,
  className: string
}

export function Button({ text, className, ...rest }: ButtonProps) {
  return (
    <div {...rest} className={`w-full text-center cursor-pointer p-2 text-sm transition-colors duration-200 ${className}`}>
      {text}
    </div>
  )
}
