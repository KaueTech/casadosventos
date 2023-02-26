import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-br">
      <Head />
      <body className="bg-slate-100 flex flex-col justify-start items-center">
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
