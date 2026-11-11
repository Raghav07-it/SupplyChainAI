import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
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
  SlidersHorizontal,
  Navigation,
  Globe,
  Sun,
  Moon,
} from "lucide-react";

// Standard Port Coordinate Registry (lng, lat) for MapLibre GeoJSON order
export const PORT_GEO_COORDINATES = {
  // Western & Mediterranean Ports
  "Port of Valencia (Spain)": [-0.32, 39.45],
  "Valencia (ES)": [-0.32, 39.45],
  "Valencia": [-0.32, 39.45],
  "Port of New York / New Jersey": [-74.04, 40.68],
  "New York (US)": [-74.04, 40.68],
  "New York": [-74.04, 40.68],
  "Port of Rotterdam (Netherlands)": [4.13, 51.95],
  "Rotterdam (NL)": [4.13, 51.95],
  "Rotterdam": [4.13, 51.95],
  "Port of Marseille (France)": [5.37, 43.30],
  "Marseille (FR)": [5.37, 43.30],
  "Marseille": [5.37, 43.30],
  "Port of Felixstowe (UK)": [1.35, 51.96],
  "Felixstowe (UK)": [1.35, 51.96],
  "Felixstowe": [1.35, 51.96],
  "Port of Hamburg (Germany)": [9.97, 53.53],
  "Hamburg (DE)": [9.97, 53.53],
  "Hamburg": [9.97, 53.53],
  "Port of Antwerp (Belgium)": [4.40, 51.22],
  "Antwerp (BE)": [4.40, 51.22],
  "Antwerp": [4.40, 51.22],

  // Asian & Middle East Hubs
  "Port of Ningbo-Zhoushan (China)": [121.55, 29.87],
  "Ningbo (CN)": [121.55, 29.87],
  "Ningbo": [121.55, 29.87],
  "Port of Qingdao (China)": [120.38, 36.06],
  "Qingdao (CN)": [120.38, 36.06],
  "Qingdao": [120.38, 36.06],
  "Port of Shanghai (China)": [121.47, 31.23],
  "Shanghai (CN)": [121.47, 31.23],
  "Shanghai": [121.47, 31.23],
  "Port of Singapore (Singapore)": [103.85, 1.29],
  "Singapore (SG)": [103.85, 1.29],
  "Singapore": [103.85, 1.29],
  "Port of Jebel Ali (Dubai, UAE)": [55.06, 25.01],
  "Dubai (AE)": [55.06, 25.01],
  "Dubai": [55.06, 25.01],
  "Port of Jawaharlal Nehru (Mumbai, India)": [72.95, 18.95],
  "Mumbai (IN)": [72.95, 18.95],
  "Mumbai": [72.95, 18.95],
  "Port of Busan (South Korea)": [129.04, 35.10],
  "Busan (KR)": [129.04, 35.10],
  "Busan": [129.04, 35.10],
  "Port of Hong Kong": [114.17, 22.32],
  "Hong Kong": [114.17, 22.32],
  "Port of Tokyo (Japan)": [139.77, 35.65],
  "Tokyo": [139.77, 35.65],
  "Port of Colombo (Sri Lanka)": [79.86, 6.94],
  "Colombo": [79.86, 6.94],

  // Americas & Oceania
  "Port of Los Angeles (US)": [-118.27, 33.74],
  "Los Angeles": [-118.27, 33.74],
  "Port of Long Beach (US)": [-118.22, 33.77],
  "Port of Santos (Brazil)": [-46.33, -23.96],
  "Santos (BR)": [-46.33, -23.96],
  "Port of Sydney (Australia)": [151.21, -33.87],
  "Port of Cape Town (South Africa)": [18.42, -33.92],
};

export const STRATEGIC_CHOKEPOINTS = [
  {
    id: "choke-red-sea",
    name: "Bab-el-Mandeb / Southern Red Sea",
    lngLat: [43.33, 12.58],
    type: "conflict_zone",
    severity: "critical",
    status: "Rerouting Active",
    description: "Anti-ship maritime advisories in effect. Major carriers routing via Cape of Good Hope (+10-14 days transit).",
    affectedCorridors: "Asia → Mediterranean / North Europe",
  },
  {
    id: "choke-suez",
    name: "Suez Canal Transit Corridor",
    lngLat: [32.56, 30.58],
    type: "canal_transit",
    severity: "medium",
    status: "Restricted Convoys",
    description: "Suez Northbound & Southbound convoy booking restrictions in effect. Draft limits normal at 66ft.",
    affectedCorridors: "Red Sea / Mediterranean",
  },
  {
    id: "choke-panama",
    name: "Panama Canal Transit System",
    lngLat: [-79.69, 9.10],
    type: "canal_transit",
    severity: "low",
    status: "Normal Operations",
    description: "Lake Gatun water levels stabilized. 34 daily transit slots active. Neo-Panamax draft at 48 feet.",
    affectedCorridors: "Transpacific → US East Coast",
  },
  {
    id: "choke-malacca",
    name: "Strait of Malacca / Singapore Corridor",
    lngLat: [101.50, 2.50],
    type: "dense_transit",
    severity: "low",
    status: "Optimal Velocity",
    description: "Clear weather, traffic flow normal with 12-hour turnaround velocity. No vessel backlogs detected.",
    affectedCorridors: "East Asia / Southeast Asia / Indian Ocean",
  },
  {
    id: "choke-hormuz",
    name: "Strait of Hormuz Corridor",
    lngLat: [56.45, 26.56],
    type: "dense_transit",
    severity: "medium",
    status: "Heightened Watch",
    description: "Naval escort monitoring active. AIS transmission mandatory for all commercial bulk & container fleets.",
    affectedCorridors: "Persian Gulf / Arabian Sea",
  },
  {
    id: "choke-gibraltar",
    name: "Strait of Gibraltar Chokepoint",
    lngLat: [-5.60, 35.96],
    type: "dense_transit",
    severity: "low",
    status: "Normal Operations",
    description: "High traffic density between Atlantic & Mediterranean. Vessel traffic services operating without delays.",
    affectedCorridors: "Atlantic Ocean / Mediterranean Sea",
  },
];

// Coordinate resolver: returns [lng, lat]
export function resolveCoordinates(portName) {
  if (!portName) return null;
  const trimmed = portName.trim();
  if (PORT_GEO_COORDINATES[trimmed]) return PORT_GEO_COORDINATES[trimmed];

  const lower = trimmed.toLowerCase();
  for (const [key, coords] of Object.entries(PORT_GEO_COORDINATES)) {
    if (lower.includes(key.toLowerCase()) || key.toLowerCase().includes(lower)) {
      return coords;
    }
  }

  // Token matching
  const tokens = lower.split(/[\s,\(\)]+/).filter((t) => t.length > 3);
  for (const token of tokens) {
    for (const [key, coords] of Object.entries(PORT_GEO_COORDINATES)) {
      if (key.toLowerCase().includes(token)) {
        return coords;
      }
    }
  }

  return null;
}

// Generates curved great-circle style arc between [lng1, lat1] and [lng2, lat2]
function generateArcPoints(start, end, steps = 60) {
  const [lng1, lat1] = start;
  const [lng2, lat2] = end;
  const points = [];

  let dLng = lng2 - lng1;
  // Handle antimeridian wrap
  if (dLng > 180) dLng -= 360;
  if (dLng < -180) dLng += 360;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const curLng = lng1 + dLng * t;
    // Arching calculation: elevate latitude towards equator or pole
    const chordDist = Math.hypot(dLng, lat2 - lat1);
    const archLift = Math.sin(Math.PI * t) * Math.min(18, chordDist * 0.15);
    const curLat = lat1 + (lat2 - lat1) * t + (lat1 + lat2 > 0 ? archLift : -archLift);
    points.push([curLng, Math.max(-85, Math.min(85, curLat))]);
  }
  return points;
}

export default function GlobalLogisticsMap({
  shipments = [],
  disruptions = [],
  selectedShipment = null,
  selectedShipmentId = null,
  onSelectShipment = null,
  height = "560px",
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  // UI state
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showShipments, setShowShipments] = useState(true);
  const [showDisruptions, setShowDisruptions] = useState(true);
  const [showChokepoints, setShowChokepoints] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [darkTheme, setDarkTheme] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeLegend, setActiveLegend] = useState(true);

  // Resolved active selection
  const effectiveSelected =
    selectedShipment ||
    (selectedShipmentId
      ? shipments.find((s) => s.id === selectedShipmentId)
      : null);

  // Fallback demo shipments if user has no shipments yet
  const effectiveShipments = shipments.length > 0 ? shipments : [
    {
      id: "DEMO-01",
      tracking_number: "CS-RTM-SIN-901",
      origin_port: "Port of Singapore (Singapore)",
      destination_port: "Port of Rotterdam (Netherlands)",
      carrier: "Maersk Line",
      status: "in_transit",
      cargo: "Advanced Microelectronics",
      estimated_arrival: "2026-11-24",
      progress: 0.62,
    },
    {
      id: "DEMO-02",
      tracking_number: "CS-NGB-VAL-402",
      origin_port: "Port of Ningbo-Zhoushan (China)",
      destination_port: "Port of Valencia (Spain)",
      carrier: "CMA CGM",
      status: "delayed",
      cargo: "Automotive Precision Parts",
      estimated_arrival: "2026-12-02",
      progress: 0.38,
    },
    {
      id: "DEMO-03",
      tracking_number: "CS-BOM-DXB-108",
      origin_port: "Port of Jawaharlal Nehru (Mumbai, India)",
      destination_port: "Port of Jebel Ali (Dubai, UAE)",
      carrier: "Hapag-Lloyd",
      status: "in_transit",
      cargo: "Organic Pharmaceuticals",
      estimated_arrival: "2026-11-18",
      progress: 0.85,
    },
  ];

  // Initialize MapLibre GL with OpenFreeMap Liberty Style
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      // 100% Free OpenFreeMap Liberty vector tile style (no AI API key, no tokens required)
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [25, 22],
      zoom: 1.9,
      minZoom: 1.2,
      maxZoom: 18,
      attributionControl: false,
    });

    // Add navigation controls (zoom, compass, pitch)
    map.addControl(
      new maplibregl.NavigationControl({
        showCompass: true,
        visualizePitch: true,
      }),
      "top-right"
    );

    // Add clean attribution
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: "© <a href='https://openfreemap.org' target='_blank' rel='noopener'>OpenFreeMap</a> / <a href='https://openstreetmap.org' target='_blank' rel='noopener'>OpenStreetMap</a>",
      }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
      // Add empty GeoJSON sources for shipment routes
      if (!map.getSource("shipment-routes")) {
        map.addSource("shipment-routes", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        // Background glow layer for active routes
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "shipment-routes",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ["get", "glowColor"],
            "line-width": 6,
            "line-opacity": 0.35,
            "line-blur": 3,
          },
        });

        // Foreground crisp route line
        map.addLayer({
          id: "route-lines",
          type: "line",
          source: "shipment-routes",
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          paint: {
            "line-color": ["get", "strokeColor"],
            "line-width": 2.5,
            "line-dasharray": ["case", ["==", ["get", "isDelayed"], true], ["literal", [3, 2]], ["literal", [1, 0]]],
          },
        });
      }
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Route GeoJSON Features and HTML Markers whenever filters or data change
  const renderMapLayers = useCallback(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const routeFeatures = [];

    // 1. SHIPMENTS LAYER
    if (showShipments) {
      effectiveShipments.forEach((s) => {
        const rawStatus = (s.status || "").toLowerCase().replace("_", " ");
        if (
          statusFilter !== "all" &&
          !rawStatus.includes(statusFilter.toLowerCase())
        ) {
          return;
        }

        const originCoords = resolveCoordinates(s.origin_port);
        const destCoords = resolveCoordinates(s.destination_port);

        if (!originCoords || !destCoords) return;

        const isDelayed =
          rawStatus.includes("delay") || rawStatus.includes("alert");
        const strokeColor = isDelayed
          ? "#EF4444" // red
          : rawStatus.includes("transit") || rawStatus.includes("active")
          ? "#06B6D4" // cyan
          : "#10B981"; // green

        const glowColor = isDelayed ? "#F87171" : "#38BDF8";

        // Generate curved route arc
        const arc = generateArcPoints(originCoords, destCoords, 50);

        routeFeatures.push({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: arc,
          },
          properties: {
            shipmentId: s.id,
            tracking: s.tracking_number,
            strokeColor,
            glowColor,
            isDelayed,
          },
        });

        // Origin Marker (Cyan Hub)
        const originEl = document.createElement("div");
        originEl.className = "cs-origin-marker";
        originEl.style.cssText = `
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #06B6D4;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 12px rgba(6, 182, 212, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        originEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><circle cx="12" cy="12" r="10"/></svg>`;

        const originPopup = new maplibregl.Popup({
          offset: 14,
          className: "cs-dark-map-popup",
        }).setHTML(`
          <div style="background:#111827; color:#F8FAFC; padding:12px; border-radius:10px; font-family:sans-serif; min-width:210px; border:1px solid #374151;">
            <div style="font-size:11px; text-transform:uppercase; color:#38BDF8; font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">Shipment Origin Port</div>
            <div style="font-size:14px; font-weight:700; margin-bottom:6px;">${s.origin_port}</div>
            <div style="font-size:12px; color:#9CA3AF; margin-bottom:8px;">Tracking: <span style="color:#FFFFFF; font-weight:600;">${s.tracking_number || "CS-" + s.id}</span></div>
            <div style="font-size:11px; background:#1F2937; padding:6px 8px; border-radius:6px; color:#E5E7EB;">
              Carrier: <strong>${s.carrier || "Global Maritime"}</strong>
            </div>
          </div>
        `);

        const mOrigin = new maplibregl.Marker({ element: originEl })
          .setLngLat(originCoords)
          .setPopup(originPopup)
          .addTo(map);
        markersRef.current.push(mOrigin);

        // Destination Marker (Indigo Hub)
        const destEl = document.createElement("div");
        destEl.className = "cs-dest-marker";
        destEl.style.cssText = `
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #6366F1;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 12px rgba(99, 102, 241, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        destEl.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>`;

        const destPopup = new maplibregl.Popup({
          offset: 14,
          className: "cs-dark-map-popup",
        }).setHTML(`
          <div style="background:#111827; color:#F8FAFC; padding:12px; border-radius:10px; font-family:sans-serif; min-width:210px; border:1px solid #374151;">
            <div style="font-size:11px; text-transform:uppercase; color:#818CF8; font-weight:700; letter-spacing:0.05em; margin-bottom:4px;">Destination Terminal</div>
            <div style="font-size:14px; font-weight:700; margin-bottom:6px;">${s.destination_port}</div>
            <div style="font-size:12px; color:#9CA3AF; margin-bottom:8px;">Cargo: <span style="color:#FFFFFF; font-weight:600;">${s.cargo || "Containerized Freight"}</span></div>
            <div style="font-size:11px; background:#1F2937; padding:6px 8px; border-radius:6px; color:#E5E7EB;">
              ETA: <strong>${s.estimated_arrival || "In Transit"}</strong>
            </div>
          </div>
        `);

        const mDest = new maplibregl.Marker({ element: destEl })
          .setLngLat(destCoords)
          .setPopup(destPopup)
          .addTo(map);
        markersRef.current.push(mDest);

        // Vessel in transit marker (along the arc)
        const progress = typeof s.progress === "number" ? s.progress : 0.55;
        const vesselIdx = Math.floor(arc.length * progress);
        const vesselCoords = arc[vesselIdx] || arc[Math.floor(arc.length / 2)];

        const vesselEl = document.createElement("div");
        vesselEl.style.cssText = `
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: ${isDelayed ? "#EF4444" : "#10B981"};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 14px ${isDelayed ? "rgba(239, 68, 68, 0.9)" : "rgba(16, 185, 129, 0.9)"};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        vesselEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/></svg>`;

        const vesselPopup = new maplibregl.Popup({
          offset: 14,
          className: "cs-dark-map-popup",
        }).setHTML(`
          <div style="background:#0F172A; color:#F8FAFC; padding:14px; border-radius:12px; font-family:sans-serif; min-width:230px; border:1px solid #334155; box-shadow:0 10px 25px rgba(0,0,0,0.5);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:11px; text-transform:uppercase; color:#38BDF8; font-weight:700;">Live AIS Tracking</span>
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700; background:${isDelayed ? "rgba(239,68,68,0.2); color:#F87171;" : "rgba(16,185,129,0.2); color:#34D399;"}">
                ${isDelayed ? "● Delay Notice" : "● On Schedule"}
              </span>
            </div>
            <div style="font-size:15px; font-weight:800; color:#FFFFFF; margin-bottom:4px;">${s.tracking_number || "CS-" + s.id}</div>
            <div style="font-size:12px; color:#CBD5E1; margin-bottom:8px;">
              ${s.origin_port.split("(")[0]} → ${s.destination_port.split("(")[0]}
            </div>
            <div style="font-size:11px; line-height:1.5; color:#94A3B8; background:#1E293B; padding:8px 10px; border-radius:8px;">
              Status: <strong style="color:#F1F5F9;">${rawStatus.toUpperCase()}</strong><br/>
              Progress: <strong style="color:#38BDF8;">${Math.round(progress * 100)}% through corridor</strong>
            </div>
          </div>
        `);

        const mVessel = new maplibregl.Marker({ element: vesselEl })
          .setLngLat(vesselCoords)
          .setPopup(vesselPopup)
          .addTo(map);
        markersRef.current.push(mVessel);
      });
    }

    // Update GeoJSON source
    const routeSource = map.getSource("shipment-routes");
    if (routeSource) {
      routeSource.setData({
        type: "FeatureCollection",
        features: routeFeatures,
      });
    }

    // 2. STRATEGIC CHOKEPOINTS & MARITIME HUBS LAYER
    if (showChokepoints) {
      STRATEGIC_CHOKEPOINTS.forEach((cp) => {
        const isCritical = cp.severity === "critical";
        const isMed = cp.severity === "medium";

        const bg = isCritical ? "#EF4444" : isMed ? "#F59E0B" : "#3B82F6";

        const cpEl = document.createElement("div");
        cpEl.style.cssText = `
          width: 24px;
          height: 24px;
          border-radius: 6px;
          background: ${bg};
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 12px ${bg};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        `;
        cpEl.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.5"><polygon points="12 2 19 21 12 17 5 21 12 2"/></svg>`;

        const cpPopup = new maplibregl.Popup({
          offset: 14,
          className: "cs-dark-map-popup",
        }).setHTML(`
          <div style="background:#0F172A; color:#F8FAFC; padding:14px; border-radius:12px; font-family:sans-serif; min-width:240px; border:1px solid #334155;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; text-transform:uppercase; color:#94A3B8; font-weight:700;">Strategic Chokepoint</span>
              <span style="font-size:10px; padding:2px 6px; border-radius:4px; font-weight:700; background:${isCritical ? "rgba(239,68,68,0.2); color:#F87171;" : "rgba(245,158,11,0.2); color:#FBBF24;"}">
                ${cp.status}
              </span>
            </div>
            <div style="font-size:14px; font-weight:800; color:#FFFFFF; margin-bottom:4px;">${cp.name}</div>
            <div style="font-size:12px; color:#E2E8F0; line-height:1.4; margin-bottom:8px;">${cp.description}</div>
            <div style="font-size:11px; color:#94A3B8; border-top:1px solid #334155; padding-top:6px;">
              Corridors: <span style="color:#38BDF8;">${cp.affectedCorridors}</span>
            </div>
          </div>
        `);

        const mCp = new maplibregl.Marker({ element: cpEl })
          .setLngLat(cp.lngLat)
          .setPopup(cpPopup)
          .addTo(map);
        markersRef.current.push(mCp);
      });
    }

    // 3. DISRUPTIONS & INCIDENTS LAYER
    if (showDisruptions && disruptions.length > 0) {
      disruptions.forEach((d) => {
        const rawSev = (d.severity || "medium").toLowerCase();
        if (severityFilter !== "all" && rawSev !== severityFilter.toLowerCase()) {
          return;
        }

        // Resolve location
        let coords = null;
        if (d.longitude && d.latitude) {
          coords = [Number(d.longitude), Number(d.latitude)];
        } else if (d.port) {
          coords = resolveCoordinates(d.port);
        } else if (d.port_code) {
          coords = resolveCoordinates(d.port_code);
        } else if (d.port_name) {
          coords = resolveCoordinates(d.port_name);
        }

        if (!coords) return;

        const isCrit = rawSev === "critical";
        const isHi = rawSev === "high";
        const iconColor = isCrit ? "#EF4444" : isHi ? "#F97316" : "#EAB308";

        const dEl = document.createElement("div");
        dEl.style.cssText = `
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: rgba(15, 23, 42, 0.9);
          border: 2px solid ${iconColor};
          box-shadow: 0 0 16px ${iconColor};
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          animation: pulse 2s infinite;
        `;
        dEl.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${iconColor}" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

        const dPopup = new maplibregl.Popup({
          offset: 14,
          className: "cs-dark-map-popup",
        }).setHTML(`
          <div style="background:#0F172A; color:#F8FAFC; padding:14px; border-radius:12px; font-family:sans-serif; min-width:240px; border:1px solid #334155;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
              <span style="font-size:11px; text-transform:uppercase; color:${iconColor}; font-weight:800;">● ${rawSev.toUpperCase()} ALERT</span>
              <span style="font-size:10px; color:#94A3B8;">${d.status || "Active"}</span>
            </div>
            <div style="font-size:14px; font-weight:800; color:#FFFFFF; margin-bottom:4px;">${d.title || d.description || "Maritime Disruption"}</div>
            <div style="font-size:12px; color:#E2E8F0; line-height:1.4; margin-bottom:8px;">${d.description || ""}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; font-size:11px; background:#1E293B; padding:8px; border-radius:6px;">
              <div>Delay: <strong style="color:#F87171;">~${d.delay_hours || d.estimated_delay_hours || 24}h</strong></div>
              <div>Impact: <strong style="color:#FBBF24;">$${(d.cost_impact || d.estimated_cost_impact_usd || 0).toLocaleString()}</strong></div>
            </div>
          </div>
        `);

        const mD = new maplibregl.Marker({ element: dEl })
          .setLngLat(coords)
          .setPopup(dPopup)
          .addTo(map);
        markersRef.current.push(mD);
      });
    }
  }, [
    mapLoaded,
    showShipments,
    showDisruptions,
    showChokepoints,
    statusFilter,
    severityFilter,
    effectiveShipments,
    disruptions,
  ]);

  useEffect(() => {
    renderMapLayers();
  }, [renderMapLayers]);

  // Center on selected shipment if passed
  useEffect(() => {
    if (!effectiveSelected || !mapRef.current) return;
    const originCoords = resolveCoordinates(effectiveSelected.origin_port);
    const destCoords = resolveCoordinates(effectiveSelected.destination_port);

    if (originCoords && destCoords) {
      const bounds = new maplibregl.LngLatBounds(originCoords, destCoords);
      mapRef.current.fitBounds(bounds, { padding: 80, maxZoom: 6, duration: 1200 });
    } else if (originCoords) {
      mapRef.current.flyTo({ center: originCoords, zoom: 4.5, duration: 1200 });
    }
  }, [effectiveSelected]);

  // Reset view to world perspective
  const handleResetView = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({ center: [25, 22], zoom: 1.9, pitch: 0, bearing: 0, duration: 1000 });
  };

  return (
    <div
      className={`cs-card relative overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen w-screen" : "w-full"
      }`}
    >
      {/* Top Map Control Bar */}
      <div className="p-3 sm:p-4 bg-[var(--surface-base)] border-b border-[var(--border-color)] flex flex-wrap items-center justify-between gap-3">
        {/* Left: Layer Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowShipments(!showShipments)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showShipments
                ? "bg-[rgba(6,182,212,0.18)] text-[var(--accent-cyan-light)] border border-[rgba(6,182,212,0.35)]"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-transparent opacity-60"
            }`}
          >
            <Ship size={14} />
            Shipments ({effectiveShipments.length})
          </button>

          <button
            type="button"
            onClick={() => setShowDisruptions(!showDisruptions)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showDisruptions
                ? "bg-[rgba(239,68,68,0.18)] text-red-400 border border-[rgba(239,68,68,0.35)]"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-transparent opacity-60"
            }`}
          >
            <AlertTriangle size={14} />
            Disruptions ({disruptions.length})
          </button>

          <button
            type="button"
            onClick={() => setShowChokepoints(!showChokepoints)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showChokepoints
                ? "bg-[rgba(99,102,241,0.18)] text-[var(--accent-primary-light)] border border-[rgba(99,102,241,0.35)]"
                : "bg-[var(--surface-overlay)] text-[var(--text-secondary)] border border-transparent opacity-60"
            }`}
          >
            <Anchor size={14} />
            Chokepoints (6)
          </button>
        </div>

        {/* Right: Status Filters & Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="cs-select text-xs py-1 px-2.5 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-color)] focus:outline-none"
            title="Filter by shipment status"
          >
            <option value="all">All Statuses</option>
            <option value="transit">In Transit</option>
            <option value="delayed">Delayed</option>
            <option value="delivered">Delivered</option>
          </select>

          {/* Severity Dropdown */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="cs-select text-xs py-1 px-2.5 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-high-contrast)] border border-[var(--border-color)] focus:outline-none"
            title="Filter disruptions by severity"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Theme Inversion Toggle */}
          <button
            type="button"
            onClick={() => setDarkTheme(!darkTheme)}
            className="p-1.5 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)] transition-colors"
            title={darkTheme ? "Switch to Standard Cartographic View" : "Switch to Cyber Dark Matrix View"}
          >
            {darkTheme ? <Moon size={15} /> : <Sun size={15} />}
          </button>

          {/* Reset View Button */}
          <button
            type="button"
            onClick={handleResetView}
            className="p-1.5 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)] transition-colors"
            title="Reset to Global World View"
          >
            <RefreshCw size={15} />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-secondary)] hover:text-white border border-[var(--border-color)] transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Map"}
          >
            {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="relative w-full" style={{ height: isFullscreen ? "calc(100vh - 65px)" : height }}>
        <div
          ref={mapContainerRef}
          className="w-full h-full"
          style={{
            filter: darkTheme
              ? "invert(92%) hue-rotate(185deg) brightness(88%) contrast(115%)"
              : "none",
            transition: "filter 0.3s ease",
          }}
        />

        {/* Legend Overlay Floating Pill */}
        <div className="absolute bottom-4 left-4 z-10 bg-[#0B132B]/90 backdrop-blur-md border border-[#273B5E] p-3 rounded-xl shadow-xl text-xs space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between gap-3 font-semibold text-white">
            <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[var(--accent-cyan)]">
              <Globe size={13} />
              OpenFreeMap Liberty • 100% Free
            </span>
            <button
              type="button"
              onClick={() => setActiveLegend(!activeLegend)}
              className="text-[10px] text-gray-400 hover:text-white"
            >
              {activeLegend ? "Hide" : "Show"}
            </button>
          </div>

          {activeLegend && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-[11px] text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#06B6D4] ring-2 ring-white/50" />
                <span>Origin Port</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6366F1] ring-2 ring-white/50" />
                <span>Destination Port</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] ring-2 ring-white/50" />
                <span>Vessel En Route</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                <span>Chokepoint Hub</span>
              </div>
              <div className="flex items-center gap-2 col-span-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-pulse" />
                <span>Active Maritime Disruption</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
