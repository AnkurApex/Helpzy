'use client';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const INDIAN_CATEGORIES = ['Electrician','Plumber','Cleaner','AC Repair','Painter','Carpenter','Pest Control','Appliance Repair'];
const TIME_SLOTS = ['08:00 AM','10:00 AM','12:00 PM','02:00 PM','04:00 PM','06:00 PM'];

import { Suspense } from 'react';

function BookingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const providerId = searchParams.get('provider');

  const [provider, setProvider] = useState(null);
  const [user, setUser] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [description, setDescription] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [category, setCategory] = useState('Electrician');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null); // { booking_id, otp }
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => {
      setUser(d.user);
      if (d.user?.city) setCity(d.user.city);
      if (d.user?.pincode) setPincode(d.user.pincode);
    }).catch(() => {});
    if (providerId) {
      fetch(`/api/providers/${providerId}`).then(r => r.json()).then(d => {
        setProvider(d);
        if (d.category) setCategory(d.category);
      }).catch(() => {});
    }
  }, [providerId]);

  const dates = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { router.push('/auth'); return; }
    if (!selectedDate || !selectedTime) { setError('Please select a date and time.'); return; }
    if (!pincode || pincode.length !== 6) { setError('Please enter a valid 6-digit pincode.'); return; }
    if (!address) { setError('Please enter your service address.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: providerId ? parseInt(providerId) : null,
          service_category: category,
          service_description: description,
          address, city, pincode,
          booking_date: selectedDate,
          booking_time: selectedTime,
          payment_method: paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data);
      } else {
        setError(data.error || 'Booking failed. Please try again.');
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background pt-20">
        <div className="text-center max-w-lg mx-auto px-6">
          <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-5xl text-emerald-950" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <h1 className="font-display-xl text-headline-lg uppercase mb-4">BOOKING CONFIRMED!</h1>
          <p className="text-on-surface-variant font-body-lg mb-4">
            Booking #{success.booking_id} placed for <strong>{selectedDate}</strong> at <strong>{selectedTime}</strong>.
          </p>
          {/* OTP Display */}
          <div className="bg-emerald-950 text-white rounded-xl p-6 mb-6">
            <p className="text-emerald-100/60 text-xs uppercase tracking-widest font-bold mb-2">Your Service OTP</p>
            <p className="text-4xl font-black text-lime-400 tracking-[0.3em]">{success.otp}</p>
            <p className="text-emerald-100/40 text-xs mt-2">Share this OTP with the provider when they arrive to start the service.</p>
          </div>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/my-bookings" className="bg-emerald-950 text-lime-400 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:scale-105 transition-transform">
              View My Bookings
            </Link>
            <Link href="/" className="border-2 border-emerald-950 text-emerald-950 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-950 hover:text-white transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-32">
      <section className="max-w-screen-2xl mx-auto px-6 mb-12 pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-primary font-label-bold text-label-bold uppercase tracking-widest mb-4 block">Booking Journey</span>
            <h1 className="font-display-xl text-display-xl max-w-3xl">SECURE YOUR PROFESSIONAL.</h1>
          </div>
          {!user && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm font-medium">
              <Link href="/auth" className="font-bold underline">Sign in</Link> to complete your booking.
            </div>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit}>
        <section className="max-w-screen-2xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-20">

            {/* Step 1: Category (if no provider) */}
            {!providerId && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">01</span>
                  <h2 className="font-headline-lg text-headline-lg">SERVICE TYPE.</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {INDIAN_CATEGORIES.map(c => (
                    <button key={c} type="button" onClick={() => setCategory(c)}
                      className={`py-3 px-4 rounded-lg font-bold text-sm transition-all border-2 ${category === c ? 'bg-primary text-white border-primary' : 'border-outline-variant hover:border-primary'}`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Date & Time */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">{providerId ? '01' : '02'}</span>
                <h2 className="font-headline-lg text-headline-lg">SCHEDULE.</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white border border-outline-variant p-6 rounded-lg">
                  <p className="font-label-bold text-label-bold uppercase text-outline mb-4">Select Date</p>
                  <div className="grid grid-cols-4 gap-2">
                    {dates.map(d => {
                      const iso = d.toISOString().split('T')[0];
                      return (
                        <button key={iso} type="button" onClick={() => setSelectedDate(iso)}
                          className={`flex flex-col items-center py-3 px-1 rounded-lg transition-all font-bold text-sm ${selectedDate === iso ? 'bg-primary text-white' : 'hover:bg-surface-container'}`}>
                          <span className="text-[10px] uppercase">{d.toLocaleDateString('en', { weekday: 'short' })}</span>
                          <span className="text-xl">{d.getDate()}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="space-y-4">
                  <p className="font-label-bold text-label-bold uppercase text-outline">Available Windows</p>
                  <div className="grid grid-cols-2 gap-3">
                    {TIME_SLOTS.map(t => (
                      <button key={t} type="button" onClick={() => setSelectedTime(t)}
                        className={`py-4 px-4 rounded-lg font-bold text-sm transition-all ${selectedTime === t ? 'bg-primary text-white border-2 border-primary' : 'border-2 border-outline-variant hover:border-primary'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Address (Indian fields) */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">{providerId ? '02' : '03'}</span>
                <h2 className="font-headline-lg text-headline-lg">SERVICE ADDRESS.</h2>
              </div>
              <div className="space-y-4">
                <textarea className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none resize-none"
                  placeholder="Flat/House No, Building Name, Street, Locality..." rows={3} value={address} onChange={e => setAddress(e.target.value)} required />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none"
                    placeholder="City" type="text" value={city} onChange={e => setCity(e.target.value)} />
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none"
                    placeholder="State" type="text" defaultValue="Maharashtra" />
                  <input className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none"
                    placeholder="Pincode (6 digits)" type="text" value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} required pattern="[0-9]{6}" />
                </div>
                <textarea className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none resize-none"
                  placeholder="Describe the problem or service needed..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </div>

            {/* Step 4: Payment */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">{providerId ? '03' : '04'}</span>
                <h2 className="font-headline-lg text-headline-lg">PAYMENT MODE.</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: 'cash', label: 'Cash', icon: 'payments' },
                  { value: 'upi', label: 'UPI', icon: 'qr_code' },
                  { value: 'phonepe', label: 'PhonePe', icon: 'smartphone' },
                  { value: 'paytm', label: 'Paytm', icon: 'account_balance_wallet' },
                ].map(m => (
                  <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 font-bold transition-all ${paymentMethod === m.value ? 'bg-primary text-white border-primary' : 'border-outline-variant hover:border-primary'}`}>
                    <span className="material-symbols-outlined">{m.icon}</span>
                    {m.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-outline font-medium">
                {paymentMethod === 'cash' ? 'Pay cash to the provider after service completion.' : `Pay via ${paymentMethod.toUpperCase()} after service is marked complete.`}
              </p>
            </div>

            {error && <div className="bg-error-container text-on-error-container p-4 rounded-lg font-bold">{error}</div>}
          </div>

          {/* Sticky Summary */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              <div className="bg-emerald-950 text-white rounded-lg p-8 space-y-8 border-t-8 border-lime-400">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-headline-md text-headline-md text-lime-400">SUMMARY.</h3>
                    <p className="text-emerald-100/60 uppercase text-xs tracking-widest font-bold">Helpzy Verified</p>
                  </div>
                  <span className="material-symbols-outlined text-lime-400 text-3xl">receipt_long</span>
                </div>
                <div className="space-y-4 border-y border-emerald-900 py-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100/40 uppercase font-bold">Service</span>
                    <span className="font-bold">{provider?.business_name || category}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100/40 uppercase font-bold">Date</span>
                    <span className="font-bold">{selectedDate || '— Select date'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100/40 uppercase font-bold">Time</span>
                    <span className="font-bold">{selectedTime || '— Select time'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-100/40 uppercase font-bold">Payment</span>
                    <span className="font-bold capitalize">{paymentMethod}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-emerald-100/40 uppercase font-bold text-xs">Base Rate</span>
                    <span className="text-4xl font-black text-lime-400 italic">
                      {provider?.base_price ? `₹${provider.base_price}` : 'On Visit'}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-100/30 uppercase leading-relaxed">Final quote provided on-site. Platform fee included.</p>
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full bg-lime-400 text-emerald-950 py-5 rounded-full font-black uppercase tracking-tighter text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-lime-400/10 disabled:opacity-60 disabled:cursor-not-allowed">
                  {submitting ? 'CONFIRMING...' : user ? 'CONFIRM BOOKING' : 'SIGN IN TO BOOK'}
                </button>
              </div>
              <div className="bg-surface-container-high p-6 rounded-lg flex items-center gap-4">
                <div className="bg-white p-3 rounded-full text-primary shrink-0">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                </div>
                <div>
                  <p className="font-label-bold text-label-bold uppercase text-[12px]">Helpzy Guarantee</p>
                  <p className="text-on-surface-variant text-xs font-medium">All providers are background verified. OTP-protected service start.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-32 text-center font-bold">Loading booking journey...</div>}>
      <BookingContent />
    </Suspense>
  );
}
