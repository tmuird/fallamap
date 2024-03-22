import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
mapboxgl.accessToken = 'pk.eyJ1IjoidG11aXJkIiwiYSI6ImNsdTA1OTNnazA2c2kyaXFzZmw1Zjk5NXYifQ.dZpsVkLriajtpVNL9ROskg';
const MapComponent: React.FC = () => {
    const mapContainerRef = useRef<HTMLDivElement>(null); // This ref is potentially null

    useEffect(() => {
        // Check that the ref is not null before using it
        if (mapContainerRef.current !== null) {
            // Now TypeScript knows mapContainerRef.current is not null
            const map = new mapboxgl.Map({
                container: mapContainerRef.current, // Safe to use here
                style: 'mapbox://styles/mapbox/streets-v11',
                center: [-0.37739, 39.46975],
                zoom: 9,
            });

            // Additional map setup (events, markers, etc.)

            // Cleanup function to remove map on component unmount
            return () => map.remove();
        }
    }, []); // Dependency array is empty, so this effect runs once after initial render

    return <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }} />;
};

export default MapComponent;
