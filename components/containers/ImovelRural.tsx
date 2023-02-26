import { FormHandles, Scope } from "@unform/core";
import { Cidade } from "../form/Cidade";
import { Container } from "./Container";
import { Estado } from "../form/Estado";
import { Input } from "../form/Input";
import { RadioGroup } from "../form/RadioGroup";
import { MutableRefObject, useState } from "react";
import { hectaresPorExtenso } from "../../utils/numerosExtensos";
import { IImovel } from "../../interfaces/IImovel";
import CurrencyInput from "react-currency-input-field";

type ImovelRuralProps = JSX.IntrinsicElements['div'] & {
  form: MutableRefObject<FormHandles>,
  initialData?: any
}

export function ImovelRural({ form: formRef, initialData, ...rest }: ImovelRuralProps) {

  function escreverHectaresPorExtenso(tipo_area, valor?) {
    if (!valor) {
      const valorRef = formRef.current.getFieldRef(`imovel.area.${tipoArea}.valor`).current
      valor = valorRef?.getAttribute('data-value')
        || valorRef?.value?.replace(' ha', '').replaceAll('.', '').replace(',', '.')
    }

    formRef.current.setFieldValue(`imovel.area.${tipo_area}.extenso`, valor ? hectaresPorExtenso(Number(valor)) : "")
  }

  const [tipoImovel, setTipoImovel] = useState<IImovel["tipo"]>(initialData?.tipo || "matricula")
  const [tipoArea, setTipoArea] = useState<IImovel['area']['tipo']>(initialData?.area?.tipo || "total")
  const [estado, setEstado] = useState(initialData?.estado || "")

  return (
    <Container title="Imóvel Rural" {...rest}>
      <Scope path="imovel">
        <div className="w-full space-y-1.5 p-2">
          <div className="pb-2 pt-1">

            <RadioGroup
              name="tipo"
              defaultValue="posse"
              options={[
                { label: "Posse", value: "posse" },
                { label: "Matrícula", value: "matricula" },
              ]}

              onChange={(value) => setTipoImovel(value)}
            />
          </div>
          <Input name="nome" label="Nome do imóvel" />
          <div className="w-full space-x-2 flex mb-5">
            <Estado name="estado" label="Estado" onChange={() => setEstado(formRef.current.getFieldValue('imovel.estado'))} />
            <Cidade name="cidade" label="Cidade" siglaUF={estado} />
          </div>


          <Scope path="area">
            <div className="pb-4 pt-6">
              <RadioGroup
                name="tipo"
                options={[
                  { label: "Área total", value: "total" },
                  { label: "Área parcial", value: "parcial" },
                ]}

                onChange={() => setTipoArea(formRef.current.getFieldValue('imovel.area.tipo'))}
              />
            </div>

            <Scope path="total">
              <div className="w-full space-x-2 flex">
                <div className="w-52">
                  <Input name="valor" label="Área total" selectAllOnFocus asChild>
                    <CurrencyInput
                      suffix=" ha"
                      decimalScale={4}
                      decimalsLimit={4}
                      groupSeparator='.'
                      allowNegativeValue={false}
                      onValueChange={(_, __, { float }) => {
                        formRef.current.getFieldRef('imovel.area.total.valor').current?.setAttribute('data-value', float || 0)
                        escreverHectaresPorExtenso('total', float)
                      }}
                    />
                  </Input>
                </div>

                <Input
                  name="extenso"
                  label="Área total por extenso"
                  onFocus={() => escreverHectaresPorExtenso('total')}
                />
              </div>
            </Scope>

            {tipoArea == "parcial" &&
              <Scope path="parcial">
                <div className="w-full space-x-2 flex">
                  <div className="w-52">
                    <Input name="valor" label="Área parcial" selectAllOnFocus asChild>
                      <CurrencyInput
                        suffix=" ha"
                        decimalScale={4}
                        decimalsLimit={4}
                        groupSeparator='.'
                        allowNegativeValue={false}
                        onValueChange={(_, __, { float }) => {
                          formRef.current.getFieldRef('imovel.area.parcial.valor').current?.setAttribute('data-value', float)
                          escreverHectaresPorExtenso('parcial', float)
                        }}
                      />
                    </Input>
                  </div>

                  <Input
                    name="extenso"
                    label="Área parcial por extenso"
                    onFocus={() => escreverHectaresPorExtenso('parcial')}
                  />
                </div>
              </Scope>
            }
          </Scope>

          {tipoImovel == "matricula" &&
            <Scope path="cartorio">
              <div className="pt-5">
                <Input name="entidade" label="Cartório" />
                <div className="flex space-x-2 w-full">
                  <Input name="livro" label="Livro" />
                  <Input name="folha" label="Folha" />
                  <Input name="matricula" label="Matrícula" />

                </div>
              </div>
            </Scope>
          }

        </div>
      </Scope>
    </Container>
  )
}
