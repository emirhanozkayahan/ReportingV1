import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, context, brandName } = await req.json();
    const lastMessage = messages[messages.length - 1].content.toLowerCase();

    // GERÇEK SENARYO: 
    // Burada process.env.OPENAI_API_KEY kontrolü yapılıp,
    // "gpt-4o" veya "claude-3-haiku" modellerine System Prompt olarak formatlanmış "context" datası verilir.
    
    // SİMÜLASYON YANITI (Daha gelişmiş NLP "Intent" Analizi):
    await new Promise(resolve => setTimeout(resolve, 1200)); 

    let reply = `Ne yazık ki "${lastMessage}" cümlenizi tam anlayamadım. Güncel gösterge paneli üzerinden kampanyalar, bütçe yönetimi, ROAS veya demografik bilgiler hakkında sorular sorabilirsiniz.`;

    const isQuestioningCampaigns = lastMessage.includes('hangi kampanya') || lastMessage.includes('bütçesini arttır') || lastMessage.includes('hangisine bütçe') || lastMessage.includes('iyi kampanya') || lastMessage.includes('en iyi');
    const isQuestioningSales = lastMessage.includes('ciro') || lastMessage.includes('satış') || lastMessage.includes('sipariş') || lastMessage.includes('roas');
    const isQuestioningIssues = lastMessage.includes('huni') || lastMessage.includes('düşüş') || lastMessage.includes('sepet') || lastMessage.includes('sorun') || lastMessage.includes('neden düşüyor');
    const isQuestioningBudgetLevel = (lastMessage.includes('harcama') || lastMessage.includes('bütçe')) && !isQuestioningCampaigns;
    const isQuestioningAudience = lastMessage.includes('şehir') || lastMessage.includes('kim') || lastMessage.includes('kitle') || lastMessage.includes('hedef');

    if (isQuestioningCampaigns) {
       const sortedCampaigns = context.campaigns.sort((a: any, b: any) => b.roas - a.roas);
       const bestCampaign = sortedCampaigns[0];
       const worstCampaign = sortedCampaigns[sortedCampaigns.length - 1];
       
       reply = `Kesinlikle ${bestCampaign.platform} platformundaki "${bestCampaign.name}" kampanyasına bütçe aktarmalısınız. Şu an ${bestCampaign.roas}x gibi mükemmel bir ROAS ile çalışıyor. Bütçeyi, daha zayıf performans gösteren (${worstCampaign.roas}x ROAS) "${worstCampaign.name}" kampanyasından kısarak transfer etmenizi öneririm.`;
    }
    else if (isQuestioningBudgetLevel) {
       reply = `Şu ana kadar toplam harcamanız ₺${context.stats.totalSpend.toLocaleString('tr-TR')} seviyesinde. (Meta: ₺${context.stats.metaSpend.toLocaleString('tr-TR')}, Google: ₺${context.stats.googleSpend.toLocaleString('tr-TR')}). Harcamalar hedeflenen ROI bantlarında ilerliyor.`;
    } 
    else if (isQuestioningSales) {
       reply = `Bugün harika bir gidişat var! ₺${context.stats.revenue.toLocaleString('tr-TR')} toplam ciro gerçekleştirildi ve toplam ${context.stats.orderCount} adet sipariş aldınız. Genel ROAS ortalamanız ${context.stats.roi}x, yani kârlılıktayız. Hacmi büyütmek için üstteki en iyi kampanyalara daha fazla bütçe verebiliriz.`;
    }
    else if (isQuestioningAudience) {
       const topCity = context.cities.sort((a: any, b: any) => b.purchases - a.purchases)[0];
       const topGender = context.gender.sort((a: any, b: any) => b.value - a.value)[0];
       reply = `Demografik verilere göre %${topGender.value} ile satışlarınızın neredeyse tamamı ${topGender.name} giyim üzerine şekilleniyor. Ayrıca lojistik/satış yoğunluğunda en çok ${topCity.name} şehrine (toplam satışın büyük kısmı) ulaşıyoruz. Kreatiflerde İzmir'e özel vurgular yapmayı test edebiliriz.`;
    }
    else if (isQuestioningIssues) {
       const cartStep = context.funnel.find((s: any) => s.step.includes('Sepete Ekleme'))?.percentage;
       const checkoutStep = context.funnel.find((s: any) => s.step.includes('Ödeme'))?.percentage;
       reply = `Temel sorununuz dönüşüm hunisinin alt kısmında. Müşterileriniz ürünü inlese de "Sepete Ekleme" oranı dramatik şekilde %${cartStep}'e düşüyor ve Ödeme tamamlanma oranı sadece %${checkoutStep}. Ürün sayfalarındaki butonları belirginleştirmeli ve sepet terkleri için Meta'da acil bir Remarketing (Yeniden Hedefleme) kampanyası açmalıyız.`;
    }
    else if (lastMessage.includes('hayır') || lastMessage.includes('değil')) {
       reply = `Anlıyorum, sanırım bir yanlış anlama oldu. Detaylı tabloyu analiz ederek size farklı bir öneri sunmamı ister misiniz? Lütfen neyi iyileştirmek istediğinizi söyleyin (Örn: Ciro, Kampanya Tespiti vs.).`;
    }

    return NextResponse.json({ reply });

  } catch (error) {
    console.error("AI API Error:", error);
    return NextResponse.json(
      { error: "İletişim sırasında bir hata oluştu." },
      { status: 500 }
    );
  }
}
