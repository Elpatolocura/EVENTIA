import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovfzywhhriwwwikdldet.supabase.co';
const supabaseKey = 'sb_publishable_47m1YJvrDFBVtkig-8FDFQ_6gKup5X5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateExistingEventsForDemo() {
  try {
    // Obtener todos los eventos existentes
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    if (!events || events.length === 0) {
      console.log('No events found to update');
      return;
    }

    console.log(`Found ${events.length} existing events. Updating them for demo...`);

    const totalEvents = events.length;
    const eventsPerCategory = Math.max(2, Math.floor(totalEvents / 5)); // Al menos 2 por categoría

    // Configuraciones por categoría
    const categoryConfigs = [
      // Destacados
      { start: 0, end: eventsPerCategory, config: { is_featured: true, attendees_count: Math.floor(Math.random() * 100) + 200 } },
      // Populares
      { start: eventsPerCategory, end: eventsPerCategory * 2, config: { attendees_count: Math.floor(Math.random() * 150) + 150 } },
      // Hoy
      { start: eventsPerCategory * 2, end: eventsPerCategory * 3, config: { event_date: '2026-05-06' } },
      // Mañana
      { start: eventsPerCategory * 3, end: eventsPerCategory * 4, config: { event_date: '2026-05-07' } },
      // Cerca (ubicación)
      { start: eventsPerCategory * 4, end: totalEvents, config: {
        latitude: 19.4326 + (Math.random() - 0.5) * 0.2,
        longitude: -99.1332 + (Math.random() - 0.5) * 0.2
      }}
    ];

    let updatedCount = 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      let updateConfig = {};

      // Aplicar configuración según la categoría
      for (const category of categoryConfigs) {
        if (i >= category.start && i < category.end) {
          updateConfig = { ...updateConfig, ...category.config };
          break;
        }
      }

      if (Object.keys(updateConfig).length > 0) {
        const { error: updateError } = await supabase
          .from('events')
          .update(updateConfig)
          .eq('id', event.id);

        if (updateError) {
          console.error(`❌ Error updating event ${event.title}:`, updateError);
        } else {
          updatedCount++;
          console.log(`✅ Updated event ${i + 1}: ${event.title}`);

          // Mostrar qué propiedades se actualizaron
          if (updateConfig.is_featured) console.log(`   📌 DESTACADO`);
          if (updateConfig.attendees_count > 100) console.log(`   🔥 POPULAR (${updateConfig.attendees_count} asistentes)`);
          if (updateConfig.event_date === '2026-05-06') console.log(`   📅 HOY`);
          if (updateConfig.event_date === '2026-05-07') console.log(`   📅 MAÑANA`);
          if (updateConfig.latitude) console.log(`   📍 CERCA (ubicación actualizada)`);
        }
      }
    }

    console.log(`\n🎉 ¡${updatedCount} eventos actualizados exitosamente!`);
    console.log('\n📊 Eventos por categoría después de la actualización:');

    // Verificar el resultado final
    const { data: updatedEvents } = await supabase
      .from('events')
      .select('is_featured, attendees_count, event_date, latitude, longitude');

    if (updatedEvents) {
      const featured = updatedEvents.filter(e => e.is_featured).length;
      const popular = updatedEvents.filter(e => e.attendees_count > 100).length;
      const today = updatedEvents.filter(e => e.event_date === '2026-05-06').length;
      const tomorrow = updatedEvents.filter(e => e.event_date === '2026-05-07').length;
      const nearby = updatedEvents.filter(e => e.latitude && e.longitude).length;

      console.log(`⭐ Destacados: ${featured}`);
      console.log(`🔥 Populares: ${popular}`);
      console.log(`📅 Hoy: ${today}`);
      console.log(`📅 Mañana: ${tomorrow}`);
      console.log(`📍 Cerca: ${nearby}`);
    }

    console.log('\n🔄 Refresca la página para ver los cambios en el sistema de filtros!');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

updateExistingEventsForDemo();