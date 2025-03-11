<template>
  <v-container>
    <v-card class="blue-card" flat>
      <v-card-text>
        <h2 class="card-title">Mapa da Rota</h2>
        <div class="info-group">
          <v-icon class="info-icon">mdi-map-marker</v-icon>
          <p><strong>Origem:</strong> {{ origem }}</p>
        </div>
        <div class="info-group">
          <v-icon class="info-icon">mdi-map-marker-outline</v-icon>
          <p><strong>Destino:</strong> {{ destino }}</p>
        </div>
        <div class="info-group">
          <v-icon class="info-icon">mdi-car</v-icon>
          <p><strong>Transporte:</strong> {{ transporte }}</p>
        </div>
        <div class="calendar-display">
          <v-icon class="calendar-icon">mdi-calendar</v-icon>
          <div class="calendar-info">
            <p><strong>Data e Hora:</strong></p>
            <p>{{ formattedDateTime }}</p>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Exibir primeiro um mapa simples -->
    <div v-if="isLoading">
      <p class="loading-message">🔄 Calculando rota...</p>
      <div id="map" class="l-map"></div>
    </div>

    <!-- Quando os dados do backend chegarem, renderiza o mapa com as cores -->
    <div v-if="!isLoading && processedRoute">
      <RotasMapa :points="mapData" :processedRoute="processedRoute" />
    </div>
  </v-container>
</template>

<script>
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";
import { fetchRouteDetails } from "@/service/api-rotas.js";
import RotasMapa from "@/components/RotasMapa.vue";

export default {
  components: {
    RotasMapa,
  },
  data() {
    return {
      origem: "",
      destino: "",
      transporte: "",
      formattedDateTime: "",
      mapData: null,
      processedRoute: null,
      isLoading: true,
      map: null,
      routingControl: null,
    };
  },
  async created() {
    const query = this.$route.query;
    this.origem = query.origem || "Origem não definida";
    this.destino = query.destino || "Destino não definido";
    this.transporte = query.transporte || "Transporte não definido";
    this.formattedDateTime = query.datetime || "Data e Hora não definida";

    try {
      // Buscar coordenadas da origem e destino
      const origemData = await this.fetchCoordinates(this.origem);
      const destinoData = await this.fetchCoordinates(this.destino);

      this.mapData = [
        { lat: origemData.lat, lng: origemData.lon, label: "Origem" },
        { lat: destinoData.lat, lng: destinoData.lon, label: "Destino" },
      ];

      console.log("📡 Dados da rota:", JSON.stringify(this.mapData, null, 2));

      // Inicializa o mapa básico com a rota
      this.$nextTick(() => {
        this.initSimpleMap();
      });

    } catch (error) {
      console.error("❌ Erro ao obter coordenadas ou rota:", error);
      alert("Erro ao carregar as informações da rota.");
      this.isLoading = false;
    }
  },
  methods: {
    async fetchCoordinates(location) {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data.length === 0) {
        throw new Error(`Nenhuma coordenada encontrada para: ${location}`);
      }

      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    },

    initSimpleMap() {
      this.$nextTick(() => {
        const mapContainer = document.getElementById("map");
        if (!mapContainer) {
          console.error("❌ Erro: Elemento #map não encontrado!");
          return;
        }

        this.map = L.map("map").setView([this.mapData[0].lat, this.mapData[0].lng], 10);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(this.map);

        this.addSimpleRouting();
      });
    },

    addSimpleRouting() {
      if (!this.map) {
        console.error("❌ Erro: O mapa ainda não foi inicializado!");
        return;
      }

      const waypoints = this.mapData.map((point) => L.latLng(point.lat, point.lng));

      this.routingControl = L.Routing.control({
        waypoints: waypoints,
        router: L.Routing.osrmv1({ language: "pt-BR", profile: "car" }),
        show: false,
        collapsible: true,
      }).addTo(this.map);

      // Capturar os trechos gerados pelo OSRM
      this.routingControl.on("routesfound", async (e) => {
        const route = e.routes[0];

        // Certifique-se de que os dados dos trechos têm latitude e longitude corretamente
        const routeSegments = route.instructions.map((instruction, index) => {
          const start = route.coordinates[instruction.index] || {};
          const end =
            index + 1 < route.instructions.length
              ? route.coordinates[route.instructions[index + 1].index] || {}
              : route.coordinates[route.coordinates.length - 1] || {};

          if (!start.lat || !start.lng || !end.lat || !end.lng) {
            console.error("❌ Ponto inválido detectado:", { start, end });
            return null; // Evita enviar trechos inválidos
          }

          return {
            description: instruction.text,
            start: { lat: start.lat, lng: start.lng },
            end: { lat: end.lat, lng: end.lng },
            distance: `${(instruction.distance / 1000).toFixed(2)} km`,
          };
        }).filter(segment => segment !== null); // Remove trechos inválidos

        console.log("📡 Trechos filtrados antes de enviar ao backend:", routeSegments);

        // Enviar apenas se houver trechos válidos
        if (routeSegments.length === 0) {
          console.error("🚨 Nenhum trecho válido para envio ao backend.");
          return;
        }

        const processedData = await fetchRouteDetails(routeSegments);

        if (!processedData || !processedData.processedRoute) {
          console.error("❌ Erro ao obter dados processados da rota.");
          return;
        }

        console.log("✅ Trechos processados recebidos:", processedData.processedRoute);
        this.processedRoute = processedData.processedRoute;
        this.isLoading = false;
      });
    },
  },
};
</script>

<style scoped>
.l-map {
  height: 500px;
  width: 100%;
}

.loading-message {
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #002b5c;
}

.blue-card {
  background-color: #002b5c;
  border-radius: 12px;
  padding: 24px;
  color: white;
  margin-bottom: 10px;
}

.info-group,
.calendar-display {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.info-icon,
.calendar-icon {
  font-size: 24px;
}
</style>
