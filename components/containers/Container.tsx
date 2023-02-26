import React from "react"

type ContainerProps = JSX.IntrinsicElements['div'] & {
  title: string
  children: React.ReactNode
}

export const Container = ({ title, children, className, ...rest }: ContainerProps) => {
  //
  return <div {...rest} className={`relative  w-full h-full bg-white shadow-sm pt-5 px-8 pb-8 rounded-2xl flex flex-col items-center ${className}`}>
    <p className="text-lg text-gray-600">{title}</p>
    <div className="w-full h-[1px] bg-gray-200 mt-1 mb-2"></div>
    {children}
  </div>
}
