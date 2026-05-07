import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  const { record } = await req.json()

  const supabase = createClient(
    SUPABASE_URL!,
    SUPABASE_SERVICE_ROLE_KEY!
  )

  // 1. Get user's FCM token
  const { data: profile } = await supabase
    .from('profiles')
    .select('fcm_token')
    .eq('id', record.user_id)
    .single()

  if (!profile?.fcm_token) {
    return new Response(JSON.stringify({ message: 'No token found' }), { status: 200 })
  }

  // 2. Prepare FCM payload
  const fcmPayload = {
    to: profile.fcm_token,
    notification: {
      title: record.title,
      body: record.message,
    },
    data: {
      url: record.action_url || '',
      type: record.type,
      related_id: record.related_id || '',
    },
  }

  // 3. Send to FCM
  const res = await fetch('https://fcm.googleapis.com/fcm/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify(fcmPayload),
  })

  const result = await res.json()

  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  })
})
