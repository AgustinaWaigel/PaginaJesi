const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Crear/conectar a la base de datos SQLite
const dbPath = path.join(__dirname, 'hospital_markers.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error abriendo la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a la base de datos SQLite');
    initializeDatabase();
  }
});

// Inicializar las tablas de la base de datos
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS markers (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      icon TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creando tabla markers:', err.message);
    } else {
      console.log('✅ Tabla markers inicializada');
    }
  });

  // Tabla para metadatos y estadísticas
  db.run(`
    CREATE TABLE IF NOT EXISTS metadata (
      key TEXT PRIMARY KEY,
      value TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Error creando tabla metadata:', err.message);
    } else {
      console.log('✅ Tabla metadata inicializada');
    }
  });
}

// RUTAS DE LA API

// GET /api/markers - Obtener todos los marcadores
app.get('/api/markers', (req, res) => {
  db.all('SELECT * FROM markers ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      console.error('Error obteniendo marcadores:', err.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      // Convertir formato de base de datos a formato frontend
      const markers = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        icon: row.icon,
        position: [row.latitude, row.longitude],
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
      res.json({ markers, count: markers.length });
    }
  });
});

// POST /api/markers - Crear un nuevo marcador
app.post('/api/markers', (req, res) => {
  const { id, title, description, icon, position } = req.body;
  
  // Validaciones
  if (!id || !title || !icon || !position || position.length !== 2) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  const [latitude, longitude] = position;
  const now = new Date().toISOString();

  db.run(
    'INSERT INTO markers (id, title, description, icon, latitude, longitude, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, title, description || '', icon, latitude, longitude, now, now],
    function(err) {
      if (err) {
        console.error('Error creando marcador:', err.message);
        if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
          res.status(409).json({ error: 'Ya existe un marcador con ese ID' });
        } else {
          res.status(500).json({ error: 'Error interno del servidor' });
        }
      } else {
        res.status(201).json({ 
          message: 'Marcador creado exitosamente',
          marker: {
            id,
            title,
            description: description || '',
            icon,
            position: [latitude, longitude],
            createdAt: now,
            updatedAt: now
          }
        });
      }
    }
  );
});

// PUT /api/markers/:id - Actualizar un marcador
app.put('/api/markers/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, icon, position } = req.body;
  
  if (!title || !icon || !position || position.length !== 2) {
    return res.status(400).json({ error: 'Datos incompletos o inválidos' });
  }

  const [latitude, longitude] = position;
  const now = new Date().toISOString();

  db.run(
    'UPDATE markers SET title = ?, description = ?, icon = ?, latitude = ?, longitude = ?, updated_at = ? WHERE id = ?',
    [title, description || '', icon, latitude, longitude, now, id],
    function(err) {
      if (err) {
        console.error('Error actualizando marcador:', err.message);
        res.status(500).json({ error: 'Error interno del servidor' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Marcador no encontrado' });
      } else {
        res.json({ 
          message: 'Marcador actualizado exitosamente',
          marker: {
            id,
            title,
            description: description || '',
            icon,
            position: [latitude, longitude],
            updatedAt: now
          }
        });
      }
    }
  );
});

// DELETE /api/markers/:id - Eliminar un marcador
app.delete('/api/markers/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM markers WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('Error eliminando marcador:', err.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Marcador no encontrado' });
    } else {
      res.json({ message: 'Marcador eliminado exitosamente' });
    }
  });
});

// DELETE /api/markers - Eliminar todos los marcadores
app.delete('/api/markers', (req, res) => {
  db.run('DELETE FROM markers', [], function(err) {
    if (err) {
      console.error('Error eliminando todos los marcadores:', err.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      res.json({ 
        message: 'Todos los marcadores eliminados exitosamente',
        deletedCount: this.changes
      });
    }
  });
});

// GET /api/stats - Obtener estadísticas
app.get('/api/stats', (req, res) => {
  db.get('SELECT COUNT(*) as total FROM markers', [], (err, row) => {
    if (err) {
      console.error('Error obteniendo estadísticas:', err.message);
      res.status(500).json({ error: 'Error interno del servidor' });
    } else {
      db.get('SELECT MIN(created_at) as oldest, MAX(created_at) as newest FROM markers', [], (err2, row2) => {
        if (err2) {
          console.error('Error obteniendo fechas:', err2.message);
          res.status(500).json({ error: 'Error interno del servidor' });
        } else {
          res.json({
            totalMarkers: row.total,
            oldestMarker: row2.oldest,
            newestMarker: row2.newest,
            databaseSize: 0 // Se puede calcular el tamaño del archivo de DB si es necesario
          });
        }
      });
    }
  });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📊 API disponible en http://localhost:${PORT}/api/markers`);
});

// Cerrar la base de datos cuando el proceso termine
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error cerrando la base de datos:', err.message);
    } else {
      console.log('🔒 Base de datos cerrada');
    }
    process.exit(0);
  });
});
