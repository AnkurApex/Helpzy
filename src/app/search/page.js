'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const CATEGORIES = [
  { slug: 'Electrician', label: 'Electrician', icon: 'electric_bolt' },
  { slug: 'Plumber', label: 'Plumber', icon: 'plumbing' },
  { slug: 'Cleaner', label: 'Cleaner', icon: 'cleaning_services' },
  { slug: 'AC Repair', label: 'AC Repair', icon: 'ac_unit' },
  { slug: 'Painter', label: 'Painter', icon: 'format_paint' },
  { slug: 'Carpenter', label: 'Carpenter', icon: 'handyman' },
  { slug: 'Pest Control', label: 'Pest Control', icon: 'pest_control' },
  { slug: 'Appliance Repair', label: 'Appliance Repair', icon: 'home_repair_service' },
];

import { Suspense } from 'react';

function SearchContent() {
  const searchParams = useSearchParams();
  const [category, setCategory] = useState(searchParams.get('category') || 'Electrician');
  const [pincode, setPincode] = useState(searchParams.get('pincode') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProviders = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ category });
    if (pincode) params.set('pincode', pincode);
    if (city) params.set('city', city);
    fetch(`/api/providers?${params}`)
      .then(r => r.json())
      .then(data => { setProviders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, city, pincode]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  return (
    <div className="min-h-screen">
      {/* Search Header */}
      <section className="bg-emerald-950 py-16 px-6 pt-28">
        <div className="max-w-screen-2xl mx-auto">
          <p className="text-lime-400 font-label-bold text-label-bold uppercase tracking-widest mb-2">{providers.length} PROS FOUND</p>
          <h1 className="font-display-xl text-display-xl text-white mb-8">{category.toUpperCase()} EXPERTS</h1>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-3 mb-6">
            {CATEGORIES.map(c => (
              <button key={c.slug} onClick={() => setCategory(c.slug)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${c.slug === category ? 'bg-lime-400 text-emerald-950' : 'bg-emerald-900/50 text-emerald-100/60 hover:text-lime-300 border border-emerald-800'}`}>
                <span className="material-symbols-outlined text-base">{c.icon}</span>
                {c.label}
              </button>
            ))}
          </div>

          {/* Location Filters */}
          <div className="flex flex-wrap gap-3 items-center bg-emerald-900/30 p-4 rounded-lg border border-emerald-800">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400 text-sm">location_on</span>
              <input type="text" placeholder="City (e.g. Mumbai)" value={city} onChange={e => setCity(e.target.value)}
                className="bg-transparent text-white placeholder:text-emerald-100/30 outline-none text-sm font-bold w-36" />
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lime-400 text-sm">pin_drop</span>
              <input type="text" placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)}
                className="bg-transparent text-white placeholder:text-emerald-100/30 outline-none text-sm font-bold w-24" pattern="[0-9]*" maxLength={6} />
            </div>
            <button onClick={fetchProviders} className="bg-lime-400 text-emerald-950 px-4 py-2 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-lime-300 transition-colors ml-auto">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="max-w-screen-2xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : providers.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-6xl text-outline mb-4 block">search_off</span>
            <p className="font-headline-md text-headline-md text-outline uppercase mb-2">No providers found.</p>
            <p className="text-on-surface-variant">Try changing category or location filters.</p>
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
                      <span className="material-symbols-outlined text-6xl text-emerald-900/20">handyman</span>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-32 text-center font-bold">Loading expert pros...</div>}>
      <SearchContent />
    </Suspense>
  );
}
