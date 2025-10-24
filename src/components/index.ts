import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Trata a requisição pre-flight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user } } = await supabaseAdmin.auth.getUser(token)

    if (!user) {
      return new Response(JSON.stringify({ error: 'Usuário não autenticado.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const { workout_name, workout_content } = await req.json()

    const { error } = await supabaseAdmin.from('saved_workouts').insert({ user_id: user.id, workout_name, workout_content })

    if (error) throw error

    return new Response(JSON.stringify({ message: 'Treino salvo com sucesso!' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (error) {
    console.error('Erro ao salvar treino:', error)
    return new Response(JSON.stringify({ error: error.message || 'Erro ao salvar o treino.' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})