'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Settings,
  Plus,
  Save,
  RotateCw,
  Check,
  AlertCircle,
  ChevronRight,
  Trash2,
  Store,
  Globe,
  Layers,
  Database,
  LineChart,
  ShoppingCart,
  ShoppingBag,
  Package,
  Box,
} from 'lucide-react';
import AdminHeader from '@/components/admin/admin-header';
import AdminSidebar from '@/components/admin/admin-sidebar';
import AdminPlatformNav from '@/components/admin/admin-platform-nav';
import BrandSettingsPanel from '@/components/admin/brand-settings-panel';
import ReportCard from '@/components/dashboard/report-card';
import { getPlatformLabel } from '@/lib/admin-platforms';

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  ga4_property_id?: string;
  user_count?: number;
}

interface Integration {
  id?: string;
  brand_id: string;
  platform: string;
  credentials: any;
}

export default function AdminPage() {
  // State
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ikas');
  const [showNewBrandForm, setShowNewBrandForm] = useState(false);
  
  // Brand Form
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandSlug, setNewBrandSlug] = useState('');
  const [newBrandLogo, setNewBrandLogo] = useState('');
  const [newBrandGa4PropertyId, setNewBrandGa4PropertyId] = useState('');
  
  // Edit Brand Form
  const [editBrandLogo, setEditBrandLogo] = useState('');
  const [editBrandGa4PropertyId, setEditBrandGa4PropertyId] = useState('');
  const [brandUsers, setBrandUsers] = useState<any[]>([]);
  const [newBrandUserEmail, setNewBrandUserEmail] = useState('');
  const [newBrandUserPassword, setNewBrandUserPassword] = useState('');
  const [resettingUserId, setResettingUserId] = useState<string | null>(null);
  const [resetUserPassword, setResetUserPassword] = useState('');

  // Integration Forms
  const [ikasCreds, setIkasCreds] = useState({ storeName: '', clientId: '', clientSecret: '' });
  const [shopifyCreds, setShopifyCreds] = useState({ storeUrl: '', accessToken: '' });
  const [tsoftCreds, setTsoftCreds] = useState({ apiUrl: '', username: '', password: '' });
  const [ticimaxCreds, setTicimaxCreds] = useState({ apiUrl: '', apiKey: '' });
  const [wordpressCreds, setWordpressCreds] = useState({ siteUrl: '', consumerKey: '', consumerSecret: '' });
  const [ideasoftCreds, setIdeasoftCreds] = useState({ apiUrl: '', accessToken: '' });
  const [faprikaCreds, setFaprikaCreds] = useState({ apiUrl: '', apiKey: '' });
  const [googleCreds, setGoogleCreds] = useState({ customerId: '' });
  const [googleAnalyticsCreds, setGoogleAnalyticsCreds] = useState({ propertyId: '' });
  const [metaCreds, setMetaCreds] = useState({ adAccountId: '', accessToken: '' });

  // Status
  const [loading, setLoading] = useState({ brands: false, integrations: false, sync: false, action: false });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Load data
  useEffect(() => {
    fetchBrands();

    // Check for Google OAuth callback params
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('google_success')) {
      showToast('Google Analytics Hesabı başarıyla bağlandı!', 'success');
      window.history.replaceState({}, '', '/admin');
    } else if (searchParams.get('google_error')) {
      showToast('Google Analytics bağlantısı başarısız oldu: ' + searchParams.get('google_error'), 'error');
      window.history.replaceState({}, '', '/admin');
    } else if (searchParams.get('google_ads_success')) {
      showToast('Google Ads Hesabı başarıyla bağlandı!', 'success');
      window.history.replaceState({}, '', '/admin');
    } else if (searchParams.get('google_ads_error')) {
      showToast('Google Ads bağlantısı başarısız oldu: ' + searchParams.get('google_ads_error'), 'error');
      window.history.replaceState({}, '', '/admin');
    }
  }, []);

  useEffect(() => {
    if (selectedBrandId) {
      fetchIntegrations(selectedBrandId);
      fetchBrandUsers(selectedBrandId);
      const b = brands.find(br => br.id === selectedBrandId);
      if (b) {
        setEditBrandLogo(b.logo_url || '');
        setEditBrandGa4PropertyId(b.ga4_property_id || '');
      }
    }
  }, [selectedBrandId, brands]);

  // Show auto-fading toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchBrands = async () => {
    setLoading(prev => ({ ...prev, brands: true }));
    try {
      const res = await fetch('/api/admin/brands');
      if (!res.ok) throw new Error('Markalar yüklenemedi.');
      const data = await res.json();
      setBrands(data);
      if (data.length > 0 && !selectedBrandId) {
        setSelectedBrandId(data[0].id);
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, brands: false }));
    }
  };

  const fetchIntegrations = async (brandId: string) => {
    setLoading(prev => ({ ...prev, integrations: true }));
    try {
      const res = await fetch(`/api/admin/integrations?brand_id=${brandId}`);
      if (!res.ok) throw new Error('Entegrasyonlar yüklenemedi.');
      const data: Integration[] = await res.json();

      // Reset forms
      setIkasCreds({ storeName: '', clientId: '', clientSecret: '' });
      setShopifyCreds({ storeUrl: '', accessToken: '' });
      setTsoftCreds({ apiUrl: '', username: '', password: '' });
      setTicimaxCreds({ apiUrl: '', apiKey: '' });
      setWordpressCreds({ siteUrl: '', consumerKey: '', consumerSecret: '' });
      setIdeasoftCreds({ apiUrl: '', accessToken: '' });
      setFaprikaCreds({ apiUrl: '', apiKey: '' });
      setGoogleCreds({ customerId: '' });
      setGoogleAnalyticsCreds({ propertyId: '' });
      setMetaCreds({ adAccountId: '', accessToken: '' });

      // Populate based on active integrations
      data.forEach(integration => {
        if (integration.platform === 'ikas') {
          setIkasCreds({
            storeName: integration.credentials.storeName || '',
            clientId: integration.credentials.clientId || '',
            clientSecret: integration.credentials.clientSecret || '',
          });
        } else if (integration.platform === 'google') {
          setGoogleCreds({
            customerId: integration.credentials.customerId || '',
          });
        } else if (integration.platform === 'meta') {
          setMetaCreds({
            adAccountId: integration.credentials.adAccountId || '',
            accessToken: integration.credentials.accessToken || '',
          });
        } else if (integration.platform === 'shopify') {
          setShopifyCreds({
            storeUrl: integration.credentials.storeUrl || '',
            accessToken: integration.credentials.accessToken || '',
          });
        } else if (integration.platform === 'tsoft') {
          setTsoftCreds({
            apiUrl: integration.credentials.apiUrl || '',
            username: integration.credentials.username || '',
            password: integration.credentials.password || '',
          });
        } else if (integration.platform === 'ticimax') {
          setTicimaxCreds({
            apiUrl: integration.credentials.apiUrl || '',
            apiKey: integration.credentials.apiKey || '',
          });
        } else if (integration.platform === 'wordpress') {
          setWordpressCreds({
            siteUrl: integration.credentials.siteUrl || '',
            consumerKey: integration.credentials.consumerKey || '',
            consumerSecret: integration.credentials.consumerSecret || '',
          });
        } else if (integration.platform === 'ideasoft') {
          setIdeasoftCreds({
            apiUrl: integration.credentials.apiUrl || '',
            accessToken: integration.credentials.accessToken || '',
          });
        } else if (integration.platform === 'faprika') {
          setFaprikaCreds({
            apiUrl: integration.credentials.apiUrl || '',
            apiKey: integration.credentials.apiKey || '',
          });
        } else if (integration.platform === 'google_analytics') {
          setGoogleAnalyticsCreds({
            propertyId: integration.credentials.propertyId || '',
          });
        }
      });
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, integrations: false }));
    }
  };

  // Auto slug generation (Turkish character friendly)
  const handleBrandNameChange = (name: string) => {
    setNewBrandName(name);
    
    // Turkish to English letter map
    const turkishChars: { [key: string]: string } = {
      'ı': 'i', 'ş': 's', 'ğ': 'g', 'ü': 'u', 'ö': 'o', 'ç': 'c',
      'İ': 'i', 'Ş': 's', 'Ğ': 'g', 'Ü': 'u', 'Ö': 'o', 'Ç': 'c'
    };
    
    let slug = name.split('').map(char => turkishChars[char] || char).join('');
    slug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
      .replace(/\s+/g, '-')         // Collapse whitespace to single hyphen
      .replace(/-+/g, '-');         // Collapse multiple hyphens
      
    setNewBrandSlug(slug);
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrandName || !newBrandSlug) return;

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newBrandName,
          slug: newBrandSlug,
          logo_url: newBrandLogo || null,
          ga4_property_id: newBrandGa4PropertyId || null,
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Marka eklenirken hata oluştu.');

      showToast(`"${newBrandName}" markası başarıyla oluşturuldu!`, 'success');
      setNewBrandName('');
      setNewBrandSlug('');
      setNewBrandLogo('');
      setNewBrandGa4PropertyId('');
      setShowNewBrandForm(false);
      if (data.brand?.id) {
        setSelectedBrandId(data.brand.id);
      }
      fetchBrands();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) return;

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch('/api/admin/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedBrandId,
          logo_url: editBrandLogo || null,
          ga4_property_id: editBrandGa4PropertyId || null,
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Marka güncellenirken hata oluştu.');

      showToast('Marka ayarları başarıyla güncellendi!', 'success');
      fetchBrands();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteBrand = async () => {
    if (!selectedBrandId) return;
    if (!confirm('Bu markayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`/api/admin/brands?id=${selectedBrandId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Marka silinirken hata oluştu.');

      showToast('Marka başarıyla silindi!', 'success');
      setSelectedBrandId('');
      fetchBrands();
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleBackfillBrand = async () => {
    if (!selectedBrandId) return;
    if (!confirm('Son 365 günün verilerini çekmek uzun sürebilir. Sayfayı kapatmayın. Onaylıyor musunuz?')) return;

    setLoading(prev => ({ ...prev, action: true }));
    const CHUNK_SIZE = 15;
    const TOTAL_DAYS = 365;
    const chunks = Math.ceil(TOTAL_DAYS / CHUNK_SIZE);

    try {
      const slug = brands.find((b) => b.id === selectedBrandId)?.slug;
      if (!slug) throw new Error('Marka bulunamadı.');

      for (let i = 0; i < chunks; i++) {
        const startOffset = i * CHUNK_SIZE;
        const days = Math.min(CHUNK_SIZE, TOTAL_DAYS - startOffset);
        const res = await fetch(`/api/admin/brands/${slug}/backfill`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days, startOffset }),
        });
        if (!res.ok) console.error(`Chunk ${i} failed`);
      }

      showToast('Geçmiş veriler başarıyla aktarıldı! Artık raporlarda görebilirsiniz.', 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleSaveIntegration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId) return;

    setLoading(prev => ({ ...prev, action: true }));
    
    let credentials = {};
    if (selectedPlatform === 'ikas') {
      credentials = ikasCreds;
    } else if (selectedPlatform === 'shopify') {
      credentials = shopifyCreds;
    } else if (selectedPlatform === 'tsoft') {
      credentials = tsoftCreds;
    } else if (selectedPlatform === 'ticimax') {
      credentials = ticimaxCreds;
    } else if (selectedPlatform === 'wordpress') {
      credentials = wordpressCreds;
    } else if (selectedPlatform === 'ideasoft') {
      credentials = ideasoftCreds;
    } else if (selectedPlatform === 'faprika') {
      credentials = faprikaCreds;
    } else if (selectedPlatform === 'google') {
      credentials = googleCreds;
    } else if (selectedPlatform === 'google_analytics') {
      credentials = googleAnalyticsCreds;
    } else if (selectedPlatform === 'meta') {
      credentials = metaCreds;
    }

    try {
      const res = await fetch('/api/admin/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_id: selectedBrandId,
          platform: selectedPlatform,
          credentials
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Entegrasyon kaydedilirken hata oluştu.');

      showToast(`${selectedPlatform.toUpperCase()} entegrasyon ayarları başarıyla kaydedildi!`, 'success');
      fetchIntegrations(selectedBrandId);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteIntegration = async () => {
    if (!selectedBrandId) return;
    if (!confirm(`Bu markanın ${selectedPlatform.toUpperCase()} entegrasyonunu silmek istediğinize emin misiniz?`)) return;

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`/api/admin/integrations?brand_id=${selectedBrandId}&platform=${selectedPlatform}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Entegrasyon silinirken hata oluştu.');

      showToast(`${selectedPlatform.toUpperCase()} entegrasyonu başarıyla kaldırıldı!`, 'success');
      fetchIntegrations(selectedBrandId);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const fetchBrandUsers = async (brandId: string) => {
    try {
      const res = await fetch(`/api/admin/brand-users?brand_id=${brandId}`);
      if (res.ok) {
        const data = await res.json();
        setBrandUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddBrandUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBrandId || !newBrandUserEmail || !newBrandUserPassword) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch('/api/admin/brand-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand_id: selectedBrandId, email: newBrandUserEmail, password: newBrandUserPassword })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Kullanıcı eklenemedi');
      }
      showToast('Kullanıcı eklendi', 'success');
      setNewBrandUserEmail('');
      setNewBrandUserPassword('');
      fetchBrandUsers(selectedBrandId);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleResetBrandUserPassword = async (userId: string) => {
    if (!resetUserPassword.trim()) {
      showToast('Yeni şifre girin', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch('/api/admin/brand-users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, password: resetUserPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Şifre güncellenemedi');

      showToast('Kullanıcı şifresi güncellendi', 'success');
      setResettingUserId(null);
      setResetUserPassword('');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleDeleteBrandUser = async (id: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
    setLoading(prev => ({ ...prev, action: true }));
    try {
      const res = await fetch(`/api/admin/brand-users?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Silinemedi');
      showToast('Kullanıcı silindi', 'success');
      fetchBrandUsers(selectedBrandId);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const handleTriggerSync = async () => {
    setLoading(prev => ({ ...prev, sync: true }));
    showToast('Tüm markaların verileri çekiliyor, bu işlem biraz sürebilir...', 'info');
    
    try {
      const res = await fetch('/api/admin/sync?history=30');
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Senkronizasyon başarısız oldu.');
      
      showToast(`Senkronizasyon başarıyla tamamlandı! Başarılı: ${data.details?.successCount || 0}, Hatalı: ${data.details?.failCount || 0}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, sync: false }));
    }
  };

  const handleTriggerBrandSync = async () => {
    if (!selectedBrandId) return;
    setLoading(prev => ({ ...prev, action: true }));
    showToast('Seçili markanın verileri çekiliyor, lütfen bekleyin...', 'info');
    
    try {
      const res = await fetch(`/api/admin/sync?history=30&brand_id=${selectedBrandId}`);
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Marka senkronizasyonu başarısız oldu.');
      
      showToast(`Marka verileri başarıyla eşitlendi! Başarılı: ${data.details?.successCount || 0}, Hatalı: ${data.details?.failCount || 0}`, 'success');
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  };

  const selectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    setShowNewBrandForm(false);
  };

  const handleSelectBrand = (brandId: string) => {
    setSelectedBrandId(brandId);
    setShowNewBrandForm(false);
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <div className="text-slate-700 font-sans">
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl transition-all duration-300 border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' :
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' :
          'bg-[#F5403F]/10 border-[#F5403F]/20 text-[#F5403F]'
        }`}>
          {toast.type === 'success' && <Check className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {toast.type === 'info' && <RotateCw className="w-5 h-5 text-[#F5403F] animate-spin" />}
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      <AdminSidebar
        brands={brands}
        selectedBrandId={selectedBrandId}
        onSelectBrand={handleSelectBrand}
        showNewBrandForm={showNewBrandForm}
        onShowNewBrand={() => setShowNewBrandForm(true)}
        loadingBrands={loading.brands}
        loadingSync={loading.sync}
        onTriggerSync={handleTriggerSync}
      />

      <div className="lg:pl-[260px] pt-14 lg:pt-0 min-h-screen w-full overflow-x-hidden">
        <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
          {showNewBrandForm ? (
            <>
              <AdminHeader
                title="Yeni Marka Ekle"
                description="Yeni bir marka oluşturun ve entegrasyonları yapılandırın."
              />
              <ReportCard label="Marka" title="Marka Bilgileri" icon={Plus} accent="brand">
                <form onSubmit={handleCreateBrand} className="space-y-4 -mt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Marka Adı</label>
                    <input
                      type="text"
                      required
                      placeholder="Örn: Natura Home"
                      value={newBrandName}
                      onChange={(e) => handleBrandNameChange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all placeholder:text-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">URL Slug (Otomatik)</label>
                    <input
                      type="text"
                      required
                      placeholder="natura-home"
                      value={newBrandSlug}
                      onChange={(e) => setNewBrandSlug(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all font-mono text-sm"
                    />
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 leading-relaxed">
                    Müşteri giriş hesaplarını marka oluşturduktan sonra sağdaki{' '}
                    <span className="font-semibold text-slate-800">Yönetim → Marka Ayarları</span>{' '}
                    bölümünden ekleyin. Şifreler güvenlik için listede gösterilmez.
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">GA4 Mülk ID (Property ID)</label>
                    <input
                      type="text"
                      placeholder="Örn: 123456789"
                      value={newBrandGa4PropertyId}
                      onChange={(e) => setNewBrandGa4PropertyId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all placeholder:text-slate-500 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Marka Logosu (İsteğe Bağlı)</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setNewBrandLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5403F]/10 file:text-[#F5403F] hover:file:bg-[#F5403F]/15 transition-all"
                    />
                    {newBrandLogo && <img src={newBrandLogo} alt="Logo Önizleme" className="mt-3 h-12 object-contain" />}
                  </div>

                  <button
                    type="submit"
                    disabled={loading.action || !newBrandName}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#F5403F] text-white font-semibold rounded-xl text-sm hover:bg-[#D93635] active:scale-98 transition-all disabled:opacity-50"
                  >
                    {loading.action ? 'Ekleniyor...' : 'Markayı Ekle'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </form>
              </ReportCard>
            </>
          ) : (
            <div className={`grid gap-6 ${selectedBrandId ? 'lg:grid-cols-[1fr_240px]' : ''}`}>
              <div className="space-y-6 min-w-0">
              <AdminHeader
                title={
                  selectedBrand
                    ? `${selectedBrand.name} — ${getPlatformLabel(selectedPlatform)}`
                    : 'Entegrasyonlar'
                }
                description={
                  selectedBrand
                    ? 'Seçili marka için API bağlantı anahtarları ve ayarlar'
                    : 'Soldan bir marka seçin veya yeni marka ekleyin'
                }
                showBrandSync={!!selectedBrandId}
                loadingBrandSync={loading.action}
                onTriggerBrandSync={handleTriggerBrandSync}
              />

              {selectedBrandId && (
                <div className="lg:hidden rounded-2xl border border-slate-200 bg-white p-4">
                  <AdminPlatformNav
                    selectedPlatform={selectedPlatform}
                    onSelectPlatform={selectPlatform}
                    brandSlug={selectedBrand?.slug}
                  />
                </div>
              )}

              <ReportCard
                label="Ayarlar"
                title={getPlatformLabel(selectedPlatform)}
                description={selectedBrand ? `/${selectedBrand.slug}` : undefined}
                icon={Settings}
                accent="brand"
                className="min-h-[450px]"
              >
            <div className="relative z-0">
            {!selectedBrandId ? (
              <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
                <Building2 className="w-12 h-12 stroke-[1.5]" />
                <p className="text-sm font-medium">Ayarları düzenlemek için soldan bir marka seçin veya yeni oluşturun.</p>
              </div>
            ) : loading.integrations ? (
              <div className="py-20 flex justify-center items-center">
                <RotateCw className="w-10 h-10 text-slate-500 animate-spin" />
              </div>
            ) : selectedPlatform === 'brand_settings' ? (
                  <BrandSettingsPanel
                    brandName={selectedBrand?.name ?? ''}
                    brandSlug={selectedBrand?.slug ?? ''}
                    userCount={brandUsers.length}
                    editBrandLogo={editBrandLogo}
                    onEditBrandLogoChange={setEditBrandLogo}
                    editBrandGa4PropertyId={editBrandGa4PropertyId}
                    onEditBrandGa4PropertyIdChange={setEditBrandGa4PropertyId}
                    brandUsers={brandUsers}
                    newBrandUserEmail={newBrandUserEmail}
                    onNewBrandUserEmailChange={setNewBrandUserEmail}
                    newBrandUserPassword={newBrandUserPassword}
                    onNewBrandUserPasswordChange={setNewBrandUserPassword}
                    resettingUserId={resettingUserId}
                    onResettingUserIdChange={setResettingUserId}
                    resetUserPassword={resetUserPassword}
                    onResetUserPasswordChange={setResetUserPassword}
                    loading={loading.action}
                    onUpdateBrand={handleUpdateBrand}
                    onAddBrandUser={handleAddBrandUser}
                    onResetBrandUserPassword={handleResetBrandUserPassword}
                    onDeleteBrandUser={handleDeleteBrandUser}
                    onBackfill={handleBackfillBrand}
                    onDeleteBrand={handleDeleteBrand}
                  />
                ) : (
                  <form onSubmit={handleSaveIntegration} className="space-y-6">
                    {/* Platform Specific Form Fields */}
                    {selectedPlatform === 'ikas' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-800 mb-2">
                          <Database className="w-5 h-5 text-[#F5403F] flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">İkas Entegrasyonu</p>
                            Mağazanızdan günlük ciro ve sipariş verilerini çekmek için İkas Admin API kimlik bilgilerini eksiksiz tanımlayınız.
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Mağaza Adı (Store Name)</label>
                          <div className="flex items-center border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-[#F5403F]/20 focus-within:border-[#F5403F]/50 overflow-hidden bg-white">
                            <input
                              type="text"
                              required
                              placeholder="Örn: navira"
                              value={ikasCreds.storeName}
                              onChange={(e) => setIkasCreds({ ...ikasCreds, storeName: e.target.value })}
                              className="flex-grow px-4 py-3 focus:outline-none border-none text-sm"
                            />
                            <span className="px-4 py-3 bg-slate-50 text-slate-500 text-xs font-bold border-l border-slate-200">.myikas.com</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Client ID</label>
                          <input
                            type="text"
                            required
                            placeholder="İkas panelinden aldığınız Client ID"
                            value={ikasCreds.clientId}
                            onChange={(e) => setIkasCreds({ ...ikasCreds, clientId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm placeholder:text-slate-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Client Secret</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••••••••••••••••••••••••••"
                            value={ikasCreds.clientSecret}
                            onChange={(e) => setIkasCreds({ ...ikasCreds, clientSecret: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm placeholder:text-slate-500 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'shopify' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-green-50/50 border border-green-100 rounded-xl p-4 flex gap-3 text-xs text-green-800 mb-2">
                          <ShoppingCart className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Shopify Entegrasyonu</p>
                            Shopify Admin API bilgilerinizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Mağaza URL</label>
                          <input type="text" required placeholder="Örn: magazaniz.myshopify.com" value={shopifyCreds.storeUrl} onChange={(e) => setShopifyCreds({ ...shopifyCreds, storeUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Access Token</label>
                          <input type="password" required placeholder="shpat_..." value={shopifyCreds.accessToken} onChange={(e) => setShopifyCreds({ ...shopifyCreds, accessToken: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'tsoft' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-800 mb-2">
                          <ShoppingBag className="w-5 h-5 text-slate-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">T-Soft Entegrasyonu</p>
                            T-Soft API bilgilerinizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API URL</label>
                          <input type="text" required placeholder="Örn: https://www.magazaniz.com/Rest1" value={tsoftCreds.apiUrl} onChange={(e) => setTsoftCreds({ ...tsoftCreds, apiUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Kullanıcı Adı</label>
                          <input type="text" required placeholder="Kullanıcı adı" value={tsoftCreds.username} onChange={(e) => setTsoftCreds({ ...tsoftCreds, username: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Şifre</label>
                          <input type="password" required placeholder="••••••••" value={tsoftCreds.password} onChange={(e) => setTsoftCreds({ ...tsoftCreds, password: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'ticimax' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-purple-50/50 border border-purple-100 rounded-xl p-4 flex gap-3 text-xs text-purple-800 mb-2">
                          <Package className="w-5 h-5 text-purple-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Ticimax Entegrasyonu</p>
                            Ticimax API bilgilerinizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API URL</label>
                          <input type="text" required placeholder="Örn: https://www.magazaniz.com/Servis/SiparisServis.svc" value={ticimaxCreds.apiUrl} onChange={(e) => setTicimaxCreds({ ...ticimaxCreds, apiUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API Anahtarı (Token)</label>
                          <input type="password" required placeholder="API Token" value={ticimaxCreds.apiKey} onChange={(e) => setTicimaxCreds({ ...ticimaxCreds, apiKey: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'wordpress' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-800 mb-2">
                          <Globe className="w-5 h-5 text-[#F5403F] flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Wordpress (WooCommerce) Entegrasyonu</p>
                            WooCommerce REST API bilgilerinizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Site URL</label>
                          <input type="text" required placeholder="Örn: https://www.magazaniz.com" value={wordpressCreds.siteUrl} onChange={(e) => setWordpressCreds({ ...wordpressCreds, siteUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Consumer Key</label>
                          <input type="text" required placeholder="ck_..." value={wordpressCreds.consumerKey} onChange={(e) => setWordpressCreds({ ...wordpressCreds, consumerKey: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Consumer Secret</label>
                          <input type="password" required placeholder="cs_..." value={wordpressCreds.consumerSecret} onChange={(e) => setWordpressCreds({ ...wordpressCreds, consumerSecret: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'ideasoft' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex gap-3 text-xs text-slate-700 mb-2">
                          <Box className="w-5 h-5 text-[#F5403F] flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">İdeasoft Entegrasyonu</p>
                            İdeasoft API bilgilerinizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API URL</label>
                          <input type="text" required placeholder="Örn: https://www.magazaniz.com/api" value={ideasoftCreds.apiUrl} onChange={(e) => setIdeasoftCreds({ ...ideasoftCreds, apiUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Access Token</label>
                          <input type="password" required placeholder="API Access Token" value={ideasoftCreds.accessToken} onChange={(e) => setIdeasoftCreds({ ...ideasoftCreds, accessToken: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'faprika' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-teal-50/50 border border-teal-100 rounded-xl p-4 flex gap-3 text-xs text-teal-800 mb-2">
                          <Store className="w-5 h-5 text-teal-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Faprika Entegrasyonu</p>
                            Faprika API bilgilerinizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API URL</label>
                          <input type="text" required placeholder="Örn: https://www.magazaniz.com/api" value={faprikaCreds.apiUrl} onChange={(e) => setFaprikaCreds({ ...faprikaCreds, apiUrl: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API Key</label>
                          <input type="password" required placeholder="API Key" value={faprikaCreds.apiKey} onChange={(e) => setFaprikaCreds({ ...faprikaCreds, apiKey: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'google' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 flex gap-3 text-xs text-amber-800 mb-2">
                          <Globe className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Google Ads Entegrasyonu</p>
                            Seçili markanın Google MCC (Manager) hesabınız altındaki spesifik müşteri ID'sini (Customer ID) girin.
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Müşteri Numarası (Customer ID)</label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: 153-426-9078"
                            value={googleCreds.customerId}
                            onChange={(e) => setGoogleCreds({ customerId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm placeholder:text-slate-500 font-mono"
                          />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'google_analytics' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-yellow-50/50 border border-yellow-200 rounded-xl p-4 flex gap-3 text-xs text-yellow-800 mb-2">
                          <LineChart className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Google Analytics (GA4) Entegrasyonu</p>
                            Google Analytics 4 Property ID'nizi giriniz.
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Property ID (Mülk ID)</label>
                          <input type="text" required placeholder="Örn: 123456789" value={googleAnalyticsCreds.propertyId} onChange={(e) => setGoogleAnalyticsCreds({ propertyId: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm font-mono" />
                        </div>
                      </div>
                    )}

                    {selectedPlatform === 'meta' && (
                      <div className="space-y-4 animate-fadeIn">
                        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-xs text-indigo-800 mb-2">
                          <Layers className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                          <div>
                            <p className="font-bold mb-0.5">Meta Ads (Facebook/Instagram) Entegrasyonu</p>
                            System User token ve reklam hesabı ID kaydedilir. Meta raporu ve &quot;Verileri Eşitle&quot; bu bilgileri kullanır.
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Reklam Hesabı ID (Ad Account ID)</label>
                          <input
                            type="text"
                            placeholder="Örn: act_123456789"
                            value={metaCreds.adAccountId}
                            onChange={(e) => setMetaCreds({ ...metaCreds, adAccountId: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm placeholder:text-slate-500 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">System User Access Token</label>
                          <input
                            type="password"
                            placeholder="EAA... (System User token, tek satır)"
                            value={metaCreds.accessToken}
                            onChange={(e) => setMetaCreds({ ...metaCreds, accessToken: e.target.value.replace(/\s/g, '') })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 transition-all text-sm placeholder:text-slate-500 font-mono"
                          />
                          <p className="text-[10px] text-slate-500 mt-1">
                            Business Manager → Sistem kullanıcıları → Token oluştur. App Secret değil, uzun EAA ile başlayan token.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Submit & Delete Buttons */}
                    <div className="sticky bottom-0 z-20 -mx-6 px-6 py-4 mt-6 bg-white border-t border-slate-100 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={handleDeleteIntegration}
                        disabled={loading.action}
                        className="flex items-center gap-2 px-4 py-3 bg-white text-rose-600 border border-rose-200 rounded-xl text-sm font-semibold hover:bg-rose-50 active:scale-98 transition-all disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        Bağlantıyı Kaldır
                      </button>
                      <button
                        type="submit"
                        disabled={loading.action}
                        className="flex items-center gap-2 px-6 py-3 bg-[#F5403F] text-white rounded-xl text-sm font-semibold hover:bg-[#D93635] active:scale-98 shadow-lg shadow-[#F5403F]/10 hover:shadow-[#F5403F]/20 transition-all disabled:opacity-50"
                      >
                        <Save className="w-4 h-4" />
                        {loading.action ? 'Kaydediliyor...' : 'Entegrasyonu Kaydet'}
                      </button>
                    </div>
                  </form>
                )}
            </div>
          </ReportCard>
              </div>

              {selectedBrandId && (
                <aside className="hidden lg:block">
                  <div className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                    <p className="text-[10px] uppercase text-slate-600 font-bold tracking-widest mb-4 px-1">
                      Entegrasyonlar
                    </p>
                    <AdminPlatformNav
                      selectedPlatform={selectedPlatform}
                      onSelectPlatform={selectPlatform}
                      brandSlug={selectedBrand?.slug}
                    />
                  </div>
                </aside>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 pt-2">
            Veritas Dijital
          </p>
        </main>
      </div>
    </div>
  );
}
