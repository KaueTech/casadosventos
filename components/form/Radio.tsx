import clsx from "clsx"

interface Props {
  label: string,
  selected?: boolean,
  error?: string,
  onClick?: Function

}

type RadioProps = JSX.IntrinsicElements['ul'] & Props

export function Radio({ label, selected = false, error, onClick, ...rest }: RadioProps) {

  return (
    <ul data-error={error} tabIndex={0} onClick={onClick} data-selected={selected} className={clsx("flex outline-none justify-center items-center cursor-pointer group transition-colors duration-300 group", {
      "animate-shake": !!error
    })} {...rest}>
      <div className={clsx("w-[16px] h-[16px] rounded-full border group-focus:border-indigo-600 group-focus:scale-110 group-foc transition-transform bg-transparent", {
        "border-red-600": !!error,
        "border-gray-600": !error && !selected,
        "border-indigo-600": !error && selected,
      })}>
        {selected && <div className="w-[12px] h-[12px] rounded-full relative top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] opacity-100 bg-indigo-600 animate-scaleShow" />}
      </div>
      <p className={clsx("ml-1 text-gray-600 text-xs group-focus:text-indigo-600 transition-colors duration-300", {
        "text-indigo-600": selected,
        "text-red-600": !!error,
      })}>{label}</p>
    </ul>
  )
}
