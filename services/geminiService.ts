import { GoogleGenAI } from "@google/genai";

const getStencilPrompt = (color: string) => `
Dibuja una plantilla de tatuaje profesional en líneas sólidas, sin sombras. Estilo dibujo hecho a mano técnico, preparado para stencil de tatuaje.

El trazo debe ser nítido, preciso y limpio, sin degradados.

Usa solo líneas ${color} sobre fondo blanco puro, sin textura de papel.

Resalta todos los músculos y líneas de expresión del rostro y cuerpo con líneas claras y bien definidas.

Use a map scale las diferentes zonas de sombras (sombras oscuras, sombras claras y luces) únicamente mediante patrones de línea o grosor, sin relleno.

Dibuja la imagen tal y como aparece con máxima definición, mostrando detalles anatómicos exactos.

Mantén el encuadre exacto de la imagen original. No recortes, no hagas zoom, ni desplaces el sujeto. La superposición debe ser perfecta.

Traza el cabello con detalle fino, siguiendo la dirección natural del crecimiento, usando líneas dinámicas.

Indica los highlights (luces) con trazos bien marcados o líneas finas discontinuas.

La composición debe ser sin perspectiva, sin adelgazamientos ni deformaciones.

Representa todos los detalles de la imagen original (contornos, pliegues, sombras, reflejos) exclusivamente mediante líneas.

El diseño debe estar listo y completo para impresión en termo copiadora (stencil de tatuaje).

Estilo: Line art técnico, stencil tattoo, trazado digital nítido, líneas ${color} sobre fondo blanco, alta resolución, sin relleno ni sombreado.

Formato final: Imagen lista para imprimir o transferir a papel hectográfico.
`;

export const generateStencil = async (base64Image: string, additionalPrompt?: string, color: string = 'negras'): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  // Extract base64 data if it has the prefix
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  
  const basePrompt = getStencilPrompt(color);

  // Combine user instruction with the strict stencil prompt if provided
  const promptText = additionalPrompt 
    ? `USER INSTRUCTION: ${additionalPrompt}\n\nSTENCIL GUIDELINES:\n${basePrompt}`
    : basePrompt;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              data: cleanBase64,
              mimeType: 'image/png', // Assuming input is converted/handled as PNG or standard image
            },
          },
          {
            text: promptText,
          },
        ],
      },
    });

    // Check for candidates and parts
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    
    throw new Error("No image generated in response");

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};