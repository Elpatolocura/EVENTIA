import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovfzywhhriwwwikdldet.supabase.co';
const supabaseKey = 'sb_publishable_47m1YJvrDFBVtkig-8FDFQ_6gKup5X5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEventsInDatabase() {
  try {
    console.log('🔍 Verificando eventos en la base de datos...\n');

    // Obtener todos los eventos
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error al consultar eventos:', error);
      return;
    }

    console.log(`📊 Total de eventos encontrados: ${events?.length || 0}\n`);

    if (!events || events.length === 0) {
      console.log('⚠️ No hay eventos en la base de datos.');
      return;
    }

    // Mostrar resumen por categorías
    const featured = events.filter(e => e.is_featured).length;
    const popular = events.filter(e => e.attendees_count > 100).length;
    const today = events.filter(e => e.event_date === '2026-05-06').length;
    const tomorrow = events.filter(e => e.event_date === '2026-05-07').length;
    const nearby = events.filter(e => e.latitude && e.longitude).length;

    console.log('📈 Resumen por categorías:');
    console.log(`⭐ Destacados: ${featured}`);
    console.log(`🔥 Populares (>100 asistentes): ${popular}`);
    console.log(`📅 Hoy (2026-05-06): ${today}`);
    console.log(`📅 Mañana (2026-05-07): ${tomorrow}`);
    console.log(`📍 Cerca (con ubicación): ${nearby}\n`);

    // Mostrar primeros 10 eventos con detalles
    console.log('📋 Primeros 10 eventos:');
    events.slice(0, 10).forEach((event, index) => {
      console.log(`${index + 1}. "${event.title}"`);
      console.log(`   ID: ${event.id}`);
      console.log(`   Destacado: ${event.is_featured ? '✅' : '❌'}`);
      console.log(`   Asistentes: ${event.attendees_count || 0}`);
      console.log(`   Fecha: ${event.event_date || 'Sin fecha'}`);
      console.log(`   Ubicación: ${event.latitude && event.longitude ? '✅' : '❌'}`);
      console.log(`   Precio: ${event.price || 'Gratis'}\n`);
    });

    // Verificar si hay eventos que deberían mostrarse
    const shouldShowEvents = events.filter(event => {
      const hasFeatured = event.is_featured;
      const hasAttendees = event.attendees_count > 0;
      const isToday = event.event_date === '2026-05-06';
      const isTomorrow = event.event_date === '2026-05-07';
      const hasLocation = event.latitude && event.longitude;

      return hasFeatured || hasAttendees || isToday || isTomorrow || hasLocation;
    });

    console.log(`🎯 Eventos que deberían mostrarse en filtros: ${shouldShowEvents.length}`);

    if (shouldShowEvents.length === 0) {
      console.log('⚠️ ALERTA: No hay eventos que cumplan con los criterios de filtrado!');
      console.log('💡 Necesitas actualizar los eventos existentes con las propiedades correctas.');
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkEventsInDatabase();