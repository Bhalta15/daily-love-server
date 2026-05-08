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
    mensaje: `${nombreUsuario} te envió un mensaje 💬`,
    foto:    `${nombreUsuario} te compartió una foto 📸`,
    cancion: `${nombreUsuario} te dedicó una canción 🎵`,
    frase:   `${nombreUsuario} te dejó una frase 💭`,
    cita:    `${nombreUsuario} propuso una cita 🗓️`,
    plan:    `${nombreUsuario} agregó un plan 💡`
  };

  const tituloEditado = {
    mensaje: `${nombreUsuario} editó su mensaje 💬`,
    foto:    `${nombreUsuario} actualizó su foto 📸`,
    cancion: `${nombreUsuario} editó su canción 🎵`,
    frase:   `${nombreUsuario} editó su frase 💭`,
    cita:    `${nombreUsuario} editó una cita 🗓️`,
    plan:    `${nombreUsuario} editó un plan 💡`
  };

  const tituloEliminado = {
    mensaje: `${nombreUsuario} eliminó su mensaje 💬`,
    foto:    `${nombreUsuario} eliminó su foto 📸`,
    cancion: `${nombreUsuario} eliminó su canción 🎵`,
    frase:   `${nombreUsuario} eliminó su frase 💭`,
    cita:    `${nombreUsuario} eliminó una cita 🗓️`,
    plan:    `${nombreUsuario} eliminó un plan 💡`
  };

  const tituloBase = esEliminacion
    ? (tituloEliminado[tipo] || `${nombreUsuario} eliminó algo 🗑️`)
    : esEdicion
      ? (tituloEditado[tipo] || `${nombreUsuario} editó algo ✏️`)
      : (tituloNuevo[tipo]   || "Tu pareja te dejó algo ❤️");

  const titulo = "Daily Love 💕";
  // Al eliminar no hay preview
  const cuerpo = (!esEliminacion && preview)
    ? `${tituloBase}\n"${preview}"`
    : tituloBase;

  const collapseId = `${oneSignalId}-${tipo}`;

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
        headings:                 { en: titulo },
        contents:                 { en: cuerpo },
        collapse_id:              collapseId,
        ttl:                      60
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
