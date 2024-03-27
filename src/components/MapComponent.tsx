import { useEffect, useRef, useContext } from "react";
import mapboxgl from "mapbox-gl";
import fallasData from "./fallas.json"; // Adjust the import path as needed
import { ThemeContext } from "../context/ThemeContext"; // Adjust the import path as needed

// Ensure you have a valid Mapbox access token
const MapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!MapboxAccessToken) {
  throw new Error("Missing Mapbox Access Token");
}

mapboxgl.accessToken = MapboxAccessToken;

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const { isDarkMode } = useContext(ThemeContext)!;

  useEffect(() => {
    if (mapContainerRef.current) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: isDarkMode
          ? "mapbox://styles/mapbox/dark-v10"
          : "mapbox://styles/mapbox/light-v10",
        center: [-0.37739, 39.46975], // Center on Valencia
        zoom: 13,
      });

      map.on("load", () => {
        // Add the 3D buildings layer from Mapbox Streets style
        map.addLayer({
          id: "3d-buildings",
          source: "composite",
          "source-layer": "building",
          filter: ["==", "extrude", "true"],
          type: "fill-extrusion",
          minzoom: 15,
          paint: {
            "fill-extrusion-color": "#aaa",
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "min_height"],
            "fill-extrusion-opacity": 0.6,
          },
        });

        // Loop through the fallas data and add markers
        fallasData.forEach((falla) => {
          if (falla.coordinates.lat !== 0.0 && falla.coordinates.lng !== 0.0) {
            const el = document.createElement("div");
            el.className = "marker";
            el.innerHTML = "📍";

            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>${falla.name}</h3><p>Time: ${falla.time}</p>`,
            );

            new mapboxgl.Marker(el)
              .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
              .setPopup(popup)
              .addTo(map);
          }
        });
      });

      // Cleanup function to remove the map instance when the component unmounts
      return () => map.remove();
    }
  }, [isDarkMode]); // Dependency array includes isDarkMode to reinitialize map on theme change

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default MapComponent;
