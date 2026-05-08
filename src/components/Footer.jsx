import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-emerald-950 dark:bg-emerald-950 full-width border-t border-emerald-900 flat no-shadows">
      <div className="w-full py-32 px-10 flex flex-col md:flex-row justify-between items-start max-w-screen-2xl mx-auto">
        <div>
          <span className="text-3xl font-black text-lime-400 mb-8 block font-inter antialiased uppercase tracking-tighter italic">Helpzy</span>
          <p className="text-emerald-100/40 font-inter text-sm uppercase tracking-widest max-w-xs mb-8">India's trusted platform for home services. Fast, verified, and reliable.</p>
          <div className="flex gap-6 mb-12 md:mb-0">
            <a className="text-emerald-100/40 hover:text-white transition-colors" href="#"><span className="material-symbols-outlined">social_leaderboard</span></a>

          </div>
        </div>
        <div className="grid grid-cols-2 gap-16">
          <div className="flex flex-col gap-4">
            <h5 className="text-white font-bold uppercase tracking-widest mb-2">Services</h5>
            {['Electrician','Plumber','Cleaner','AC Repair','Painter','Carpenter'].map(s => (
              <Link key={s} href={`/services/${s.toLowerCase().replace(' ', '-')}`} className="text-emerald-100/40 font-inter text-sm uppercase tracking-widest hover:text-white underline decoration-lime-400 decoration-2">{s}</Link>
            ))}
          </div>
          <div className="flex flex-col gap-4">
            <h5 className="text-white font-bold uppercase tracking-widest mb-2">Support</h5>
            <a className="text-emerald-100/40 font-inter text-sm uppercase tracking-widest hover:text-white underline decoration-lime-400 decoration-2" href="#">Safety</a>
            <a className="text-emerald-100/40 font-inter text-sm uppercase tracking-widest hover:text-white underline decoration-lime-400 decoration-2" href="#">Help Center</a>
            <Link href="/auth" className="text-emerald-100/40 font-inter text-sm uppercase tracking-widest hover:text-white underline decoration-lime-400 decoration-2">Join as Pro</Link>
          </div>
        </div>
      </div>
      <div className="w-full px-10 pb-12 max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-emerald-900/50 pt-8">
        <span className="text-emerald-100/20 font-inter text-[11px] uppercase tracking-widest">© 2026 HELPZY. YOUR HOME. OUR MISSION.</span>
        <div className="flex gap-8">
          <a className="text-emerald-100/20 text-[11px] uppercase tracking-widest hover:text-lime-400" href="#">Privacy Policy</a>
          <a className="text-emerald-100/20 text-[11px] uppercase tracking-widest hover:text-lime-400" href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
