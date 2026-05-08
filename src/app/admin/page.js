'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState([]);
  const [allProviders, setAllProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') { router.push('/auth'); return; }
      loadAll();
    });
  }, []);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/overview').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/providers').then(r => r.json()),
    ]).then(([ov, us, pr]) => {
      setOverview(ov);
      setUsers(Array.isArray(us) ? us : []);
      setAllProviders(Array.isArray(pr) ? pr : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const doProviderAction = async (provider_id, action) => {
    setActionLoading(true);
    const res = await fetch('/api/admin/providers', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ provider_id, action }) });
    const d = await res.json();
    setMessage(res.ok ? d.message : d.error);
    setActionLoading(false);
    loadAll();
  };

  const doUserAction = async (user_id, action) => {
    if (action === 'delete' && !confirm('Remove this user?')) return;
    setActionLoading(true);
    const res = await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ user_id, action }) });
    const d = await res.json();
    setMessage(res.ok ? d.message : d.error);
    setActionLoading(false);
    loadAll();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const pendingProviders = allProviders.filter(p => p.status === 'pending');
  const activeProviders = allProviders.filter(p => p.status === 'active');

  return (
    <div className="flex-grow pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
      <section className="py-8 mb-8">
        <div className="flex flex-col mb-8">
          <h1 className="font-display-xl text-display-xl text-primary mb-4 uppercase">System Control</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Helpzy admin panel. Real-time metrics and professional validation portal.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="md:col-span-2 bg-primary p-12 rounded-xl flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-primary-fixed font-label-bold text-label-bold uppercase tracking-[0.2em] mb-4 block">Total Platform Revenue</span>
              <h2 className="text-white font-display-xl text-display-xl">₹{(overview?.stats?.revenue || 0).toLocaleString('en-IN')}</h2>
            </div>
            <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
              <span className="material-symbols-outlined text-[300px] text-white">monitoring</span>
            </div>
          </div>
          <div className="bg-surface-container-high p-8 rounded-xl border border-outline/10 flex flex-col justify-center">
            <span className="text-on-surface-variant font-label-bold text-label-bold uppercase tracking-widest mb-4 block">Active Providers</span>
            <h3 className="text-primary font-headline-lg text-headline-lg">{overview?.stats?.active_providers || 0}</h3>
            <p className="text-on-surface-variant text-sm mt-2">{pendingProviders.length} awaiting verification</p>
          </div>
          <div className="bg-lime-400 p-8 rounded-xl border border-primary/10 flex flex-col justify-center">
            <span className="text-emerald-950 font-label-bold text-label-bold uppercase tracking-widest mb-4 block">Total Bookings</span>
            <h3 className="text-emerald-950 font-headline-lg text-headline-lg">{overview?.stats?.bookings || 0}</h3>
            <p className="text-emerald-900 text-sm mt-2">{overview?.stats?.users || 0} customers</p>
          </div>
        </div>
      </section>

      {message && (
        <div className="mb-6 bg-primary-container text-on-primary-container p-4 rounded-lg font-bold flex justify-between">
          {message}
          <button onClick={() => setMessage('')} className="opacity-60 hover:opacity-100 ml-4">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-outline-variant overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'pending', label: `Verify Providers (${pendingProviders.length})` },
          { key: 'providers', label: 'All Providers' },
          { key: 'users', label: 'Users' },
          { key: 'bookings', label: 'Bookings' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 font-bold text-sm uppercase tracking-widest shrink-0 border-b-2 transition-all ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-headline-md text-primary uppercase">Verification Queue</h2>
              <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${pendingProviders.length > 0 ? 'bg-error text-white' : 'bg-surface-container text-outline'}`}>{pendingProviders.length} Pending</span>
            </div>
            <div className="space-y-4">
              {pendingProviders.slice(0, 3).map(p => (
                <div key={p.id} className="bg-white p-6 rounded-lg border border-outline-variant flex flex-col sm:flex-row items-center gap-6 hover:border-primary transition-colors">
                  <div className="flex-grow text-center sm:text-left">
                    <h4 className="font-headline-md text-2xl text-on-background mb-1">{p.business_name}</h4>
                    <p className="text-on-surface-variant uppercase text-xs font-bold tracking-widest mb-2">{p.category} · {p.city}</p>
                    <p className="text-xs text-outline">{p.email} · {p.phone}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => doProviderAction(p.id, 'reject')} disabled={actionLoading}
                      className="p-3 rounded-full border border-outline-variant text-error hover:bg-error/10 active:scale-95 transition-all disabled:opacity-60">
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <button onClick={() => doProviderAction(p.id, 'verify')} disabled={actionLoading}
                      className="bg-primary text-white px-6 py-3 rounded-full font-bold uppercase text-xs tracking-widest hover:bg-emerald-800 active:scale-95 transition-all disabled:opacity-60">Approve</button>
                  </div>
                </div>
              ))}
              {pendingProviders.length > 3 && (
                <button onClick={() => setTab('pending')} className="w-full py-6 border-2 border-dashed border-outline-variant rounded-xl text-on-surface-variant font-bold uppercase tracking-widest hover:bg-surface-container transition-colors">
                  View All {pendingProviders.length} Pending
                </button>
              )}
            </div>
          </div>
          {/* Activity Feed */}
          <div className="bg-emerald-950 p-10 rounded-xl text-white">
            <h3 className="font-headline-md text-headline-md text-lime-400 uppercase mb-8">Recent Bookings</h3>
            <div className="space-y-6">
              {(overview?.recent_bookings || []).slice(0, 5).map((b, i) => (
                <div key={b.id} className="relative pl-10 border-b border-emerald-900 pb-4">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-lime-400 border-4 border-emerald-950"></div>
                  <p className="text-xs text-lime-400 font-bold uppercase tracking-widest mb-1">#{b.id} · {b.status}</p>
                  <h5 className="font-bold">{b.service_category}</h5>
                  <p className="text-emerald-100/60 text-sm">{b.customer_name} · ₹{b.total_amount}</p>
                </div>
              ))}
              {(!overview?.recent_bookings || overview.recent_bookings.length === 0) && (
                <p className="text-emerald-100/40 text-center py-8">No bookings yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PENDING PROVIDERS */}
      {tab === 'pending' && (
        <div className="space-y-4">
          {pendingProviders.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">No pending providers.</div>
          ) : pendingProviders.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-lg border border-outline-variant flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-grow">
                <h4 className="font-bold text-lg">{p.business_name}</h4>
                <p className="text-on-surface-variant text-sm">{p.category} · {p.city} {p.pincode}</p>
                <p className="text-xs text-outline">{p.email} · {p.phone}</p>
                <p className="text-xs text-on-surface-variant mt-1">{p.description}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => doProviderAction(p.id, 'reject')} disabled={actionLoading}
                  className="px-4 py-2 border border-error text-error rounded-full text-xs font-bold uppercase hover:bg-error/10 disabled:opacity-60">Reject</button>
                <button onClick={() => doProviderAction(p.id, 'verify')} disabled={actionLoading}
                  className="px-4 py-2 bg-primary text-white rounded-full text-xs font-bold uppercase hover:bg-emerald-800 disabled:opacity-60">Verify</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ALL PROVIDERS */}
      {tab === 'providers' && (
        <div className="space-y-4">
          {allProviders.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4">
              <div className="flex-1">
                <h4 className="font-bold">{p.business_name}</h4>
                <p className="text-sm text-on-surface-variant">{p.category} · {p.city} · {p.email}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${p.status === 'active' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{p.is_verified ? 'Verified' : p.status}</span>
              <div className="flex gap-2">
                {p.status === 'pending' && (
                  <button onClick={() => doProviderAction(p.id, 'verify')} disabled={actionLoading}
                    className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold uppercase disabled:opacity-60">Verify</button>
                )}
                <button onClick={() => doProviderAction(p.id, 'remove')} disabled={actionLoading}
                  className="px-3 py-1 border border-error text-error rounded-full text-xs font-bold uppercase hover:bg-error/10 disabled:opacity-60">Remove</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* USERS */}
      {tab === 'users' && (
        <div className="space-y-4">
          {users.filter(u => u.role !== 'admin').map(u => (
            <div key={u.id} className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold">{u.name}</h4>
                  <span className="text-xs text-outline capitalize">({u.role})</span>
                  {u.is_blocked ? <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">Blocked</span> : null}
                </div>
                <p className="text-sm text-on-surface-variant">{u.email} · {u.phone} · {u.city} {u.pincode}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {u.is_blocked ? (
                  <button onClick={() => doUserAction(u.id, 'unblock')} disabled={actionLoading}
                    className="px-3 py-1 bg-primary text-white rounded-full text-xs font-bold uppercase disabled:opacity-60">Unblock</button>
                ) : (
                  <button onClick={() => doUserAction(u.id, 'block')} disabled={actionLoading}
                    className="px-3 py-1 border border-error text-error rounded-full text-xs font-bold uppercase hover:bg-error/10 disabled:opacity-60">Block</button>
                )}
                <button onClick={() => doUserAction(u.id, 'delete')} disabled={actionLoading}
                  className="px-3 py-1 bg-error text-white rounded-full text-xs font-bold uppercase disabled:opacity-60">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOOKINGS */}
      {tab === 'bookings' && (
        <div className="space-y-4">
          {(overview?.recent_bookings || []).map(b => (
            <div key={b.id} className="bg-white p-4 rounded-lg border border-outline-variant flex items-center gap-4">
              <div className="flex-1">
                <div className="flex gap-2 mb-1">
                  <span className="text-xs font-bold text-outline">#{b.id}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${b.status === 'completed' ? 'bg-green-100 text-green-800' : b.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{b.status.replace('_',' ')}</span>
                  {b.payment_status === 'paid' && <span className="text-xs font-bold px-2 py-0.5 rounded-full uppercase bg-teal-100 text-teal-800">Paid</span>}
                </div>
                <p className="font-bold">{b.service_category} — {b.customer_name}</p>
                <p className="text-sm text-on-surface-variant">{b.provider_name || 'No provider'} · {b.booking_date}</p>
              </div>
              <p className="font-bold text-primary shrink-0">₹{b.total_amount}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}