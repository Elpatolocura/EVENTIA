// Script para modificar eventos existentes y mostrar las secciones
// Ejecutar en la consola del navegador

import { supabase } from './src/lib/supabase.ts';

async function updateEventsForDemo() {
  try {
    // Obtener todos los eventos
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching events:', error);
      return;
    }

    if (!events || events.length === 0) {
      console.log('No events found');
      return;
    }

    console.log(`Found ${events.length} events. Updating first ${Math.min(6, events.length)}...`);

    // Modificar los primeros eventos
    for (let i = 0; i < Math.min(6, events.length); i++) {
      const event = events[i];
      const updates: any = {};

      // Primeros 2: destacados
      if (i < 2) {
        updates.is_featured = true;
        console.log(`Making event ${i + 1} featured: ${event.title}`);
      }

      // Primeros 4: populares
      if (i < 4) {
        updates.attendees_count = Math.floor(Math.random() * 150) + 50;
        console.log(`Making event ${i + 1} popular: ${event.title} (${updates.attendees_count} attendees)`);
      }

      // Algunos para hoy
      if (i < 3) {
        updates.event_date = '2026-05-06'; // Fecha actual
        console.log(`Setting event ${i + 1} for today: ${event.title}`);
      }

      if (Object.keys(updates).length > 0) {
        const { error: updateError } = await supabase
          .from('events')
          .update(updates)
          .eq('id', event.id);

        if (updateError) {
          console.error(`Error updating event ${event.title}:`, updateError);
        } else {
          console.log(`✅ Updated: ${event.title}`);
        }
      }
    }

    console.log('🎉 Demo events updated! Refresh the page to see the sections.');
    console.log('Featured events should appear first, then popular events.');

  } catch (error) {
    console.error('Error in updateEventsForDemo:', error);
  }
}

// Ejecutar la función
updateEventsForDemo();