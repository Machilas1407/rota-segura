import axios from "axios";

// Cache para evitar requisições repetidas
const cache = new Map();

// Função para agrupar coordenadas próximas e reduzir chamadas repetitivas
function groupCoordinates(coordinates, threshold = 0.005) { // Aumentado para reduzir requisições repetitivas
    const grouped = [];
    coordinates.forEach((coord) => {
        let found = false;
        for (const group of grouped) {
            if (Math.abs(group.lat - coord.lat) < threshold && Math.abs(group.lng - coord.lng) < threshold) {
                found = true;
                break;
            }
        }
        if (!found) grouped.push(coord);
    });
    return grouped;
}

// Função para buscar detalhes de rodovias no OpenStreetMap
export async function fetchRoadDetails(coordinates) {
    console.time("⏳ Tempo total de busca de rodovias");

    console.log(`🔹 Iniciando busca de rodovias para ${coordinates.length} coordenadas...`);

    // Agrupamos coordenadas próximas para evitar chamadas repetitivas desnecessárias
    const groupedCoords = groupCoordinates(coordinates, 0.005);
    console.log(`📌 Coordenadas agrupadas para otimizar requisições: ${groupedCoords.length}`);

    const roadSegments = [];

    // Criamos um array de Promises para executar todas as requisições em paralelo
    const promises = groupedCoords.map(async (coord) => {
        try {
            const cacheKey = `${coord.lat},${coord.lng}`;
            if (cache.has(cacheKey)) {
                console.log(`⚡ Usando cache para lat: ${coord.lat}, lng: ${coord.lng}`);
                roadSegments.push(...cache.get(cacheKey));
                return;
            }

            console.log(`🌍 Consultando OpenStreetMap para lat: ${coord.lat}, lng: ${coord.lng}`);

            const query = `
            [out:json];
            way(around:500, ${coord.lat}, ${coord.lng})["highway"];
            out tags;
            `;

            // Testando um servidor alternativo para melhor performance
            const url = `https://overpass.kumi.systems/api/interpreter?data=${encodeURIComponent(query)}`;
            const response = await axios.get(url, { timeout: 10000 });

            console.log("✅ Resposta recebida do OpenStreetMap");

            let roads = [];
            if (response.data?.elements?.length > 0) {
                roads = response.data.elements.map((element) => ({
                    name: element.tags.name || "Rodovia Sem Nome",
                    ref: element.tags.ref || "Sem referência",
                    type: element.tags.highway || "Sem tipo",
                    lat: coord.lat,
                    lng: coord.lng,
                    accidents: Math.floor(Math.random() * 6) + 1
                }));
            } else {
                console.warn(`⚠️ Nenhuma rodovia encontrada para lat: ${coord.lat}, lng: ${coord.lng}`);
                roads = [{
                    name: "Rodovia Desconhecida",
                    ref: "N/A",
                    type: "Rodovia",
                    lat: coord.lat,
                    lng: coord.lng,
                    accidents: Math.floor(Math.random() * 3) // Mesmo sem dados, ainda simulamos acidentes
                }];
            }

            // Adicionamos ao cache e ao array de resultados
            cache.set(cacheKey, roads);
            roadSegments.push(...roads);

        } catch (error) {
            console.error("❌ Erro ao buscar detalhes no OpenStreetMap:", error.message);
        }
    });

    // Executa todas as requisições em paralelo e espera a conclusão
    await Promise.all(promises);

    console.log(`🔹 Total de rodovias encontradas: ${roadSegments.length}`);
    console.timeEnd("⏳ Tempo total de busca de rodovias");

    return roadSegments.length > 0
        ? Array.from(new Set(roadSegments.map(JSON.stringify))).map(JSON.parse)
        : [{ name: "Rodovia Desconhecida", ref: "N/A", type: "Rodovia", lat: 0, lng: 0, accidents: Math.floor(Math.random() * 3) }];
}
