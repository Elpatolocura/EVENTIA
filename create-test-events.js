import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovfzywhhriwwwikdldet.supabase.co';
const supabaseKey = 'sb_publishable_47m1YJvrDFBVtkig-8FDFQ_6gKup5X5';

const supabase = createClient(supabaseUrl, supabaseKey);

// Crear eventos de prueba
const testEvents = [
  {
    title: "Concierto de Rock Estelar",
    description: "Un concierto inolvidable con la mejor banda de rock",
    category: "música",
    organizer_name: "Rock Productions",
    location: "Auditorio Nacional",
    latitude: 19.4326,
    longitude: -99.1332,
    event_date: "2026-05-06", // Hoy
    event_time: "20:00:00",
    is_featured: true, // Evento destacado
    attendees_count: 150,
    price: 250,
    currency: "MXN",
    amenities: ["wifi", "parking", "food"],
    tags: ["rock", "concierto", "musica"]
  },
  {
    title: "Exposición de Arte Moderno",
    description: "Descubre las últimas tendencias en arte contemporáneo",
    category: "arte",
    organizer_name: "Museo de Arte Moderno",
    location: "Centro Cultural",
    latitude: 19.4330,
    longitude: -99.1300,
    event_date: "2026-05-06", // Hoy
    event_time: "10:00:00",
    is_featured: false,
    attendees_count: 200, // Evento popular
    price: 0,
    currency: "MXN",
    amenities: ["wifi", "ac"],
    tags: ["arte", "exposicion", "cultura"]
  },
  {
    title: "Festival Gastronómico",
    description: "Saborea los mejores platillos de chefs reconocidos",
    category: "gastronomía",
    organizer_name: "Food Festival MX",
    location: "Parque Central",
    latitude: 19.4350,
    longitude: -99.1350,
    event_date: "2026-05-07", // Mañana
    event_time: "12:00:00",
    is_featured: true, // Evento destacado
    attendees_count: 300, // Evento popular
    price: 150,
    currency: "MXN",
    amenities: ["food", "parking"],
    tags: ["comida", "gastronomia", "festival"]
  },
  {
    title: "Torneo de eSports",
    description: "Compite en el torneo más grande de videojuegos",
    category: "tech",
    organizer_name: "Gaming Pro League",
    location: "Centro de Convenciones",
    latitude: 19.4300,
    longitude: -99.1400,
    event_date: "2026-05-08", // Pasado mañana
    event_time: "14:00:00",
    is_featured: false,
    attendees_count: 500, // Muy popular
    price: 100,
    currency: "MXN",
    amenities: ["wifi", "tv"],
    tags: ["gaming", "esports", "tecnologia"]
  },
  {
    title: "Clase de Yoga al Aire Libre",
    description: "Encuentra paz y bienestar en nuestra clase matutina",
    category: "bienestar",
    organizer_name: "Zen Studios",
    location: "Parque Chapultepec",
    latitude: 19.4200,
    longitude: -99.1800,
    event_date: "2026-05-06", // Hoy
    event_time: "08:00:00",
    is_featured: false,
    attendees_count: 80,
    price: 0,
    currency: "MXN",
    amenities: ["parking"],
    tags: ["yoga", "bienestar", "salud"]
  }
];

async function createTestEvents() {
  try {
    for (const event of testEvents) {
      const { data, error } = await supabase
        .from('events')
        .insert(event)
        .select();

      if (error) {
        console.error('Error creando evento:', event.title, error);
      } else {
        console.log('✅ Evento creado:', event.title);
      }
    }

    console.log('🎉 Todos los eventos de prueba han sido creados!');
  } catch (error) {
    console.error('Error general:', error);
  }
}

createTestEvents();