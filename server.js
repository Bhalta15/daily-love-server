const express = require("express");
const cors    = require("cors");
const fetch   = require("node-fetch");
const app = express();
app.use(cors({ origin: "https://bhalta15.github.io" }));
app.use(express.json());

const ONESIGNAL_APP_ID  = "1c802966-0ba1-4c4b-8b5b-7e0d8074f499";
const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

app.post("/notificar", async (req, res) => {
  const { oneSignalId, tipo, nombreUsuario, preview, esEdicion, esEliminacion } = req.body;
  if (!oneSignalId || !tipo) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const tituloNuevo = {
    mensaje: `${nombreUsuario}: nuevo mensaje 💬`,
    foto:    `${nombreUsuario}: nueva foto 📸`,
    cancion: `${nombreUsuario}: nueva canción 🎵`,
    frase:   `${nombreUsuario}: nueva frase 💭`,
    cita:    `${nombreUsuario}: propuso nueva cita 🗓️`,
    plan:    `${nombreUsuario}: agregó nuevo plan💡`
  };

  const tituloEditado = {
    mensaje: `${nombreUsuario}: editó un mensaje 💬`,
    foto:    `${nombreUsuario}: actualizó una foto 📸`,
    cancion: `${nombreUsuario}: editó una canción 🎵`,
    frase:   `${nombreUsuario}: editó una frase 💭`,
    cita:    `${nombreUsuario}: editó una cita 🗓️`,
    plan:    `${nombreUsuario}: editó un plan 💡`
  };

  const tituloEliminado = {
    mensaje: `${nombreUsuario}: eliminó un mensaje 💬`,
    foto:    `${nombreUsuario}: eliminó una foto 📸`,
    cancion: `${nombreUsuario}: eliminó una canción 🎵`,
    frase:   `${nombreUsuario}: eliminó una frase 💭`,
    cita:    `${nombreUsuario}: eliminó una cita 🗓️`,
    plan:    `${nombreUsuario}: eliminó un plan💡`
  };

  const tituloBase = esEliminacion
    ? (tituloEliminado[tipo] || `${nombreUsuario} eliminó algo 🗑️`)
    : esEdicion
      ? (tituloEditado[tipo] || `${nombreUsuario} editó algo ✏️`)
      : (tituloNuevo[tipo]   || "Tu pareja te dejó algo");

  const titulo = "Daily Love";
  // Al eliminar no hay preview
let cuerpo = tituloBase;

// previews solo para mensajes y frases
if (
  !esEliminacion &&
  !esEdicion &&
  preview &&
  (tipo === "mensaje" || tipo === "frase")
) {
  cuerpo += `\n"${preview}"`;
}

// ediciones sí muestran preview
if (
  esEdicion &&
  preview &&
  (tipo === "mensaje" || tipo === "frase")
) {
  cuerpo += `\n"${preview}"`;
}

  let collapseId;

if (esEdicion || esEliminacion) {
  collapseId = `${oneSignalId}-${tipo}-${Date.now()}`;
} else {
  switch (tipo) {
    case "mensaje":
      collapseId = `${oneSignalId}-mensajes`;
      break;

    case "frase":
      collapseId = `${oneSignalId}-frases`;
      break;

    case "foto":
      collapseId = `${oneSignalId}-fotos`;
      break;

    case "cita":
      collapseId = `${oneSignalId}-citas`;
      break;

    case "plan":
      collapseId = `${oneSignalId}-planes`;
      break;

    default:
      collapseId = `${oneSignalId}-general`;
  }
}

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Key ${ONESIGNAL_API_KEY}`
      },
body: JSON.stringify({
  app_id:                   ONESIGNAL_APP_ID,
  target_channel:           "push",
  include_subscription_ids: [oneSignalId],

  headings: {
    en: titulo
  },

  contents: {
    en: cuerpo
  },

  // reemplaza notis similares
  collapse_id: collapseId,

  // agrupa visualmente en Android
  android_group: collapseId,

  // tiempo máximo esperando entregar
  ttl: 300,

  // prioridad alta
  priority: 10,

  // sonido
  android_sound: "default"
      })
    });
    const data = await response.json();
    console.log("OneSignal response:", JSON.stringify(data));
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al enviar notificación" });
  }
});

app.get("/", (req, res) => res.send("Daily Love Server OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
