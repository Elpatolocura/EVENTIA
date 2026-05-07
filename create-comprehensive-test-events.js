import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovfzywhhriwwwikdldet.supabase.co';
const supabaseKey = 'sb_publishable_47m1YJvrDFBVtkig-8FDFQ_6gKup5X5';

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de eventos de prueba para todas las categorías
const testEvents = [
  // EVENTOS DESTACADOS (is_featured = true)
  {
    title: "Festival Internacional de Música Electrónica",
    description: "El festival más grande de música electrónica en Latinoamérica con DJs internacionales",
    category: "música",
    organizer_name: "Music Festivals MX",
    location: "Autódromo Hermanos Rodríguez",
    latitude: 19.4067,
    longitude: -99.0919,
    event_date: "2026-05-08",
    event_time: "20:00:00",
    is_featured: true,
    attendees_count: 250,
    price: 350,
    currency: "MXN",
    amenities: ["wifi", "parking", "food", "tv"],
    tags: ["electrónica", "festival", "dj", "internacional"]
  },
  {
    title: "Exposición de Arte Contemporáneo",
    description: "Muestra de arte vanguardista con artistas emergentes y reconocidos",
    category: "arte",
    organizer_name: "Museo Tamayo",
    location: "Museo Tamayo",
    latitude: 19.4334,
    longitude: -99.1968,
    event_date: "2026-05-09",
    event_time: "11:00:00",
    is_featured: true,
    attendees_count: 180,
    price: 0,
    currency: "MXN",
    amenities: ["wifi", "ac"],
    tags: ["arte", "contemporáneo", "museo", "cultura"]
  },
  {
    title: "Maratón CDMX 2026",
    description: "La carrera atlética más importante de la ciudad con distancias para todos",
    category: "deportes",
    organizer_name: "Instituto del Deporte CDMX",
    location: "Zócalo Histórico",
    latitude: 19.4326,
    longitude: -99.1332,
    event_date: "2026-05-10",
    event_time: "07:00:00",
    is_featured: true,
    attendees_count: 500,
    price: 120,
    currency: "MXN",
    amenities: ["parking", "food", "ac"],
    tags: ["maratón", "deportes", "running", "salud"]
  },

  // EVENTOS POPULARES (attendees_count alto)
  {
    title: "Concierto de Rock Nacional",
    description: "Los mejores grupos de rock mexicano en un solo escenario",
    category: "música",
    organizer_name: "Rock MX Productions",
    location: "Auditorio Nacional",
    latitude: 19.4242,
    longitude: -99.1956,
    event_date: "2026-05-12",
    event_time: "21:00:00",
    is_featured: false,
    attendees_count: 400,
    price: 280,
    currency: "MXN",
    amenities: ["wifi", "parking", "food"],
    tags: ["rock", "mexicano", "concierto", "música"]
  },
  {
    title: "Feria del Libro CDMX",
    description: "La feria del libro más grande de América Latina",
    category: "cultura",
    organizer_name: "Cámara Nacional de la Industria Editorial",
    location: "Centro Cultural Bella Época",
    latitude: 19.4100,
    longitude: -99.1700,
    event_date: "2026-05-13",
    event_time: "10:00:00",
    is_featured: false,
    attendees_count: 350,
    price: 0,
    currency: "MXN",
    amenities: ["wifi", "food", "parking"],
    tags: ["libros", "literatura", "cultura", "educación"]
  },
  {
    title: "Festival Gastronómico Internacional",
    description: "Sabores del mundo en el corazón de la ciudad",
    category: "gastronomía",
    organizer_name: "Chef Masters International",
    location: "Paseo de la Reforma",
    latitude: 19.4270,
    longitude: -99.1677,
    event_date: "2026-05-14",
    event_time: "12:00:00",
    is_featured: false,
    attendees_count: 450,
    price: 200,
    currency: "MXN",
    amenities: ["food", "parking", "wifi"],
    tags: ["gastronomía", "comida", "internacional", "festival"]
  },

  // EVENTOS DE HOY (2026-05-06)
  {
    title: "Yoga en el Parque",
    description: "Sesión matutina de yoga al aire libre para todos los niveles",
    category: "bienestar",
    organizer_name: "Zen Life Studio",
    location: "Parque México",
    latitude: 19.4133,
    longitude: -99.1767,
    event_date: "2026-05-06",
    event_time: "08:00:00",
    is_featured: false,
    attendees_count: 25,
    price: 0,
    currency: "MXN",
    amenities: ["parking"],
    tags: ["yoga", "bienestar", "salud", "aire libre"]
  },
  {
    title: "Taller de Fotografía Urbana",
    description: "Aprende técnicas de fotografía en la ciudad",
    category: "tech",
    organizer_name: "Photo Academy MX",
    location: "Centro Histórico",
    latitude: 19.4326,
    longitude: -99.1332,
    event_date: "2026-05-06",
    event_time: "14:00:00",
    is_featured: false,
    attendees_count: 30,
    price: 150,
    currency: "MXN",
    amenities: ["wifi"],
    tags: ["fotografía", "taller", "tecnología", "arte"]
  },
  {
    title: "Noche de Jazz en Condesa",
    description: "Concierto íntimo de jazz con músicos locales",
    category: "música",
    organizer_name: "Jazz Club CDMX",
    location: "Plaza Río de Janeiro",
    latitude: 19.4136,
    longitude: -99.1767,
    event_date: "2026-05-06",
    event_time: "20:00:00",
    is_featured: false,
    attendees_count: 80,
    price: 100,
    currency: "MXN",
    amenities: ["food", "parking"],
    tags: ["jazz", "música", "concierto", "local"]
  },

  // EVENTOS DE MAÑANA (2026-05-07)
  {
    title: "Mercado de Artesanías",
    description: "Artesanías mexicanas tradicionales en el corazón de Roma",
    category: "arte",
    organizer_name: "Artesanos Unidos MX",
    location: "Plaza Villa de Madrid",
    latitude: 19.4200,
    longitude: -99.1600,
    event_date: "2026-05-07",
    event_time: "09:00:00",
    is_featured: false,
    attendees_count: 60,
    price: 0,
    currency: "MXN",
    amenities: ["parking"],
    tags: ["artesanías", "artesanal", "mexicano", "mercado"]
  },
  {
    title: "Clase de Baile Flamenco",
    description: "Introducción al baile flamenco con instructor profesional",
    category: "cultura",
    organizer_name: "Centro Cultural Español",
    location: "Centro Cultural Bella Época",
    latitude: 19.4100,
    longitude: -99.1700,
    event_date: "2026-05-07",
    event_time: "18:00:00",
    is_featured: false,
    attendees_count: 35,
    price: 120,
    currency: "MXN",
    amenities: ["wifi", "parking"],
    tags: ["baile", "flamenco", "cultura", "español"]
  },
  {
    title: "Torneo de Ajedrez Rápido",
    description: "Competición de ajedrez con tiempo limitado por partida",
    category: "deportes",
    organizer_name: "Club de Ajedrez CDMX",
    location: "Biblioteca Vasconcelos",
    latitude: 19.3742,
    longitude: -99.1733,
    event_date: "2026-05-07",
    event_time: "16:00:00",
    is_featured: false,
    attendees_count: 45,
    price: 50,
    currency: "MXN",
    amenities: ["wifi", "parking"],
    tags: ["ajedrez", "deporte", "mental", "competencia"]
  },

  // EVENTOS CERCA DE CDMX (ubicaciones variadas en CDMX)
  {
    title: "Paseo en Bicicleta por Chapultepec",
    description: "Recorrido guiado en bicicleta por el bosque más grande de la ciudad",
    category: "deportes",
    organizer_name: "Ecobici CDMX",
    location: "Bosque de Chapultepec",
    latitude: 19.4167,
    longitude: -99.1833,
    event_date: "2026-05-11",
    event_time: "08:00:00",
    is_featured: false,
    attendees_count: 55,
    price: 80,
    currency: "MXN",
    amenities: ["parking"],
    tags: ["bicicleta", "deporte", "naturaleza", "ecológico"]
  },
  {
    title: "Taller de Cocina Vegana",
    description: "Aprende a preparar deliciosos platillos veganos",
    category: "gastronomía",
    organizer_name: "Vegan Kitchen MX",
    location: "La Condesa",
    latitude: 19.4167,
    longitude: -99.1667,
    event_date: "2026-05-15",
    event_time: "11:00:00",
    is_featured: false,
    attendees_count: 40,
    price: 180,
    currency: "MXN",
    amenities: ["food", "wifi"],
    tags: ["vegano", "cocina", "taller", "saludable"]
  },
  {
    title: "Noche de Observación Astronómica",
    description: "Observa las estrellas con telescopios profesionales",
    category: "ciencia",
    organizer_name: "Sociedad Astronómica Mexicana",
    location: "Parque Nacional Desierto de los Leones",
    latitude: 19.3000,
    longitude: -99.3000,
    event_date: "2026-05-16",
    event_time: "21:00:00",
    is_featured: false,
    attendees_count: 75,
    price: 90,
    currency: "MXN",
    amenities: ["parking"],
    tags: ["astronomía", "ciencia", "estrellas", "naturaleza"]
  }
];

async function createTestEvents() {
  try {
    console.log(`Creando ${testEvents.length} eventos de prueba...`);

    for (let i = 0; i < testEvents.length; i++) {
      const event = testEvents[i];

      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select();

      if (error) {
        console.error(`❌ Error creando evento ${i + 1} (${event.title}):`, error.message);
      } else {
        console.log(`✅ Evento ${i + 1} creado: ${event.title}`);

        // Mostrar resumen por categoría
        if (event.is_featured) console.log(`   📌 DESTACADO`);
        if (event.attendees_count > 100) console.log(`   🔥 POPULAR (${event.attendees_count} asistentes)`);
        if (event.event_date === '2026-05-06') console.log(`   📅 HOY`);
        if (event.event_date === '2026-05-07') console.log(`   📅 MAÑANA`);
        if (event.latitude && event.longitude) console.log(`   📍 CERCA (${event.location})`);
      }
    }

    console.log('\n🎉 ¡Todos los eventos de prueba han sido creados exitosamente!');
    console.log('\n📊 Resumen de eventos por categoría:');
    console.log(`⭐ Destacados: ${testEvents.filter(e => e.is_featured).length}`);
    console.log(`🔥 Populares: ${testEvents.filter(e => e.attendees_count > 100).length}`);
    console.log(`📅 Hoy: ${testEvents.filter(e => e.event_date === '2026-05-06').length}`);
    console.log(`📅 Mañana: ${testEvents.filter(e => e.event_date === '2026-05-07').length}`);
    console.log(`📍 Cerca de CDMX: ${testEvents.filter(e => e.latitude && e.longitude).length}`);

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createTestEvents();