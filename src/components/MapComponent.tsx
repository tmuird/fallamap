// src/components/MapComponent.tsx
import  { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = 'pk.eyJ1IjoidG11aXJkIiwiYSI6ImNsdTA1OTNnazA2c2kyaXFzZmw1Zjk5NXYifQ.dZpsVkLriajtpVNL9ROskg';

const MapComponent = () => {
    const mapContainerRef = useRef(null);

    useEffect(() => {
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11', // Map style
            center: [-0.37739, 39.46975], // Initial position [lng, lat] for Valencia
            zoom: 12,
        });

        return () => map.remove();
    }, []);

    return <div ref={mapContainerRef} style={{ height: '100vh', width: '100%' }} />;
};

export default MapComponent;
