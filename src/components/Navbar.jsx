'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth').then(r => r.json()).then(d => setUser(d.user)).catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    setUser(null);
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/services/electrician', label: 'Services' },
  ];

  return (
    <nav className="bg-emerald-950 dark:bg-emerald-950 top-0 z-50 border-b border-emerald-900 fixed w-full">
      <div className="flex justify-between items-center w-full px-6 py-4 max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-2xl font-black text-lime-400 italic font-inter antialiased uppercase tracking-tighter">
            Helpzy
          </Link>
          <div className="hidden md:flex gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-emerald-100/60 font-medium hover:text-lime-300 transition-colors font-inter antialiased uppercase tracking-tighter text-sm">
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/my-bookings" className="hidden md:block text-emerald-100/60 font-medium hover:text-lime-300 transition-colors text-sm uppercase tracking-widest font-bold">
                My Bookings
              </Link>
              {(user.role === 'provider') && (
                <Link href="/provider/dashboard" className="hidden md:block text-emerald-100/60 font-medium hover:text-lime-300 transition-colors text-sm uppercase tracking-widest font-bold">
                  Dashboard
                </Link>
              )}
              {(user.role === 'admin') && (
                <Link href="/admin" className="hidden md:block text-emerald-100/60 font-medium hover:text-lime-300 transition-colors text-sm uppercase tracking-widest font-bold">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="hidden md:block text-emerald-100/60 font-medium hover:text-lime-300 transition-colors text-sm uppercase tracking-widest">
                {user.name?.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="bg-lime-400 text-emerald-950 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs active:scale-95 duration-100 hover:bg-lime-300 transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth" className="hidden md:block text-emerald-100/60 font-medium hover:text-lime-300 transition-colors text-sm uppercase tracking-widest font-bold">
                Sign In
              </Link>
              <Link href="/search?category=Electrician" className="bg-lime-400 text-emerald-950 px-6 py-2 rounded-full font-bold uppercase tracking-widest text-xs active:scale-95 duration-100 inline-flex items-center justify-center hover:bg-lime-300 transition-colors">
                Search Pros
              </Link>
            </>
          )}
          <button className="md:hidden text-emerald-100/60 hover:text-lime-300" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-emerald-900 border-t border-emerald-800 px-6 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block text-emerald-100/60 font-medium hover:text-lime-300 transition-colors uppercase tracking-tighter text-sm py-2 border-b border-emerald-800/50">
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/my-bookings" onClick={() => setMobileOpen(false)} className="block text-lime-400 font-bold uppercase tracking-widest text-sm py-2">My Bookings</Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block text-emerald-100/60 uppercase tracking-widest text-sm py-2">Profile</Link>
              <button onClick={handleLogout} className="block text-error font-bold uppercase tracking-widest text-sm py-2">Sign Out</button>
            </>
          ) : (
            <Link href="/auth" onClick={() => setMobileOpen(false)} className="block text-lime-400 font-bold uppercase tracking-widest text-sm py-2">Sign In / Register</Link>
          )}
        </div>
      )}

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 bg-emerald-950 border-t border-emerald-900 z-50">
        {[
          { href: '/', icon: 'home', label: 'Home' },
          { href: '/search?category=Electrician', icon: 'search', label: 'Search' },
          { href: user ? '/my-bookings' : '/auth', icon: 'calendar_today', label: 'Bookings' },
          { href: user ? '/profile' : '/auth', icon: 'person', label: user ? user.name?.split(' ')[0] : 'Account' },
        ].map(item => (
          <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center text-emerald-100/50 hover:text-lime-400 transition-colors p-2">
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[11px] font-bold uppercase tracking-widest mt-1 truncate max-w-[60px]">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
