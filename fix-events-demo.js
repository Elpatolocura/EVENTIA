import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovfzywhhriwwwikdldet.supabase.co';
const supabaseKey = 'sb_publishable_47m1YJvrDFBVtkig-8FDFQ_6gKup5X5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixEventsForDemo() {
  try {
    console.log('🔧 Actualizando eventos para demo...\n');

    // Obtener todos los eventos
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title')
      .order('created_at', { ascending: false });

    if (error || !events) {
      console.error('Error fetching events:', error);
      return;
    }

    const totalEvents = events.length;
    console.log(`📊 Procesando ${totalEvents} eventos...\n`);

    // Actualizar eventos en lotes
    const batchSize = 5;

    for (let i = 0; i < totalEvents; i += batchSize) {
      const batch = events.slice(i, i + batchSize);
      console.log(`📦 Procesando lote ${Math.floor(i/batchSize) + 1} (${batch.length} eventos)...`);

      const updatePromises = batch.map((event, index) => {
        const globalIndex = i + index;
        let updates = {};

        // Configurar diferentes tipos de eventos
        if (globalIndex < 3) {
          // DESTACADOS
          updates = {
            is_featured: true,
            attendees_count: Math.floor(Math.random() * 100) + 200,
            event_date: '2026-05-06', // Hoy
            latitude: 19.4326 + (Math.random() - 0.5) * 0.05,
            longitude: -99.1332 + (Math.random() - 0.5) * 0.05
          };
          console.log(`  ⭐ ${event.title} → DESTACADO`);
        } else if (globalIndex < 8) {
          // POPULARES
          updates = {
            attendees_count: Math.floor(Math.random() * 150) + 150,
            event_date: '2026-05-07', // Mañana
            latitude: 19.4326 + (Math.random() - 0.5) * 0.05,
            longitude: -99.1332 + (Math.random() - 0.5) * 0.05
          };
          console.log(`  🔥 ${event.title} → POPULAR`);
        } else if (globalIndex < 12) {
          // PARA HOY
          updates = {
            event_date: '2026-05-06',
            attendees_count: Math.floor(Math.random() * 50) + 20,
            latitude: 19.4326 + (Math.random() - 0.5) * 0.05,
            longitude: -99.1332 + (Math.random() - 0.5) * 0.05
          };
          console.log(`  📅 ${event.title} → HOY`);
        } else if (globalIndex < 16) {
          // PARA MAÑANA
          updates = {
            event_date: '2026-05-07',
            attendees_count: Math.floor(Math.random() * 50) + 20,
            latitude: 19.4326 + (Math.random() - 0.5) * 0.05,
            longitude: -99.1332 + (Math.random() - 0.5) * 0.05
          };
          console.log(`  📅 ${event.title} → MAÑANA`);
        } else {
          // CERCA (resto)
          updates = {
            attendees_count: Math.floor(Math.random() * 100) + 10,
            latitude: 19.4326 + (Math.random() - 0.5) * 0.1,
            longitude: -99.1332 + (Math.random() - 0.5) * 0.1
          };
          console.log(`  📍 ${event.title} → CERCA`);
        }

        return supabase
          .from('events')
          .update(updates)
          .eq('id', event.id);
      });

      // Ejecutar todas las actualizaciones del lote
      const results = await Promise.all(updatePromises);

      // Verificar resultados
      results.forEach((result, idx) => {
        if (result.error) {
          console.error(`  ❌ Error en ${batch[idx].title}:`, result.error.message);
        }
      });

      // Pequeña pausa entre lotes
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\n✅ ¡Todos los eventos han sido actualizados!\n');

    // Verificar resultados finales
    const { data: updatedEvents } = await supabase
      .from('events')
      .select('is_featured, attendees_count, event_date, latitude, longitude');

    if (updatedEvents) {
      const featured = updatedEvents.filter(e => e.is_featured).length;
      const popular = updatedEvents.filter(e => e.attendees_count > 100).length;
      const today = updatedEvents.filter(e => e.event_date === '2026-05-06').length;
      const tomorrow = updatedEvents.filter(e => e.event_date === '2026-05-07').length;
      const nearby = updatedEvents.filter(e => e.latitude && e.longitude).length;

      console.log('📈 Resumen final:');
      console.log(`⭐ Destacados: ${featured}`);
      console.log(`🔥 Populares: ${popular}`);
      console.log(`📅 Hoy: ${today}`);
      console.log(`📅 Mañana: ${tomorrow}`);
      console.log(`📍 Cerca: ${nearby}`);
      console.log(`📊 Total con filtros: ${featured + popular + today + tomorrow + nearby}`);
    }

    console.log('\n🎉 ¡Los filtros ahora deberían funcionar correctamente!');
    console.log('🔄 Refresca la aplicación para ver los cambios.');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

fixEventsForDemo();