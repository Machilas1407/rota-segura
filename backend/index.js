import express from "express";
import cors from "cors";
import { spawn } from "child_process";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

// Função para definir cor de risco com base nos acidentes
function getRiskColor(accidents) {
  if (accidents === 0) return "green";
  if (accidents >= 1 && accidents <= 3) return "yellow";
  if (accidents >= 4 && accidents <= 6) return "orange";
  return "red";
}
function fetchAccidentData(routeInstructions) {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn("python3", ["consulta.py"]);

    let resultData = "";

    // Envia os dados via stdin para o Python
    pythonProcess.stdin.write(JSON.stringify(routeInstructions));
    pythonProcess.stdin.end();

    pythonProcess.stdout.on("data", (data) => {
      resultData += data.toString();
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`Erro no Python: ${data.toString()}`);
    });

    pythonProcess.on("close", (code) => {
      if (code === 0) {
        try {
          resolve(JSON.parse(resultData));
        } catch (error) {
          reject(`Erro ao parsear JSON do Python: ${error}`);
        }
      } else {
        reject("Erro ao executar o script Python");
      }
    });
  });
}

// Endpoint para processar a rota recebida e chamar o Python
app.post("/process-route", async (req, res) => {
  try {
    const { routeInstructions } = req.body;

    if (!routeInstructions || !Array.isArray(routeInstructions)) {
      return res.status(400).json({ error: "Dados de rota inválidos" });
    }

    console.log("📡 Enviando trechos para o Python...");

    const accidentData = await fetchAccidentData(routeInstructions);

    // Adiciona as cores com base no número de acidentes
    const processedRoute = accidentData.map((trecho) => ({
      ...trecho,
      color: getRiskColor(trecho.accidents),
    }));

    console.log("🚀 Dados processados e retornados:", processedRoute);

    res.json({ message: "✅ Dados processados com sucesso.", processedRoute });
  } catch (error) {
    console.error("❌ Erro interno:", error);
    res.status(500).json({ error: "Erro ao processar a rota" });
  }
});

// Inicializa o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
