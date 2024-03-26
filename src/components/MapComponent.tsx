import React, { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import fallasData from "./fallas.json"; // Adjust the import path as needed

const MapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
if (!MapboxAccessToken) {
  throw new Error("Missing Mapbox Access Token");
}

mapboxgl.accessToken = MapboxAccessToken;

const MapComponent: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mapContainerRef.current !== null) {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [-0.37739, 39.46975], // Centering the map on Valencia
        zoom: 13,
      });

      map.on("load", () => {
        fallasData.forEach((falla: any) => {
          console.log(falla);
          // Check if coordinates are valid (not 0.0 for both lat and lng)
          if (falla.coordinates.lat !== 0.0 && falla.coordinates.lng !== 0.0) {
            const el = document.createElement("div");
            el.className = "marker";
            el.innerHTML = "📍";
            // Popup for displaying the name and time
            const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<h3>${falla.name}</h3><p>Time: ${falla.time}</p>`,
            );

            // Create a marker and add it to the map
            new mapboxgl.Marker(el)
              .setLngLat([falla.coordinates.lng, falla.coordinates.lat])
              .setPopup(popup)
              .addTo(map);
          }
        });
      });

      return () => map.remove();
    }
  }, []);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
  );
};

export default MapComponent;
