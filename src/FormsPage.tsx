import './FormsPage.css'

function FormsPage() {
  return (
    <form>
      <label htmlFor="nombrePaciente" className="text-3xl font-bold underline">Nombre del paciente</label>
      <input id="nombrePaciente" type="text" className="border rounded px-3 py-2" />
      <button type="submit" className="font-bold">Enviar</button>
    </form>
  )
}

export default FormsPage