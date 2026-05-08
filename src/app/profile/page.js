'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetch('/api/profile').then(r => r.json()).then(data => {
      if (data.error) { router.push('/auth'); return; }
      setProfile(data);
      setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '', city: data.city || '', state: data.state || 'Maharashtra', pincode: data.pincode || '',
        ...(data.provider ? { business_name: data.provider.business_name, description: data.provider.description || '', category: data.provider.category } : {}) });
      setLoading(false);
    }).catch(() => router.push('/auth'));
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setMessage({ type: res.ok ? 'success' : 'error', text: res.ok ? 'Profile updated successfully.' : data.error });
    setSaving(false);
    if (res.ok) setProfile(p => ({ ...p, ...form }));
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.confirm) { setMessage({ type: 'error', text: 'New passwords do not match.' }); return; }
    setSaving(true);
    const res = await fetch('/api/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pwForm.password, new_password: pwForm.new_password }) });
    const data = await res.json();
    setMessage({ type: res.ok ? 'success' : 'error', text: res.ok ? 'Password changed successfully.' : data.error });
    setSaving(false);
    if (res.ok) setPwForm({ password: '', new_password: '', confirm: '' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <span className="text-primary font-label-bold text-label-bold uppercase tracking-widest mb-2 block">Account</span>
        <h1 className="font-display-xl text-display-xl mb-10">MY PROFILE.</h1>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg font-bold flex justify-between ${message.type === 'success' ? 'bg-primary-container text-on-primary-container' : 'bg-error-container text-on-error-container'}`}>
            {message.text}
            <button onClick={() => setMessage({ type: '', text: '' })} className="ml-4 opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Profile Info */}
        <form onSubmit={saveProfile} className="bg-white border border-outline-variant rounded-xl p-8 mb-8">
          <h2 className="font-headline-md text-headline-md mb-6 uppercase">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Full Name</label>
              <input className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" value={form.name || ''} onChange={e => set('name', e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Email (read-only)</label>
              <input className="w-full border border-outline-variant rounded-lg p-4 bg-surface-container" value={profile?.email || ''} disabled />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Phone</label>
              <input className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" type="tel" value={form.phone || ''} onChange={e => set('phone', e.target.value)} placeholder="10-digit mobile number" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-outline mb-2">Role</label>
              <input className="w-full border border-outline-variant rounded-lg p-4 bg-surface-container capitalize" value={profile?.role || ''} disabled />
            </div>
          </div>

          <h3 className="font-headline-md mt-8 mb-4 uppercase text-sm">Address</h3>
          <div className="space-y-4">
            <input className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" value={form.address || ''} onChange={e => set('address', e.target.value)} placeholder="Flat/House, Building, Street, Locality" />
            <div className="grid grid-cols-3 gap-4">
              <input className="border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" value={form.city || ''} onChange={e => set('city', e.target.value)} placeholder="City" />
              <input className="border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" value={form.state || ''} onChange={e => set('state', e.target.value)} placeholder="State" />
              <input className="border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" value={form.pincode || ''} onChange={e => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Pincode" maxLength={6} />
            </div>
          </div>

          {/* Provider-specific fields */}
          {profile?.provider && (
            <>
              <h3 className="font-headline-md mt-8 mb-4 uppercase text-sm">Provider Details</h3>
              <div className="space-y-4">
                <input className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" value={form.business_name || ''} onChange={e => set('business_name', e.target.value)} placeholder="Business Name" />
                <textarea className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary resize-none" value={form.description || ''} onChange={e => set('description', e.target.value)} rows={3} placeholder="Business description..." />
                <div className="flex items-center gap-2 bg-surface-container p-3 rounded-lg">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${profile.provider.is_verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {profile.provider.is_verified ? '✓ Verified' : 'Pending Verification'}
                  </span>
                  <span className="text-on-surface-variant text-sm">{profile.provider.category}</span>
                </div>
              </div>
            </>
          )}

          <button type="submit" disabled={saving} className="mt-8 w-full bg-primary text-white py-4 rounded-full font-black uppercase tracking-tighter hover:bg-emerald-800 transition-all disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change Password */}
        <form onSubmit={changePassword} className="bg-white border border-outline-variant rounded-xl p-8">
          <h2 className="font-headline-md text-headline-md mb-6 uppercase">Change Password</h2>
          <div className="space-y-4">
            <input type="password" className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" placeholder="Current Password" value={pwForm.password} onChange={e => setPwForm(f => ({ ...f, password: e.target.value }))} required />
            <input type="password" className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" placeholder="New Password (min 6 characters)" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} required />
            <input type="password" className="w-full border border-outline-variant rounded-lg p-4 outline-none focus:border-primary" placeholder="Confirm New Password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
          </div>
          <button type="submit" disabled={saving} className="mt-6 w-full border-2 border-primary text-primary py-4 rounded-full font-black uppercase tracking-tighter hover:bg-primary hover:text-white transition-all disabled:opacity-60">
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
