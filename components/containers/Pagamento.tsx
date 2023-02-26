import { FormHandles, Scope } from "@unform/core";
import { Container } from "./Container";
import { Input } from "../form/Input";
import { MutableRefObject } from "react";
import { realPorExtenso } from "../../utils/numerosExtensos";
import CurrencyInput from "react-currency-input-field";
import { ContainerProps } from "react-select";

type PagamentoProps = JSX.IntrinsicElements['div'] & {
  form: MutableRefObject<FormHandles>
}

export function Pagamento({ form: formRef, ...rest }: PagamentoProps) {

  function escreverValorAnualPorExtenso(valor?) {
    if (!valor) {
      const valorRef = formRef.current.getFieldRef('pagamento.valor').current
      valor = valorRef?.getAttribute('data-value')
        || valorRef?.value?.replace('R$ ', '').replaceAll('.', '').replace(',', '.')
    }

    formRef.current.setFieldValue("pagamento.extenso", valor ? realPorExtenso(Number(valor)) : '')
  }

  return (
    <Container title="Pagamento" {...rest}>
      <Scope path="pagamento">

        <div className="w-full space-x-2 p-2 flex justify-center items-center">
          <div className="w-52">
            <Input name="valor" label="Valor anual" selectAllOnFocus asChild>
              <CurrencyInput
                prefix="R$ "
                decimalScale={2}
                decimalsLimit={2}
                groupSeparator='.'
                decimalSeparator=","
                allowNegativeValue={false}
                onValueChange={(_, __, { float }) => {
                  formRef.current.getFieldRef('pagamento.valor').current.setAttribute('data-value', float || "")
                  escreverValorAnualPorExtenso(float)
                }}
              />
            </Input>
          </div>
          <Input
            name="extenso"
            label="Valor anual por extenso"
            onFocus={() => escreverValorAnualPorExtenso()}
          />
        </div>
      </Scope>
    </Container>
  )
}
