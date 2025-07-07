// Servicio para comunicarse con la API del backend
import type { CustomMarker } from '../components/Location';

const API_BASE_URL = 'http://localhost:3001/api';

export interface DatabaseMarker extends CustomMarker {
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

class MarkerService {
  // Obtener todos los marcadores
  static async getAllMarkers(): Promise<ApiResponse<DatabaseMarker[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/markers`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { data: data.markers };
    } catch (error) {
      console.error('Error obteniendo marcadores:', error);
      return { error: 'Error al cargar marcadores desde la base de datos' };
    }
  }

  // Crear un nuevo marcador
  static async createMarker(marker: CustomMarker): Promise<ApiResponse<DatabaseMarker>> {
    try {
      const response = await fetch(`${API_BASE_URL}/markers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marker),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return { data: data.marker };
    } catch (error) {
      console.error('Error creando marcador:', error);
      return { error: error instanceof Error ? error.message : 'Error al crear marcador' };
    }
  }

  // Actualizar un marcador existente
  static async updateMarker(id: string, marker: Omit<CustomMarker, 'id'>): Promise<ApiResponse<DatabaseMarker>> {
    try {
      const response = await fetch(`${API_BASE_URL}/markers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(marker),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return { data: data.marker };
    } catch (error) {
      console.error('Error actualizando marcador:', error);
      return { error: error instanceof Error ? error.message : 'Error al actualizar marcador' };
    }
  }

  // Eliminar un marcador
  static async deleteMarker(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${API_BASE_URL}/markers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      return { data: undefined };
    } catch (error) {
      console.error('Error eliminando marcador:', error);
      return { error: error instanceof Error ? error.message : 'Error al eliminar marcador' };
    }
  }

  // Eliminar todos los marcadores
  static async deleteAllMarkers(): Promise<ApiResponse<number>> {
    try {
      const response = await fetch(`${API_BASE_URL}/markers`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      return { data: data.deletedCount };
    } catch (error) {
      console.error('Error eliminando todos los marcadores:', error);
      return { error: error instanceof Error ? error.message : 'Error al eliminar todos los marcadores' };
    }
  }

  // Obtener estadísticas
  static async getStats(): Promise<ApiResponse<{
    totalMarkers: number;
    oldestMarker: string | null;
    newestMarker: string | null;
    databaseSize: number;
  }>> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return { data };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { error: 'Error al cargar estadísticas' };
    }
  }

  // Migrar marcadores desde localStorage
  static async migrateFromLocalStorage(markers: CustomMarker[]): Promise<ApiResponse<number>> {
    try {
      let successCount = 0;
      const errors: string[] = [];

      for (const marker of markers) {
        const result = await this.createMarker(marker);
        if (result.data) {
          successCount++;
        } else {
          errors.push(`Error con "${marker.title}": ${result.error}`);
        }
      }

      if (errors.length > 0) {
        console.warn('Errores durante la migración:', errors);
        return { 
          data: successCount,
          error: `Se migraron ${successCount} de ${markers.length} marcadores. Algunos fallaron.`
        };
      }

      return { data: successCount };
    } catch (error) {
      console.error('Error durante la migración:', error);
      return { error: 'Error durante la migración desde localStorage' };
    }
  }
}

export default MarkerService;
