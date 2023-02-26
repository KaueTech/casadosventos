import { FormHandles, SubmitHandler } from "@unform/core"
import { Form } from "@unform/web"
import { useRef } from "react"

export default function App() {
  const formRef = useRef<FormHandles>(null)

  const handleSubmit: SubmitHandler = data => {

  }

  return (
    <Form onSubmit={handleSubmit} ref={formRef}>

    </Form>
  )
}
