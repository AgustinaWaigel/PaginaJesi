# 🚀 Guía de Despliegue Completa

## 📋 Resumen
- **Frontend**: Ya desplegado en Vercel ✅
- **Backend**: Necesita desplegarse en Railway o similar
- **Base de datos**: SQLite incluida en el backend

## 🔧 Paso a Paso

### 1. Preparar el Backend para Producción

#### Opción A: Railway (Recomendada - Gratuita)

1. **Crear cuenta**: Ve a [railway.app](https://railway.app)
2. **Nuevo proyecto**: 
   - Click "New Project"
   - "Deploy from GitHub repo"
   - Conecta tu GitHub y selecciona el repositorio del backend
3. **Variables de entorno** (en Railway):
   ```
   NODE_ENV=production
   FRONTEND_URL=https://tu-app.vercel.app
   ```
4. **Configurar dominio**: Railway te dará una URL como `https://tu-proyecto.railway.app`

#### Opción B: Render (Alternativa gratuita)

1. Ve a [render.com](https://render.com)
2. Conecta GitHub y selecciona el repo del backend
3. Configuración:
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

#### Opción C: Heroku (Opción paga)

```bash
# En el directorio del backend
heroku create tu-app-backend
git push heroku main
```

### 2. Actualizar Frontend en Vercel

Una vez que tengas la URL del backend, actualiza Vercel:

1. **Ve a tu proyecto en Vercel**
2. **Settings → Environment Variables**
3. **Agregar**:
   ```
   VITE_API_URL = https://tu-backend.railway.app/api
   ```
4. **Redeploy**: Trigger a new deployment

### 3. Verificar Conexión

1. Ve a tu app en Vercel
2. Abre Developer Tools (F12)
3. Intenta agregar un marcador
4. Verifica que las requests vayan a tu backend

## 🔍 URLs Finales

- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-backend.railway.app`
- **API Health**: `https://tu-backend.railway.app/health`

## 🛠️ Comandos Útiles

### Backend Local
```bash
cd hospital-backend
npm install
npm run dev  # Puerto 3001
```

### Frontend Local
```bash
cd hospital-website
npm install
npm run dev  # Puerto 5173+
```

### Verificar API
```bash
curl https://tu-backend.railway.app/health
```

## 📊 Monitoreo

### Health Check
- URL: `https://tu-backend.railway.app/health`
- Debería devolver: `{"status": "OK", "message": "Hospital Backend API is running"}`

### Logs
- **Railway**: Ve a tu proyecto → Deployments → View Logs
- **Vercel**: Ve a tu proyecto → Functions → View Function Logs

## 🚨 Solución de Problemas

### Error CORS
- Verificar que `FRONTEND_URL` esté configurada en el backend
- Verificar que la URL en `markerService.ts` sea correcta

### Base de datos no funciona
- En Railway: Los archivos en `/tmp/` persisten durante la sesión
- Para datos permanentes: considerar PostgreSQL de Railway

### 404 en API
- Verificar que `VITE_API_URL` esté configurada en Vercel
- Verificar que el backend esté desplegado y funcionando

## 💡 Próximos Pasos

1. **Desplegar backend** en Railway
2. **Configurar variables** en Vercel
3. **Probar aplicación** end-to-end
4. **Configurar dominio personalizado** (opcional)

## 📞 Endpoints de Testing

```bash
# Health check
GET https://tu-backend.railway.app/health

# Listar marcadores
GET https://tu-backend.railway.app/api/markers

# Estadísticas
GET https://tu-backend.railway.app/api/stats
```
