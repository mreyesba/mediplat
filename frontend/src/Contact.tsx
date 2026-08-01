import './Contact.css';

function Contact() {
    
    return (
        <form className="flex flex-col gap-4 border p-4 rounded bg-white shadow-sm">
            <div className="flex flex-col gap-1">
                <label 
                    htmlFor="nombrePaciente" 
                    className="text-sm font-semibold text-slate-700">
                    Name
                </label>
                <input
                    id="nombrePaciente"
                    type="text"
                    className="border rounded px-3 py-2 outline-sky-500"
                    required
                />
            </div>
            
            {/* Render extra fields dynamically based on the current page type */}
            <div className="flex flex-col gap-1">
                <label 
                    htmlFor="correo" 
                    className="text-sm font-semibold text-slate-700">
                    Email
                </label>
                <input
                    id="correo"
                    type="email"
                    className="border rounded px-3 py-2 outline-sky-500"
                    required
                />
            </div>

            <div className="flex flex-col gap-1">
                <label 
                    htmlFor="nombrePaciente" 
                    className="text-sm font-semibold text-slate-700">
                    Description
                </label>
                <input
                    id="nombrePaciente"
                    type="text"
                    className="border rounded px-3 py-2 outline-sky-500"
                    required
                />
            </div>

            <button 
                type="submit" 
                className="font-bold bg-sky-600 text-white py-2 rounded hover:bh-sky-700">
                Submit
            </button>
        </form>
    );
}

export default Contact;