# Hospital San José - Sitio Web

Una moderna página web para un hospital construida con React + Vite y Google Maps integrado.

## 🏥 Características

- **Diseño moderno y responsive** - Se adapta a todos los dispositivos
- **Mapa interactivo de Google Maps** - Muestra la ubicación del hospital y lugares destacados
- **Navegación suave** - Scroll animado entre secciones
- **Formulario de contacto** - Para consultas y mensajes
- **Sección de servicios** - Información sobre los servicios del hospital
- **Información de emergencia** - Números de contacto destacados

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 16+ instalado
- Una API Key de Google Maps

### Instalación

1. **Instala las dependencias**
   ```bash
   npm install
   ```

2. **Configura tu API Key de Google Maps**
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Crea un nuevo proyecto o selecciona uno existente
   - Habilita la API de Google Maps JavaScript
   - Crea una API Key
   - Edita el archivo `.env` y reemplaza `TU_API_KEY_DE_GOOGLE_MAPS` con tu API Key real

3. **Personaliza la información del hospital**
   - Edita el archivo `.env` con la información de tu hospital:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
   VITE_HOSPITAL_NAME="Tu Hospital"
   VITE_HOSPITAL_ADDRESS="Tu Dirección"
   VITE_HOSPITAL_PHONE="Tu Teléfono"
   VITE_HOSPITAL_LAT=tu_latitud
   VITE_HOSPITAL_LNG=tu_longitud
   ```

4. **Ejecuta el proyecto**
   ```bash
   npm run dev
   ```

5. **Abre tu navegador**
   - Ve a `http://localhost:5173`

## 🗺️ Configuración del Mapa

El mapa de Google Maps incluye:

- **Marcador del hospital** - Ubicación principal con información detallada
- **Lugares destacados** - Marcadores para lugares importantes cerca del hospital:
  - Farmacia
  - Estación de autobús
  - Banco
  - Estacionamiento
- **Estilos personalizados** - Colores y diseño adaptado al tema del hospital

### Personalizar Lugares Destacados

Para modificar los lugares destacados, edita el array `nearbyPlaces` en `src/components/Location.jsx`:

```javascript
const nearbyPlaces = [
  {
    name: 'Nuevo Lugar',
    position: { lat: 19.4328, lng: -99.1330 },
    icon: '🏪',
    description: 'Descripción del lugar'
  },
  // ... más lugares
];
```

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework de JavaScript
- **Vite** - Build tool rápido
- **Google Maps API** - Mapas interactivos
- **CSS3** - Estilos modernos con Grid y Flexbox
- **Google Fonts** - Tipografía profesional

## 📦 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Construir para producción
npm run build

# Vista previa de la build
npm run preview
```

---

**¡Gracias por usar nuestro template para sitio web de hospital!** 🏥✨
