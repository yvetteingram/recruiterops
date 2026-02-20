import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    return { statusCode: 500, body: JSON.stringify({ error: 'Missing environment variables' }) };
  }

  try {
    const params = new URLSearchParams(event.body || '');
    const allParams: Record<string, string> = {};
    params.forEach((value, key) => { allParams[key] = value; });

    const saleId      = params.get('sale_id');
    const email       = params.get('email');
    const productName = params.get('product_name');
    const refunded    = params.get('refunded') === 'true';
    const cancelled   = params.get('cancelled') === 'true';

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    // Always log the webhook
    await supabase.from('usage_logs').insert({
      customer_id: null,
      action: 'webhook_received',
      metadata: { sale_id: saleId, email, product_name: productName, all_params: allParams },
    });

    if (!email || !saleId) {
      return { statusCode: 200, body: JSON.stringify({ success: true, note: 'Ping logged' }) };
    }

    const subscription_status = (refunded || cancelled) ? 'cancelled' : 'active';

    // Find existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles').select('id, email').eq('email', email).single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    if (existingProfile) {
      // Update subscription status
      await supabase.from('profiles')
        .update({ subscription_status, gumroad_sale_id: saleId, plan: 'pro' })
        .eq('email', email);

      if (subscription_status === 'cancelled') {
        // Archive all jobs for this user
        const { data: userJobs } = await supabase
          .from('jobs')
          .select('id')
          .eq('user_id', existingProfile.id)
          .is('archived_at', null);

        if (userJobs && userJobs.length > 0) {
          const jobIds = userJobs.map(j => j.id);

          // Archive jobs
          await supabase.from('jobs')
            .update({ archived_at: new Date().toISOString() })
            .in('id', jobIds);

          // Archive candidates on those jobs
          await supabase.from('candidates')
            .update({ archived_at: new Date().toISOString() })
            .in('job_id', jobIds);

          console.log(`Archived ${jobIds.length} job orders for cancelled user ${email}`);
        }

        await supabase.from('usage_logs').insert({
          customer_id: existingProfile.id,
          action: 'subscription_cancelled',
          metadata: { email, sale_id: saleId, jobs_archived: userJobs?.length || 0 },
        });
      } else {
        await supabase.from('usage_logs').insert({
          customer_id: existingProfile.id,
          action: 'subscription_activated',
          metadata: { email, sale_id: saleId },
        });
      }
    } else {
      // New buyer — pre-seed profile
      await supabase.from('profiles').insert({
        id: crypto.randomUUID(),
        email,
        full_name: '',
        plan: 'pro',
        subscription_status,
        gumroad_sale_id: saleId,
      });
      console.log(`Pre-seeded profile for ${email}`);
    }

    return { statusCode: 200, body: JSON.stringify({ success: true, status: subscription_status }) };

  } catch (error: any) {
    console.error('Webhook error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message || 'Internal server error' }) };
  }
};