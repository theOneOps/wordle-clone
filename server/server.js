const express = require("express");
const cors = require("cors");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

app.get("/api/words", async (_, res) => {
  try {
    console.log("📡 Requête envoyée à l'API externe...");

    const randomValue = getRandomArbitrary(5, 7)

    const response = await fetch(
      `https://random-word-api.herokuapp.com/word?length=${randomValue}&lang=fr`
    );

    if (!response.ok) {
      throw new Error(`Erreur API externe: ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("❌ Erreur attrapée :", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});


app.listen(5000, () => console.log("http://localhost:5000/api/words"));
