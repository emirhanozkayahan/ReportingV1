import re

with open('app/admin/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Imports
content = content.replace(
    "Check, \n  AlertCircle, \n  ChevronRight,",
    "Check, \n  AlertCircle, \n  ChevronRight, \n  Users,\n  Trash2,"
)
content = content.replace(
    "Check, \r\n  AlertCircle, \r\n  ChevronRight,",
    "Check, \n  AlertCircle, \n  ChevronRight, \n  Users,\n  Trash2,"
)
content = content.replace(
    "Check,\n  AlertCircle,\n  ChevronRight,",
    "Check,\n  AlertCircle,\n  ChevronRight,\n  Users,\n  Trash2,"
)

# 2. State
content = content.replace(
    "const [editBrandPassword, setEditBrandPassword] = useState('');",
    "const [editBrandPassword, setEditBrandPassword] = useState('');\n  const [brandUsers, setBrandUsers] = useState<any[]>([]);\n  const [newBrandUserEmail, setNewBrandUserEmail] = useState('');\n  const [newBrandUserPassword, setNewBrandUserPassword] = useState('');"
)

# 3. useEffect
content = content.replace(
    "fetchIntegrations(selectedBrandId);\n      const b = brands.find(br => br.id === selectedBrandId);",
    "fetchIntegrations(selectedBrandId);\n      fetchBrandUsers(selectedBrandId);\n      const b = brands.find(br => br.id === selectedBrandId);"
)
content = content.replace(
    "fetchIntegrations(selectedBrandId);\r\n      const b = brands.find(br => br.id === selectedBrandId);",
    "fetchIntegrations(selectedBrandId);\n      fetchBrandUsers(selectedBrandId);\n      const b = brands.find(br => br.id === selectedBrandId);"
)

# 4. Functions
funcs = """  const fetchBrandUsers = async (brandId: string) => {
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
      if (!res.ok) throw new Error('Kullanıcı eklenemedi');
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

  const handleTriggerSync = async () => {"""

content = content.replace("  const handleTriggerSync = async () => {", funcs)

# 5. JSX
old_jsx = """                    <form onSubmit={handleUpdateBrand} className="space-y-4 border-b border-slate-100 pb-8">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Müşteri E-posta (İsteğe Bağlı)</label>
                        <input
                          type="email"
                          placeholder="musteri@marka.com"
                          value={editBrandEmail}
                          onChange={(e) => setEditBrandEmail(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Müşteri Şifre (İsteğe Bağlı)</label>
                        <input
                          type="text"
                          placeholder="Giriş Şifresi"
                          value={editBrandPassword}
                          onChange={(e) => setEditBrandPassword(e.target.value)}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-slate-400"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading.action}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-semibold rounded-xl text-sm hover:bg-blue-700 active:scale-98 transition-all disabled:opacity-50"
                      >
                        {loading.action ? 'Güncelleniyor...' : 'Ayarları Kaydet'}
                      </button>
                    </form>"""

new_jsx = """                    {/* Brand Users Management */}
                    <div className="space-y-4 border-b border-slate-100 pb-8">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-500" /> Marka Kullanıcıları
                      </h3>
                      
                      {brandUsers.length > 0 ? (
                        <div className="space-y-2">
                          {brandUsers.map(user => (
                            <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                              <div>
                                <p className="text-sm font-semibold text-slate-700">{user.email}</p>
                                <p className="text-xs text-slate-400 font-mono">Şifre: {user.password}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDeleteBrandUser(user.id)}
                                className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 italic">Henüz bu marka için kullanıcı eklenmemiş.</p>
                      )}

                      <form onSubmit={handleAddBrandUser} className="mt-4 p-4 bg-blue-50/30 border border-blue-100 rounded-xl space-y-3">
                        <h4 className="text-xs font-semibold text-blue-800 mb-2">Yeni Kullanıcı Ekle</h4>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <input
                            type="email"
                            placeholder="E-posta"
                            value={newBrandUserEmail}
                            onChange={(e) => setNewBrandUserEmail(e.target.value)}
                            required
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <input
                            type="text"
                            placeholder="Şifre"
                            value={newBrandUserPassword}
                            onChange={(e) => setNewBrandUserPassword(e.target.value)}
                            required
                            className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-blue-500"
                          />
                          <button
                            type="submit"
                            disabled={loading.action}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Ekle
                          </button>
                        </div>
                      </form>
                    </div>"""

# To avoid newline mismatch in JSX
content = re.sub(r'<form onSubmit=\{handleUpdateBrand\}.*?<\/form>', new_jsx, content, flags=re.DOTALL)

with open('app/admin/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patch successful!")
