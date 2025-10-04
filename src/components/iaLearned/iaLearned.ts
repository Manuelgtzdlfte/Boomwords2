export interface EstadisticasAprendizaje {
  historial: Record<string, number>;
  total_aprendido: number;
}


// Datos iniciales de aprendizaje de la IA
export interface DatosAprendizaje {
  historial: Record<string, number>;
  total_aprendido: number;
}

// Cargar datos guardados o usar datos iniciales
const cargarDatosGuardados = (): DatosAprendizaje => {
  try {
    const guardado = localStorage.getItem('ia_aprendizaje');
    if (guardado) {
      return JSON.parse(guardado);
    }
  } catch (error) {
    console.log('No se pudieron cargar datos previos de la IA, usando iniciales');
  }
  
  // Datos iniciales basados en frecuencia de letras en español
  return {
    historial: {
      'e': 15, 'a': 12, 'o': 9, 's': 7, 'n': 6, 'r': 6, 'i': 6, 
      'l': 5, 'd': 5, 't': 4, 'u': 4, 'm': 3, 'c': 3, 'p': 2,
      'b': 2, 'g': 2, 'v': 1, 'y': 1, 'q': 1, 'h': 1, 'f': 1,
      'z': 1, 'j': 1, 'ñ': 1, 'x': 1, 'k': 1, 'w': 1
    },
    total_aprendido: 100
  };
};

// Guardar datos en localStorage
export const guardarDatosIA = (datos: DatosAprendizaje): void => {
  try {
    localStorage.setItem('ia_aprendizaje', JSON.stringify(datos));
  } catch (error) {
    console.error('Error guardando datos de IA:', error);
  }
};

export let datos: DatosAprendizaje = cargarDatosGuardados();