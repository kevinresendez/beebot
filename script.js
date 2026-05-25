const excelURL =
"https://docs.google.com/spreadsheets/d/12lsuCTdXyhZ0Ew9ram9QBdOg_nvVOPQ9t0UPQFNZt1E/gviz/tq?tqx=out:json";

const apiKey =
"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";

let contenidoExcel = "";

async function cargarExcel(){

    try{

        const response =
            await fetch(excelURL);

        const arrayBuffer =
            await response.arrayBuffer();

        const workbook =
            XLSX.read(
                arrayBuffer,
                {type:"array"}
            );

        const hoja =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const json =
            XLSX.utils.sheet_to_json(
                hoja,
                {header:1}
            );

        contenidoExcel =
            JSON.stringify(json);

        document
        .getElementById("status")
        .innerHTML =
        "✅ Excel conectado correctamente";

    }
    catch(error){

        document
        .getElementById("status")
        .innerHTML =
        "❌ Error leyendo Excel";
    }
}

function agregarMensaje(texto, tipo){

    const chatBox =
        document.getElementById("chatBox");

    const div =
        document.createElement("div");

    div.className =
        "message " + tipo;

    div.innerHTML = texto;

    chatBox.appendChild(div);

    chatBox.scrollTop =
        chatBox.scrollHeight;
}

async function preguntar(){

    const prompt =
        document.getElementById("prompt");

    const pregunta =
        prompt.value.trim();

    if(pregunta === "")
        return;

    agregarMensaje(
        pregunta,
        "user"
    );

    prompt.value = "";

    agregarMensaje(
        "⏳ Pensando...",
        "bot"
    );

    try{

        const response =
            await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {

                method:"POST",

                headers:{

                    "Content-Type":"application/json",

                    "Authorization":
                    `Bearer ${apiKey}`
                },

                body: JSON.stringify({

                    model:"llama-3.3-70b-versatile",

                    messages:[

                        {
                            role:"system",

                            content:
                            contenidoExcel
                        },

                        {
                            role:"user",

                            content:pregunta
                        }

                    ]
                })
            }
        );

        const data =
            await response.json();

        const respuesta =
            data.choices[0]
            .message.content;

        const mensajes =
            document.querySelectorAll(".bot");

        mensajes[
            mensajes.length - 1
        ].innerHTML =
            respuesta;
    }
    catch(error){

        const mensajes =
            document.querySelectorAll(".bot");

        mensajes[
            mensajes.length - 1
        ].innerHTML =
            "❌ Error";
    }
}

cargarExcel();