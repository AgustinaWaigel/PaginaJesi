import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix para íconos rotos
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

import 'leaflet/dist/leaflet.css';

interface CustomMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  icon?: string;
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  customMarkers: CustomMarker[];
}

const LeafletMap: React.FC<LeafletMapProps> = ({ center, zoom, customMarkers }) => {
  return (
    <MapContainer center={center} zoom={zoom} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {customMarkers.map((marker) => (
        <Marker key={marker.id} position={marker.position} icon={L.icon({
          iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // ícono genérico, podés cambiarlo
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
          shadowSize: [41, 41],
        })}>
          <Popup>
            <strong>{marker.title}</strong><br />
            {marker.description}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
