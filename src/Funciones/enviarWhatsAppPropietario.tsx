"use server";

interface EnviarWhatsAppProps {
  numero: string;
  mensaje1: string;
  mensaje2: string;
  mensaje3: string;
  mensaje4: string;
  imagenUrl?: string;
}

export const enviarWhatsAppPropietario = async ({
  numero,
  mensaje1,
  mensaje2,
  mensaje3,
  mensaje4,
  imagenUrl = "https://storage.googleapis.com/glamperos-imagenes/Imagenes/animal1.jpeg",
}: EnviarWhatsAppProps) => {
  try {
    if (!numero) {
      throw new Error("No has actualizado tu WhatsApp");
    }

    const url = "https://graph.facebook.com/v21.0/531912696676146/messages";
    const body = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: numero,
      type: "template",
      template: {
        name: "confirmacionreserva",
        language: { code: "es_CO" },
        components: [
          {
            type: "header",
            parameters: [
              {
                type: "image",
                image: { link: imagenUrl },
              },
            ],
          },
          {
            type: "body",
            parameters: [
              { type: "text", text: mensaje1 },
              { type: "text", text: mensaje2 },
              { type: "text", text: mensaje3 },
              { type: "text", text: mensaje4 },
            ],
          },
        ],
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error al enviar el mensaje: ${errorData.error.message}`);
    }

    console.log(`Mensaje enviado correctamente a ${numero}`);
  } catch (error) {
    console.error("Error al enviar mensaje de WhatsApp:", error);
  }
};
