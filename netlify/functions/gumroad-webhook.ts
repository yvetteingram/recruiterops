import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// ─── Supabase Admin Client (bypasses RLS) ───────────────────
// Uses the SERVICE ROLE key, not the anon key
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const handler: Handler = async (event) => {
  // Only accept POST requests from Gumroad
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // ─── Parse Gumroad webhook payload ───────────────────────
    // Gumroad sends data as application/x-www-form-urlencoded
    const params = new URLSearchParams(event.body || '');

    const saleId        = params.get('sale_id');
    const email         = params.get('email');
    const productName   = params.get('product_name');
    const refunded      = params.get('refunded') === 'true';
    const chargebacked  = params.get('chargebacked') === 'true';
    const cancelled     = params.get('cancelled') === 'true';

    console.log('Gumroad webhook received:', {
      saleId, email, productName, refunded, chargebacked, cancelled
    });

    // ─── Validate required fields ─────────────────────────────
    if (!email || !saleId) {
      console.error('Missing required fields: email or sale_id');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing email or sale_id' }),
      };
    }

    // ─── Determine subscription status ───────────────────────
    let subscription_status: string;
    let plan = 'pro'; // default plan for new purchases

    if (refunded || chargebacked || cancelled) {
      subscription_status = 'cancelled';
    } else {
      subscription_status = 'active';
    }

    // ─── Check if user profile exists ────────────────────────
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      // PGRST116 = no rows found, which is fine for new users
      console.error('Error fetching profile:', fetchError);
      throw fetchError;
    }

    if (existingProfile) {
      // ─── Existing user — update their subscription ──────────
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status,
          gumroad_sale_id: saleId,
          plan: subscription_status === 'active' ? plan : existingProfile['plan'],
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log(`✅ Updated profile for ${email} → ${subscription_status}`);
    } else {
      // ─── New user — create a pending profile ─────────────────
      // They'll complete signup via AuthView, this pre-seeds their record
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          email,
          full_name: '',
          plan,
          subscription_status,
          gumroad_sale_id: saleId,
        });

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        throw insertError;
      }

      console.log(`✅ Pre-seeded profile for new user ${email}`);
    }

    // ─── Log the event to usage_logs ─────────────────────────
    await supabase.from('usage_logs').insert({
      customer_id: existingProfile?.id || null,
      action: subscription_status === 'active' ? 'subscription_activated' : 'subscription_cancelled',
      metadata: {
        sale_id: saleId,
        email,
        product_name: productName,
        refunded,
        cancelled,
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, status: subscription_status }),
    };

  } catch (error: any) {
    console.error('Gumroad webhook error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};