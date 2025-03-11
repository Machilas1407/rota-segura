const express = require("express");
const { fetchRoadDetails } = require("../services/osmService");
const router = express.Router();

// Rota para buscar detalhes de rodovias e incluir acidentes simulados
router.post("/road-details", async (req, res) => {
    try {
        const { coordinates } = req.body; // Recebe as coordenadas do frontend
        if (!coordinates || coordinates.length === 0) {
            return res.status(400).json({ error: "Coordenadas são obrigatórias." });
        }

        const roadDetails = await fetchRoadDetails(coordinates);

        if (!roadDetails || roadDetails.length === 0) {
            return res.status(404).json({ error: "Nenhuma rodovia encontrada." });
        }

        res.status(200).json({ roadDetails });
    } catch (error) {
        console.error("Erro ao buscar detalhes de rodovias:", error);
        res.status(500).json({ error: "Erro ao buscar detalhes de rodovias." });
    }
});

module.exports = router;
