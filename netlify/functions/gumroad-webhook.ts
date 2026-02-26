import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

// Map Gumroad product permalink slugs → plan names
const PRODUCT_PLAN_MAP: Record<string, string> = {
  'recruiteros': 'pro',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const gumroadSellerId = process.env.GUMROAD_SELLER_ID;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    return { statusCode: 500, body: JSON.stringify({ error: 'Server misconfiguration' }) };
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  try {
    const params = new URLSearchParams(event.body || '');

    const alertType        = params.get('alert_type') || params.get('type') || 'sale';
    const sellerId         = params.get('seller_id');
    const email            = params.get('email')?.toLowerCase().trim();
    const saleId           = params.get('sale_id');
    const subscriberId     = params.get('subscriber_id');
    const productPermalink = params.get('product_permalink');
    const refunded         = params.get('refunded') === 'true';
    const cancelled        = params.get('cancelled') === 'true';

    // ALWAYS log the raw webhook first — before any other logic
    await supabase.from('webhook_logs').insert({
      alert_type: alertType,
      email,
      sale_id: saleId,
      raw_payload: event.body,
    }).catch(err => console.error('webhook_log insert failed:', err));

    // Verify seller ID — reject anything that doesn't match
    // Only enforce if GUMROAD_SELLER_ID env var is set
    if (gumroadSellerId && sellerId !== gumroadSellerId) {
      console.warn('Unauthorized webhook — seller_id mismatch');
      return { statusCode: 401, body: 'Unauthorized' };
    }

    if (!email || !saleId) {
      return { statusCode: 200, body: JSON.stringify({ success: true, note: 'Ping logged' }) };
    }

    // Determine plan and status from event type
    const plan = PRODUCT_PLAN_MAP[productPermalink ?? ''] ?? 'pro';
    const now = new Date().toISOString();

    let subscriptionStatus: string;
    if (refunded || cancelled || alertType === 'refund') {
      subscriptionStatus = 'cancelled';
    } else if (alertType === 'subscription_ended') {
      subscriptionStatus = 'expired';
    } else {
      subscriptionStatus = 'active';
    }

    // Look up existing profile by email
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('email', email)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existingProfile) {
      // User exists — update their subscription status
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          subscription_status: subscriptionStatus,
          gumroad_sale_id: saleId,
          gumroad_subscriber_id: subscriberId ?? null,
          plan: subscriptionStatus === 'active' ? plan : existingProfile.plan,
          updated_at: now,
        })
        .eq('id', existingProfile.id);

      if (updateError) throw updateError;

      // If cancelled/refunded — archive their jobs and candidates
      if (subscriptionStatus === 'cancelled' || subscriptionStatus === 'expired') {
        const { data: userJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('user_id', existingProfile.id)
          .is('archived_at', null);

        if (userJobs && userJobs.length > 0) {
          const jobIds = userJobs.map((j: any) => j.id);

          await supabase
            .from('jobs')
            .update({ archived_at: now })
            .in('id', jobIds);

          await supabase
            .from('candidates')
            .update({ archived_at: now })
            .in('job_id', jobIds);

          console.log(`Archived ${jobIds.length} jobs for cancelled user ${email}`);
        }

        // Log usage event
        await supabase.from('usage_logs').insert({
          customer_id: existingProfile.id,
          product_id: null,
          action: 'subscription_cancelled',
          metadata: { email, sale_id: saleId, jobs_archived: userJobs?.length || 0 },
        });
      } else {
        // Log activation
        await supabase.from('usage_logs').insert({
          customer_id: existingProfile.id,
          product_id: null,
          action: 'subscription_activated',
          metadata: { email, sale_id: saleId, alert_type: alertType },
        });
      }

      console.log(`Updated profile for ${email} → ${subscriptionStatus}`);

    } else {
      // User hasn't registered yet — store in pending_subscriptions
      // Their profile will be activated when they sign up (via /auth/callback)
      if (subscriptionStatus === 'active') {
        const { error: pendingError } = await supabase
          .from('pending_subscriptions')
          .upsert({
            email,
            plan,
            gumroad_sale_id: saleId,
            gumroad_subscriber_id: subscriberId ?? null,
          });

        if (pendingError) throw pendingError;
        console.log(`Stored pending subscription for unregistered buyer ${email}`);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, status: subscriptionStatus }),
    };

  } catch (error: any) {
    console.error('Webhook error:', error);
    // Return 500 so Gumroad retries — this is a real failure
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal server error' }),
    };
  }
};