const excelURL =
"https://docs.google.com/spreadsheets/d/12lsuCTdXyhZ0Ew9ram9QBdOg_nvVOPQ9t0UPQFNZt1E/gviz/tq?tqx=out:json";

const apiKey = "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"; // ⚠️ pega la nueva

let contenidoExcel = "";

// 🔹 Cargar Excel (sin CORS)
function cargarExcel() {
    return new Promise((resolve, reject) => {
        window.google = {
            visualization: {
                Query: {
                    setResponse: function(data) {
                        try {
                            const filas = data.table.rows.map(row =>
                                row.c.map(cell => cell ? cell.v : "")
                            );

                            contenidoExcel = JSON.stringify(filas);

                            document.getElementById("status").innerHTML =
                                "✅ Excel conectado correctamente";

                            resolve();
                        } catch (error) {
                            reject(error);
                        }
                    }
                }
            }
        };

        const script = document.createElement("script");
        script.src = excelURL;
        script.onerror = reject;
        document.body.appendChild(script);
    }).catch(error => {
        console.error(error);
        document.getElementById("status").innerHTML =
            "❌ Error leyendo Excel";
    });
}

// 🔹 UI chat
function agregarMensaje(texto, tipo){
    const chatBox = document.getElementById("chatBox");
    const div = document.createElement("div");
    div.className = "message " + tipo;
    div.innerHTML = texto;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 🔹 Preguntar a Grok
async function preguntar(){

    if(contenidoExcel === ""){
        alert("El Excel aún no carga bro 😅");
        return;
    }

    const prompt = document.getElementById("prompt");
    const pregunta = prompt.value.trim();

    if(pregunta === "") return;

    agregarMensaje(pregunta, "user");
    prompt.value = "";

    agregarMensaje("⏳ Pensando...", "bot");

    try{

        const response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model:"llama-3.1-8b-instant",
                messages:[
                    {
                        role:"system",
                        content:
                        "Eres un asistente escolar. Responde solo con base a la información de la base de datos de Excel:\n" +
                        contenidoExcel.slice(0,12000)
                    },
                    {
                        role:"user",
                        content: pregunta
                    }
                ]
            })
        });

        const data = await response.json();
        console.log(data);

        if(!response.ok){
            throw new Error(data.error?.message || "Error API");
        }

        const respuesta =
            data.choices?.[0]?.message?.content ||
            "❌ Error en respuesta";

        const mensajes = document.querySelectorAll(".bot");
        mensajes[mensajes.length - 1].innerHTML = respuesta;

    }
    catch(error){
        console.error(error);

        const mensajes = document.querySelectorAll(".bot");
        mensajes[mensajes.length - 1].innerHTML =
        "❌ " + error.message;
    }
}

cargarExcel();
