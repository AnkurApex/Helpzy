export const SERVICE_CATEGORIES = [
  { slug: 'electrician', label: 'Electrician', icon: 'electric_bolt' },
  { slug: 'plumber', label: 'Plumber', icon: 'plumbing' },
  { slug: 'cleaner', label: 'Cleaner', icon: 'cleaning_services' },
  { slug: 'ac-repair', label: 'AC Repair', icon: 'ac_unit' },
  { slug: 'painter', label: 'Painter', icon: 'format_paint' },
  { slug: 'carpenter', label: 'Carpenter', icon: 'handyman' },
  { slug: 'pest-control', label: 'Pest Control', icon: 'pest_control' },
  { slug: 'appliance-repair', label: 'Appliance Repair', icon: 'home_repair_service' },
];

export const CATEGORY_LABELS = SERVICE_CATEGORIES.map((item) => item.label);

export const PAYMENT_METHODS = ['cash', 'upi', 'phonepe', 'paytm', 'gpay'];

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
