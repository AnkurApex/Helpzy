'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const STATUS_COLORS = {
  pending:    'bg-yellow-100 text-yellow-800',
  accepted:   'bg-blue-100 text-blue-800',
  in_progress:'bg-purple-100 text-purple-800',
  completed:  'bg-green-100 text-green-800',
  reviewed:   'bg-emerald-100 text-emerald-800',
  cancelled:  'bg-red-100 text-red-800',
  rejected:   'bg-gray-100 text-gray-800',
};

export default function ProviderDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('requests');

  const loadDashboard = useCallback(() => {
    setLoading(true);
    fetch('/api/provider/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'provider') { router.push('/auth'); return; }
      loadDashboard();
    });
  }, [loadDashboard, router]);

  const doAction = async (bookingId, action, extra = {}) => {
    setActionLoading(true);
    const res = await fetch(`/api/bookings/${bookingId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...extra }),
    });
    const d = await res.json();
    setMessage(res.ok ? `Action successful: ${d.status || 'done'}` : d.error);
    setActionLoading(false);
    loadDashboard();
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  const newRequests = data?.bookings?.filter(b => b.status === 'pending') || [];
  const activeBookings = data?.bookings?.filter(b => ['accepted','in_progress'].includes(b.status)) || [];
  const completed = data?.bookings?.filter(b => ['completed','reviewed','cancelled','rejected'].includes(b.status)) || [];

  return (
    <div className="flex-grow pt-24 pb-20 px-6 max-w-screen-2xl mx-auto">
      <section className="mb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary font-label-bold uppercase tracking-widest mb-2 block">{data?.provider?.business_name}</span>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Provider Dashboard</h1>
          </div>
          <div className="flex items-center gap-4 bg-surface-container p-4 rounded-lg">
            <div className="text-right">
              <p className="font-label-bold text-on-surface-variant uppercase text-xs">Verification Status</p>
              <p className={`font-headline-md ${data?.provider?.is_verified ? 'text-primary' : 'text-yellow-600'}`}>
                {data?.provider?.is_verified ? 'VERIFIED' : 'PENDING'}
              </p>
            </div>
            <div className="h-12 w-1 bg-primary rounded-full"></div>
          </div>
        </div>
      </section>

      {message && (
        <div className="mb-6 bg-primary-container text-on-primary-container p-4 rounded-lg font-bold flex justify-between">
          {message}
          <button onClick={() => setMessage('')} className="opacity-60 hover:opacity-100 ml-4">✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch mb-12">
        <div className="md:col-span-8 bg-emerald-950 text-lime-400 p-10 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="font-label-bold uppercase tracking-widest text-lime-400/60 mb-8">Total Earnings (Paid)</h3>
            <p className="font-display-xl text-display-xl">₹{(data?.earnings || 0).toLocaleString('en-IN')}</p>
            <div className="flex gap-4 mt-6">
              <span className="bg-lime-400/20 px-3 py-1 rounded-full text-sm font-bold">{data?.bookings?.filter(b => b.payment_status === 'paid').length || 0} paid bookings</span>
            </div>
          </div>
          <div className="absolute right-[-10%] bottom-[-20%] opacity-20 pointer-events-none">
            <span className="material-symbols-outlined text-[300px]" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
          </div>
          <div className="mt-12 flex gap-4 relative z-10">
            <Link href="/profile" className="bg-lime-400 text-emerald-950 font-bold px-8 py-4 rounded-full hover:bg-white transition-all">Edit Profile</Link>
          </div>
        </div>
        <div className="md:col-span-4 bg-surface-container-highest p-10 rounded-xl flex flex-col justify-center items-center text-center">
          <span className="material-symbols-outlined text-primary text-6xl mb-4" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
          <h3 className="font-label-bold uppercase tracking-widest text-on-surface-variant mb-2">Average Rating</h3>
          <p className="font-headline-lg text-headline-lg text-on-surface">{data?.provider?.rating || '—'}</p>
          <p className="text-on-surface-variant mt-2">from {data?.provider?.review_count || 0} reviews</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-outline-variant">
        {[
          { key: 'requests', label: `New Requests (${newRequests.length})` },
          { key: 'active', label: `Active (${activeBookings.length})` },
          { key: 'history', label: 'History' },
          { key: 'reviews', label: 'Reviews' },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`pb-3 font-bold text-sm uppercase tracking-widest border-b-2 transition-all ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* NEW REQUESTS */}
      {tab === 'requests' && (
        <div className="space-y-4">
          {newRequests.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">No new booking requests.</div>
          ) : newRequests.map(b => (
            <div key={b.id} className="bg-white p-6 border border-outline-variant rounded-lg relative overflow-hidden hover:border-primary transition-colors">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-secondary-fixed">person</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-lg">{b.service_category} Service</h4>
                  <p className="text-on-surface-variant text-sm">Customer: <strong>{b.customer_name}</strong> · {b.customer_phone}</p>
                  <p className="text-on-surface-variant text-sm">📅 {b.booking_date} at {b.booking_time}</p>
                  <p className="text-on-surface-variant text-sm">📍 {b.address}, {b.city} - {b.pincode}</p>
                  {b.service_description && <p className="text-on-surface-variant text-sm italic mt-1">"{b.service_description}"</p>}
                  <p className="text-primary font-bold mt-1">₹{b.total_amount}</p>
                </div>
                <span className="text-outline text-xs font-bold">#{b.id}</span>
              </div>
              <div className="flex gap-3">
                <button onClick={() => doAction(b.id, 'accept')} disabled={actionLoading}
                  className="flex-1 bg-primary text-white font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-60">Accept</button>
                <button onClick={() => doAction(b.id, 'reject')} disabled={actionLoading}
                  className="flex-1 bg-surface-variant text-on-surface-variant font-bold py-3 rounded-lg hover:bg-error-container hover:text-on-error-container transition-all disabled:opacity-60">Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ACTIVE BOOKINGS */}
      {tab === 'active' && (
        <div className="space-y-4">
          {activeBookings.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">No active bookings.</div>
          ) : activeBookings.map(b => (
            <div key={b.id} className="bg-white p-6 border border-outline-variant rounded-lg hover:border-primary transition-colors">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${STATUS_COLORS[b.status]}`}>{b.status.replace('_', ' ')}</span>
                    <span className="text-outline text-xs font-bold">#{b.id}</span>
                  </div>
                  <h4 className="font-bold text-lg">{b.service_category} — {b.customer_name}</h4>
                  <p className="text-sm text-on-surface-variant">📅 {b.booking_date} at {b.booking_time}</p>
                  <p className="text-sm text-on-surface-variant">📍 {b.address}, {b.city} - {b.pincode}</p>
                  <p className="text-sm text-on-surface-variant">📞 {b.customer_phone}</p>
                  <p className="text-primary font-bold mt-1">₹{b.total_amount}</p>
                </div>
              </div>
              <div className="space-y-3">
                {b.status === 'accepted' && !b.otp_verified && (
                  <div className="flex gap-3 items-center">
                    <input type="text" placeholder="Enter 4-digit OTP from customer" value={otpInputs[b.id] || ''}
                      onChange={e => setOtpInputs(prev => ({ ...prev, [b.id]: e.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className="border border-outline-variant rounded-lg px-4 py-3 font-bold tracking-widest text-center w-48 outline-none focus:border-primary" maxLength={4} />
                    <button onClick={() => doAction(b.id, 'verify_otp', { otp: otpInputs[b.id] })} disabled={actionLoading || !otpInputs[b.id] || otpInputs[b.id].length < 4}
                      className="bg-primary text-white font-bold px-6 py-3 rounded-lg hover:brightness-110 disabled:opacity-60">Verify OTP</button>
                  </div>
                )}
                {b.status === 'in_progress' && (
                  <button onClick={() => doAction(b.id, 'complete')} disabled={actionLoading}
                    className="w-full bg-lime-400 text-emerald-950 font-bold py-3 rounded-lg hover:bg-lime-300 transition-all disabled:opacity-60">
                    ✓ Mark Service Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORY */}
      {tab === 'history' && (
        <div className="space-y-4">
          {completed.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">No booking history yet.</div>
          ) : completed.map(b => (
            <div key={b.id} className="bg-white p-6 border border-outline-variant rounded-lg flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full uppercase ${STATUS_COLORS[b.status]}`}>{b.status.replace('_', ' ')}</span>
                  <span className="text-xs font-bold text-outline">#{b.id}</span>
                </div>
                <h4 className="font-bold">{b.service_category} — {b.customer_name}</h4>
                <p className="text-sm text-on-surface-variant">{b.booking_date} · {b.city}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">₹{b.total_amount}</p>
                <p className={`text-xs font-bold uppercase ${b.payment_status === 'paid' ? 'text-green-600' : 'text-outline'}`}>{b.payment_status}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* REVIEWS */}
      {tab === 'reviews' && (
        <div className="space-y-6">
          {(!data?.reviews || data.reviews.length === 0) ? (
            <div className="text-center py-12 text-on-surface-variant">No reviews yet.</div>
          ) : data.reviews.map(r => (
            <div key={r.id} className="bg-white p-6 border border-outline-variant rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className="material-symbols-outlined text-yellow-400 text-base" style={{ fontVariationSettings: `'FILL' ${s <= r.rating ? 1 : 0}` }}>star</span>
                ))}
                <span className="text-xs text-outline ml-2 font-bold">{r.customer_name}</span>
              </div>
              <p className="text-on-surface-variant">{r.review_text || 'No written review.'}</p>
              <p className="text-xs text-outline mt-2">{formatDate(r.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
