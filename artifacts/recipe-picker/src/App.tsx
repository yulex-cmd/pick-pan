import { useMemo, useState } from 'react';
import {
  ArrowUpRight,
  Carrot,
  ChefHat,
  CircleCheck,
  Clock3,
  CookingPot,
  Flame,
  Leaf,
  NotebookPen,
  Plus,
  Refrigerator,
  RotateCcw,
  Search,
  Soup,
  Sprout,
  Utensils,
  Wheat,
  X,
} from 'lucide-react';
import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

type Mode = 'fuzzy' | 'strict' | 'survival';

type Option = {
  id: string;
  label: string;
  note: string;
  icon: typeof Carrot;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  time: string;
  tags: string[];
  required: string[];
  accent: string;
  icon: typeof Soup;
};

const queryClient = new QueryClient();

const ingredientGroups: { title: string; eyebrow: string; options: Option[] }[] = [
  {
    title: 'Fresh things',
    eyebrow: 'Produce drawer',
    options: [
      { id: 'tomato', label: 'Tomatoes', note: 'juicy + bright', icon: Carrot },
      { id: 'onion', label: 'Onion', note: 'the good base', icon: Sprout },
      { id: 'greens', label: 'Leafy greens', note: 'spinach, kale, chard', icon: Leaf },
      { id: 'mushroom', label: 'Mushrooms', note: 'deep + savory', icon: Sprout },
      { id: 'potato', label: 'Potatoes', note: 'always dependable', icon: Carrot },
      { id: 'chicken', label: 'Chicken', note: 'thighs or breast', icon: Utensils },
    ],
  },
  {
    title: 'Pantry friends',
    eyebrow: 'Shelf stable',
    options: [
      { id: 'beans', label: 'Beans', note: 'canned counts', icon: Wheat },
      { id: 'pasta', label: 'Pasta', note: 'any shape works', icon: Wheat },
      { id: 'rice', label: 'Rice', note: 'white, brown, or sticky', icon: Wheat },
      { id: 'eggs', label: 'Eggs', note: 'the great fixer', icon: Soup },
      { id: 'cheese', label: 'Cheese', note: 'something melty', icon: Soup },
      { id: 'bread', label: 'Bread', note: 'even slightly stale', icon: Wheat },
    ],
  },
];

const stapleOptions: Option[] = [
  { id: 'olive-oil', label: 'Olive oil', note: 'for the hot pan', icon: CookingPot },
  { id: 'butter', label: 'Butter', note: 'a little richness', icon: CookingPot },
  { id: 'soy-sauce', label: 'Soy sauce', note: 'instant depth', icon: Soup },
  { id: 'garlic', label: 'Garlic', note: 'one clove is plenty', icon: Sprout },
  { id: 'lemon', label: 'Lemon', note: 'a bright finish', icon: Leaf },
  { id: 'spices', label: 'Dried spices', note: 'open the cupboard', icon: Flame },
];

const toolOptions: Option[] = [
  { id: 'stovetop', label: 'Stovetop', note: 'one warm burner', icon: Flame },
  { id: 'oven', label: 'Oven', note: 'let it do the work', icon: CookingPot },
  { id: 'blender', label: 'Blender', note: 'smooth or chunky', icon: Soup },
  { id: 'one-pan', label: 'One pan only', note: 'less washing up', icon: CookingPot },
];

const recipes: Recipe[] = [
  {
    id: 'pantry-tomato-pasta',
    title: 'Golden tomato pasta',
    description: 'A glossy pan sauce with sweet tomatoes, garlic, and whatever cheese is waiting nearby.',
    time: '25 min',
    tags: ['one pan', 'comforting'],
    required: ['tomato', 'pasta'],
    accent: '#e06b3f',
    icon: Utensils,
  },
  {
    id: 'greens-egg-toast',
    title: 'Greens and eggs on toast',
    description: 'Wilt the greens, tuck in a soft egg, and let toast catch all the good bits.',
    time: '12 min',
    tags: ['quick', 'breakfast for dinner'],
    required: ['greens', 'eggs', 'bread'],
    accent: '#6e9541',
    icon: Leaf,
  },
  {
    id: 'crispy-potato-beans',
    title: 'Crispy potato bean skillet',
    description: 'The sturdy little dinner: golden potatoes, creamy beans, and a sharp lemon finish.',
    time: '30 min',
    tags: ['budget-friendly', 'filling'],
    required: ['potato', 'beans'],
    accent: '#c69032',
    icon: CookingPot,
  },
  {
    id: 'soy-mushroom-rice',
    title: 'Soy mushroom rice bowl',
    description: 'Earthy mushrooms over rice with a glossy soy pan sauce and a fried egg if you have one.',
    time: '20 min',
    tags: ['savory', 'weeknight'],
    required: ['mushroom', 'rice'],
    accent: '#8f6e4b',
    icon: Soup,
  },
  {
    id: 'lemon-chicken-pan',
    title: 'Lemon chicken pan',
    description: 'Sizzle chicken until golden, then make a bright, buttery pan sauce in the same skillet.',
    time: '35 min',
    tags: ['high-protein', 'bright'],
    required: ['chicken', 'lemon'],
    accent: '#dcae35',
    icon: Utensils,
  },
  {
    id: 'cheesy-bean-toast',
    title: 'Cheesy beans on toast',
    description: 'Warm beans with spices, pile them onto toast, and finish with a blanket of melted cheese.',
    time: '15 min',
    tags: ['five ingredients', 'cozy'],
    required: ['beans', 'bread', 'cheese'],
    accent: '#cf7850',
    icon: NotebookPen,
  },
];

const modes: { id: Mode; label: string; description: string; mark: string }[] = [
  { id: 'fuzzy', label: 'Fuzzy match', description: 'A little creative, a lot of options.', mark: '01' },
  { id: 'strict', label: 'Strict match', description: 'Only show ideas that fit your picks.', mark: '02' },
  { id: 'survival', label: 'Survival mode', description: 'Simple, forgiving, and filling.', mark: '03' },
];

function OptionButton({
  option,
  selected,
  onToggle,
}: {
  option: Option;
  selected: boolean;
  onToggle: () => void;
}) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      className="selection-card group flex min-h-[76px] w-full items-center gap-3 rounded-2xl border border-[#ded6c8] bg-[#fbf8f1] px-3 py-3 text-left"
      data-selected={selected}
      data-testid={`button-option-${option.id}`}
      onClick={onToggle}
      aria-pressed={selected}
    >
      <span className="option-mark flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e9da] text-[#195d44] transition-colors">
        <Icon size={18} strokeWidth={1.8} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-semibold tracking-[-0.01em] text-[#33291f]">{option.label}</span>
        <span className="mt-0.5 block text-[11px] leading-4 text-[#857867]">{option.note}</span>
      </span>
      <span className={`flex size-5 items-center justify-center rounded-full border ${selected ? 'border-[#195d44] bg-[#195d44] text-[#fbf8f1]' : 'border-[#cfc5b5] text-transparent'}`}>
        <CircleCheck size={14} strokeWidth={2.4} />
      </span>
    </button>
  );
}

function SectionHeading({ number, eyebrow, title, children }: { number: string; eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex gap-3">
        <span className="font-mono text-[11px] font-medium tracking-[0.12em] text-[#e06b3f]">{number}</span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8c7c68]">{eyebrow}</p>
          <h2 className="mt-1 font-serif text-[22px] font-semibold leading-tight text-[#33291f]">{title}</h2>
        </div>
      </div>
      {children}
    </div>
  );
}

function RecipeCard({ recipe, index, selectedCount }: { recipe: Recipe; index: number; selectedCount: number }) {
  const Icon = recipe.icon;
  const searchTerm = `${recipe.title} easy recipe`;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerm)}`;
  const matchCount = recipe.required.filter((item) => selectedCount > 0).length;
  return (
    <article className="result-card overflow-hidden rounded-[22px] border border-[#ded6c8] bg-[#fffdf8] shadow-[0_12px_28px_rgba(79,58,35,0.06)]" style={{ animationDelay: `${index * 70}ms` }} data-testid={`card-recipe-${recipe.id}`}>
      <div className="h-1.5" style={{ backgroundColor: recipe.accent }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4eddf] text-[#195d44]">
              <Icon size={21} strokeWidth={1.7} />
            </span>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b7965]">idea {String(index + 1).padStart(2, '0')}</span>
                {selectedCount > 0 && <span className="rounded-full bg-[#edf3df] px-2 py-0.5 text-[10px] font-semibold text-[#195d44]">{matchCount} pantry match{matchCount === 1 ? '' : 'es'}</span>}
              </div>
              <h3 className="font-serif text-[24px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#33291f]">{recipe.title}</h3>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f7f0e4] px-2.5 py-1 text-[11px] font-medium text-[#796b5a]">
            <Clock3 size={13} />
            {recipe.time}
          </span>
        </div>
        <p className="mt-4 max-w-[50ch] text-[13px] leading-6 text-[#6f6253]">{recipe.description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6d9] pt-4">
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map((tag) => <span key={tag} className="rounded-full border border-[#e4dacb] px-2.5 py-1 text-[10px] font-medium text-[#887967]">{tag}</span>)}
          </div>
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-1.5 rounded-full bg-[#195d44] px-3.5 py-2 text-[12px] font-semibold text-[#fbf8f1] transition-transform hover:-translate-y-0.5"
            data-testid={`link-youtube-${recipe.id}`}
          >
            Watch on YouTube
            <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>
      </div>
    </article>
  );
}

function Home() {
  const [mode, setMode] = useState<Mode>('fuzzy');
  const [selected, setSelected] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [generated, setGenerated] = useState(false);
  const [resultVersion, setResultVersion] = useState(0);

  const allOptions = useMemo(() => [...ingredientGroups.flatMap((group) => group.options), ...stapleOptions, ...toolOptions], []);
  const selectedLabels = selected.map((id) => allOptions.find((option) => option.id === id)?.label).filter(Boolean) as string[];
  const displayedRecipes = useMemo(() => {
    const chosen = selected;
    if (mode === 'survival') return recipes.filter((recipe) => recipe.required.some((item) => chosen.includes(item)) || ['crispy-potato-beans', 'cheesy-bean-toast', 'greens-egg-toast'].includes(recipe.id)).slice(0, 3);
    if (mode === 'strict' && chosen.length) {
      const strictMatches = recipes.filter((recipe) => recipe.required.every((item) => chosen.includes(item) || ['olive-oil', 'butter', 'garlic', 'lemon', 'spices'].includes(item)));
      return (strictMatches.length ? strictMatches : recipes.filter((recipe) => recipe.required.some((item) => chosen.includes(item)))).slice(0, 3);
    }
    if (chosen.length) {
      return [...recipes].sort((a, b) => {
        const aScore = a.required.filter((item) => chosen.includes(item)).length;
        const bScore = b.required.filter((item) => chosen.includes(item)).length;
        return bScore - aScore;
      }).slice(0, 3);
    }
    return recipes.slice(0, 3);
  }, [mode, selected]);

  const toggleOption = (id: string) => {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    setGenerated(false);
  };

  const addCustom = () => {
    const value = customInput.trim().replace(/\s+/g, ' ');
    if (!value || customItems.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setCustomItems((current) => [...current, value]);
    setCustomInput('');
    setGenerated(false);
  };

  const removeCustom = (value: string) => setCustomItems((current) => current.filter((item) => item !== value));

  const generate = () => {
    setGenerated(true);
    setResultVersion((value) => value + 1);
    window.setTimeout(() => document.getElementById('ideas')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40);
  };

  const clearAll = () => {
    setSelected([]);
    setCustomItems([]);
    setCustomInput('');
    setGenerated(false);
  };

  return (
    <main className="app-shell min-h-[100dvh] overflow-x-hidden text-[#33291f]">
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-5 pb-8 pt-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5">
          <span className="flex size-10 rotate-[-5deg] items-center justify-center rounded-[14px] bg-[#195d44] text-[#fbf8f1] shadow-[3px_4px_0_#d4b883]">
            <ChefHat size={21} strokeWidth={1.7} />
          </span>
          <div>
            <p className="font-serif text-[18px] font-semibold leading-none tracking-[-0.02em]">pinch &amp; pan</p>
            <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8c7c68]">a tiny recipe notebook</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-[11px] font-medium text-[#847462] sm:flex">
          <span className="size-1.5 rounded-full bg-[#e06b3f]" />
          <span>English kitchen edition</span>
        </div>
      </header>

      <section className="mx-auto max-w-[1240px] px-5 pb-10 sm:px-8 lg:px-12 lg:pb-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_300px] lg:items-end">
          <div className="animate-rise">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9cfbe] bg-[#fbf7ee] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.13em] text-[#195d44]">
              <Search size={12} />
              dinner, improvised
            </p>
            <h1 className="hand-rule max-w-[740px] pb-4 font-serif text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[.88] tracking-[-0.065em] text-[#33291f]">
              What can we<br /><span className="text-[#195d44]">make from this?</span>
            </h1>
            <p className="mt-7 max-w-[560px] text-[15px] leading-7 text-[#766856]">
              Point to what is already in your kitchen. We will turn a few odds and ends into a good place to start.
            </p>
          </div>
          <aside className="animate-float hidden rounded-[22px] border border-[#ded6c8] bg-[#eee6d7] p-5 lg:block" style={{ animationDelay: '120ms' }}>
            <div className="mb-5 flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8a7966]">the house note</span>
              <NotebookPen size={17} className="text-[#e06b3f]" />
            </div>
            <p className="font-serif text-[21px] font-semibold leading-[1.18] text-[#195d44]">“Good cooking is mostly noticing what you already have.”</p>
            <div className="mt-5 h-px w-12 bg-[#d4b883]" />
            <p className="mt-3 text-[11px] leading-5 text-[#887765]">Choose freely. There is no wrong answer, only a next step.</p>
          </aside>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:gap-12 lg:px-12">
        <section aria-label="Choose ingredients" className="space-y-9">
          <div>
            <SectionHeading number="01" eyebrow="Start with what is around" title="Pick a few ingredients">
              <span className="rounded-full bg-[#195d44] px-3 py-1.5 font-mono text-[10px] text-[#fbf8f1]" data-testid="text-selection-count">{selected.length} selected</span>
            </SectionHeading>
            <div className="space-y-6">
              {ingredientGroups.map((group) => (
                <div key={group.title}>
                  <div className="mb-3 flex items-baseline gap-2">
                    <h3 className="font-serif text-[16px] font-semibold text-[#554636]">{group.title}</h3>
                    <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a39380]">{group.eyebrow}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {group.options.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} onToggle={() => toggleOption(option.id)} />)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionHeading number="02" eyebrow="The quiet essentials" title="Staples on hand" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {stapleOptions.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} onToggle={() => toggleOption(option.id)} />)}
            </div>
          </div>

          <div>
            <SectionHeading number="03" eyebrow="How are we cooking?" title="Kitchen tools" />
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              {toolOptions.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} onToggle={() => toggleOption(option.id)} />)}
            </div>
          </div>

          <div>
            <SectionHeading number="04" eyebrow="Anything else counts" title="Custom" />
            <div className="rounded-[22px] border border-dashed border-[#cfc3b1] bg-[#f9f4eb] p-4 sm:p-5">
              <div className="flex gap-2">
                <input
                  value={customInput}
                  onChange={(event) => setCustomInput(event.target.value)}
                  onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom(); } }}
                  placeholder="e.g. half a jar of pesto"
                  className="min-w-0 flex-1 rounded-xl border border-[#ded4c4] bg-[#fffdf8] px-3.5 py-3 text-[13px] text-[#33291f] placeholder:text-[#a99b89]"
                  data-testid="input-custom-ingredient"
                  aria-label="Add a custom ingredient"
                />
                <button type="button" onClick={addCustom} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e06b3f] text-[#fffaf2] transition-transform hover:-translate-y-0.5" data-testid="button-add-custom" aria-label="Add custom ingredient">
                  <Plus size={19} />
                </button>
              </div>
              {customItems.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {customItems.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efd7] px-3 py-1.5 text-[11px] font-medium text-[#195d44]" data-testid={`tag-custom-${item.replace(/\s+/g, '-')}`}>
                      {item}
                      <button type="button" onClick={() => removeCustom(item)} className="rounded-full text-[#588063] hover:text-[#195d44]" data-testid={`button-remove-custom-${item.replace(/\s+/g, '-')}`} aria-label={`Remove ${item}`}>
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-[11px] text-[#9b8c79]">Add leftovers, a craving, or something you want to use up.</p>
              )}
            </div>
          </div>
        </section>

        <aside className="lg:sticky lg:top-5 lg:self-start">
          <div className="rounded-[26px] border border-[#d8cebe] bg-[#efe7d9] p-4 shadow-[0_18px_40px_rgba(79,58,35,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#8d7b67]">choose a mood</p>
                <h2 className="mt-1 font-serif text-[22px] font-semibold text-[#33291f]">How loose should we be?</h2>
              </div>
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#f8f2e8] text-[#e06b3f]"><Sprout size={18} /></span>
            </div>
            <div className="space-y-2">
              {modes.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { setMode(item.id); setGenerated(false); }}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${mode === item.id ? 'border-[#195d44] bg-[#f7fbef] shadow-[0_5px_14px_rgba(25,93,68,0.08)]' : 'border-[#ddd2c2] bg-[#f7f1e7] hover:border-[#b8aa97]'}`}
                  data-testid={`button-mode-${item.id}`}
                  aria-pressed={mode === item.id}
                >
                  <span className={`font-mono text-[10px] ${mode === item.id ? 'text-[#e06b3f]' : 'text-[#9a8a77]'}`}>{item.mark}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-semibold text-[#42372b]">{item.label}</span>
                    <span className="mt-0.5 block text-[11px] text-[#8a7966]">{item.description}</span>
                  </span>
                  <span className={`size-2 rounded-full ${mode === item.id ? 'bg-[#195d44]' : 'bg-[#d1c5b4]'}`} />
                </button>
              ))}
            </div>
            <div className="my-5 h-px bg-[#d9cebd]" />
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8d7b67]">your basket</p>
                <p className="mt-1 text-[12px] text-[#756654]" data-testid="text-basket-summary">
                  {selected.length || customItems.length ? `${selected.length + customItems.length} little clues ready` : 'Nothing selected yet'}
                </p>
              </div>
              {(selected.length > 0 || customItems.length > 0) && (
                <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9b6950] hover:text-[#e06b3f]" data-testid="button-clear-all">
                  <RotateCcw size={13} />
                  Clear
                </button>
              )}
            </div>
            <button type="button" onClick={generate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#195d44] px-4 py-3.5 text-[13px] font-semibold text-[#fbf8f1] shadow-[0_7px_0_#0f422f] transition-all hover:-translate-y-0.5 hover:shadow-[0_9px_0_#0f422f] active:translate-y-0.5 active:shadow-[0_4px_0_#0f422f]" data-testid="button-generate">
              <Search size={17} />
              Find my next meal
              <ArrowUpRight size={16} />
            </button>
            <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[#978774]">ideas, not instructions</p>
          </div>

          <div className="mt-6 rounded-[22px] border border-[#ded6c8] bg-[#fbf8f1] p-5">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f5dfd1] text-[#e06b3f]"><Refrigerator size={17} /></span>
              <div>
                <p className="font-serif text-[17px] font-semibold text-[#42372b]">A small reminder</p>
                <p className="mt-1.5 text-[12px] leading-5 text-[#857564]">Taste as you go. Swap freely. The best recipe is the one that gets dinner on the table.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <section id="ideas" className="border-t border-[#ded6c8] bg-[#f1eadf] px-5 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1240px]">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#e06b3f]">05 / the good part</p>
              <h2 className="mt-2 font-serif text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[.94] tracking-[-0.05em] text-[#33291f]">{generated ? 'Here are a few places to start.' : 'Your next meal is hiding in here.'}</h2>
              <p className="mt-3 max-w-[560px] text-[13px] leading-6 text-[#796a59]">
                {generated ? `Built with ${mode === 'fuzzy' ? 'a generous' : mode === 'strict' ? 'a precise' : 'a resourceful'} eye${selectedLabels.length ? ` around ${selectedLabels.slice(0, 3).join(', ').toLowerCase()}${selectedLabels.length > 3 ? ' and friends' : ''}` : ''}.` : 'You can browse a few friendly starting points now, or choose ingredients above and make the list yours.'}
              </p>
            </div>
            {!generated && <span className="hidden rounded-full border border-[#d9cebd] bg-[#f9f4eb] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8e7d69] sm:inline-flex">waiting for your picks</span>}
          </div>
          <div key={resultVersion} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {displayedRecipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} selectedCount={selected.length + customItems.length} />)}
          </div>
          <div className="mt-9 flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-[0.13em] text-[#a08f7b]">
            <span className="h-px w-8 bg-[#d4c7b6]" />
            <span>keep tinkering</span>
            <span className="h-px w-8 bg-[#d4c7b6]" />
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-[11px] text-[#8d7b67] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12">
        <p className="font-serif text-[16px] font-semibold text-[#195d44]">pinch &amp; pan</p>
        <p>Made for the “what do I have?” moment.</p>
      </footer>
    </main>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;