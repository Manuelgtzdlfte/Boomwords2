export const wordBank = {
  facil: [
    "bomba", "caos", "juego", "fácil", "casa", "perro", "gato", "sol", "luz", "mar", 
    "flor", "pan", "mesa", "silla", "libro", "agua", "fuego", "tierra", "aire", "viento",
    "luna", "estrella", "nube", "lluvia", "nieve", "río", "lago", "bosque", "campo", "ciudad",
    "calle", "coche", "bici", "barco", "avión", "tren", "bus", "puente", "parque", "jardín",
    "árbol", "flor", "hoja", "fruta", "verdura", "carne", "pescado", "leche", "queso", "pan",
    "arroz", "pasta", "sopa", "café", "té", "azúcar", "sal", "pimienta", "huevo", "aceite",
    "ropa", "zapato", "sombrero", "guante", "bufanda", "abrigo", "vestido", "camisa", "pantalón",
    "calcetín", "reloj", "llave", "dinero", "carta", "regalo", "fiesta", "baile", "canto", "música",
    "arte", "color", "dibujo", "pintura", "foto", "cine", "radio", "tv", "teléfono", "computadora",
    "amigo", "familia", "padre", "madre", "hijo", "hija", "hermano", "hermana", "abuelo", "abuela",
    "niño", "niña", "hombre", "mujer", "doctor", "maestro", "estudiante", "trabajo", "escuela", "casa"
  ],
  medio: [
    "explosión", "palabra", "reto", "medio", "computadora", "teclado", "ventana", 
    "edificio", "jardín", "montaña", "océano", "viaje", "camino", "puerta", "espejo", 
    "sombra", "luz", "tiempo", "espacio", "musica", "animal", "elefante", "leon", "tigre",
    "jirafa", "mono", "oso", "pájaro", "pez", "mariposa", "abeja", "hormiga", "araña", "serpiente",
    "universidad", "hospital", "biblioteca", "mercado", "restaurante", "hotel", "teatro", "museo",
    "estación", "aeropuerto", "puerto", "fábrica", "oficina", "tienda", "banco", "iglesia", "plaza",
    "castillo", "palacio", "torre", "pirámide", "templo", "estatua", "fuente", "monumento", "ruina",
    "invierno", "primavera", "verano", "otoño", "clima", "temperatura", "viento", "tormenta", "rayo",
    "trueno", "arcoíris", "amanecer", "atardecer", "noche", "día", "semana", "mes", "año", "siglo",
    "planeta", "estrella", "galaxia", "cometa", "asteroide", "satélite", "cohete", "astronauta",
    "explorador", "aventura", "descubrimiento", "invención", "creación", "construcción", "proyecto",
    "investigación", "experimento", "laboratorio", "científico", "ingeniero", "arquitecto", "diseñador",
    "escritor", "poeta", "pintor", "músico", "actor", "director", "productor", "editor", "periodista",
    "deporte", "competencia", "campeonato", "trofeo", "medalla", "victoria", "derrota", "entrenamiento"
  ],
  dificil: [
    "programación", "javascript", "complejo", "difícil", "arquitectura", "infraestructura", 
    "desarrollador", "aplicación", "tecnología", "inteligencia", "artificial", "aprendizaje", 
    "automático", "base de datos", "framework", "biblioteca", "componente", "implementación", 
    "configuración", "especificación", "algoritmo", "criptografía", "blockchain", "ciberseguridad",
    "virtualización", "containerización", "microservicios", "escalabilidad", "rendimiento", "optimización",
    "refactorización", "depuración", "documentación", "versionamiento", "colaboración", "metodología",
    "paradigma", "funcional", "orientado", "objetos", "procedimental", "declarativo", "imperativo",
    "concurrente", "paralelismo", "asincronía", "multihilo", "distribuido", "descentralizado",
    "interoperabilidad", "compatibilidad", "portabilidad", "mantenibilidad", "testabilidad", "verificación",
    "validación", "certificación", "acreditación", "estandarización", "normalización", "reglamentación",
    "legislación", "jurisdicción", "constitución", "democracia", "república", "monarquía", "dictadura",
    "federación", "confederación", "organización", "asociación", "corporación", "multinacional", "transnacional",
    "globalización", "internacional", "supranacional", "diplomacia", "embajada", "consulado", "tratado",
    "protocolo", "negociación", "mediación", "arbitraje", "conciliación", "resolución", "implementación",
    "filosofía", "epistemología", "ontología", "metafísica", "ética", "estética", "lógica", "dialéctica",
    "hermenéutica", "fenomenología", "existencialismo", "estructuralismo", "postmodernismo", "deconstrucción",
    "psicoanálisis", "conductismo", "cognitivismo", "constructivismo", "humanismo", "transpersonal",
    "neurociencia", "biología", "genética", "ecología", "sostenibilidad", "biodiversidad", "conservación",
    "paleontología", "arqueología", "antropología", "sociología", "psicología", "economía", "política"
  ]
};

export type Difficulty = keyof typeof wordBank;