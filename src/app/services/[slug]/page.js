import { openDb } from '@/lib/db';
import Link from 'next/link';

const SERVICE_CONFIG = {
  electrician:      { icon: 'electric_bolt',     label: 'Electrician',      tagline: 'CERTIFIED ELECTRICIANS AT YOUR DOOR', color: 'from-yellow-900 to-emerald-950' },
  plumber:          { icon: 'plumbing',           label: 'Plumber',          tagline: 'LICENSED PLUMBING EXPERTS NEAR YOU',  color: 'from-blue-900 to-emerald-950' },
  cleaner:          { icon: 'cleaning_services',  label: 'Cleaner',          tagline: 'PROFESSIONAL HOME CLEANING SERVICES', color: 'from-sky-900 to-emerald-950' },
  'ac-repair':      { icon: 'ac_unit',            label: 'AC Repair',        tagline: 'ALL BRANDS AC SERVICE & REPAIR',      color: 'from-cyan-900 to-emerald-950' },
  painter:          { icon: 'format_paint',       label: 'Painter',          tagline: 'QUALITY INTERIOR & EXTERIOR PAINTING', color: 'from-orange-900 to-emerald-950' },
  carpenter:        { icon: 'handyman',           label: 'Carpenter',        tagline: 'SKILLED CARPENTERS FOR HOME REPAIRS',  color: 'from-amber-900 to-emerald-950' },
  'pest-control':   { icon: 'pest_control',       label: 'Pest Control',     tagline: 'SAFE & EFFECTIVE PEST ELIMINATION',   color: 'from-green-900 to-emerald-950' },
  'appliance-repair':{ icon: 'home_repair_service',label:'Appliance Repair', tagline: 'EXPERT APPLIANCE REPAIR SERVICES',    color: 'from-violet-900 to-emerald-950' },
};

// Map slug to DB category name
const SLUG_TO_CATEGORY = {
  electrician: 'Electrician',
  plumber: 'Plumber',
  cleaner: 'Cleaner',
  'ac-repair': 'AC Repair',
  painter: 'Painter',
  carpenter: 'Carpenter',
  'pest-control': 'Pest Control',
  'appliance-repair': 'Appliance Repair',
};

async function getProviders(categoryDb) {
  try {
    const db = await openDb();
    return await db.all(
      "SELECT * FROM providers WHERE LOWER(category) = LOWER(?) AND status = 'active' ORDER BY rating DESC",
      [categoryDb]
    );
  } catch { return []; }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const cfg = SERVICE_CONFIG[slug] || { label: slug };
  return {
    title: `${cfg.label} Services in India | Helpzy`,
    description: `Book trusted ${cfg.label.toLowerCase()} professionals near you. Verified, background-checked, affordable.`,
  };
}

export default async function ServicePage({ params }) {
  const { slug } = await params;
  const cfg = SERVICE_CONFIG[slug] || { icon: 'build', label: slug, tagline: 'PROFESSIONAL SERVICES', color: 'from-emerald-900 to-emerald-950' };
  const categoryDb = SLUG_TO_CATEGORY[slug] || slug;
  const providers = await getProviders(categoryDb);

  const allCategories = Object.entries(SERVICE_CONFIG);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className={`bg-gradient-to-br ${cfg.color} py-20 px-6 pt-32`}>
        <div className="max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-lime-400 text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>{cfg.icon}</span>
            <span className="text-lime-400 font-label-bold uppercase tracking-widest">{cfg.label}</span>
          </div>
          <h1 className="font-display-xl text-display-xl text-white mb-4">{cfg.tagline}</h1>
          <p className="text-emerald-100/60 font-body-lg max-w-xl mb-8">
            Connect with vetted, top-rated {cfg.label.toLowerCase()} professionals near you. Book in minutes, pay after service.
          </p>
          <div className="flex flex-wrap gap-3">
            {allCategories.map(([s, c]) => (
              <Link key={s} href={`/services/${s}`}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${s === slug ? 'bg-lime-400 text-emerald-950' : 'bg-emerald-900/50 text-emerald-100/60 hover:text-lime-300 border border-emerald-800'}`}>
                <span className="material-symbols-outlined text-base">{c.icon}</span>{c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-screen-2xl mx-auto px-6 py-12">
        {providers.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">{cfg.icon}</span>
            <p className="font-headline-md text-headline-md uppercase mb-4">No {cfg.label} Providers Yet</p>
            <p className="text-on-surface-variant font-body-md mb-8">We're expanding to more cities. Check back soon or try another service.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              {allCategories.filter(([s]) => s !== slug).map(([s, c]) => (
                <Link key={s} href={`/services/${s}`} className="bg-emerald-950 text-lime-400 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-primary transition-colors">{c.label}</Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {providers.map(p => (
              <div key={p.id} className="group bg-white rounded-lg border border-outline-variant p-6 flex flex-col md:flex-row gap-6 hover:border-primary transition-all duration-300">
                <div className="w-full md:w-48 h-48 rounded bg-surface-container-high overflow-hidden relative shrink-0">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-emerald-50">
                      <span className="material-symbols-outlined text-6xl text-emerald-900/20">{cfg.icon}</span>
                    </div>
                  )}
                  {p.rating >= 4.8 && (
                    <div className="absolute top-2 right-2 bg-lime-400 text-emerald-950 font-bold text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">Top Rated</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
                      <h3 className="font-headline-md text-headline-md text-emerald-950 uppercase">{p.business_name}</h3>
                      {p.rating > 0 && (
                        <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded shrink-0">
                          <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                          <span className="font-bold text-sm">{p.rating}</span>
                          <span className="text-xs text-outline">({p.review_count})</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="material-symbols-outlined text-sm text-outline">location_on</span>
                      <p className="text-emerald-900/70 font-bold text-xs uppercase tracking-widest">{p.city}{p.pincode ? ` · ${p.pincode}` : ''}</p>
                    </div>
                    <p className="text-body-md font-body-md text-on-surface-variant mb-6 line-clamp-2">{p.description}</p>
                  </div>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    {p.base_price > 0 && (
                      <div>
                        <p className="text-xs text-outline font-bold uppercase">Starting at</p>
                        <p className="text-xl font-black text-emerald-950">₹{p.base_price}</p>
                      </div>
                    )}
                    <div className="flex gap-3 ml-auto">
                      <Link href={`/provider/${p.id}`} className="border-2 border-emerald-950 text-emerald-950 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-950 hover:text-lime-400 transition-colors text-sm">
                        View Profile
                      </Link>
                      <Link href={`/booking?provider=${p.id}`} className="bg-emerald-950 text-lime-400 px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors text-sm">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
