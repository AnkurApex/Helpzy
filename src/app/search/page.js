'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SERVICE_CATEGORIES } from '@/lib/constants';
import ProviderCard from '@/components/ProviderCard';

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
            {SERVICE_CATEGORIES.map(c => (
              <button key={c.label} onClick={() => setCategory(c.label)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${c.label === category ? 'bg-lime-400 text-emerald-950' : 'bg-emerald-900/50 text-emerald-100/60 hover:text-lime-300 border border-emerald-800'}`}>
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
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
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
