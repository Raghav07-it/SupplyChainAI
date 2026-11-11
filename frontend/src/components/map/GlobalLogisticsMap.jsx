import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Compass,
  AlertTriangle,
  Ship,
  Anchor,
  Layers,
  Maximize2,
  Minimize2,
  RefreshCw,
  Info,
  CheckCircle2,
  Shield,
  Activity,
} from "lucide-react";

// Standard Port Coordinate Registry
export const PORT_COORDINATES = {
  // Key Western & Med Ports
  "Port of Valencia (Spain)": [39.45, -0.32],
  "Valencia (ES)": [39.45, -0.32],
  "Valencia": [39.45, -0.32],
  "Port of New York / New Jersey": [40.68, -74.04],
  "New York (US)": [40.68, -74.04],
  "New York": [40.68, -74.04],
  "Port of Rotterdam (Netherlands)": [51.95, 4.13],
  "Rotterdam (NL)": [51.95, 4.13],
  "Rotterdam": [51.95, 4.13],
  "Port of Marseille (France)": [43.30, 5.37],
  "Marseille (FR)": [43.30, 5.37],
  "Marseille": [43.30, 5.37],
  "Port of Felixstowe (UK)": [51.96, 1.35],
  "Felixstowe (UK)": [51.96, 1.35],
  "Felixstowe": [51.96, 1.35],
  "Port of Hamburg (Germany)": [53.53, 9.97],
  "Hamburg (DE)": [53.53, 9.97],
  "Hamburg": [53.53, 9.97],

  // Asian & Middle East Hubs
  "Port of Ningbo-Zhoushan (China)": [29.87, 121.55],
  "Ningbo (CN)": [29.87, 121.55],
  "Ningbo": [29.87, 121.55],
  "Port of Qingdao (China)": [36.06, 120.38],
  "Qingdao (CN)": [36.06, 120.38],
  "Qingdao": [36.06, 120.38],
  "Port of Shanghai (China)": [31.23, 121.47],
  "Shanghai (CN)": [31.23, 121.47],
  "Shanghai": [31.23, 121.47],
  "Port of Singapore (Singapore)": [1.29, 103.85],
  "Singapore (SG)": [1.29, 103.85],
  "Singapore": [1.29, 103.85],
  "Port of Jebel Ali (Dubai, UAE)": [25.01, 55.06],
  "Dubai (AE)": [25.01, 55.06],
  "Dubai": [25.01, 55.06],
  "Port of Jawaharlal Nehru (Mumbai, India)": [18.95, 72.95],
  "Mumbai (IN)": [18.95, 72.95],
  "Mumbai": [18.95, 72.95],
};

export const STRATEGIC_CHOKEPOINTS = [
  {
    id: "choke-red-sea",
    name: "Bab-el-Mandeb / Southern Red Sea",
    coords: [12.58, 43.33],
    type: "conflict_zone",
    severity: "critical",
    status: "Rerouting Active",
    description: "Anti-ship maritime missile advisories in effect. Major carriers routing via Cape of Good Hope (+10-14 days transit).",
    affectedCorridors: "Asia → Mediterranean / North Europe",
  },
  {
    id: "choke-suez",
    name: "Suez Canal Transit Corridor",
    coords: [30.58, 32.56],
    type: "canal_transit",
    severity: "medium",
    status: "Restricted Convoys",
    description: "Suez Northbound & Southbound convoy booking restrictions in effect. Draft limits normal at 66ft.",
    affectedCorridors: "Red Sea / Mediterranean",
  },
  {
    id: "choke-panama",
    name: "Panama Canal Transit System",
    coords: [9.10, -79.69],
    type: "canal_transit",
    severity: "low",
    status: "Normal Operations",
    description: "Lake Gatun water levels stabilized. 34 daily transit slots active. Neo-Panamax draft at 48 feet.",
    affectedCorridors: "Transpacific → US East Coast",
  },
  {
    id: "choke-malacca",
    name: "Strait of Malacca / Singapore Corridor",
    coords: [2.50, 101.50],
    type: "dense_transit",
    severity: "low",
    status: "Optimal Velocity",
    description: "Clear weather, traffic flow normal with 12-hour turnaround velocity. No vessel backlogs detected.",
    affectedCorridors: "Far East → Indian Ocean / Europe",
  },
];

function findCoordinates(portString) {
  if (!portString) return null;
  const raw = portString.trim();
  if (PORT_COORDINATES[raw]) return PORT_COORDINATES[raw];

  // Try partial matching
  const lower = raw.toLowerCase();
  for (const [key, coords] of Object.entries(PORT_COORDINATES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return coords;
    }
  }

  // City keyword checks
  if (lower.includes("valencia")) return [39.45, -0.32];
  if (lower.includes("new york") || lower.includes("new jersey") || lower.includes("newark")) return [40.68, -74.04];
  if (lower.includes("rotterdam")) return [51.95, 4.13];
  if (lower.includes("singapore")) return [1.29, 103.85];
  if (lower.includes("ningbo")) return [29.87, 121.55];
  if (lower.includes("qingdao")) return [36.06, 120.38];
  if (lower.includes("shanghai")) return [31.23, 121.47];
  if (lower.includes("marseille")) return [43.30, 5.37];
  if (lower.includes("felixstowe")) return [51.96, 1.35];
  if (lower.includes("hamburg")) return [53.53, 9.97];
  if (lower.includes("mumbai") || lower.includes("jnpt")) return [18.95, 72.95];
  if (lower.includes("dubai") || lower.includes("jebel")) return [25.01, 55.06];

  return null;
}

// Generate curved multi-segment arc points for great-circle sea corridor
function generateArcPoints(start, end, numPoints = 25) {
  const points = [];
  const lat1 = start[0];
  const lng1 = start[1];
  const lat2 = end[0];
  const lng2 = end[1];

  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    // Linear interpolation
    let lat = lat1 + (lat2 - lat1) * f;
    let lng = lng1 + (lng2 - lng1) * f;

    // Slight parabolic arc offset for oceanic curve visualization
    const offset = Math.sin(f * Math.PI) * 4.5;
    lat += offset;

    points.push([lat, lng]);
  }
  return points;
}

export default function GlobalLogisticsMap({
  shipments = [],
  disruptions = [],
  selectedShipmentId = null,
  onSelectShipment = null,
  height = "600px",
  className = "",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef({
    markers: null,
    routes: null,
    chokepoints: null,
  });

  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'shipments' | 'disruptions' | 'chokepoints'
  const [selectedPin, setSelectedPin] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [24.0, 15.0],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: false,
      attributionControl: false,
      worldCopyJump: true,
    });

    // Dark Matter CartoDB Basemap
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    // Zoom control at bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Attribution
    L.control.attribution({ position: "bottomleft", prefix: "CartoDB Dark Matter • ChainSight GIS" }).addTo(map);

    // Feature group layers
    layersRef.current.routes = L.layerGroup().addTo(map);
    layersRef.current.chokepoints = L.layerGroup().addTo(map);
    layersRef.current.markers = L.layerGroup().addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Render Routes and Markers whenever data or filter changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const { routes, chokepoints, markers } = layersRef.current;
    routes.clearLayers();
    chokepoints.clearLayers();
    markers.clearLayers();

    // 1. Draw Strategic Chokepoints
    if (filterMode === "all" || filterMode === "chokepoints" || filterMode === "disruptions") {
      STRATEGIC_CHOKEPOINTS.forEach((cp) => {
        const isCritical = cp.severity === "critical";
        const isMedium = cp.severity === "medium";

        const pulseColor = isCritical ? "#EF4444" : isMedium ? "#F59E0B" : "#10B981";

        const iconHtml = `
          <div style="position:relative; width:28px; height:28px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:100%; height:100%; border-radius:50%; background:${pulseColor}; opacity:0.35; animation:ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:16px; height:16px; border-radius:50%; background:${pulseColor}; border:2px solid #0B0F17; box-shadow:0 0 10px ${pulseColor}; display:flex; align-items:center; justify-content:center; color:white; font-size:9px; font-weight:bold;">
              !
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          className: "custom-chokepoint-icon",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker(cp.coords, { icon });
        const popupContent = `
          <div style="font-family:Inter,sans-serif; background:#1E293B; color:#F8FAFC; padding:12px; border-radius:10px; border:1px solid #3B4E6B; max-width:260px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px;">
              <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:${pulseColor};">${cp.type.replace("_", " ")}</span>
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:${pulseColor}22; color:${pulseColor}; border:1px solid ${pulseColor}66;">${cp.status}</span>
            </div>
            <div style="font-weight:700; font-size:13px; margin-bottom:4px;">${cp.name}</div>
            <p style="font-size:11px; color:#94A3B8; margin:0 0 6px 0; line-height:1.4;">${cp.description}</p>
            <div style="font-size:10px; color:#64748B; border-top:1px solid #273549; padding-top:6px;">Corridor: <strong style="color:#F8FAFC;">${cp.affectedCorridors}</strong></div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          closeButton: false,
          className: "cs-dark-popup",
        });

        marker.on("click", () => {
          setSelectedPin({
            type: "chokepoint",
            data: cp,
          });
        });

        chokepoints.addLayer(marker);
      });
    }

    // 2. Draw Shipment Corridors and Port Markers
    if (filterMode === "all" || filterMode === "shipments") {
      const activeShipments = shipments.length > 0 ? shipments : [
        // Realistic default fleet corridors matching Acme Ceramics mockups
        {
          id: 8921,
          tracking_number: "CS-8921",
          product: "Glazed Porcelain Tiles",
          quantity: 450,
          origin_port: "Port of Ningbo-Zhoushan (China)",
          destination_port: "Port of Rotterdam (Netherlands)",
          carrier: "Cosco Shipping",
          status: "in_transit",
          expected_arrival: "2025-10-24",
        },
        {
          id: 8890,
          tracking_number: "CS-8890",
          product: "Artisan Terracotta Vases",
          quantity: 120,
          origin_port: "Port of Valencia (Spain)",
          destination_port: "Port of Felixstowe (UK)",
          carrier: "Maersk Line",
          status: "in_transit",
          expected_arrival: "2025-10-29",
        },
        {
          id: 8854,
          tracking_number: "CS-8854",
          product: "Matte Floor Slabs",
          quantity: 310,
          origin_port: "Port of Qingdao (China)",
          destination_port: "Port of Hamburg (Germany)",
          carrier: "Hapag-Lloyd",
          status: "in_transit",
          expected_arrival: "2025-11-03",
        },
        {
          id: 8802,
          tracking_number: "CS-8802",
          product: "Ceramic Kitchenware Sample Kit",
          quantity: 40,
          origin_port: "Port of Marseille (France)",
          destination_port: "Port of New York / New Jersey",
          carrier: "CMA CGM",
          status: "in_transit",
          expected_arrival: "2025-11-07",
        },
      ];

      activeShipments.forEach((s) => {
        const startCoord = findCoordinates(s.origin_port);
        const endCoord = findCoordinates(s.destination_port);

        if (!startCoord || !endCoord) return;

        const isSelected = selectedShipmentId && (s.id === selectedShipmentId || s.tracking_number === selectedShipmentId);
        const isDisrupted = (s.status || "").toLowerCase().includes("delay") || (s.status || "").toLowerCase().includes("disrupt");

        const routeColor = isSelected ? "#38BDF8" : isDisrupted ? "#F59E0B" : "#6366F1";
        const routeWeight = isSelected ? 4 : 2.5;

        // Draw Great-Circle Arc
        const arcPoints = generateArcPoints(startCoord, endCoord);
        const polyline = L.polyline(arcPoints, {
          color: routeColor,
          weight: routeWeight,
          opacity: isSelected ? 0.95 : 0.75,
          dashArray: isDisrupted ? "6, 6" : undefined,
        });

        const routePopup = `
          <div style="font-family:Inter,sans-serif; background:#1E293B; color:#F8FAFC; padding:12px; border-radius:10px; border:1px solid #3B4E6B; min-width:240px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; font-weight:700; color:#38BDF8;">#${s.tracking_number || s.id}</span>
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:#10B98122; color:#10B981; border:1px solid #10B98166; text-transform:capitalize;">${s.status}</span>
            </div>
            <div style="font-weight:700; font-size:13px; margin-bottom:2px;">${s.product || s.product_name || "Cargo Consignment"}</div>
            <div style="font-size:11px; color:#94A3B8; margin-bottom:8px;">${s.quantity} units • ${s.carrier || "Global Liner"}</div>
            <div style="font-size:11px; background:#111827; padding:6px 8px; border-radius:6px; border:1px solid #273549; margin-bottom:6px;">
              <div><strong>From:</strong> ${s.origin_port}</div>
              <div><strong>To:</strong> ${s.destination_port}</div>
            </div>
            <div style="font-size:10px; color:#64748B;">Est. Arrival: <strong style="color:#F8FAFC;">${s.expected_arrival || "On Schedule"}</strong></div>
          </div>
        `;

        polyline.bindPopup(routePopup, { closeButton: false });
        polyline.on("click", () => {
          setSelectedPin({ type: "shipment", data: s });
          if (onSelectShipment) onSelectShipment(s);
        });

        routes.addLayer(polyline);

        // Origin Port Marker (Green glow)
        const originHtml = `
          <div style="width:14px; height:14px; border-radius:50%; background:#10B981; border:2px solid #0B0F17; box-shadow:0 0 10px #10B981;"></div>
        `;
        const originMarker = L.marker(startCoord, {
          icon: L.divIcon({ html: originHtml, className: "port-origin-icon", iconSize: [14, 14], iconAnchor: [7, 7] }),
        });
        originMarker.bindPopup(`
          <div style="font-family:Inter,sans-serif; background:#1E293B; color:#F8FAFC; padding:10px; border-radius:8px; border:1px solid #3B4E6B;">
            <div style="font-size:10px; font-weight:700; color:#10B981; text-transform:uppercase;">Origin Departure Terminal</div>
            <div style="font-size:12px; font-weight:700; margin-top:2px;">${s.origin_port}</div>
            <div style="font-size:10px; color:#94A3B8; margin-top:4px;">Carries shipment #${s.tracking_number || s.id}</div>
          </div>
        `, { closeButton: false });
        markers.addLayer(originMarker);

        // Destination Port Marker (Cyan glow)
        const destHtml = `
          <div style="width:14px; height:14px; border-radius:50%; background:#06B6D4; border:2px solid #0B0F17; box-shadow:0 0 10px #06B6D4;"></div>
        `;
        const destMarker = L.marker(endCoord, {
          icon: L.divIcon({ html: destHtml, className: "port-dest-icon", iconSize: [14, 14], iconAnchor: [7, 7] }),
        });
        destMarker.bindPopup(`
          <div style="font-family:Inter,sans-serif; background:#1E293B; color:#F8FAFC; padding:10px; border-radius:8px; border:1px solid #3B4E6B;">
            <div style="font-size:10px; font-weight:700; color:#06B6D4; text-transform:uppercase;">Discharge Destination Port</div>
            <div style="font-size:12px; font-weight:700; margin-top:2px;">${s.destination_port}</div>
            <div style="font-size:10px; color:#94A3B8; margin-top:4px;">Est. Delivery: ${s.expected_arrival || "On Schedule"}</div>
          </div>
        `, { closeButton: false });
        markers.addLayer(destMarker);
      });
    }
  }, [shipments, disruptions, selectedShipmentId, filterMode]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([24.0, 15.0], 2.5, { duration: 1.2 });
    }
  };

  const activeShipmentsCount = shipments.length > 0 ? shipments.length : 4;

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[var(--border-color)] bg-[#0B0F17] shadow-2xl ${className}`}>
      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height: isFullscreen ? "100vh" : height, width: "100%" }}
        className="z-0"
      />

      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Left: Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[var(--surface-base)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-xl pointer-events-auto">
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === "all"
                ? "bg-[var(--accent-primary)] text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            All Corridors
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("shipments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterMode === "shipments"
                ? "bg-[var(--accent-cyan)] text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <Ship size={13} />
            My Cargo ({activeShipmentsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("chokepoints")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterMode === "chokepoints"
                ? "bg-[var(--status-warning)] text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "text-[var(--text-secondary)] hover:text-white"
            }`}
          >
            <AlertTriangle size={13} />
            Chokepoints (4)
          </button>
        </div>

        {/* Right: Map Utilities */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-[var(--surface-base)]/90 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)] transition-all shadow-xl"
            title="Recenter World Map"
          >
            <RefreshCw size={15} />
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-[var(--surface-base)]/90 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-white hover:bg-[var(--surface-elevated)] transition-all shadow-xl"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Floating Bottom Left Telemetry Summary */}
      <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-base)]/90 backdrop-blur-md border border-[var(--border-color)] shadow-2xl pointer-events-auto text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--status-success)] shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="font-bold text-[var(--text-high-contrast)]">GIS Live Telemetry Active</span>
        </div>
        <div className="w-[1px] h-4 bg-[var(--border-color)]" />
        <div className="text-[var(--text-secondary)]">
          <strong className="text-[var(--accent-cyan)]">{activeShipmentsCount}</strong> Active Vessels at Sea
        </div>
        <div className="w-[1px] h-4 bg-[var(--border-color)]" />
        <div className="text-[var(--text-secondary)]">
          <strong className="text-[var(--status-warning)]">1</strong> Advisory on Rotterdam
        </div>
      </div>

      {/* Legend at Bottom Right */}
      <div className="absolute bottom-4 right-16 z-10 hidden md:flex items-center gap-4 px-3 py-2 rounded-xl bg-[var(--surface-base)]/90 backdrop-blur-md border border-[var(--border-color)] text-[11px] text-[var(--text-secondary)] shadow-2xl">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Origin Port</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#06B6D4]" />
          <span>Destination</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-[#6366F1]" />
          <span>Active Sea Lane</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          <span>Chokepoint / Warning</span>
        </div>
      </div>
    </div>
  );
}
