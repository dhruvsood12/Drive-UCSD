import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No auth' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const userClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_PUBLISHABLE_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { trip_id, amount, payee_id } = await req.json()
    if (!trip_id || !amount || !payee_id) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Check payer is not suspended
    const { data: payerProfile } = await adminClient
      .from('profiles')
      .select('suspended')
      .eq('id', user.id)
      .single()
    
    if (payerProfile?.suspended) {
      return new Response(JSON.stringify({ error: 'Account suspended' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check wallet balance
    const { data: wallet } = await adminClient
      .from('wallets')
      .select('balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet || wallet.balance < amount) {
      return new Response(JSON.stringify({ error: 'Insufficient balance' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Deduct from payer
    await adminClient
      .from('wallets')
      .update({ balance: wallet.balance - amount, updated_at: new Date().toISOString() })
      .eq('user_id', user.id)

    // Credit to payee
    const { data: payeeWallet } = await adminClient
      .from('wallets')
      .select('balance')
      .eq('user_id', payee_id)
      .single()

    if (payeeWallet) {
      await adminClient
        .from('wallets')
        .update({ balance: payeeWallet.balance + amount, updated_at: new Date().toISOString() })
        .eq('user_id', payee_id)
    }

    // Record payment
    const { data: payment, error: paymentError } = await adminClient
      .from('payments')
      .insert({
        payer_id: user.id,
        payee_id,
        trip_id,
        amount,
        status: 'completed',
        description: `Ride payment for trip`,
      })
      .select()
      .single()

    if (paymentError) {
      return new Response(JSON.stringify({ error: 'Payment record failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ success: true, payment }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
