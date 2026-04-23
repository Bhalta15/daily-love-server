const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");

const app = express();
app.use(cors({ origin: "https://bhalta15.github.io" }));
app.use(express.json());

const ONESIGNAL_APP_ID = "1c802966-0ba1-4c4b-8b5b-7e0d8074f499";
const ONESIGNAL_API_KEY = "os_v2_app_dsacszqlufgexc23pygya5hutej6m3hi6oje7m4gg4wwl7yfukeko6cxnvfchbszhuldpidtukwh4xl74xyk6xnp4tho2by5hhzmb4a";

app.post("/notificar", async (req, res) => {
  const { oneSignalId, tipo } = req.body;

  if (!oneSignalId || !tipo) {
    return res.status(400).json({ error: "Faltan datos" });
  }

  const mensajesNoti = {
    mensaje: "Te enviaron un mensaje 💬",
    foto:    "Te compartieron una foto 📸",
    cancion: "Te dedicaron una canción 🎵",
    frase:   "Te dejaron una frase 💭"
  };

  try {
    const response = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Key ${ONESIGNAL_API_KEY}`
      },
      body: JSON.stringify({
        app_id:                   ONESIGNAL_APP_ID,
        include_subscription_ids: [oneSignalId],
        headings:                 { en: "Daily Love 💕" },
        contents:                 { en: mensajesNoti[tipo] || "Tu pareja te dejó algo ❤️" }
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error al enviar notificación" });
  }
});

app.get("/", (req, res) => res.send("Daily Love Server OK"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
