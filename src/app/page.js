import Link from 'next/link';

export default function Home({ params }) {
  return (
    <div className="flex-grow">
      

<section className="relative min-h-[90vh] flex items-center bg-emerald-950 overflow-hidden pt-20">

  {/* 4-panel image grid */}
  <div className="absolute inset-0 grid grid-cols-4">
    {[
      { src: '/category_plumber.png',     alt: 'Plumber' },
      { src: '/category_electrician.png', alt: 'Electrician' },
      { src: '/category_ac_repair.png',   alt: 'AC Repair' },
      { src: '/category_landscaper.png',  alt: 'Landscaper' },
    ].map((img, i) => (
      <div key={i} className="relative overflow-hidden">
        <img src={img.src} alt={img.alt} className="w-full h-full object-cover object-center scale-110" />
        {/* per-panel dark overlay */}
        <div className="absolute inset-0 bg-emerald-950/60" />
      </div>
    ))}
  </div>

  {/* Gradient — stronger on left so text pops, fades right */}
  <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/95 via-emerald-950/70 to-emerald-950/30" />
  <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-emerald-950/60" />

  {/* Divider lines between panels (decorative) */}
  <div className="absolute inset-0 grid grid-cols-4 pointer-events-none">
    {[1,2,3].map(i => <div key={i} className="border-r border-white/5" />)}
    <div />
  </div>

  {/* Content */}
  <div className="container-max mx-auto px-6 relative z-10 py-section-padding">
    <div className="max-w-3xl">
      <span className="inline-block text-lime-400 font-label-bold text-xs uppercase tracking-[0.25em] mb-6 border border-lime-400/30 px-4 py-1.5 rounded-full bg-lime-400/5">
        India's #1 Home Service Platform
      </span>
      <h1 className="font-display-xl text-display-xl text-white mb-6 leading-none">
        HOME <span className="text-neon-gradient">MAINTENANCE</span> MAGIC.
      </h1>
      <p className="font-body-lg text-body-lg text-emerald-100/70 mb-10 max-w-xl">
        Direct, high-impact solutions for your local home needs. We vibrate with modern energy to connect you with elite pros instantly.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link href="/search?category=Electrician" className="bg-lime-400 text-emerald-950 font-black uppercase tracking-tight px-8 py-4 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl shadow-lime-400/20">
          Search Pros →
        </Link>
        <Link href="/auth" className="border-2 border-white/20 text-white font-bold uppercase tracking-widest px-8 py-4 rounded-full hover:border-lime-400/50 hover:text-lime-300 transition-all">
          Sign Up Free
        </Link>
      </div>
    </div>
  </div>
</section>


<section className="py-section-padding bg-background">
<div className="container-max mx-auto px-6">
<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
<div>
<span className="text-primary font-label-bold uppercase tracking-widest block mb-4">Elite Services</span>
<h2 className="font-headline-lg text-headline-lg">POPULAR <span className="text-secondary">CATEGORIES</span></h2>
</div>
<a className="text-primary font-label-bold uppercase underline decoration-2 decoration-lime-400 flex items-center gap-2" href="#">
                        View All Services <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
</a>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">


<Link href="/services/electrician" className="group relative aspect-square bg-emerald-950 overflow-hidden rounded-lg cursor-pointer block">
<div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
<img alt="Electrician" className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500" src="/category_electrician.png"/>
</div>
<div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent"></div>
<div className="absolute bottom-8 left-8">
<span className="material-symbols-outlined text-lime-400 text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>electric_bolt</span>
<h3 className="font-headline-md text-headline-md text-white">Electrician</h3>
</div>
</Link>

<Link href="/services/plumber" className="group relative aspect-square bg-emerald-950 overflow-hidden rounded-lg cursor-pointer block">
<div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
<img alt="Plumber" className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500" src="/category_plumber.png"/>
</div>
<div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent"></div>
<div className="absolute bottom-8 left-8">
<span className="material-symbols-outlined text-lime-400 text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>plumbing</span>
<h3 className="font-headline-md text-headline-md text-white">Plumber</h3>
</div>
</Link>

<Link href="/services/cleaner" className="group relative aspect-square bg-emerald-950 overflow-hidden rounded-lg cursor-pointer block">
<div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
<img alt="Cleaner" className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500" src="/category_cleaner.png"/>
</div>
<div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent"></div>
<div className="absolute bottom-8 left-8">
<span className="material-symbols-outlined text-lime-400 text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>cleaning_services</span>
<h3 className="font-headline-md text-headline-md text-white">Cleaning</h3>
</div>
</Link>

<Link href="/services/ac-repair" className="group relative aspect-square bg-emerald-950 overflow-hidden rounded-lg cursor-pointer block">
<div className="absolute inset-0 group-hover:scale-110 transition-transform duration-700">
<img alt="AC Repair" className="w-full h-full object-cover opacity-60 group-hover:opacity-75 transition-opacity duration-500" src="/category_ac_repair.png"/>
</div>
<div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/30 to-transparent"></div>
<div className="absolute bottom-8 left-8">
<span className="material-symbols-outlined text-lime-400 text-4xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>ac_unit</span>
<h3 className="font-headline-md text-headline-md text-white">AC Repair</h3>
</div>
</Link>
</div>
</div>
</section>

<section className="py-section-padding bg-surface-container overflow-hidden">
<div className="container-max mx-auto px-6">
<div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
<div className="relative">
<div className="bg-lime-400 w-full aspect-[4/5] rounded-lg rotate-3 absolute -top-4 -left-4 -z-10"></div>
<div className="bg-emerald-950 w-full aspect-[4/5] rounded-lg flex items-center justify-center overflow-hidden">
<img alt="Helpzy home service professionals" className="w-full h-full object-cover" src="/platform_hero.png"/>
</div>
</div>
<div>
<h2 className="font-display-xl text-headline-lg mb-8 uppercase">A PLATFORM CREATED TO BE <span className="text-primary italic">YOUR OWN</span>.</h2>
<div className="space-y-12">
<div className="flex gap-6">
<div className="w-16 h-16 bg-lime-400 text-emerald-950 flex items-center justify-center rounded-full shrink-0">
<span className="material-symbols-outlined text-3xl font-bold" data-icon="bolt">bolt</span>
</div>
<div>
<h4 className="font-headline-md text-body-lg font-bold mb-2 uppercase">Energetic Efficiency</h4>
<p className="text-on-surface-variant font-body-md">We cut the fluff. Direct connections, instant quotes, and verified reviews mean you save time and energy on every project.</p>
</div>
</div>
<div className="flex gap-6">
<div className="w-16 h-16 bg-emerald-950 text-lime-400 flex items-center justify-center rounded-full shrink-0">
<span className="material-symbols-outlined text-3xl" data-icon="visibility">visibility</span>
</div>
<div>
<h4 className="font-headline-md text-body-lg font-bold mb-2 uppercase">Radical Transparency</h4>
<p className="text-on-surface-variant font-body-md">No hidden fees or mysterious ratings. Our data-driven approach ensures you know exactly who is entering your home and what you're paying.</p>
</div>
</div>
</div>
</div>
</div>
</div>
</section>

<section className="py-section-padding bg-emerald-950 text-white">
<div className="container-max mx-auto px-6">
<div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
<div className="p-12 bg-white/5 border border-white/10 rounded-lg flex flex-col justify-between min-h-[400px]">
<span className="material-symbols-outlined text-lime-400 text-6xl" data-icon="verified_user" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
<div>
<h3 className="font-headline-lg text-headline-lg mb-4">100% GUARANTEE</h3>
<p className="text-emerald-100/60 font-body-lg max-w-sm">If you aren't satisfied with the work, we'll make it right. No arguments, just solutions.</p>
</div>
</div>
<div className="p-12 bg-lime-400 text-emerald-950 rounded-lg flex flex-col justify-between min-h-[400px]">
<span className="material-symbols-outlined text-6xl" data-icon="lock" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
<div>
<h3 className="font-headline-lg text-headline-lg mb-4 uppercase">SECURE BOOKING</h3>
<p className="text-emerald-950/70 font-body-lg max-w-sm">Encrypted transactions and direct communication through our proprietary high-speed portal.</p>
</div>
</div>
</div>
</div>
</section>



<section className="bg-lime-400 py-32 overflow-hidden relative">
<div className="absolute inset-0 opacity-10 pointer-events-none">
<div className="flex gap-12 whitespace-nowrap animate-marquee">
<span className="text-[120px] font-black text-emerald-950 uppercase italic">EFFICIENCY EFFICIENCY EFFICIENCY EFFICIENCY</span>
</div>
</div>
<div className="container-max mx-auto px-6 relative z-10 text-center">
<h2 className="font-display-xl text-display-xl text-emerald-950 mb-12 uppercase">READY TO BUILD YOUR <span className="bg-emerald-950 text-lime-400 px-4">MAINTENANCE TEAM?</span></h2>
<div className="flex flex-col sm:flex-row justify-center gap-6">
<button className="bg-emerald-950 text-lime-400 font-label-bold text-lg px-12 py-6 rounded-full uppercase tracking-widest hover:scale-105 transition-transform">Get Started Now</button>
<button className="border-4 border-emerald-950 text-emerald-950 font-label-bold text-lg px-12 py-6 rounded-full uppercase tracking-widest hover:bg-emerald-950 hover:text-white transition-colors">Become a Pro</button>
</div>
</div>
</section>

    </div>
  );
}