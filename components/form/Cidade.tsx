import axios from "axios"
import { useEffect, useState } from "react"
import { Select, SelectProps } from "./Select"

type CidadeProps = SelectProps & {
  siglaUF: string
}

export const Cidade = ({ siglaUF, ...rest }: CidadeProps) => {
  const [todasCidades, setTodasCidades] = useState({})

  const [cidades, setCidades] = useState([
    { value: '', label: 'Selecione...', hidden: true }
  ])

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (siglaUF) {
      if (todasCidades.hasOwnProperty(siglaUF)) {
        setCidades(todasCidades[siglaUF])
        setLoading(false)

      } else {
        const data = getCidadesCache().data
        if (data.hasOwnProperty(siglaUF)) {
          setCidades(data[siglaUF])
          setLoading(false)
        } else {
          setLoading(true)
          axios.get(`https://brasilapi.com.br/api/ibge/municipios/v1/${siglaUF}?providers=gov`).then(
            response => {
              if (typeof response != "string" && response.status === 200) {
                let data: { nome: string, codigo_ibge: string }[] = response.data

                const cidadesFormatas = [{ value: '', label: 'Selecione...', hidden: true }, ...data.map(props => {
                  return {
                    label: props.nome,
                    value: props.nome,
                    hidden: false
                  }
                })]

                setCidades(cidadesFormatas)
                setTodasCidades(old => {
                  const newObj = { ...old }
                  newObj[siglaUF] = cidadesFormatas
                  return newObj
                })

                setLoading(false)
                adicionarCidadesNoCache(siglaUF, cidadesFormatas)
              }
            }
          )
        }

      }

    }
  }, [siglaUF])

  return (
    <Select
      data-estado={siglaUF}
      data-loading={loading || undefined}
      options={cidades}
      disabled={loading}
      {...rest}
    />
  )
}

const CIDADES_CACHE = "CITIES_CACHE"
const TWO_WEEKS = 1000 * 60 * 60 * 24 * 14

const getCidadesCache = () => {

  let citiesCache = {
    data: {},
    nextCleanup: new Date().getTime() + TWO_WEEKS
  }

  try {
    const data = localStorage.getItem(CIDADES_CACHE)

    if (data) {
      citiesCache = JSON.parse(data)
    }
  }
  catch (e) {
    console.error(e.message)
  }

  return citiesCache
}

const adicionarCidadesNoCache = (siglaUF, cidades) => {

  const cidadesCache = getCidadesCache()
  const data = cidadesCache.data

  data[siglaUF] = cidades

  try {
    localStorage.setItem(CIDADES_CACHE, JSON.stringify(cidadesCache))
  }
  catch (e) {
    cleanUpStorage(data)

  }

}

const cleanUpStorage = (data) => {

  let isDeleted
  let oldest
  let oldestKey


  //if 14 days have been passed, it removes the cache
  for (const key in data) {
    console.log("key is", key)
    const expiry = data[key].expiry
    if (expiry && expiry <= Date.now()) {
      delete data[key]
      isDeleted = true
    }

    //finding the oldest cache in case none of them are expired
    if (!oldest || oldest > expiry) {
      oldest = expiry
      oldestKey = key
    }
  }

  //remove the oldest cache if there is no more space in local storage (5 MB)
  if (!isDeleted && oldestKey) {
    delete data[oldestKey]
  }

  localStorage.setItem(
    CIDADES_CACHE,
    JSON.stringify({
      data: data,
      nextCleanup: Date.now() + TWO_WEEKS,
    })
  )

}
