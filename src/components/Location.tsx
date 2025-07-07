import React, { useEffect, useState } from 'react';
import { Wrapper, Status } from '@googlemaps/react-wrapper';

interface MapComponentProps {
  center: google.maps.LatLngLiteral;
  zoom: number;
  onMapLoad: (map: google.maps.Map) => void;
  customMarkers: CustomMarker[];
}

interface NearbyPlace {
  name: string;
  position: google.maps.LatLngLiteral;
  icon: string;
  description: string;
}

interface CustomMarker {
  id: string;
  position: google.maps.LatLngLiteral;
  title: string;
  description: string;
  icon: string;
}

const MapComponent: React.FC<MapComponentProps> = ({ center, zoom, onMapLoad, customMarkers }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (ref.current && !map) {
      const newMap = new window.google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeId: 'roadmap',
        styles: [
          {
            featureType: 'poi.medical',
            elementType: 'geometry',
            stylers: [{ color: '#ffeaa7' }]
          }
        ]
      });
      setMap(newMap);
      onMapLoad(newMap);
    }
  }, [center, zoom, onMapLoad, map]);

  // Actualizar marcadores personalizados
  useEffect(() => {
    if (map && customMarkers) {
      customMarkers.forEach(marker => {
        const mapMarker = new window.google.maps.Marker({
          position: marker.position,
          map: map,
          title: marker.title,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="15" cy="15" r="15" fill="#3b82f6"/>
                <text x="15" y="20" text-anchor="middle" font-size="12" fill="white">${marker.icon}</text>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(30, 30),
            anchor: new window.google.maps.Point(15, 15)
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 10px; max-width: 200px;">
              <h3 style="margin: 0 0 10px 0; color: #2d3748;">${marker.icon} ${marker.title}</h3>
              <p style="margin: 0; color: #4a5568;">${marker.description}</p>
            </div>
          `
        });

        mapMarker.addListener('click', () => {
          infoWindow.open(map, mapMarker);
        });
      });
    }
  }, [map, customMarkers]);

  return <div ref={ref} style={{ width: '100%', height: '100%' }} />;
};

const Location: React.FC = () => {
  const [customMarkers, setCustomMarkers] = useState<CustomMarker[]>([]);
  const [newMarker, setNewMarker] = useState<{
    title: string;
    description: string;
    icon: string;
  }>({
    title: '',
    description: '',
    icon: '📍'
  });

  // Coordenadas del hospital
  const hospitalLocation: google.maps.LatLngLiteral = { 
    lat: parseFloat(import.meta.env.VITE_HOSPITAL_LAT) || 19.4326, 
    lng: parseFloat(import.meta.env.VITE_HOSPITAL_LNG) || -99.1332 
  };
  
  // Lugares destacados cerca del hospital
  const nearbyPlaces: NearbyPlace[] = [
    {
      name: 'Farmacia Central',
      position: { lat: 19.4328, lng: -99.1330 },
      icon: '🏪',
      description: 'A 200m del hospital'
    },
    {
      name: 'Estación de Autobús',
      position: { lat: 19.4322, lng: -99.1338 },
      icon: '🚌',
      description: 'A 300m del hospital'
    },
    {
      name: 'Banco Nacional',
      position: { lat: 19.4330, lng: -99.1325 },
      icon: '🏦',
      description: 'A 150m del hospital'
    },
    {
      name: 'Estacionamiento',
      position: { lat: 19.4324, lng: -99.1335 },
      icon: '🅿️',
      description: 'Gratuito para pacientes'
    }
  ];

  const handleMapLoad = (mapInstance: google.maps.Map) => {
    // Agregar marcador del hospital
    const hospitalMarker = new window.google.maps.Marker({
      position: hospitalLocation,
      map: mapInstance,
      title: 'Hospital San José',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#e53e3e"/>
            <text x="20" y="26" text-anchor="middle" font-size="16" fill="white">🏥</text>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Agregar info window para el hospital
    const hospitalInfoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; max-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #2d3748;">🏥 Hospital San José</h3>
          <p style="margin: 0; color: #4a5568;">Tu centro de salud de confianza</p>
          <p style="margin: 5px 0 0 0; color: #4a5568; font-size: 12px;">📍 Av. Principal 123, Ciudad</p>
        </div>
      `
    });

    hospitalMarker.addListener('click', () => {
      hospitalInfoWindow.open(mapInstance, hospitalMarker);
    });

    // Agregar marcadores para lugares destacados
    nearbyPlaces.forEach((place) => {
      const marker = new window.google.maps.Marker({
        position: place.position,
        map: mapInstance,
        title: place.name,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="15" cy="15" r="15" fill="#667eea"/>
              <text x="15" y="20" text-anchor="middle" font-size="12" fill="white">${place.icon}</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 15)
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; max-width: 180px;">
            <h4 style="margin: 0 0 5px 0; color: #2d3748;">${place.icon} ${place.name}</h4>
            <p style="margin: 0; color: #4a5568; font-size: 12px;">${place.description}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
    });

    // Permitir agregar marcadores haciendo clic en el mapa
    mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      if (event.latLng && newMarker.title) {
        const position = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        
        const customMarker: CustomMarker = {
          id: Date.now().toString(),
          position,
          title: newMarker.title,
          description: newMarker.description,
          icon: newMarker.icon
        };
        
        setCustomMarkers([...customMarkers, customMarker]);
        
        // Limpiar el formulario
        setNewMarker({
          title: '',
          description: '',
          icon: '📍'
        });
      }
    });
  };

  const render = (status: Status) => {
    switch (status) {
      case Status.LOADING:
        return (
          <div className="flex justify-center items-center h-96 bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-600">Cargando mapa...</div>
            </div>
          </div>
        );
      case Status.FAILURE:
        return (
          <div className="flex justify-center items-center h-96 bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <div className="text-gray-700 mb-4">
                <strong>Vista Simulada del Mapa</strong>
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Para ver el mapa real, configura tu API key de Google Maps en el archivo .env
              </div>
              <div className="bg-white rounded-lg p-4 shadow-md">
                <div className="text-lg font-semibold text-blue-600 mb-2">🏥 Hospital San José</div>
                <div className="text-sm text-gray-600">📍 Av. Principal 123, Ciudad</div>
                <div className="text-sm text-gray-600">📞 +1 (555) 123-4567</div>
              </div>
            </div>
          </div>
        );
      case Status.SUCCESS:
        return (
          <MapComponent
            center={hospitalLocation}
            zoom={16}
            onMapLoad={handleMapLoad}
            customMarkers={customMarkers}
          />
        );
    }
  };

  return (
    <section id="ubicacion" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="section-title">Nuestra Ubicación</h2>
        <p className="section-subtitle">
          Estamos estratégicamente ubicados en el centro de la ciudad, 
          cerca de importantes puntos de referencia para tu comodidad.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-2xl font-semibold mb-6 text-gray-800">Información de Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-2xl">📍</span>
                <span className="text-gray-600">Av. Principal 123, Ciudad</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl">📞</span>
                <span className="text-gray-600">+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl">⏰</span>
                <span className="text-gray-600">Emergencias: 24/7</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-2xl">🕒</span>
                <span className="text-gray-600">Consultas: Lun-Vie 8:00-18:00</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-96">
              <Wrapper
                apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "TU_API_KEY_DE_GOOGLE_MAPS"}
                render={render}
                libraries={['places']}
              />
            </div>
          </div>
        </div>

        {/* Panel de control para marcadores personalizados */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold text-gray-800">Agregar Marcador Personalizado</h3>
            {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === "TU_API_KEY_DE_GOOGLE_MAPS" && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>💡 Tip:</strong> Para usar el mapa real, configura tu API key de Google Maps
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
              <input
                type="text"
                value={newMarker.title}
                onChange={(e) => setNewMarker({...newMarker, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Mi ubicación"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
              <input
                type="text"
                value={newMarker.description}
                onChange={(e) => setNewMarker({...newMarker, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Punto de encuentro"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
              <select
                value={newMarker.icon}
                onChange={(e) => setNewMarker({...newMarker, icon: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="📍">📍 Ubicación</option>
                <option value="🏠">🏠 Casa</option>
                <option value="🏢">🏢 Oficina</option>
                <option value="🚗">🚗 Estacionamiento</option>
                <option value="🍽️">🍽️ Restaurante</option>
                <option value="🏪">🏪 Tienda</option>
                <option value="⛽">⛽ Gasolinera</option>
                <option value="🏦">🏦 Banco</option>
                <option value="🎯">🎯 Punto de interés</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  if (newMarker.title) {
                    // Simular ubicación aleatoria cerca del hospital
                    const randomLat = hospitalLocation.lat + (Math.random() - 0.5) * 0.01;
                    const randomLng = hospitalLocation.lng + (Math.random() - 0.5) * 0.01;
                    
                    const customMarker: CustomMarker = {
                      id: Date.now().toString(),
                      position: { lat: randomLat, lng: randomLng },
                      title: newMarker.title,
                      description: newMarker.description,
                      icon: newMarker.icon
                    };
                    
                    setCustomMarkers([...customMarkers, customMarker]);
                    
                    // Limpiar el formulario
                    setNewMarker({
                      title: '',
                      description: '',
                      icon: '📍'
                    });
                    
                    alert(`Marcador "${customMarker.title}" agregado exitosamente!`);
                  } else {
                    alert('Por favor, ingresa un título para el marcador');
                  }
                }}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
                disabled={!newMarker.title}
              >
                {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === "TU_API_KEY_DE_GOOGLE_MAPS" 
                  ? "Agregar Marcador (Simulado)" 
                  : "Preparar Marcador"}
              </button>
            </div>
          </div>
          
          {/* Lista de marcadores personalizados */}
          {customMarkers.length > 0 && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">Marcadores Personalizados</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customMarkers.map((marker) => (
                  <div key={marker.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{marker.icon}</span>
                      <div>
                        <h5 className="font-semibold text-gray-800">{marker.title}</h5>
                        <p className="text-sm text-gray-600">{marker.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setCustomMarkers(customMarkers.filter(m => m.id !== marker.id));
                      }}
                      className="text-red-500 hover:text-red-700 transition-colors duration-200"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Instrucciones para configurar Google Maps */}
        {import.meta.env.VITE_GOOGLE_MAPS_API_KEY === "TU_API_KEY_DE_GOOGLE_MAPS" && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 mb-8 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Configurar Google Maps API
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p className="mb-2">Para habilitar el mapa interactivo, sigue estos pasos:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="underline font-medium">Google Cloud Console</a></li>
                    <li>Crea un proyecto o selecciona uno existente</li>
                    <li>Habilita la "Maps JavaScript API"</li>
                    <li>Crea una API key en "Credenciales"</li>
                    <li>Reemplaza "TU_API_KEY_DE_GOOGLE_MAPS" en el archivo .env con tu clave</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-2xl font-semibold mb-8 text-gray-800 text-center">Lugares Destacados Cercanos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {nearbyPlaces.map((place, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 text-center hover:shadow-md transition-shadow">
                <span className="text-4xl mb-3 block">{place.icon}</span>
                <h4 className="text-lg font-semibold mb-2 text-gray-800">{place.name}</h4>
                <p className="text-gray-600 text-sm">{place.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
