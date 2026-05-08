import Link from 'next/link';

export default function BookProvider({ params }) {
  return (
    <div className="flex-grow">
      

<section className="max-w-screen-2xl mx-auto px-6 mb-12">
<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
<div>
<span className="text-primary font-label-bold text-label-bold uppercase tracking-widest mb-4 block">Booking Journey</span>
<h1 className="font-display-xl text-display-xl max-w-3xl">SECURE YOUR PROFESSIONAL.</h1>
</div>
<div className="flex gap-2">
<div className="h-1.5 w-12 bg-primary rounded-full"></div>
<div className="h-1.5 w-12 bg-primary-container rounded-full"></div>
<div className="h-1.5 w-12 bg-surface-container-highest rounded-full"></div>
</div>
</div>
</section>

<section className="max-w-screen-2xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12">

<div className="lg:col-span-8 space-y-20">

<div className="space-y-8">
<div className="flex items-center gap-4">
<span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">01</span>
<h2 className="font-headline-lg text-headline-lg">SCHEDULE.</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">

<div className="bg-white border border-outline-variant p-8 rounded-lg">
<div className="flex justify-between items-center mb-6">
<span className="font-label-bold text-label-bold uppercase">October 2024</span>
<div className="flex gap-2">
<span className="material-symbols-outlined cursor-pointer hover:text-primary" data-icon="chevron_left">chevron_left</span>
<span className="material-symbols-outlined cursor-pointer hover:text-primary" data-icon="chevron_right">chevron_right</span>
</div>
</div>
<div className="grid grid-cols-7 gap-2 text-center">
<span className="text-[10px] font-bold text-outline uppercase">Mo</span>
<span className="text-[10px] font-bold text-outline uppercase">Tu</span>
<span className="text-[10px] font-bold text-outline uppercase">We</span>
<span className="text-[10px] font-bold text-outline uppercase">Th</span>
<span className="text-[10px] font-bold text-outline uppercase">Fr</span>
<span className="text-[10px] font-bold text-outline uppercase">Sa</span>
<span className="text-[10px] font-bold text-outline uppercase">Su</span>

<div className="py-3 hover:bg-surface-container rounded-md cursor-pointer font-bold">12</div>
<div className="py-3 hover:bg-surface-container rounded-md cursor-pointer font-bold">13</div>
<div className="py-3 bg-primary text-white rounded-md cursor-pointer font-bold">14</div>
<div className="py-3 hover:bg-surface-container rounded-md cursor-pointer font-bold">15</div>
<div className="py-3 hover:bg-surface-container rounded-md cursor-pointer font-bold">16</div>
<div className="py-3 hover:bg-surface-container rounded-md cursor-pointer font-bold">17</div>
<div className="py-3 hover:bg-surface-container rounded-md cursor-pointer font-bold">18</div>
</div>
</div>

<div className="space-y-4">
<span className="font-label-bold text-label-bold uppercase text-outline">Available Windows</span>
<div className="grid grid-cols-2 gap-4">
<button className="border-2 border-primary text-primary py-4 px-6 rounded-lg font-bold hover:bg-primary hover:text-white transition-all">09:00 AM</button>
<button className="border border-outline-variant text-on-surface py-4 px-6 rounded-lg font-bold hover:border-primary transition-all">11:30 AM</button>
<button className="border border-outline-variant text-on-surface py-4 px-6 rounded-lg font-bold hover:border-primary transition-all">02:00 PM</button>
<button className="border border-outline-variant text-on-surface py-4 px-6 rounded-lg font-bold hover:border-primary transition-all">04:30 PM</button>
</div>
</div>
</div>
</div>

<div className="space-y-8">
<div className="flex items-center gap-4">
<span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">02</span>
<h2 className="font-headline-lg text-headline-lg">PROJECT SCOPE.</h2>
</div>
<div className="space-y-6">
<div className="group">
<label className="block font-label-bold text-label-bold uppercase text-outline mb-2 group-focus-within:text-primary transition-colors">Service Description</label>
<textarea className="w-full bg-white border border-outline-variant rounded-lg p-6 font-body-md focus:ring-0 focus:border-primary transition-all outline-none" placeholder="Explain what you need fixed or built..." rows="4"></textarea>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<label className="block font-label-bold text-label-bold uppercase text-outline mb-2">Estimated Duration</label>
<select className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:ring-0 focus:border-primary outline-none">
<option>Quick Fix (1-2 Hours)</option>
<option>Half Day (4 Hours)</option>
<option>Full Day (8 Hours)</option>
<option>Multi-Day Project</option>
</select>
</div>
<div className="flex flex-col justify-end">
<label className="flex items-center gap-3 cursor-pointer p-4 border border-outline-variant rounded-lg hover:bg-surface-container transition-colors">
<input className="w-6 h-6 rounded border-outline-variant text-primary focus:ring-0" type="checkbox"/>
<span className="font-bold text-on-surface uppercase text-sm">Materials Needed</span>
</label>
</div>
</div>
</div>
</div>

<div className="space-y-8">
<div className="flex items-center gap-4">
<span className="bg-emerald-950 text-lime-400 w-12 h-12 flex items-center justify-center rounded-full font-black text-xl italic">03</span>
<h2 className="font-headline-lg text-headline-lg">COORDINATES.</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div className="space-y-6">
<input className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none" placeholder="FULL NAME" type="text"/>
<input className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none" placeholder="EMAIL ADDRESS" type="email"/>
<input className="w-full bg-white border border-outline-variant rounded-lg p-4 font-body-md focus:border-primary outline-none" placeholder="PHONE NUMBER" type="tel"/>
</div>
<div className="relative min-h-[250px] rounded-lg overflow-hidden border border-outline-variant">
<div className="absolute inset-0 bg-cover bg-center" data-alt="A detailed aerial satellite map view of an urban residential neighborhood with sharp street outlines and green spaces. The map reflects a professional navigation interface style with high-contrast lines and clear topographical markers. The aesthetic is modern and data-driven, emphasizing precision and geographical accuracy for service location tagging." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/ADBb0uieEUKbGEzXK3ZlE4QWnR3BK8F3p2ONVt8kLJt-FsaI58knvgEI0swhtSwHBd4m5X_USteXBOilHoY7M2Gzh2PVs2n1cE2oGrBV8FiM_pBjsukEeyoO9Wi4oGK1pJTvAYq3dpAZRit3fagBzzYYRqg0MXotWX7GUjWnHdecgsK9Hdej-gdg3pO6rI8S7GJ4krxxHLLcEsLacitwahVDURPXh-Yf_p3JUvznyN8q632udaOAeVCB6Yr6G5ZAEuB-IoQJHxxf5E1-ag')" }}></div>
<div className="absolute inset-0 bg-black/10 flex items-center justify-center">
<div className="bg-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
<span className="material-symbols-outlined text-primary" data-icon="location_on">location_on</span>
<span className="font-bold uppercase text-xs">Confirm Location</span>
</div>
</div>
</div>
</div>
</div>
</div>

<div className="lg:col-span-4">
<div className="sticky top-28 space-y-6">
<div className="bg-emerald-950 text-white rounded-lg p-8 space-y-8 border-t-8 border-lime-400">
<div className="flex justify-between items-start">
<div>
<h3 className="font-headline-md text-headline-md text-lime-400">SUMMARY.</h3>
<p className="text-emerald-100/60 uppercase text-xs tracking-widest font-bold">Premium Tier Service</p>
</div>
<span className="material-symbols-outlined text-lime-400 text-3xl" data-icon="receipt_long">receipt_long</span>
</div>
<div className="space-y-4 border-y border-emerald-900 py-6">
<div className="flex justify-between text-sm">
<span className="text-emerald-100/40 uppercase font-bold">Pro Specialist</span>
<span className="font-bold">Marco 'The Bolt' Rossi</span>
</div>
<div className="flex justify-between text-sm">
<span className="text-emerald-100/40 uppercase font-bold">Date</span>
<span className="font-bold">14 OCT, 2024</span>
</div>
<div className="flex justify-between text-sm">
<span className="text-emerald-100/40 uppercase font-bold">Time Window</span>
<span className="font-bold">09:00 - 11:00 AM</span>
</div>
</div>
<div className="space-y-2">
<div className="flex justify-between items-end">
<span className="text-emerald-100/40 uppercase font-bold text-xs">Total Estimate</span>
<span className="text-4xl font-black text-lime-400 italic">$185.00</span>
</div>
<p className="text-[10px] text-emerald-100/30 uppercase leading-relaxed">Price includes platform fee and initial call-out. Final quote provided on-site for custom materials.</p>
</div>
<Link href="/provider/dashboard" className="w-full bg-lime-400 text-emerald-950 py-5 rounded-full font-black uppercase tracking-tighter text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-lime-400/10 inline-block text-center">
              CONFIRM BOOKING
            </Link>
</div>

<div className="bg-surface-container-high p-6 rounded-lg flex items-center gap-4">
<div className="bg-white p-3 rounded-full text-primary">
<span className="material-symbols-outlined" data-icon="verified_user" data-weight="fill">verified_user</span>
</div>
<div>
<p className="font-label-bold text-label-bold uppercase text-[12px]">LocalPro Guarantee</p>
<p className="text-on-surface-variant text-xs font-medium">All jobs are insured up to $50,000 for peace of mind.</p>
</div>
</div>
</div>
</div>
</section>

<section className="mt-32 w-full h-[500px] overflow-hidden relative">
<div className="absolute inset-0 bg-cover bg-center" data-alt="A high-intensity, close-up lifestyle photograph of a professional technician's hands working with precision tools in a modern architectural setting. The lighting is dramatic and high-contrast, featuring deep shadows and bright metallic highlights. The image captures the energetic efficiency of the brand with a focus on craftsmanship and technical mastery. The background is a clean, minimalist workspace." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida/ADBb0ujtkaa9JzBT1P0oMRwy5PO76U8-tjQlc_4rLKruA7fIFSyogVdcn4-c3alhQP8qedfKvvd2-CgAdaIivQKzXl4U26xT7ksdperx7XPpx5HsfyJ-pyNcFQwHkpbIYr9zucVUBUFR0vnpjbycORtCr1thcadDSQo-3DfA3NreEzDCmkCBJcoZJttWHBQuqT-LC0jFK-bG8mar4TYTsOujuXyXQNRfGyVHYKdQ2kdebhCSr9a-zhMNharb83Lz_Xp2MQmtupcduS8vZQ')" }}></div>
<div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
</section>

    </div>
  );
}