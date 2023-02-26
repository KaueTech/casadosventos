import { FormHandles, Scope } from "@unform/core";
import { Cidade } from "../form/Cidade";
import { Container } from "./Container";
import { Estado } from "../form/Estado";
import { MutableRefObject, useState } from "react";

type AssinaturaProps = JSX.IntrinsicElements['div'] & {
  form: MutableRefObject<FormHandles>
}

export function Assinatura({ form, ...rest }: AssinaturaProps) {
  const [estado, setEstado] = useState("")
  return (
    <Container title="Assinatura" {...rest}>
      <Scope path="assinatura">
        <div className="w-full space-y-4 p-2">
          <div className="w-full space-x-2 flex">
            <Estado name="estado" label="Estado" onChange={() => setEstado(form.current.getFieldValue('assinatura.estado'))} />
            <Cidade name="cidade" label="Cidade" siglaUF={estado} />
          </div>
        </div>
      </Scope>

    </Container>
  )
}
