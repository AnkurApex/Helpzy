'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG = {
  pending:    { label: 'Pending',     color: 'bg-yellow-100 text-yellow-800',  icon: 'schedule' },
  accepted:   { label: 'Accepted',    color: 'bg-blue-100 text-blue-800',      icon: 'thumb_up' },
  in_progress:{ label: 'In Progress', color: 'bg-purple-100 text-purple-800',  icon: 'construction' },
  completed:  { label: 'Completed',   color: 'bg-green-100 text-green-800',    icon: 'check_circle' },
  reviewed:   { label: 'Reviewed',    color: 'bg-emerald-100 text-emerald-800',icon: 'star' },
  paid:       { label: 'Paid',        color: 'bg-teal-100 text-teal-800',      icon: 'payments' },
  cancelled:  { label: 'Cancelled',   color: 'bg-red-100 text-red-800',        icon: 'cancel' },
  rejected:   { label: 'Rejected',    color: 'bg-gray-100 text-gray-800',      icon: 'block' },
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null); // booking object
  const [payModal, setPayModal] = useState(null); // booking object
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [payMethod, setPayMethod] = useState('cash');
  const [upiId, setUpiId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      if (!d.user) { router.push('/auth'); return; }
      loadBookings();
    });
  }, []);

  const loadBookings = () => {
    setLoading(true);
    fetch('/api/bookings').then(r => r.json()).then(data => {
      setBookings(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const cancelBooking = async (id) => {
    if (!confirm('Cancel this booking?')) return;
    setActionLoading(true);
    const res = await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'cancel' }) });
    const data = await res.json();
    setMessage(res.ok ? 'Booking cancelled.' : data.error);
    setActionLoading(false);
    loadBookings();
  };

  const submitReview = async () => {
    if (!reviewModal) return;
    setActionLoading(true);
    const res = await fetch('/api/reviews', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: reviewModal.id, provider_id: reviewModal.provider_id, rating, review_text: reviewText }),
    });
    const data = await res.json();
    setMessage(res.ok ? 'Review submitted! Thank you.' : data.error);
    setReviewModal(null);
    setActionLoading(false);
    loadBookings();
  };

  const initiatePayment = async () => {
    if (!payModal) return;
    setActionLoading(true);
    const res = await fetch('/api/payment', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking_id: payModal.id, method: payMethod, upi_id: upiId }),
    });
    const data = await res.json();
    if (res.ok && payMethod === 'cash') {
      setMessage('Cash payment recorded.');
      setPayModal(null);
      loadBookings();
    } else if (res.ok) {
      setMessage(`${data.message} Transaction: ${data.transaction_ref}`);
      setPayModal(null);
    } else {
      setMessage(data.error);
    }
    setActionLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-primary font-label-bold text-label-bold uppercase tracking-widest mb-2 block">Your Account</span>
            <h1 className="font-display-xl text-display-xl">MY BOOKINGS.</h1>
          </div>
          <Link href="/booking" className="bg-emerald-950 text-lime-400 px-6 py-3 rounded-full font-bold uppercase tracking-widest text-sm hover:bg-primary transition-colors">
            + Book Service
          </Link>
        </div>

        {message && (
          <div className="mb-6 bg-primary-container text-on-primary-container p-4 rounded-lg font-bold flex justify-between">
            {message}
            <button onClick={() => setMessage('')} className="ml-4 text-inherit opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">calendar_today</span>
            <p className="font-headline-md uppercase mb-4">No bookings yet</p>
            <Link href="/search?category=Electrician" className="bg-primary text-white px-8 py-4 rounded-full font-bold uppercase tracking-widest">Browse Services</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map(b => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              return (
                <div key={b.id} className="bg-white rounded-lg border border-outline-variant p-6 hover:border-primary transition-all">
                  <div className="flex flex-col md:flex-row gap-4 items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.color}`}>
                          <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
                          {cfg.label}
                        </span>
                        {b.payment_status === 'paid' && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase bg-teal-100 text-teal-800">
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>currency_rupee</span>
                            Paid
                          </span>
                        )}
                        <span className="text-outline text-xs font-bold">#{b.id}</span>
                      </div>
                      <h3 className="font-headline-md text-headline-md mb-1">{b.service_category} Service</h3>
                      {b.provider_name && <p className="text-on-surface-variant text-sm mb-1">Provider: <strong>{b.provider_name}</strong></p>}
                      <p className="text-on-surface-variant text-sm mb-1">📅 {b.booking_date} at {b.booking_time}</p>
                      <p className="text-on-surface-variant text-sm mb-1">📍 {b.address}, {b.city} - {b.pincode}</p>
                      {b.service_description && <p className="text-on-surface-variant text-sm mt-2 italic">"{b.service_description}"</p>}
                      <div className="flex gap-4 mt-3">
                        {b.total_amount > 0 && <span className="font-bold text-primary">₹{b.total_amount}</span>}
                        <span className="text-outline text-xs font-bold uppercase">{b.payment_method}</span>
                        <span className="text-outline text-xs">{formatDate(b.created_at)}</span>
                      </div>
                    </div>
                    {/* OTP display if pending/accepted */}
                    {['pending','accepted'].includes(b.status) && b.otp && (
                      <div className="bg-emerald-950 text-white rounded-lg p-4 text-center shrink-0">
                        <p className="text-emerald-100/60 text-[10px] uppercase tracking-widest">Service OTP</p>
                        <p className="text-2xl font-black text-lime-400 tracking-widest">{b.otp}</p>
                        <p className="text-[10px] text-emerald-100/40">Share with provider</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-outline-variant/50">
                    {b.provider_id && (
                      <Link href={`/provider/${b.provider_id}`} className="text-primary font-bold text-sm uppercase tracking-widest hover:underline">View Provider</Link>
                    )}
                    {['pending'].includes(b.status) && (
                      <button onClick={() => cancelBooking(b.id)} disabled={actionLoading}
                        className="px-4 py-2 border-2 border-red-300 text-red-600 rounded-full font-bold text-xs uppercase hover:bg-red-50 transition-colors disabled:opacity-60">
                        Cancel
                      </button>
                    )}
                    {b.status === 'completed' && b.payment_status !== 'paid' && (
                      <button onClick={() => setPayModal(b)}
                        className="px-4 py-2 bg-primary text-white rounded-full font-bold text-xs uppercase hover:bg-emerald-800 transition-colors">
                        Pay Now ₹{b.total_amount}
                      </button>
                    )}
                    {b.status === 'completed' && (
                      <button onClick={() => { setReviewModal(b); setRating(5); setReviewText(''); }}
                        className="px-4 py-2 bg-lime-400 text-emerald-950 rounded-full font-bold text-xs uppercase hover:bg-lime-300 transition-colors">
                        Leave Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="font-headline-md text-headline-md mb-6">Rate Your Experience</h3>
            <p className="text-on-surface-variant mb-4">{reviewModal.service_category} — {reviewModal.provider_name}</p>
            <div className="flex gap-2 mb-6">
              {[1,2,3,4,5].map(s => (
                <button key={s} type="button" onClick={() => setRating(s)}
                  className={`material-symbols-outlined text-3xl transition-colors ${s <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                  style={{ fontVariationSettings: `'FILL' ${s <= rating ? 1 : 0}` }}>
                  star
                </button>
              ))}
            </div>
            <textarea className="w-full border border-outline-variant rounded-lg p-4 mb-6 resize-none outline-none focus:border-primary"
              placeholder="Write your review..." rows={3} value={reviewText} onChange={e => setReviewText(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={submitReview} disabled={actionLoading}
                className="flex-1 bg-primary text-white py-3 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-800 disabled:opacity-60">
                {actionLoading ? 'Submitting...' : 'Submit Review'}
              </button>
              <button onClick={() => setReviewModal(null)} className="flex-1 border-2 border-outline-variant py-3 rounded-full font-bold uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {payModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full">
            <h3 className="font-headline-md text-headline-md mb-2">Complete Payment</h3>
            <p className="text-on-surface-variant mb-6">{payModal.service_category} — ₹{payModal.total_amount}</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[{ v: 'cash', l: 'Cash', i: 'payments' }, { v: 'upi', l: 'UPI', i: 'qr_code' }, { v: 'phonepe', l: 'PhonePe', i: 'smartphone' }, { v: 'paytm', l: 'Paytm', i: 'account_balance_wallet' }].map(m => (
                <button key={m.v} type="button" onClick={() => setPayMethod(m.v)}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 font-bold text-sm transition-all ${payMethod === m.v ? 'border-primary bg-primary/5 text-primary' : 'border-outline-variant'}`}>
                  <span className="material-symbols-outlined text-base">{m.i}</span>{m.l}
                </button>
              ))}
            </div>
            {payMethod !== 'cash' && (
              <input className="w-full border border-outline-variant rounded-lg p-4 mb-6 outline-none focus:border-primary"
                placeholder="Enter UPI ID (e.g. name@upi)" value={upiId} onChange={e => setUpiId(e.target.value)} />
            )}
            <div className="flex gap-3">
              <button onClick={initiatePayment} disabled={actionLoading}
                className="flex-1 bg-primary text-white py-3 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-800 disabled:opacity-60">
                {actionLoading ? 'Processing...' : `Pay ₹${payModal.total_amount}`}
              </button>
              <button onClick={() => setPayModal(null)} className="flex-1 border-2 border-outline-variant py-3 rounded-full font-bold uppercase">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
