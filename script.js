// =====================================
// GOOGLE SHEETS MULTI-HOJA
// =====================================

const spreadsheetID =
"12lsuCTdXyhZ0Ew9ram9QBdOg_nvVOPQ9t0UPQFNZt1E";

// CAMBIA ESTOS NOMBRES
const hojas = [
    "Tramites",
    "Talleres",
    "Directivos"
   
];

const apiKey = "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";

let contenidoExcel = "";

// =====================================
// LEER UNA HOJA
// =====================================

function leerHoja(nombreHoja){

    return new Promise((resolve,reject)=>{

        const callbackName =
        "sheetCallback_" +
        Math.random().toString(36).substring(2);

        window[callbackName] = function(data){

            try{

                const filas =
                data.table.rows.map(row =>
                    row.c.map(cell =>
                        cell ? cell.v : ""
                    )
                );

                delete window[callbackName];

                resolve({
                    hoja:nombreHoja,
                    datos:filas
                });

            }catch(error){

                reject(error);
            }
        };

        const script =
        document.createElement("script");

        script.src =
        `https://docs.google.com/spreadsheets/d/${spreadsheetID}/gviz/tq?tqx=responseHandler:${callbackName};out:json&sheet=${encodeURIComponent(nombreHoja)}`;

        script.onerror = reject;

        document.body.appendChild(script);
    });
}

// =====================================
// CARGAR TODAS LAS HOJAS
// =====================================

async function cargarExcel(){

    try{

        let baseCompleta = [];

        for(const hoja of hojas){

            const resultado =
            await leerHoja(hoja);

            baseCompleta.push(resultado);
        }

        contenidoExcel =
        JSON.stringify(baseCompleta);

        document.getElementById("status")
        .innerHTML =
        "✅ Base de datos conectada correctamente";

        console.log(baseCompleta);

    }
    catch(error){

        console.error(error);

        document.getElementById("status")
        .innerHTML =
        "❌ Error leyendo Google Sheets";
    }
}

// =====================================
// INICIAR CARGA
// =====================================

cargarExcel();
