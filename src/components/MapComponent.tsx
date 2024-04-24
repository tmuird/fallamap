import {useEffect, useRef, useContext, useState} from "react";
import mapboxgl from "mapbox-gl";
import { ThemeContext } from "../context/ThemeContext";
import { PopupContent } from "./ui/PopupContent";
import AnimatedPopup from "mapbox-gl-animated-popup";
import { createRoot } from "react-dom/client";

const MapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

if (!MapboxAccessToken) {
  throw new Error("Missing Mapbox Access Token");
}

mapboxgl.accessToken = MapboxAccessToken;

interface Falla {
  number: string;
  name: string;
  time: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

const MapComponent = () => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // @ts-ignore
  const { isDarkMode } = useContext(ThemeContext);
  const [fallasData, setFallasData] = useState([]);
  useEffect(() => {
    // Fetch the Falla data from the API
    fetch("http://localhost:3000/api/fallas") // Update the API URL if needed
        .then((response) => response.json())
        .then((data) => {
          setFallasData(data);
        })
        .catch((error) => {
          console.error("Error fetching Falla data:", error);
        });
  }, []);

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
        // map.addLayer({
        //   id: "3d-buildings",
        //   source: "composite",
        //   "source-layer": "building",
        //   filter: ["==", "extrude", "true"],
        //   type: "fill-extrusion",
        //   minzoom: 15,
        //   paint: {
        //     "fill-extrusion-color": "#aaa",
        //     "fill-extrusion-height": ["get", "height"],
        //     "fill-extrusion-base": ["get", "min_height"],
        //     "fill-extrusion-opacity": 0.6,
        //   },
        // });

        // Loop through the fallas data and add markers
        fallasData.forEach((falla: Falla) => {
          if (falla.coordinates.lat !== 0.0 && falla.coordinates.lng !== 0.0) {
            const el = document.createElement("div");
            el.className = "marker";

            el.style.backgroundImage = `url('https://img.icons8.com/color/48/000000/marker.png')`;

            const popupNode = document.createElement("div");
            const popup = new AnimatedPopup({ offset: 25, className: 'custom-popup' }).setDOMContent(popupNode);

            const root = createRoot(popupNode);
            root.render(<PopupContent falla={falla} />);

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
  }, [isDarkMode, fallasData]); // Dependency array includes isDarkMode to reinitialize map on theme change

  return (
    <div className="map-flex flex">
      <div ref={mapContainerRef} style={{ width: "100%", height: "100vh" }} />
    </div>
  );
};

export default MapComponent;
