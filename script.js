const spreadsheetID = "12lsuCTdXyhZ0Ew9ram9QBdOg_nvVOPQ9t0UPQFNZt1E";

const hojas = [
    "Tramites",
    "Talleres",
    "Directivos"
    
];

const apiKey = "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".trim();

let contenidoExcel = "";


function leerHoja(nombreHoja) {
    return new Promise((resolve, reject) => {

        window.google = {
            visualization: {
                Query: {
                    setResponse: function(data) {
                        try {
                            const filas = data.table.rows.map(row =>
                                row.c.map(cell => cell ? cell.v : "")
                            );

                            resolve({
                                hoja: nombreHoja,
                                datos: filas
                            });

                        } catch (error) {
                            reject(error);
                        }
                    }
                }
            }
        };

        const script = document.createElement("script");

        script.src =
            `https://docs.google.com/spreadsheets/d/${spreadsheetID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(nombreHoja)}`;

        script.onerror = reject;

        document.body.appendChild(script);
    });
}


async function cargarExcel() {
    try {
        let baseCompleta = [];

        for (const hoja of hojas) {
            const resultado = await leerHoja(hoja);
            baseCompleta.push(resultado);
        }

        contenidoExcel = JSON.stringify(baseCompleta);

        document.getElementById("status").innerHTML =
            "✅ Base de datos conectada correctamente";

        console.log("Base completa:", baseCompleta);

    } catch (error) {
        console.error(error);

        document.getElementById("status").innerHTML =
            "❌ Error leyendo Google Sheets. Revisa los nombres de las hojas.";
    }
}


function agregarMensaje(texto, tipo) {
    const chatBox = document.getElementById("chatBox");

    const div = document.createElement("div");
    div.className = "message " + tipo;
    div.innerHTML = texto;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function preguntar() {
    if (contenidoExcel === "") {
        alert("La base de datos aún no carga bro 😅");
        return;
    }

    const prompt = document.getElementById("prompt");
    const pregunta = prompt.value.trim();

    if (pregunta === "") return;

    agregarMensaje(pregunta, "user");
    prompt.value = "";

    agregarMensaje("⏳ Pensando...", "bot");

    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [
                        {
                            role: "system",
                            content:
                                "Eres un asistente escolar. Responde solo con base en la información de la base de datos. No menciones Excel. Tu creador es Héctor Alexander Jasso Buenrostro:\n" +
                                contenidoExcel.slice(0, 12000)
                        },
                        {
                            role: "user",
                            content: pregunta
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.message || "Error API");
        }

        const respuesta =
            data.choices?.[0]?.message?.content ||
            "❌ Error en respuesta";

        const mensajes = document.querySelectorAll(".bot");
        mensajes[mensajes.length - 1].innerHTML = respuesta;

    } catch (error) {
        console.error(error);

        const mensajes = document.querySelectorAll(".bot");
        mensajes[mensajes.length - 1].innerHTML =
            "❌ " + error.message;
    }
}


function mostrarPagina(pagina) {
    document.querySelectorAll(".page").forEach(p => {
        p.classList.remove("active");
    });

    if (pagina === "ia") {
        document.getElementById("iaPage").classList.add("active");
    } else {
        document.getElementById("testPage").classList.add("active");
    }
}


function calcularResultado() {
    let respuestas = {
        A: 0,
        B: 0,
        C: 0,
        D: 0
    };

    for (let i = 1; i <= 6; i++) {
        let seleccion = document.querySelector(`input[name="q${i}"]:checked`);

        if (seleccion) {
            respuestas[seleccion.value]++;
        }
    }

    let mayor = "A";

    for (let letra in respuestas) {
        if (respuestas[letra] > respuestas[mayor]) {
            mayor = letra;
        }
    }

    const resultado = document.getElementById("resultado");

    if (mayor === "A") {
        resultado.innerHTML = `
        <h2>💻 Tecnología Digital</h2>
        <p>Perfil relacionado con Inteligencia Artificial, Programación y Ciberseguridad.</p>
        `;
    } else if (mayor === "B") {
        resultado.innerHTML = `
        <h2>⚙ Mecánica e Industria</h2>
        <p>Perfil orientado a Mecánica, Electricidad y Sistemas Industriales.</p>
        `;
    } else if (mayor === "C") {
        resultado.innerHTML = `
        <h2>👶 Puericultura</h2>
        <p>Tienes vocación para el cuidado y educación infantil.</p>
        `;
    } else {
        resultado.innerHTML = `
        <h2>👗 Industria del Vestido</h2>
        <p>Perfil creativo orientado a diseño y moda.</p>
        `;
    }
}


window.preguntar = preguntar;
window.mostrarPagina = mostrarPagina;
window.calcularResultado = calcularResultado;


cargarExcel();
