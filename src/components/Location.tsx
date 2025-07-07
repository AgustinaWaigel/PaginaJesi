// NUEVO Location.tsx con Leaflet centrado en Hospital de Paraná + lugares destacados
import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix para íconos rotos en Leaflet + Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface CustomMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  icon: string;
}

const hospitalLocation: [number, number] = [-31.7446, -60.5116]; // Hospital San Martín - Paraná

const nearbyPlaces: CustomMarker[] = [
  {
    id: 'farmacia',
    position: [-31.7442, -60.5100],
    title: 'Farmacia Central',
    description: 'A 1 cuadra del hospital',
    icon: '🏪',
  },
  {
    id: 'colectivo',
    position: [-31.7452, -60.5122],
    title: 'Parada de Colectivo',
    description: 'Línea 6 - acceso al centro',
    icon: '🚌',
  },
  {
    id: 'estacionamiento',
    position: [-31.7439, -60.5125],
    title: 'Estacionamiento Público',
    description: 'Gratuito para pacientes',
    icon: '🅿️',
  },
];

const Location: React.FC = () => {
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>([]);
  const [newMarker, setNewMarker] = useState({
    title: '',
    description: '',
    icon: '📍',
  });

  const HandleMapClick = () => {
    useMapEvents({
      click(e) {
        if (newMarker.title) {
          const newCustomMarker: CustomMarker = {
            id: Date.now().toString(),
            position: [e.latlng.lat, e.latlng.lng],
            title: newMarker.title,
            description: newMarker.description,
            icon: newMarker.icon,
          };
          setCustomMarkers((prev) => [...prev, newCustomMarker]);
          setNewMarker({ title: '', description: '', icon: '📍' });
        }
      },
    });
    return null;
  };

  return (
    <section id="ubicacion" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Nuestra Ubicación</h2>
        <p className="section-subtitle">
          Estamos en el corazón de Paraná, cerca de servicios clave para nuestros pacientes.
        </p>

        <div className="h-96 rounded-lg overflow-hidden mb-8">
          <MapContainer center={hospitalLocation} zoom={17} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <HandleMapClick />

            {[...nearbyPlaces, ...customMarkers, {
              id: 'hospital',
              position: hospitalLocation,
              title: 'Hospital San Martín',
              description: 'Tu centro de salud en Paraná',
              icon: '🏥'
            }].map((marker) => (
              <Marker key={marker.id} position={marker.position}>
                <Popup>
                  <strong>{marker.icon} {marker.title}</strong><br />
                  {marker.description}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">Agregar Marcador Personalizado</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              value={newMarker.title}
              onChange={(e) => setNewMarker({ ...newMarker, title: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Título"
            />
            <input
              type="text"
              value={newMarker.description}
              onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Descripción"
            />
            <select
              value={newMarker.icon}
              onChange={(e) => setNewMarker({ ...newMarker, icon: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="📍">📍 Ubicación</option>
              <option value="🏥">🏥 Hospital</option>
              <option value="🚗">🚗 Estacionamiento</option>
              <option value="🏪">🏪 Tienda</option>
              <option value="🍽️">🍽️ Restaurante</option>
              <option value="🚌">🚌 Colectivo</option>
            </select>
            <button
              onClick={() => alert('Hacé clic en el mapa para colocar el marcador')}
              className="bg-blue-600 text-white py-2 rounded-md"
              disabled={!newMarker.title}
            >
              Activar Clic en Mapa
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;