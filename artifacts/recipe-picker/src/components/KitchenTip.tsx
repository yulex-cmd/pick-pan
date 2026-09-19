import { useEffect, useState } from 'react';
import { NotebookPen } from 'lucide-react';

const tips = [
  { title: 'Dry vegetables before stir-frying.', detail: 'Pat washed vegetables dry so they sear instead of steaming in the pan.' },
  { title: 'Save a little pasta water.', detail: 'Before draining, reserve a cup of the starchy water. Add a splash to help your sauce coat the pasta.' },
  { title: 'Keep your cutting board steady.', detail: 'Place a damp kitchen towel underneath to stop the board from sliding while you chop.' },
  { title: 'Give mushrooms room to brown.', detail: 'Cook them in a single layer, in batches if needed. A crowded pan traps moisture.' },
  { title: 'Add garlic after the onions.', detail: 'Garlic browns quickly. Add it once the onions soften, and stir to keep it from burning.' },
  { title: 'Prep before you turn on the heat.', detail: 'Chop ingredients and measure sauces first, especially for quick stir-fries.' },
  { title: 'Freeze herbs for another meal.', detail: 'Chop spare herbs into an ice cube tray with water, freeze, then transfer to a freezer bag for soups and stews.' },
];

function localDay() {
  const now = new Date();
  return Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000);
}

export default function KitchenTip() {
  const [day, setDay] = useState(localDay);
  useEffect(() => {
    const timer = window.setInterval(() => setDay(localDay()), 60_000);
    const refresh = () => setDay(localDay());
    document.addEventListener('visibilitychange', refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', refresh);
    };
  }, []);
  const tip = tips[day % tips.length];
  return (
    <aside aria-label="Daily kitchen tip" className="animate-float hidden rounded-[22px] border border-[#ded6c8] bg-[#eee6d7] p-5 lg:block">
      <div className="mb-5 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a7966]">Kitchen Tip</span>
        <NotebookPen size={17} className="text-[#e06b3f]" />
      </div>
      <p className="font-serif text-[21px] font-semibold leading-[1.18] text-[#195d44]">{tip.title}</p>
      <div className="mt-5 h-px w-12 bg-[#d4b883]" />
      <p className="mt-3 text-[11px] leading-5 text-[#887765]">{tip.detail}</p>
      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.12em] text-[#8a7966]">A little kitchen know-how, every day</p>
    </aside>
  );
}