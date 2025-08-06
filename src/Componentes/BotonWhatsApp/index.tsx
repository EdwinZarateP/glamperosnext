"use client";

export default function BotonWhatsApp() {
  const redirigirWhatsApp = () => {
    const numeroWhatsApp = "+573218695196";
    const urlActual = typeof window !== "undefined" ? window.location.href : "";
    const mensaje = encodeURIComponent(
      `Hola equipo Glamperos, ¡Quiero más información!\n\n${urlActual}`
    );
    const esPantallaPequena =
      typeof window !== "undefined" && window.innerWidth < 600;
    const urlWhatsApp = esPantallaPequena
      ? `https://wa.me/${numeroWhatsApp}?text=${mensaje}`
      : `https://web.whatsapp.com/send?phone=${numeroWhatsApp}&text=${mensaje}`;
    window.open(urlWhatsApp, "_blank");
  };

  return (
    <button
      type="button"
      className="contenedor-principal-whatsapp-button"
      onClick={redirigirWhatsApp}
      aria-label="Chatea por WhatsApp"
    >
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        alt="WhatsApp"
        width={45}
        height={45}
      />
    </button>
  );
}
