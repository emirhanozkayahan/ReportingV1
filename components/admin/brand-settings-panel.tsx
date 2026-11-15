"use client";

import { useState } from "react";
import {
  Building2,
  Database,
  LineChart,
  RotateCw,
  Save,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";

type BrandUser = { id: string; email: string };

type BrandSettingsPanelProps = {
  brandName: string;
  brandSlug: string;
  userCount: number;
  editBrandLogo: string;
  onEditBrandLogoChange: (value: string) => void;
  editBrandGa4PropertyId: string;
  onEditBrandGa4PropertyIdChange: (value: string) => void;
  brandUsers: BrandUser[];
  newBrandUserEmail: string;
  onNewBrandUserEmailChange: (value: string) => void;
  newBrandUserPassword: string;
  onNewBrandUserPasswordChange: (value: string) => void;
  resettingUserId: string | null;
  onResettingUserIdChange: (id: string | null) => void;
  resetUserPassword: string;
  onResetUserPasswordChange: (value: string) => void;
  loading: boolean;
  onUpdateBrand: (e: React.FormEvent) => void;
  onAddBrandUser: (e: React.FormEvent) => void;
  onResetBrandUserPassword: (userId: string) => void;
  onDeleteBrandUser: (id: string) => void;
  onBackfill: () => void;
  onDeleteBrand: () => void;
};

type SettingsTab = "general" | "users" | "data";

const TABS: { id: SettingsTab; label: string }[] = [
  { id: "general", label: "Genel" },
  { id: "users", label: "Kullanıcılar" },
  { id: "data", label: "Veri" },
];

export default function BrandSettingsPanel({
  brandName,
  brandSlug,
  userCount,
  editBrandLogo,
  onEditBrandLogoChange,
  editBrandGa4PropertyId,
  onEditBrandGa4PropertyIdChange,
  brandUsers,
  newBrandUserEmail,
  onNewBrandUserEmailChange,
  newBrandUserPassword,
  onNewBrandUserPasswordChange,
  resettingUserId,
  onResettingUserIdChange,
  resetUserPassword,
  onResetUserPasswordChange,
  loading,
  onUpdateBrand,
  onAddBrandUser,
  onResetBrandUserPassword,
  onDeleteBrandUser,
  onBackfill,
  onDeleteBrand,
}: BrandSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Özet */}
      <div className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 bg-slate-50/80">
        {editBrandLogo ? (
          <img
            src={editBrandLogo}
            alt={brandName}
            className="w-14 h-14 rounded-xl object-contain bg-white border border-slate-200 shrink-0"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#F5403F] to-[#E83837] text-white flex items-center justify-center font-bold text-xl shrink-0">
            {brandName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-slate-900 truncate">{brandName}</p>
          <p className="text-sm text-slate-500 font-mono truncate">/{brandSlug}</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-600 shrink-0">
          <Users className="w-3.5 h-3.5" />
          {userCount} kullanıcı
        </div>
      </div>

      {/* Sekmeler */}
      <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200/80">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.id === "users" && brandUsers.length > 0 && (
              <span className="ml-1.5 text-[10px] font-bold text-[#F5403F]">
                {brandUsers.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sekme içeriği */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        {activeTab === "general" && (
          <form onSubmit={onUpdateBrand} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Marka Logosu
                </h3>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onloadend = () =>
                      onEditBrandLogoChange(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#F5403F]/10 file:text-[#F5403F]"
                />
                {editBrandLogo && (
                  <div className="flex items-center justify-center p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50">
                    <img
                      src={editBrandLogo}
                      alt="Logo önizleme"
                      className="h-16 max-w-full object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-[#E37400]" />
                  Google Analytics 4
                </h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                    Mülk ID (Property ID)
                  </label>
                  <input
                    type="text"
                    placeholder="Örn: 123456789"
                    value={editBrandGa4PropertyId}
                    onChange={(e) => onEditBrandGa4PropertyIdChange(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#F5403F]/20 focus:border-[#F5403F]/50 text-sm font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                    Sidebar&apos;daki &quot;GA4 Bağla&quot; ile yetki verildikten sonra bu ID kullanılır.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5403F] text-white font-semibold rounded-xl text-sm hover:bg-[#D93635] transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "users" && (
          <div className="space-y-6">
            {brandUsers.length === 0 ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Bu marka için henüz giriş kullanıcısı yok.
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                {brandUsers.map((user) => (
                  <div key={user.id} className="p-4 bg-white">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            onResettingUserIdChange(
                              resettingUserId === user.id ? null : user.id
                            );
                            onResetUserPasswordChange("");
                          }}
                          className="px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-lg"
                        >
                          Şifre sıfırla
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteBrandUser(user.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {resettingUserId === user.id && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-slate-100">
                        <input
                          type="password"
                          placeholder="Yeni şifre"
                          value={resetUserPassword}
                          onChange={(e) => onResetUserPasswordChange(e.target.value)}
                          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-[#F5403F]/50"
                        />
                        <button
                          type="button"
                          onClick={() => onResetBrandUserPassword(user.id)}
                          disabled={loading}
                          className="px-4 py-2 bg-[#F5403F] text-white text-sm font-semibold rounded-lg hover:bg-[#D93635] disabled:opacity-50"
                        >
                          Güncelle
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={onAddBrandUser}
              className="rounded-xl border border-[#F5403F]/15 bg-[#F5403F]/[0.04] p-4 space-y-3"
            >
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#F5403F]" />
                Yeni Kullanıcı Ekle
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="E-posta"
                  value={newBrandUserEmail}
                  onChange={(e) => onNewBrandUserEmailChange(e.target.value)}
                  required
                  autoComplete="off"
                  className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#F5403F]/50"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={newBrandUserPassword}
                  onChange={(e) => onNewBrandUserPasswordChange(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:border-[#F5403F]/50"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#F5403F] text-white text-sm font-semibold rounded-xl hover:bg-[#D93635] disabled:opacity-50"
              >
                Kullanıcı Ekle
              </button>
            </form>
          </div>
        )}

        {activeTab === "data" && (
          <div className="space-y-4">
            <div className="flex gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <Database className="w-5 h-5 text-[#F5403F] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800 mb-1">
                  Geçmiş Verileri İçe Aktar
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bağlı entegrasyonlardan son 365 günün verisini çeker. Raporlarda geçmiş
                  dönemi görmek için bir kez çalıştırmanız yeterli. İşlem uzun sürebilir;
                  sayfayı kapatmayın.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBackfill}
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F5403F] text-white font-semibold rounded-xl text-sm hover:bg-[#D93635] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  İçe aktarılıyor, sayfayı kapatmayın...
                </>
              ) : (
                "1 Yıllık Veriyi İçe Aktar"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Tehlikeli bölge */}
      <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 sm:p-5">
        <p className="text-sm font-bold text-rose-700 mb-1">Markayı Sil</p>
        <p className="text-xs text-rose-600/80 mb-4 leading-relaxed">
          Bu işlem geri alınamaz. Markaya ait tüm entegrasyonlar ve kullanıcılar silinir.
        </p>
        <button
          type="button"
          onClick={onDeleteBrand}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-rose-600 border border-rose-200 font-semibold rounded-xl text-sm hover:bg-rose-100 disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          Markayı Kalıcı Olarak Sil
        </button>
      </div>
    </div>
  );
}
