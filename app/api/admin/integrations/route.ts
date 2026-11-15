import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/lib/supabase';
import {
  sanitizeMetaAccessToken,
  sanitizeMetaAdAccountId,
  validateMetaAccessToken,
} from '@/lib/meta/sanitize-credentials';

/**
 * GET /api/admin/integrations?brand_id=X
 * Belirli bir markanın veya tüm markaların entegrasyon bilgilerini çeker.
 */
export async function GET(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const brandId = searchParams.get('brand_id');

    let query = supabase.from('integrations').select('*');

    if (brandId) {
      query = query.eq('brand_id', brandId);
    }

    const { data: integrations, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(integrations || []);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/integrations
 * Marka için entegrasyon bilgilerini kaydeder veya günceller (Upsert).
 */
export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı' }, { status: 500 });
    }

    const body = await request.json();
    const { brand_id, platform, credentials } = body;

    if (!brand_id || !platform || !credentials) {
      return NextResponse.json({ error: 'Marka ID, platform ve credentials (kimlik bilgileri) alanları zorunludur.' }, { status: 400 });
    }

    let credsToSave = credentials;
    if (platform === 'meta') {
      const adAccountId = sanitizeMetaAdAccountId(credentials.adAccountId);
      const accessToken = sanitizeMetaAccessToken(credentials.accessToken);
      const tokenError = validateMetaAccessToken(accessToken);
      if (!adAccountId) {
        return NextResponse.json({ error: 'Meta Ad Account ID zorunludur (act_...).' }, { status: 400 });
      }
      if (tokenError) {
        return NextResponse.json({ error: tokenError }, { status: 400 });
      }
      credsToSave = { adAccountId, accessToken };
    }

    // Upsert işlemi (brand_id ve platform UNIQUE ikilisine göre çakışma olursa günceller)
    const { data, error } = await supabase
      .from('integrations')
      .upsert([
        {
          brand_id,
          platform,
          credentials: credsToSave
        }
      ], {
        onConflict: 'brand_id,platform'
      })
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, integration: data?.[0] || data }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/integrations
 * Marka için entegrasyon bilgilerini siler.
 */
export async function DELETE(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase bağlantısı kurulamadı' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const brand_id = searchParams.get('brand_id');
    const platform = searchParams.get('platform');

    if (!brand_id || !platform) {
      return NextResponse.json({ error: 'Marka ID ve platform parametreleri zorunludur.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('integrations')
      .delete()
      .eq('brand_id', brand_id)
      .eq('platform', platform);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
