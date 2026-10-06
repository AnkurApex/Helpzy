import Link from 'next/link';

export default function ProviderCard({ provider, icon = 'handyman' }) {
  return (
    <div className="group bg-white rounded-lg border border-outline-variant p-6 flex flex-col md:flex-row gap-6 hover:border-primary transition-all duration-300">
      <div className="w-full md:w-48 h-48 rounded bg-surface-container-high overflow-hidden relative shrink-0">
        {provider.image_url ? (
          <img src={provider.image_url} alt={provider.business_name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-emerald-50">
            <span className="material-symbols-outlined text-6xl text-emerald-900/20">{icon}</span>
          </div>
        )}
        {provider.rating >= 4.8 && (
          <div className="absolute top-2 right-2 bg-lime-400 text-emerald-950 font-bold text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">Top Rated</div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 flex-wrap gap-2">
            <h3 className="font-headline-md text-headline-md text-emerald-950 uppercase">{provider.business_name}</h3>
            {provider.rating > 0 && (
              <div className="flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded shrink-0">
                <span className="material-symbols-outlined text-primary text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-bold text-sm">{Number(provider.rating).toFixed(1)}</span>
                <span className="text-xs text-outline">({provider.review_count})</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-sm text-outline">location_on</span>
            <p className="text-emerald-900/70 font-bold text-xs uppercase tracking-widest">
              {provider.city}{provider.pincode ? ` · ${provider.pincode}` : ''}
            </p>
          </div>
          <p className="text-body-md font-body-md text-on-surface-variant mb-6 line-clamp-2">
            {provider.description || 'Verified Helpzy professional ready to book.'}
          </p>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          {provider.base_price > 0 && (
            <div>
              <p className="text-xs text-outline font-bold uppercase">Starting at</p>
              <p className="text-xl font-black text-emerald-950">₹{provider.base_price}</p>
            </div>
          )}
          <div className="flex gap-3 ml-auto">
            <Link href={`/provider/${provider.id}`} className="border-2 border-emerald-950 text-emerald-950 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-emerald-950 hover:text-lime-400 transition-colors text-sm">
              View Profile
            </Link>
            <Link href={`/booking?provider=${provider.id}`} className="bg-emerald-950 text-lime-400 px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-colors text-sm">
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
