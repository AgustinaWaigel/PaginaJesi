// NUEVO Location.tsx con Leaflet centrado en Hospital de Paraná + lugares destacados
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


// Fix para íconos rotos en Leaflet + Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configuración de iconos default
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Función para crear iconos personalizados con emojis
const createCustomIcon = (emoji: string) => {
  return L.divIcon({
    html: `<div style="
      background-color: white;
      border: 2px solid #3B82F6;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    ">${emoji}</div>`,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15],
  });
};

// Icono especial para el hospital
const hospitalIcon = L.divIcon({
  html: `<div style="
    background-color: #DC2626;
    border: 3px solid white;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    color: white;
  ">🏥</div>`,
  className: 'hospital-marker',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

interface CustomMarker {
  id: string;
  position: [number, number];
  title: string;
  description: string;
  icon: string;
}

const hospitalLocation: [number, number] = [-31.7446, -60.5116]; // Hospital San Martín - Paraná

// Clave para localStorage
const MARKERS_STORAGE_KEY = 'hospital-custom-markers';

// Función para cargar marcadores desde localStorage
const loadMarkersFromStorage = (): CustomMarker[] => {
  try {
    const stored = localStorage.getItem(MARKERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error cargando marcadores:', error);
    return [];
  }
};

// Función para guardar marcadores en localStorage
const saveMarkersToStorage = (markers: CustomMarker[]) => {
  try {
    localStorage.setItem(MARKERS_STORAGE_KEY, JSON.stringify(markers));
  } catch (error) {
    console.error('Error guardando marcadores:', error);
  }
};

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
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>(() => loadMarkersFromStorage());
  const [newMarker, setNewMarker] = useState({
    title: '',
    description: '',
    icon: '📍',
  });
  const [isAddingMarker, setIsAddingMarker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>(hospitalLocation);
  const [mapZoom, setMapZoom] = useState(17);

  // Guardar marcadores en localStorage cada vez que cambien
  useEffect(() => {
    saveMarkersToStorage(customMarkers);
  }, [customMarkers]);

  // Función para buscar ubicaciones
  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Paraná, Entre Ríos, Argentina')}&limit=5`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Error buscando ubicación:', error);
      alert('Error al buscar la ubicación');
    } finally {
      setIsSearching(false);
    }
  };

  // Función para ir a una ubicación encontrada
  const goToLocation = (lat: number, lon: number, displayName: string) => {
    setMapCenter([lat, lon]);
    setMapZoom(18);
    setSearchResults([]);
    setSearchQuery(displayName);
  };

  // Función para eliminar un marcador personalizado
  const removeCustomMarker = (markerId: string) => {
    setCustomMarkers(prev => prev.filter(marker => marker.id !== markerId));
  };

  // Función para limpiar todos los marcadores personalizados
  const clearAllMarkers = () => {
    if (confirm('¿Estás seguro de que quieres eliminar TODOS los marcadores personalizados? Esta acción no se puede deshacer.')) {
      setCustomMarkers([]);
    }
  };

  // Función para exportar marcadores a archivo JSON
  const exportMarkers = () => {
    if (customMarkers.length === 0) {
      alert('No hay marcadores para exportar');
      return;
    }

    const dataStr = JSON.stringify(customMarkers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `marcadores-hospital-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Función para importar marcadores desde archivo JSON
  const importMarkers = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedMarkers = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedMarkers)) {
          // Generar nuevos IDs para evitar conflictos
          const markersWithNewIds = importedMarkers.map(marker => ({
            ...marker,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
          }));
          setCustomMarkers(prev => [...prev, ...markersWithNewIds]);
          alert(`Se importaron ${importedMarkers.length} marcadores exitosamente`);
        } else {
          alert('El archivo no tiene el formato correcto');
        }
      } catch (error) {
        alert('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
    // Limpiar el input para permitir reimportar el mismo archivo
    event.target.value = '';
  };

  const HandleMapClick = () => {
    useMapEvents({
      click(e) {
        if (newMarker.title && isAddingMarker) {
          const newCustomMarker: CustomMarker = {
            id: Date.now().toString(),
            position: [e.latlng.lat, e.latlng.lng],
            title: newMarker.title,
            description: newMarker.description,
            icon: newMarker.icon,
          };
          setCustomMarkers((prev) => [...prev, newCustomMarker]);
          setNewMarker({ title: '', description: '', icon: '📍' });
          setIsAddingMarker(false);
          alert(`Marcador "${newMarker.title}" agregado exitosamente!`);
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
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <HandleMapClick />

            {/* Marcadores de lugares cercanos */}
            {nearbyPlaces.map((marker) => (
              <Marker 
                key={marker.id} 
                position={marker.position}
                icon={createCustomIcon(marker.icon)}
              >
                <Popup>
                  <strong>{marker.icon} {marker.title}</strong><br />
                  {marker.description}
                </Popup>
              </Marker>
            ))}

            {/* Marcadores personalizados del usuario */}
            {customMarkers.map((marker) => (
              <Marker 
                key={marker.id} 
                position={marker.position}
                icon={createCustomIcon(marker.icon)}
              >
                <Popup>
                  <div>
                    <strong>{marker.icon} {marker.title}</strong><br />
                    {marker.description}<br />
                    <button 
                      onClick={() => removeCustomMarker(marker.id)}
                      className="mt-2 bg-red-500 text-white px-2 py-1 text-xs rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Marcador del hospital */}
            <Marker position={hospitalLocation} icon={hospitalIcon}>
              <Popup>
                <strong>🏥 Hospital San Martín</strong><br />
                Tu centro de salud en Paraná
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* Controles de búsqueda */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">🔍 Buscar Ubicación</h3>
            <button
              onClick={() => {
                setMapCenter(hospitalLocation);
                setMapZoom(17);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm"
            >
              🏥 Volver al Hospital
            </button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchLocation()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Buscar dirección, lugar o punto de interés en Paraná..."
              />
            </div>
            <button
              onClick={searchLocation}
              disabled={!searchQuery.trim() || isSearching}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          
          {/* Resultados de búsqueda */}
          {searchResults.length > 0 && (
            <div className="mt-4 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => goToLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-800">{result.display_name}</div>
                  <div className="text-sm text-gray-500">Lat: {result.lat}, Lon: {result.lon}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controles para agregar marcadores */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">📍 Agregar Marcador Personalizado</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input
              type="text"
              value={newMarker.title}
              onChange={(e) => setNewMarker({ ...newMarker, title: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Título del marcador"
            />
            <input
              type="text"
              value={newMarker.description}
              onChange={(e) => setNewMarker({ ...newMarker, description: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descripción"
            />
            <select
              value={newMarker.icon}
              onChange={(e) => setNewMarker({ ...newMarker, icon: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="📍">📍 Ubicación General</option>
              <option value="🏥">🏥 Centro Médico</option>
              <option value="🚗">🚗 Estacionamiento</option>
              <option value="🏪">🏪 Tienda/Comercio</option>
              <option value="🍽️">🍽️ Restaurante</option>
              <option value="🚌">🚌 Transporte Público</option>
              <option value="⛽">⛽ Estación de Servicio</option>
              <option value="🏦">🏦 Banco/Cajero</option>
              <option value="🏫">🏫 Institución</option>
              <option value="🎯">🎯 Punto de Interés</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                if (!newMarker.title.trim()) {
                  alert('Por favor, ingresa un título para el marcador');
                  return;
                }
                setIsAddingMarker(true);
                alert('Modo agregar marcador activado. Haz clic en el mapa donde quieras colocar el marcador.');
              }}
              disabled={!newMarker.title.trim()}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                isAddingMarker 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white'
              }`}
            >
              {isAddingMarker ? '✅ Haz clic en el mapa' : '🎯 Activar Modo Agregar'}
            </button>
            
            {isAddingMarker && (
              <button
                onClick={() => {
                  setIsAddingMarker(false);
                  setNewMarker({ title: '', description: '', icon: '📍' });
                }}
                className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Lista de marcadores personalizados */}
        {customMarkers.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">📋 Tus Marcadores Personalizados ({customMarkers.length})</h3>
              <div className="flex gap-2">
                <button
                  onClick={exportMarkers}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  title="Exportar marcadores a archivo JSON"
                >
                  📥 Exportar
                </button>
                <button
                  onClick={clearAllMarkers}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  title="Eliminar todos los marcadores"
                >
                  🗑️ Limpiar Todo
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {customMarkers.map((marker) => (
                <div key={marker.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{marker.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{marker.title}</div>
                      <div className="text-sm text-gray-500">{marker.description}</div>
                      <div className="text-xs text-gray-400">
                        Lat: {marker.position[0].toFixed(6)}, Lon: {marker.position[1].toFixed(6)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de que quieres eliminar "${marker.title}"?`)) {
                        removeCustomMarker(marker.id);
                      }
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gestión de datos */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">💾 Gestión de Marcadores</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Importar Marcadores</h4>
              <p className="text-sm text-gray-500">
                Carga marcadores desde un archivo JSON exportado previamente
              </p>
              <input
                type="file"
                accept=".json"
                onChange={importMarkers}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">Estado Actual</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p>📍 Marcadores guardados: <strong>{customMarkers.length}</strong></p>
                <p>💾 Guardado automático: <strong>Activado</strong></p>
                <p>🔄 Persistencia: <strong>localStorage del navegador</strong></p>
              </div>
            </div>
          </div>
          {customMarkers.length === 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                ℹ️ No tienes marcadores personalizados guardados. Agrega algunos usando el formulario de arriba y se guardarán automáticamente en tu navegador.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Location;