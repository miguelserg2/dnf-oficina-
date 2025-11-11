import { GoogleGenAI } from "@google/genai";

// --- INSTRUCCIONES PARA EL DESPLIEGUE EN VERCEL ---
// Para que la aplicación funcione correctamente en producción,
// debes configurar la variable de entorno `API_KEY` en los ajustes
// de tu proyecto en Vercel.
//
// 1. Ve a tu proyecto en Vercel.
// 2. Ve a la pestaña "Settings".
// 3. Haz clic en "Environment Variables".
// 4. Añade una nueva variable con el nombre `API_KEY` y pega tu clave de la API de Gemini como valor.
// 5. Guarda y vuelve a desplegar tu proyecto para que los cambios surtan efecto.
// ----------------------------------------------------

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateReport = async (data: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: data,
        config: {
            systemInstruction: `Eres un asistente de oficina experto en analizar datos y generar informes concisos. 
            Analiza los datos proporcionados sobre tareas, documentos y eventos de calendario. 
            Genera un informe ejecutivo que resuma el estado actual de la oficina. 
            El informe debe estar bien estructurado en español, usando Markdown para el formato (títulos, listas, negritas). 
            Secciones sugeridas:
            1.  **Resumen Ejecutivo**: Un párrafo breve con lo más destacado.
            2.  **Estado de Tareas**: Cuántas tareas están pendientes y completadas, y cuáles son las más urgentes.
            3.  **Actividad Reciente de Documentos**: Menciona los últimos documentos creados.
            4.  **Próximos Eventos Clave**: Lista los eventos más importantes de la agenda para los próximos días.
            5.  **Conclusiones y Recomendaciones**: Ofrece una breve conclusión sobre la productividad y posibles áreas de mejora.`,
        }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating report with Gemini API:", error);
    return "Error: No se pudo generar el informe. Por favor, inténtelo de nuevo más tarde.";
  }
};