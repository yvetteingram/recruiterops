import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  try {
    const { email, userId } = JSON.parse(event.body || '{}');

    if (!email || !userId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing email or userId' }) };
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Check for a pending subscription for this email
    const { data: pending, error: fetchError } = await supabase
      .from('pending_subscriptions')
      .select('plan, gumroad_sale_id, gumroad_subscriber_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError || !pending) {
      // No pending subscription — nothing to claim, not an error
      return { statusCode: 200, body: JSON.stringify({ activated: false }) };
    }

    // Activate the profile with the pending subscription data
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan: pending.plan,
        subscription_status: 'active',
        gumroad_sale_id: pending.gumroad_sale_id,
        gumroad_subscriber_id: pending.gumroad_subscriber_id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    // Clean up pending record
    await supabase
      .from('pending_subscriptions')
      .delete()
      .eq('email', email.toLowerCase().trim());

    console.log(`Activated pending subscription for ${email} → plan: ${pending.plan}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ activated: true, plan: pending.plan }),
    };

  } catch (error: any) {
    console.error('confirm-subscription error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};