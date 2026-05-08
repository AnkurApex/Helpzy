'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CATEGORIES = ['Electrician','Plumber','Cleaner','AC Repair','Painter','Carpenter','Pest Control','Appliance Repair'];

// ── Step indicator ──────────────────────────────────────────────────────────
function StepDots({ step, total }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={`rounded-full transition-all duration-500 ${i + 1 === step ? 'w-6 h-2 bg-lime-400' : i + 1 < step ? 'w-2 h-2 bg-lime-400/60' : 'w-2 h-2 bg-emerald-800'}`} />
      ))}
    </div>
  );
}

// ── 6-box OTP input ─────────────────────────────────────────────────────────
function OTPInput({ value, onChange, disabled }) {
  const refs = useRef([]);
  const digits = value.split('');

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const next = [...digits];
      if (next[i]) { next[i] = ''; onChange(next.join('')); }
      else if (i > 0) { next[i - 1] = ''; onChange(next.join('')); refs.current[i - 1]?.focus(); }
    }
  };

  const handleChange = (i, e) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[i] = val;
    onChange(next.join(''));
    if (val && i < 5) refs.current[i + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-3 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input key={i}
          ref={el => refs.current[i] = el}
          type="text" inputMode="numeric" maxLength={1}
          value={digits[i] || ''}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={`w-11 h-14 text-center text-xl font-black rounded-lg border-2 outline-none transition-all duration-200 bg-emerald-900/50 text-white
            ${digits[i] ? 'border-lime-400 scale-105' : 'border-emerald-700 focus:border-lime-400/70'}
            disabled:opacity-50`}
        />
      ))}
    </div>
  );
}

// ── Animated slide wrapper ──────────────────────────────────────────────────
function SlideStep({ visible, direction }) {
  return {
    transform: visible ? 'translateX(0) scale(1)' : direction === 'forward' ? 'translateX(60px) scale(0.97)' : 'translateX(-60px) scale(0.97)',
    opacity: visible ? 1 : 0,
    transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: visible ? 'auto' : 'none',
    position: visible ? 'relative' : 'absolute',
    width: '100%',
  };
}

// ── Main component ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [step, setStep] = useState(1);       // 1 | 2 | 3
  const [dir, setDir] = useState('forward');

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('customer');
  const [category, setCategory] = useState('Electrician');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [demoOtp, setDemoOtp] = useState(''); // shown in dev mode

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successUser, setSuccessUser] = useState(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  const go = (nextStep) => {
    setDir(nextStep > step ? 'forward' : 'backward');
    setError('');
    setTimeout(() => setStep(nextStep), 20);
  };

  const switchMode = (m) => {
    setMode(m); setStep(1); setError(''); setOtp('');
    setEmail(''); setName(''); setPhone(''); setPassword(''); setDemoOtp('');
  };

  // ── STEP 1 → send OTP ───────────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    if (!email) { setError('Please enter your email address.'); return; }
    if (mode === 'signup' && !name) { setError('Please enter your full name.'); return; }
    if (mode === 'signup' && (!phone || phone.length !== 10)) { setError('Please enter a valid 10-digit phone number.'); return; }

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: mode === 'login' ? 'send_login' : 'send_signup',
          email, name, phone, role, category,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDemoOtp(data.otp); // Dev: show OTP
      setResendTimer(30);
      go(2);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── STEP 2 → verify OTP ─────────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otp.length < 6) { setError('Please enter the complete 6-digit OTP.'); return; }
    if (mode === 'signup' && (!password || password.length < 6)) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth/otp', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); setOtp(''); return; }
      setSuccessUser(data.user);
      go(3);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };

  // ── STEP 3 → redirect ───────────────────────────────────────────────────
  useEffect(() => {
    if (step === 3 && successUser) {
      const timer = setTimeout(() => {
        if (successUser.role === 'admin') router.push('/admin');
        else if (successUser.role === 'provider') router.push('/provider/dashboard');
        else router.push('/');
        router.refresh();
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [step, successUser]);

  // ── Demo login ──────────────────────────────────────────────────────────
  const demoLogin = async (dEmail, dPw) => {
    setLoading(true); setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email: dEmail, password: dPw }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccessUser(data.user);
      setStep(3);
    } catch { setError('Network error.'); }
    finally { setLoading(false); }
  };

  const totalSteps = 3;

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center px-4 py-24">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-lime-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-4xl font-black text-lime-400 italic uppercase tracking-tighter hover:scale-105 transition-transform">
            Helpzy
          </Link>
          <p className="text-emerald-100/40 text-xs uppercase tracking-[0.2em] mt-2">
            India's Home Service Platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl shadow-black/40">
          {/* Mode toggle — only on step 1 */}
          <div className={`transition-all duration-300 ${step === 1 ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="flex bg-emerald-900/60 p-1 m-4 rounded-full gap-1">
              {[{ v: 'login', l: 'Sign In' }, { v: 'signup', l: 'Create Account' }].map(m => (
                <button key={m.v} type="button" onClick={() => switchMode(m.v)}
                  className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${mode === m.v ? 'bg-lime-400 text-emerald-950 shadow-lg shadow-lime-400/20' : 'text-emerald-100/50 hover:text-lime-300'}`}>
                  {m.l}
                </button>
              ))}
            </div>
          </div>

          <div className="px-8 pb-8 pt-2">
            <StepDots step={step} total={totalSteps} />

            <div className="relative overflow-hidden min-h-[300px]">

              {/* ── STEP 1 ── */}
              <div style={SlideStep({ visible: step === 1, direction: dir })}>
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-white font-black text-2xl uppercase tracking-tight">
                      {mode === 'login' ? 'Welcome Back.' : 'Get Started.'}
                    </h2>
                    <p className="text-emerald-100/40 text-sm mt-1">
                      {mode === 'login' ? 'Sign in to manage your bookings.' : 'Join thousands of happy customers.'}
                    </p>
                  </div>

                  {mode === 'signup' && (
                    <>
                      <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)}
                        className="w-full bg-emerald-900/50 border border-emerald-800 rounded-xl px-4 py-3.5 text-white placeholder:text-emerald-100/30 focus:border-lime-400 focus:bg-emerald-900/80 outline-none transition-all duration-200" />

                      {/* Role */}
                      <div className="grid grid-cols-2 gap-3">
                        {[{ v: 'customer', i: 'home', l: 'Customer' }, { v: 'provider', i: 'build', l: 'Service Pro' }].map(r => (
                          <button key={r.v} type="button" onClick={() => setRole(r.v)}
                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200 text-sm font-bold ${role === r.v ? 'border-lime-400 bg-lime-400/10 text-lime-400 scale-[1.02]' : 'border-emerald-800 text-emerald-100/50 hover:border-emerald-600'}`}>
                            <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: role === r.v ? "'FILL' 1" : "'FILL' 0" }}>{r.i}</span>
                            {r.l}
                          </button>
                        ))}
                      </div>

                      {role === 'provider' && (
                        <select value={category} onChange={e => setCategory(e.target.value)}
                          className="w-full bg-emerald-900/50 border border-emerald-800 rounded-xl px-4 py-3.5 text-white focus:border-lime-400 outline-none transition-all duration-200">
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      )}

                      <input type="tel" placeholder="Phone Number (10 digits)" value={phone}
                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="w-full bg-emerald-900/50 border border-emerald-800 rounded-xl px-4 py-3.5 text-white placeholder:text-emerald-100/30 focus:border-lime-400 focus:bg-emerald-900/80 outline-none transition-all duration-200" />
                    </>
                  )}

                  <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full bg-emerald-900/50 border border-emerald-800 rounded-xl px-4 py-3.5 text-white placeholder:text-emerald-100/30 focus:border-lime-400 focus:bg-emerald-900/80 outline-none transition-all duration-200" />

                  {error && <p className="text-red-400 text-sm font-medium bg-red-950/40 border border-red-900/50 px-4 py-3 rounded-xl">{error}</p>}

                  <button onClick={handleSendOtp} disabled={loading}
                    className="w-full bg-lime-400 text-emerald-950 py-4 rounded-full font-black uppercase tracking-tight text-base mt-2 hover:bg-lime-300 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg shadow-lime-400/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-emerald-950/40 border-t-emerald-950 rounded-full animate-spin inline-block" />
                        Sending OTP...
                      </span>
                    ) : 'Get OTP →'}
                  </button>

                  {/* Demo accounts */}
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-emerald-100/30 text-xs uppercase tracking-widest text-center mb-3">Quick Demo</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Admin', email: 'admin@helpzy.in', pw: 'admin123' },
                        { label: 'Customer', email: 'rahul@example.com', pw: 'customer123' },
                        { label: 'Provider', email: 'ramesh@provider.com', pw: 'provider123' },
                      ].map(d => (
                        <button key={d.label} type="button" onClick={() => demoLogin(d.email, d.pw)} disabled={loading}
                          className="text-xs text-emerald-100/40 hover:text-lime-400 border border-emerald-800 hover:border-lime-400/40 py-2 px-3 rounded-lg transition-all duration-200 uppercase font-bold tracking-widest disabled:opacity-50">
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── STEP 2 ── */}
              <div style={SlideStep({ visible: step === 2, direction: dir })}>
                <div className="space-y-6">
                  <div className="mb-2">
                    <button onClick={() => go(1)} className="flex items-center gap-1 text-emerald-100/40 hover:text-lime-300 text-xs uppercase font-bold tracking-widest transition-colors mb-4 group">
                      <span className="material-symbols-outlined text-base group-hover:-translate-x-1 transition-transform">arrow_back</span>
                      Back
                    </button>
                    <h2 className="text-white font-black text-2xl uppercase tracking-tight">Verify OTP.</h2>
                    <p className="text-emerald-100/40 text-sm mt-1">
                      Enter the 6-digit code sent to <span className="text-lime-400 font-bold">{email}</span>
                    </p>
                  </div>

                  {/* Dev mode OTP hint */}
                  {demoOtp && (
                    <div className="bg-lime-400/10 border border-lime-400/30 rounded-xl px-4 py-3 flex items-center gap-3">
                      <span className="material-symbols-outlined text-lime-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>info</span>
                      <div>
                        <p className="text-lime-400/60 text-[10px] uppercase font-bold tracking-widest">Dev Mode — Your OTP</p>
                        <p className="text-lime-400 font-black text-xl tracking-[0.3em]">{demoOtp}</p>
                      </div>
                    </div>
                  )}

                  <OTPInput value={otp} onChange={setOtp} disabled={loading} />

                  {/* Signup also needs password */}
                  {mode === 'signup' && (
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create Password (min 6 chars)"
                        value={password} onChange={e => setPassword(e.target.value)}
                        className="w-full bg-emerald-900/50 border border-emerald-800 rounded-xl px-4 py-3.5 pr-12 text-white placeholder:text-emerald-100/30 focus:border-lime-400 focus:bg-emerald-900/80 outline-none transition-all duration-200"
                      />
                      <button type="button" onClick={() => setShowPassword(s => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-100/40 hover:text-lime-300 transition-colors">
                        <span className="material-symbols-outlined text-xl">{showPassword ? 'visibility_off' : 'visibility'}</span>
                      </button>
                    </div>
                  )}

                  {error && <p className="text-red-400 text-sm font-medium bg-red-950/40 border border-red-900/50 px-4 py-3 rounded-xl">{error}</p>}

                  <button onClick={handleVerifyOtp} disabled={loading || otp.length < 6}
                    className="w-full bg-lime-400 text-emerald-950 py-4 rounded-full font-black uppercase tracking-tight text-base hover:bg-lime-300 hover:scale-[1.02] active:scale-95 transition-all duration-200 shadow-lg shadow-lime-400/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-emerald-950/40 border-t-emerald-950 rounded-full animate-spin inline-block" />
                        Verifying...
                      </span>
                    ) : mode === 'login' ? 'Sign In →' : 'Create Account →'}
                  </button>

                  {/* Resend OTP */}
                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-emerald-100/30 text-sm">
                        Resend OTP in <span className="text-lime-400 font-bold">{resendTimer}s</span>
                      </p>
                    ) : (
                      <button onClick={handleSendOtp} disabled={loading}
                        className="text-emerald-100/40 hover:text-lime-400 text-sm font-bold uppercase tracking-widest transition-colors underline decoration-dotted underline-offset-4">
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ── STEP 3 — SUCCESS ── */}
              <div style={SlideStep({ visible: step === 3, direction: dir })}>
                <div className="flex flex-col items-center justify-center py-8 text-center space-y-5">
                  {/* Animated checkmark */}
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-lime-400 flex items-center justify-center animate-[bounce_0.6s_ease-out]">
                      <span className="material-symbols-outlined text-5xl text-emerald-950" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <div className="absolute inset-0 rounded-full bg-lime-400/30 animate-ping" />
                  </div>

                  <div>
                    <h2 className="text-white font-black text-3xl uppercase tracking-tight">
                      {mode === 'login' ? 'Welcome Back!' : 'You\'re In!'}
                    </h2>
                    <p className="text-lime-400 font-bold text-lg mt-1">{successUser?.name}</p>
                    <p className="text-emerald-100/40 text-sm mt-2 uppercase tracking-widest">
                      {mode === 'login' ? 'Signing you in...' : 'Account created successfully!'}
                    </p>
                  </div>

                  <div className="w-full bg-emerald-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-lime-400 text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>
                          {successUser?.role === 'admin' ? 'admin_panel_settings' : successUser?.role === 'provider' ? 'build' : 'home'}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-white font-bold capitalize">{successUser?.role}</p>
                        <p className="text-emerald-100/40 text-xs">{successUser?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {[0,1,2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-lime-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <p className="text-emerald-100/30 text-xs uppercase tracking-widest">Redirecting...</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Footer note */}
        {step < 3 && (
          <p className="text-center text-emerald-100/20 text-xs uppercase tracking-widest mt-6">
            By continuing, you agree to Helpzy's Terms & Privacy Policy.
          </p>
        )}
      </div>
    </div>
  );
}
