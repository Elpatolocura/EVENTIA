import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ovfzywhhriwwwikdldet.supabase.co';
const supabaseKey = 'sb_publishable_47m1YJvrDFBVtkig-8FDFQ_6gKup5X5';

const supabase = createClient(supabaseUrl, supabaseKey);

async function manuallyUpdateEventsForDemo() {
  try {
    // Obtener eventos existentes
    const { data: events, error } = await supabase
      .from('events')
      .select('id, title')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error || !events) {
      console.error('Error fetching events:', error);
      return;
    }

    console.log(`Updating ${events.length} events for demo...`);

    // Actualizar eventos específicos con categorías claras

    // DESTACADOS (primeros 3)
    if (events[0]) {
      await supabase.from('events').update({
        is_featured: true,
        attendees_count: 250,
        latitude: 19.4326,
        longitude: -99.1332
      }).eq('id', events[0].id);
      console.log(`✅ ${events[0].title} → DESTACADO`);
    }

    if (events[1]) {
      await supabase.from('events').update({
        is_featured: true,
        attendees_count: 300,
        latitude: 19.4242,
        longitude: -99.1956
      }).eq('id', events[1].id);
      console.log(`✅ ${events[1].title} → DESTACADO`);
    }

    // POPULARES (siguientes 4)
    if (events[2]) {
      await supabase.from('events').update({
        attendees_count: 400,
        latitude: 19.4133,
        longitude: -99.1767
      }).eq('id', events[2].id);
      console.log(`✅ ${events[2].title} → POPULAR`);
    }

    if (events[3]) {
      await supabase.from('events').update({
        attendees_count: 350,
        latitude: 19.4200,
        longitude: -99.1600
      }).eq('id', events[3].id);
      console.log(`✅ ${events[3].title} → POPULAR`);
    }

    // HOY (siguientes 3)
    if (events[4]) {
      await supabase.from('events').update({
        event_date: '2026-05-06',
        latitude: 19.4100,
        longitude: -99.1700
      }).eq('id', events[4].id);
      console.log(`✅ ${events[4].title} → HOY`);
    }

    if (events[5]) {
      await supabase.from('events').update({
        event_date: '2026-05-06',
        latitude: 19.3742,
        longitude: -99.1733
      }).eq('id', events[5].id);
      console.log(`✅ ${events[5].title} → HOY`);
    }

    // MAÑANA (siguientes 3)
    if (events[6]) {
      await supabase.from('events').update({
        event_date: '2026-05-07',
        latitude: 19.4167,
        longitude: -99.1833
      }).eq('id', events[6].id);
      console.log(`✅ ${events[6].title} → MAÑANA`);
    }

    if (events[7]) {
      await supabase.from('events').update({
        event_date: '2026-05-07',
        latitude: 19.4167,
        longitude: -99.1667
      }).eq('id', events[7].id);
      console.log(`✅ ${events[7].title} → MAÑANA`);
    }

    // CERCA (resto con ubicaciones)
    for (let i = 8; i < Math.min(15, events.length); i++) {
      if (events[i]) {
        await supabase.from('events').update({
          latitude: 19.4326 + (Math.random() - 0.5) * 0.1,
          longitude: -99.1332 + (Math.random() - 0.5) * 0.1,
          attendees_count: Math.floor(Math.random() * 50) + 20
        }).eq('id', events[i].id);
        console.log(`✅ ${events[i].title} → CERCA`);
      }
    }

    console.log('\n🎉 ¡Eventos actualizados para demo!');
    console.log('🔄 Refresca la aplicación para ver los filtros funcionando.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

manuallyUpdateEventsForDemo();