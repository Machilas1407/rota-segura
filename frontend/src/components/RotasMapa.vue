<template>
  <v-container fluid>
    <v-row>
      <v-col cols="3">
        <v-card class="itinerary-card" flat>
          <v-card-title>📍 Itinerário da Rota</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item-group>
                <v-list-item v-for="(segment, index) in processedRoute" :key="index">
                  <v-list-item-content>
                    <v-list-item-title>
                      {{ index + 1 }}. {{ segment.description }}
                    </v-list-item-title>
                    <v-list-item-subtitle>
                      📏 Distância: {{ formatDistance(segment.distance) }} | 🚦 Acidentes: {{ segment.accidents }}
                    </v-list-item-subtitle>
                  </v-list-item-content>
                  <v-list-item-icon>
                    <div
                      :style="{ backgroundColor: segment.color, width: '20px', height: '20px', borderRadius: '50%' }">
                    </div>
                  </v-list-item-icon>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="9">
        <div id="map" class="l-map"></div>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).href,
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).href,
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).href,
});

export default {
  name: "RotaMapa",
  props: {
    points: {
      type: Array,
      required: true,
    },
    processedRoute: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      map: null,
      realRoute: [],
      bounds: null, // Para definir o ajuste do mapa
    };
  },
  mounted() {
    this.$nextTick(() => {
      this.initMap();
    });
  },
  methods: {
    formatDistance(distance) {
      if (!distance) return "N/A";
      const formatted = parseFloat(distance).toFixed(2); // Mantém 2 casas decimais
      return `${formatted} km`;
    },
    initMap() {
      const mapContainer = document.getElementById("map");
      if (!mapContainer) {
        console.error("❌ Erro: Elemento #map não encontrado!");
        return;
      }

      this.map = L.map("map");
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(this.map);

      this.bounds = L.latLngBounds(this.points.map(p => [p.lat, p.lng]));
      this.map.fitBounds(this.bounds, { padding: [50, 50] });

      this.addMarkers();
      this.generateRealRoute();
    },

    addMarkers() {
      if (this.points.length < 2) return;

      const blueIcon = L.icon({
        iconUrl: "https://cdn-icons-png.flaticon.com/512/5215/5215062.png",
        iconSize: [50, 50], // Tamanho do ícone aumentado para maior visibilidade
        iconAnchor: [25, 50],
      });

      L.marker([this.points[0].lat, this.points[0].lng], { icon: blueIcon }).addTo(this.map);

      L.marker([this.points[this.points.length - 1].lat, this.points[this.points.length - 1].lng], { icon: blueIcon }).addTo(this.map);
    },

    async generateRealRoute() {
      console.log("📡 Iniciando a geração da rota real...");

      const coordinates = this.points.map(p => `${p.lng},${p.lat}`).join(";");
      const osrmUrl = `https://router.project-osrm.org/route/v1/car/${coordinates}?overview=full&geometries=geojson&steps=true`;

      try {
        console.log(`🔗 Requisição OSRM: ${osrmUrl}`);
        const response = await fetch(osrmUrl);
        const data = await response.json();

        if (!data.routes || data.routes.length === 0) {
          throw new Error("Nenhuma rota encontrada!");
        }

        const fullRoute = data.routes[0].geometry.coordinates.map(coord => ({
          lat: coord[1],
          lng: coord[0],
        }));

        console.log(`✅ Total de pontos na rota original: ${fullRoute.length}`);
        console.log("📍 Primeiros 5 pontos da rota original:", fullRoute.slice(0, 5));

        // Gerar pontos a cada 10 km
        this.realRoute = this.getPointsEvery10Km(fullRoute);

        console.log(`📌 Total de pontos a cada 10 km: ${this.realRoute.length}`);
        console.log("📍 Primeiros 5 pontos da rota filtrada:", this.realRoute.slice(0, 5));

        this.applyColorsToRoute();
      } catch (error) {
        console.error("❌ Erro ao obter a rota do OSRM:", error);
      }
    },

    getPointsEvery10Km(routePoints) {
      console.log("📊 Iniciando processamento para extrair pontos a cada 10 km...");
      const selectedPoints = [];
      let accumulatedDistance = 0;
      let lastPoint = routePoints[0];

      selectedPoints.push(lastPoint); // Adiciona o ponto inicial
      console.log(`🚀 Ponto inicial adicionado: ${JSON.stringify(lastPoint)}`);

      for (let i = 1; i < routePoints.length; i++) {
        const currentPoint = routePoints[i];
        const distance = this.calculateDistance(lastPoint, currentPoint);
        accumulatedDistance += distance;

        console.log(`🔍 Analisando ponto ${i}: ${JSON.stringify(currentPoint)}`);
        console.log(`➡️ Distância acumulada: ${accumulatedDistance.toFixed(2)}m`);

        if (accumulatedDistance >= 10000) { // 10 km
          selectedPoints.push(currentPoint);
          console.log(`✅ Ponto a cada 10km adicionado: ${JSON.stringify(currentPoint)}`);
          accumulatedDistance = 0;
          lastPoint = currentPoint;
        }
      }

      // Garante que o último ponto da rota seja incluído
      if (selectedPoints[selectedPoints.length - 1] !== routePoints[routePoints.length - 1]) {
        selectedPoints.push(routePoints[routePoints.length - 1]);
        console.log(`🏁 Último ponto adicionado: ${JSON.stringify(routePoints[routePoints.length - 1])}`);
      }

      console.log(`🎯 Total de pontos selecionados: ${selectedPoints.length}`);
      return selectedPoints;
    },

    calculateDistance(p1, p2) {
      const R = 6371e3; // Raio da Terra em metros
      const lat1 = (p1.lat * Math.PI) / 180;
      const lat2 = (p2.lat * Math.PI) / 180;
      const deltaLat = ((p2.lat - p1.lat) * Math.PI) / 180;
      const deltaLng = ((p2.lng - p1.lng) * Math.PI) / 180;

      const a =
        Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);

      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const distance = R * c; // Distância em metros
      console.log(`📏 Distância entre ${JSON.stringify(p1)} e ${JSON.stringify(p2)}: ${distance.toFixed(2)}m`);
      return distance;
    },


    applyColorsToRoute() {
      if (!this.realRoute.length || !this.processedRoute.length) {
        console.warn("⚠️ Nenhuma rota processada para desenhar.");
        return;
      }

      let lastPoint = null;
      this.realRoute.forEach((point) => {
        if (!lastPoint) {
          lastPoint = point;
          return;
        }

        const matchingSegment = this.findClosestSegment(lastPoint, point);
        const color = matchingSegment ? matchingSegment.color : "blue";

        L.polyline([[lastPoint.lat, lastPoint.lng], [point.lat, point.lng]], {
          color: color,
          weight: 6,
          opacity: 0.9,
        }).addTo(this.map);

        lastPoint = point;
      });

      this.map.fitBounds(this.bounds, { padding: [50, 50] });
    },

    findClosestSegment(p1, p2) {
      let closestSegment = null;
      let minDistance = Infinity;

      this.processedRoute.forEach(segment => {
        const distanceStart = this.calculateDistance(p1, segment.start);
        const distanceEnd = this.calculateDistance(p2, segment.end);
        const totalDistance = distanceStart + distanceEnd;

        if (totalDistance < minDistance) {
          minDistance = totalDistance;
          closestSegment = segment;
        }
      });

      return closestSegment;
    },
  },
};
</script>

<style scoped>
.l-map {
  height: 100%;
  min-height: 500px;
  width: 100%;
}

.map-column {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.itinerary-card {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 10px;
  max-height: 500px;
  overflow-y: auto;
}

.v-list-item {
  border-bottom: 1px solid #ddd;
  padding: 8px;
}

.v-list-item:last-child {
  border-bottom: none;
}
</style>
