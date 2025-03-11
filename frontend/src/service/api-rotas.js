const BASE_URL = "http://localhost:3001"; // URL do backend

// Função para buscar detalhes de rodovias
export async function fetchRouteDetails(routeInstructions) {
  console.time("⏳ Tempo total da requisição ao backend"); // Início da contagem

  try {
    const response = await fetch("http://localhost:3001/process-route", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ routeInstructions }),
    });

    console.timeEnd("⏳ Tempo total da requisição ao backend"); // Fim da contagem

    if (!response.ok) {
      throw new Error("Erro ao buscar detalhes da rota no backend");
    }

    const data = await response.json();
    console.log("Trechos da rota retornados:", data);
    return data;
  } catch (error) {
    console.error("❌ Erro na API de processamento de rota:", error);
    return null;
  }
}



// Função para buscar acidentes
export async function fetchAccidents(coordinates) {
  try {
    const response = await fetch(`${BASE_URL}/acidentes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coordinates }),
    });

    if (!response.ok) {
      throw new Error("Erro ao buscar acidentes");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro na API de acidentes:", error);
    return null;
  }
}
