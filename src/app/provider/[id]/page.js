import { openDb } from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

async function getProvider(id) {
  try {
    const db = await openDb();
    const provider = await db.get('SELECT * FROM providers WHERE id = ?', [id]);
    if (!provider) return null;
    const services = await db.all('SELECT * FROM services WHERE provider_id = ?', [id]);
    return { ...provider, services };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) return { title: 'Provider Not Found | LocalPro' };
  return {
    title: `${provider.business_name} | LocalPro`,
    description: provider.description,
  };
}

export default async function ProviderProfilePage({ params }) {
  const { id } = await params;
  const provider = await getProvider(id);
  if (!provider) notFound();

  const stars = Math.round(provider.rating);
  const reviews = [
    { initials: 'MJ', name: 'Marcus Johnson', role: 'Verified Homeowner', bg: 'bg-lime-400', text: '"A pipe burst at 3 AM on a Sunday. They were at my door in 20 minutes. No extra fees, just pure efficiency. They saved me thousands."' },
    { initials: 'EL', name: 'Elena Rodriguez', role: 'Property Manager', bg: 'bg-primary', text: '"The gold standard. Installation was surgical. Professional, clean — the energetic efficiency of the crew is unmatched."' },
    { initials: 'DK', name: 'David Kessler', role: 'Business Owner', bg: 'bg-white/20', text: '"Transparent pricing. No hidden bullshit. Just real experts doing real work. My go-to for all commercial properties now."' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative bg-emerald-950 pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {provider.image_url && (
            <img src={provider.image_url} alt="" className="w-full h-full object-cover grayscale" />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/60 to-emerald-950/20" />
        <div className="max-w-screen-2xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-12">
            <div className="flex-1">
              <div className="inline-flex items-center bg-lime-400 text-emerald-950 px-4 py-1 rounded-full mb-6">
                <span className="material-symbols-outlined text-[18px] mr-2" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                <span className="text-label-bold font-label-bold uppercase">VERIFIED PROVIDER</span>
              </div>
              <h1 className="font-display-xl text-display-xl text-white tracking-tighter mb-4">
                {provider.business_name.toUpperCase()}
              </h1>
              <p className="font-headline-md text-headline-md text-lime-400 max-w-2xl">
                {provider.category.toUpperCase()} · {provider.location}
              </p>
            </div>
            <div className="flex flex-col items-end gap-6">
              {provider.rating > 0 && (
                <div className="text-right">
                  <div className="text-white opacity-60 text-label-bold">RATING</div>
                  <div className="flex items-center text-lime-400">
                    <span className="text-headline-lg font-headline-lg mr-2">{provider.rating}</span>
                    <div className="flex text-2xl">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${i < stars ? 1 : 0}` }}>star</span>
                      ))}
                    </div>
                    <span className="text-emerald-100/40 text-sm ml-2">({provider.review_count})</span>
                  </div>
                </div>
              )}
              <Link
                href={`/booking?provider=${provider.id}`}
                className="bg-lime-400 text-emerald-950 px-10 py-5 rounded-full font-black uppercase tracking-widest hover:bg-white transition-all active:scale-95 inline-block text-center"
              >
                BOOK NOW
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento */}
      <section className="py-16 px-6 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-8 rounded-lg border border-emerald-950/10 flex flex-col justify-between h-48">
            <span className="material-symbols-outlined text-primary text-4xl">speed</span>
            <div>
              <div className="text-headline-md font-headline-md text-primary">15 MIN</div>
              <div className="text-label-bold font-label-bold text-outline uppercase">Avg Response Time</div>
            </div>
          </div>
          <div className="bg-primary text-white p-8 rounded-lg flex flex-col justify-between h-48">
            <span className="material-symbols-outlined text-lime-400 text-4xl">handyman</span>
            <div>
              <div className="text-headline-md font-headline-md">1.2K+</div>
              <div className="text-label-bold font-label-bold uppercase">Projects Completed</div>
            </div>
          </div>
          <div className="bg-white p-8 rounded-lg border border-emerald-950/10 flex flex-col justify-between h-48 md:col-span-2">
            <span className="material-symbols-outlined text-primary text-4xl">workspace_premium</span>
            <div>
              <div className="text-headline-md font-headline-md text-primary">LICENSED &amp; INSURED</div>
              <div className="text-label-bold font-label-bold text-outline uppercase">Master Certified</div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-12 px-6 max-w-screen-2xl mx-auto">
        <h2 className="font-headline-lg text-headline-lg mb-6 uppercase">ABOUT</h2>
        <p className="text-body-lg font-body-lg text-on-surface-variant max-w-3xl">{provider.description}</p>
      </section>

      {/* Services & Pricing */}
      {provider.services?.length > 0 && (
        <section className="py-16 bg-surface-container-low px-6">
          <div className="max-w-screen-2xl mx-auto">
            <h2 className="font-headline-lg text-headline-lg mb-12 uppercase tracking-tighter">
              PRECISION SERVICES &amp; <span className="text-primary">FLAT-RATE PRICING</span>
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {provider.services.map(s => (
                <div key={s.id} className="group bg-white p-10 rounded-lg flex items-center justify-between border-2 border-transparent hover:border-primary transition-all">
                  <div>
                    <h3 className="font-headline-md text-headline-md mb-2">{s.name}</h3>
                    <p className="text-body-lg font-body-lg text-outline max-w-md">{s.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-6">
                    <div className="text-label-bold text-primary mb-1">{s.price_type || 'STARTING AT'}</div>
                    <div className="text-headline-lg font-headline-lg">${s.price}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="py-16 bg-emerald-950 px-6 text-white">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 items-start">
            <div className="lg:sticky lg:top-32">
              <h2 className="font-display-xl text-display-xl tracking-tighter mb-8 leading-none">
                VOICES FROM <br /><span className="text-lime-400 italic">THE FLOW.</span>
              </h2>
              <p className="text-emerald-100/60 text-body-lg mb-12">We restore peace of mind daily.</p>
              <div className="p-8 bg-white/5 rounded-lg border border-white/10">
                <div className="text-headline-lg font-headline-lg text-lime-400 mb-2">98%</div>
                <div className="text-label-bold uppercase tracking-widest text-emerald-100">CLIENT RETENTION RATE</div>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-12">
              {reviews.map((r, i) => (
                <div key={i} className="border-b border-white/10 pb-12">
                  <div className="flex gap-1 text-lime-400 mb-6">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    ))}
                  </div>
                  <blockquote className="font-headline-md text-headline-md mb-8 italic">{r.text}</blockquote>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full ${r.bg} flex items-center justify-center text-emerald-950 font-black`}>{r.initials}</div>
                    <div>
                      <div className="text-label-bold">{r.name}</div>
                      <div className="text-emerald-100/40 text-sm">{r.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <h2 className="font-display-xl text-display-xl mb-8 tracking-tighter">
          READY? <br /><span className="text-primary italic">START TODAY.</span>
        </h2>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link href={`/booking?provider=${provider.id}`} className="bg-primary text-white px-12 py-6 rounded-full font-bold text-xl uppercase tracking-widest hover:bg-emerald-800 transition-all">
            BOOK NOW
          </Link>
          <Link href="/search?category=plumbing" className="border-4 border-emerald-950 text-emerald-950 px-12 py-6 rounded-full font-bold text-xl uppercase tracking-widest hover:bg-emerald-950 hover:text-white transition-all">
            BROWSE MORE
          </Link>
        </div>
      </section>
    </div>
  );
}