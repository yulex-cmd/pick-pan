import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRecipeBook } from './useRecipeBook';
import KitchenTip from './components/KitchenTip';
import HealthyVegetableIllustration from './components/HealthyVegetableIllustration';
import DishIllustration from './components/DishIllustration';
import {
  allRecipes,
  categories,
  defaultPantry,
  expandOwnedIngredients,
  healthTagClass,
  ingredientById,
  ingredients,
  isKeyMatchIngredient,
  quickPicks,
  weightedMatchScore,
  type Ingredient,
  type Recipe,
  type RecipeAudience,
  type RecipeMethod,
} from './kitchenData';
import { useLocation } from 'wouter';
import {
  ArrowUpRight,
  ChefHat,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock3,
  CookingPot,
  Flame,
  HeartPulse,
  Leaf,
  Minus,
  NotebookPen,
  Plus,
  Refrigerator,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Timer,
  TimerReset,
  X,
  type LucideIcon,
} from 'lucide-react';

type Mode = 'fuzzy' | 'strict' | 'survival';
type EntryMode = 'have' | 'avoid';
type TimeFilter = 'all' | 'quick' | 'slow';
type MethodFilter = 'all' | RecipeMethod;
type AudienceFilter = 'all' | RecipeAudience;
type HealthGoal = 'none' | 'lower-calorie' | 'fat-loss' | 'muscle-gain' | 'balanced';

type Option = {
  id: string;
  label: string;
  note: string;
  icon: LucideIcon;
};

type MatchInfo = {
  status: 'complete' | 'partial' | 'stretch' | 'blocked';
  score: number;
  missing: string[];
  missingKey: boolean;
  usedUrgent: boolean;
  substituteHints: string[];
};

const toolOptions: Option[] = [
  { id: 'stovetop', label: 'Stovetop', note: 'one warm burner', icon: Flame },
  { id: 'steamer', label: 'Steamer', note: 'soft + gentle heat', icon: CookingPot },
  { id: 'oven', label: 'Oven', note: 'let it do the work', icon: CookingPot },
  { id: 'air-fryer', label: 'Air fryer', note: 'crisp with less oil', icon: Sparkles },
  { id: 'blender', label: 'Blender', note: 'smooth or chunky', icon: CookingPot },
  { id: 'one-pan', label: 'One pan only', note: 'less washing up', icon: CookingPot },
];

const modes: { id: Mode; label: string; description: string; mark: string }[] = [
  { id: 'fuzzy', label: 'Fuzzy match', description: 'Creative ideas with flexible swaps.', mark: '01' },
  { id: 'strict', label: 'Strict match', description: 'Only ideas that fit your basket.', mark: '02' },
  { id: 'survival', label: 'Survival mode', description: 'Simple, forgiving, and filling.', mark: '03' },
];

const healthGoals: { id: HealthGoal; label: string; description: string }[] = [
  { id: 'none', label: 'No preference', description: 'Let the ingredient match lead.' },
  { id: 'lower-calorie', label: 'Lower calorie', description: 'Prefer Low-Calorie dishes from the sheet.' },
  { id: 'fat-loss', label: 'Fat-loss friendly', description: 'Use the sheet Fat-Loss Friendly tags.' },
  { id: 'muscle-gain', label: 'Muscle-gain friendly', description: 'Use the sheet Muscle-Gain Friendly tags.' },
  { id: 'balanced', label: 'Balanced meal', description: 'Prefer Balanced Choice dishes from the sheet.' },
];

const healthGoalTag: Record<Exclude<HealthGoal, 'none'>, string> = {
  'lower-calorie': 'Low-Calorie',
  'fat-loss': 'Fat-Loss Friendly',
  'muscle-gain': 'Muscle-Gain Friendly',
  'balanced': 'Balanced Choice',
};

function recipeMatchesHealthGoal(recipe: Recipe, goal: HealthGoal) {
  if (goal === 'none') return true;
  return recipe.healthTags.includes(healthGoalTag[goal]);
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

function OptionButton({ option, selected, avoided, urgent, onToggle, onUrgent }: {
  option: { id: string; label: string; note: string; icon: LucideIcon };
  selected: boolean;
  avoided?: boolean;
  urgent?: boolean;
  onToggle: () => void;
  onUrgent?: () => void;
}) {
  const Icon = option.icon;
  return (
    <div className={`selection-card relative flex h-[92px] w-full items-center gap-3 rounded-2xl border bg-[#fbf8f1] px-3 py-3 text-left ${avoided ? 'border-[#d97868] bg-[#fff4ef]' : 'border-[#ded6c8]'}`} data-selected={selected} data-avoided={avoided}>
      <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={onToggle} aria-pressed={selected} data-testid={`button-option-${option.id}`}>
        <span className={`option-mark flex size-10 shrink-0 items-center justify-center rounded-xl text-[#195d44] transition-colors ${avoided ? 'bg-[#f6dcd4] text-[#b44d3b]' : 'bg-[#f1e9da]'}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[14px] font-semibold tracking-[-0.01em] text-[#33291f]">{option.label}</span>
          <span className="mt-0.5 block truncate text-[11px] leading-4 text-[#857867]">{option.note}</span>
        </span>
        <span className={`flex size-5 items-center justify-center rounded-full border ${selected ? 'border-[#195d44] bg-[#195d44] text-[#fbf8f1]' : avoided ? 'border-[#c45a48] bg-[#c45a48] text-[#fffaf2]' : 'border-[#cfc5b5] text-transparent'}`}>
          {avoided ? <X size={13} strokeWidth={2.4} /> : <CircleCheck size={14} strokeWidth={2.4} />}
        </span>
      </button>
      {selected && onUrgent && (
        <button type="button" onClick={onUrgent} className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${urgent ? 'bg-[#f4d5c7] text-[#c45840]' : 'bg-[#f5f0e6] text-[#a4937f] hover:bg-[#f4e5d8] hover:text-[#c45840]'}`} title={urgent ? 'Marked to use first' : 'Mark to use first'} aria-label={urgent ? `Unmark ${option.label} as urgent` : `Mark ${option.label} to use first`}>
          <HeartPulse size={15} />
        </button>
      )}
    </div>
  );
}

function FilterButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-full border px-3 py-2 text-[11px] font-semibold transition-colors ${active ? 'border-[#195d44] bg-[#195d44] text-[#fbf8f1]' : 'border-[#ded3c4] bg-[#fbf8f1] text-[#746452] hover:border-[#a99b88]'}`}>{children}</button>;
}

function RecipeCard({ recipe, index, match, onOpen, confirmed, onConfirm }: { recipe: Recipe; index: number; match: MatchInfo; onOpen: () => void; confirmed: boolean; onConfirm: () => void }) {
  const Icon = recipe.icon;
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${recipe.title} easy recipe`)}`;
  const statusLabel = match.status === 'complete' ? '100% match' : match.status === 'partial' ? `${match.score}% match · ${match.missing.length} to pick up` : match.status === 'blocked' ? 'Not for you today' : `${match.score}% match`;
  const calorieLabel = `~${recipe.calories} kcal / serving`;
  return (
    <article className="result-card flex h-full flex-col overflow-hidden rounded-[22px] border border-[#ded6c8] bg-[#fffdf8] shadow-[0_12px_28px_rgba(79,58,35,0.06)]" style={{ animationDelay: `${index * 70}ms` }} data-testid={`card-recipe-${recipe.id}`}>
      <div className="h-1.5 shrink-0" style={{ backgroundColor: recipe.accent }} />
      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4eddf] text-[#195d44]"><Icon size={21} strokeWidth={1.7} /></span>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b7965]">idea {String(index + 1).padStart(2, '0')}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${match.status === 'complete' ? 'bg-[#e8f0da] text-[#195d44]' : match.status === 'blocked' ? 'bg-[#f7dfd7] text-[#ad4b3c]' : 'bg-[#f7edda] text-[#92702a]'}`}>{statusLabel}</span>
              <span className="ml-auto flex shrink-0 items-center gap-1.5 rounded-full bg-[#f7f0e4] px-2.5 py-1 text-[11px] font-medium text-[#796b5a]"><Clock3 size={13} />{recipe.time} min</span>
            </div>
            <h3 className="font-serif text-[22px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#33291f] sm:text-[24px]">{recipe.title}</h3>
          </div>
        </div>
        <p className="mt-4 line-clamp-2 min-h-12 text-[13px] leading-6 text-[#6f6253]">{recipe.description}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-[#e7ddce] bg-[#fbf8f1] px-3 py-2.5"><span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[#998875]">Calories</span><span className="mt-1 block text-[11px] font-semibold text-[#5f5041]">{calorieLabel}</span><span className="mt-0.5 block text-[10px] text-[#998875]">Demo estimate · 1 serving</span></div>
          <div className="rounded-xl border border-[#e7ddce] bg-[#fbf8f1] px-3 py-2.5"><span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[#998875]">Ingredient match</span><span className="mt-1 block text-[11px] font-semibold text-[#195d44]">{statusLabel}</span></div>
        </div>
        <div className="mt-3 flex min-h-8 flex-wrap items-center gap-1.5 overflow-hidden"><span className="mr-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#998875]">Health tags</span>{recipe.healthTags.map((tag) => <span key={tag} className={healthTagClass(tag)}>{tag}</span>)}</div>
        {match.status !== 'blocked' ? (
          <div className={`mt-4 line-clamp-2 min-h-[42px] rounded-xl px-3 py-2.5 text-[11px] leading-5 ${match.missing.length > 0 ? 'bg-[#fbf2e1] text-[#806640]' : 'bg-[#edf4e4] text-[#416847]'}`}><span className="font-semibold">Missing ingredients:</span> {match.missing.length > 0 ? match.missing.join(', ') : 'none — ready to cook'}{match.substituteHints.length > 0 && <span className="mt-1 block text-[#9b7c50]">Swap tip: {match.substituteHints[0]}</span>}</div>
        ) : (
          <div className="mt-4 flex min-h-[42px] items-center gap-2 rounded-xl bg-[#fff0eb] px-3 py-2.5 text-[11px] text-[#a65242]"><CircleAlert size={14} /> This recipe uses something you marked to avoid.</div>
        )}
        <div className="mt-auto flex flex-col gap-3 border-t border-[#eee6d9] pt-4">
          <div className="flex min-h-[26px] flex-wrap gap-1.5">{recipe.tags.map((tag) => <span key={tag} className="rounded-full border border-[#e4dacb] px-2.5 py-1 text-[10px] font-medium text-[#887967]">{tag}</span>)}</div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onConfirm} disabled={confirmed} aria-pressed={confirmed} data-testid={`confirm-${recipe.id}`} className="inline-flex items-center gap-1.5 rounded-full bg-[#e06b3f] px-3.5 py-2 text-[12px] font-semibold text-white disabled:bg-[#e8f0da] disabled:text-[#195d44]">
              <Check size={14} />{confirmed ? 'Confirmed' : 'Confirm choice'}
            </button>
            <button type="button" onClick={onOpen} className="inline-flex items-center gap-1.5 rounded-full border border-[#cdbfae] px-3.5 py-2 text-[12px] font-semibold text-[#5b4b3b] transition-colors hover:border-[#195d44] hover:text-[#195d44]">Cook this <ChevronDown size={14} /></button>
            <a href={youtubeUrl} target="_blank" rel="noreferrer" className="group inline-flex items-center gap-1.5 rounded-full bg-[#195d44] px-3.5 py-2 text-[12px] font-semibold text-[#fbf8f1] transition-transform hover:-translate-y-0.5" data-testid={`link-youtube-${recipe.id}`}>YouTube <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" /></a>
          </div>
        </div>
      </div>
    </article>
  );
}

function RecipeDetail({ recipe, match, servings, onServings, wakeLockActive, onWakeLock, timerSeconds, timerLabel, onStartTimer, onClose }: {
  recipe: Recipe;
  match: MatchInfo;
  servings: number;
  onServings: (value: number) => void;
  wakeLockActive: boolean;
  onWakeLock: () => void;
  timerSeconds: number;
  timerLabel: string;
  onStartTimer: (label: string, minutes: number) => void;
  onClose: () => void;
}) {
  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(`${recipe.title} cooking tutorial`)}`;
  const amount = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(1).replace('.5', '½');
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#2c241d]/45 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-label={`${recipe.title} cooking details`}>
      <div className="max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-[#d9cdbb] bg-[#fffaf1] shadow-[0_25px_80px_rgba(44,36,29,0.24)] sm:rounded-[28px]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#ece2d3] bg-[#fffaf1]/95 px-5 py-4 backdrop-blur sm:px-7">
          <div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#e06b3f]">kitchen mode</p><h2 className="mt-1 font-serif text-[27px] font-semibold leading-none text-[#33291f]">{recipe.title}</h2></div>
          <button type="button" onClick={onClose} className="flex size-10 items-center justify-center rounded-full bg-[#f2e9dc] text-[#6f5e4c] hover:bg-[#e7dccd]" aria-label="Close recipe details"><X size={18} /></button>
        </div>
        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <p className="text-[13px] leading-6 text-[#756654]">{recipe.description}</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-[#e7ddce] bg-[#fbf8f1] px-3 py-2.5"><span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[#998875]">Calories</span><span className="mt-1 block text-[12px] font-semibold text-[#5f5041]">~{recipe.calories} kcal / serving</span></div>
              <div className="rounded-xl border border-[#e7ddce] bg-[#fbf8f1] px-3 py-2.5"><span className="block font-mono text-[9px] uppercase tracking-[0.12em] text-[#998875]">Health tags</span><div className="mt-1.5 flex flex-wrap gap-1">{recipe.healthTags.map((tag) => <span key={tag} className={healthTagClass(tag)}>{tag}</span>)}</div></div>
            </div>
            <div className="mt-5 rounded-2xl border border-[#e0d5c4] bg-[#f5ede0] p-4">
              <div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f7d69]">servings</p><p className="mt-1 text-[12px] text-[#786856]">Scale every amount as you cook.</p></div><div className="flex items-center gap-1 rounded-full bg-[#fffaf1] p-1"><button type="button" onClick={() => onServings(Math.max(1, servings - 1))} className="flex size-8 items-center justify-center rounded-full text-[#6f5e4c] hover:bg-[#f0e5d6]" aria-label="Decrease servings"><Minus size={14} /></button><span className="min-w-7 text-center text-[13px] font-semibold text-[#33291f]">{servings}</span><button type="button" onClick={() => onServings(Math.min(8, servings + 1))} className="flex size-8 items-center justify-center rounded-full text-[#6f5e4c] hover:bg-[#f0e5d6]" aria-label="Increase servings"><Plus size={14} /></button></div></div>
              <div className="mt-3 flex gap-2">{[1, 2, 4].map((value) => <button key={value} type="button" onClick={() => onServings(value)} className={`flex-1 rounded-lg py-2 text-[11px] font-semibold ${servings === value ? 'bg-[#195d44] text-[#fffaf2]' : 'bg-[#fffaf1] text-[#806e5b] hover:bg-[#efe4d6]'}`}>{value} {value === 1 ? 'person' : 'people'}</button>)}</div>
            </div>
            <div className="mt-4 rounded-2xl border border-[#e0d5c4] bg-[#fbf8f1] p-4">
              <div className="mb-3 flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f7d69]">ingredients</p><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${match.status === 'complete' ? 'bg-[#e8f0da] text-[#195d44]' : 'bg-[#f8ead6] text-[#99713c]'}`}>{match.status === 'complete' ? 'ready to cook' : `add ${match.missing.length}`}</span></div>
              <ul className="space-y-2">{recipe.ingredients.map((item) => <li key={item.id} className="flex items-center justify-between gap-3 text-[12px] text-[#5e5042]"><span>{item.label}</span><span className="font-mono text-[11px] text-[#8d7a66]">{item.unit === 'as needed' ? 'as needed' : `${amount(item.quantity * servings / recipe.baseServings)} ${item.unit}`}</span></li>)}</ul>
              {match.missing.length > 0 && <p className="mt-3 border-t border-[#eee5d8] pt-3 text-[11px] leading-5 text-[#99713c]">Missing items can often be swapped. Check the note on the recipe card before you shop.</p>}
            </div>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#d7e2cb] bg-[#edf4e4] p-4"><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center rounded-xl bg-[#dbe9cb] text-[#195d44]"><ShieldCheck size={17} /></span><div><p className="text-[12px] font-semibold text-[#315d43]">Keep screen awake</p><p className="mt-0.5 text-[10px] text-[#66816d]">{wakeLockActive ? 'Screen lock is active.' : 'Helpful when your hands are messy.'}</p></div></div><button type="button" onClick={onWakeLock} className={`rounded-full px-3 py-2 text-[11px] font-semibold ${wakeLockActive ? 'bg-[#195d44] text-[#fffaf1]' : 'bg-[#fffaf1] text-[#35674b]'}`}>{wakeLockActive ? 'On' : 'Turn on'}</button></div>
            <a href={youtubeUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#e06b3f] px-4 py-3.5 text-[13px] font-semibold text-[#fffaf1] shadow-[0_5px_0_#b85231] transition-transform hover:-translate-y-0.5">Watch this recipe on YouTube <ArrowUpRight size={16} /></a>
          </div>
          <div>
            <div className="mb-4 flex items-center justify-between"><p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8f7d69]">step by step</p><span className="flex items-center gap-1.5 text-[11px] text-[#8b7862]"><Clock3 size={13} /> about {recipe.time} min</span></div>
            <div className="space-y-3">{recipe.steps.map((step, index) => <div key={step.title} className="rounded-2xl border border-[#e3d9ca] bg-[#fbf8f1] p-4"><div className="flex gap-3"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#195d44] font-mono text-[11px] text-[#fffaf1]">{String(index + 1).padStart(2, '0')}</span><div className="min-w-0 flex-1"><h3 className="text-[13px] font-semibold text-[#44372b]">{step.title}</h3><p className="mt-1.5 text-[12px] leading-5 text-[#756654]">{step.instruction}</p>{step.minutes && <button type="button" onClick={() => onStartTimer(step.title, step.minutes ?? 0)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f4dfd3] px-3 py-2 text-[11px] font-semibold text-[#b3533c] hover:bg-[#f0d2c3]"><Timer size={14} /> Start {step.minutes}-min timer</button>}</div></div></div>)}</div>
            {timerLabel && <div className="sticky bottom-3 mt-4 flex items-center justify-between gap-3 rounded-2xl bg-[#195d44] px-4 py-3 text-[#fffaf1] shadow-[0_12px_30px_rgba(25,93,68,0.22)]"><div className="flex items-center gap-2"><TimerReset size={16} /><div><p className="text-[11px] font-semibold">{timerLabel}</p><p className="font-mono text-[10px] text-[#cfe0c9]">{timerSeconds > 0 ? 'counting down' : 'done — nice work'}</p></div></div><span className="font-mono text-[18px] font-medium">{Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}</span></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RecipePickerApp() {
  const [location, navigate] = useLocation();
  const isPicker = location === '/';
  const isIngredients = location === '/ingredients';
  const isResults = location === '/results';
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location]);
  const { savedIds, storageError, confirm, remove } = useRecipeBook();
  const [bookNotice, setBookNotice] = useState('');
  const savedRecipes = savedIds.flatMap((id) => {
    const recipe = allRecipes.find((item) => item.id === id);
    return recipe ? [recipe] : [];
  });
  const openBook = () => {
    navigate('/recipes');
  };
  const [mode, setMode] = useState<Mode>('fuzzy');
  const [healthGoal, setHealthGoal] = useState<HealthGoal>('none');
  const [entryMode, setEntryMode] = useState<EntryMode>('have');
  const [selected, setSelected] = useState<string[]>([]);
  const [avoided, setAvoided] = useState<string[]>([]);
  const [urgent, setUrgent] = useState<string[]>([]);
  const [customInput, setCustomInput] = useState('');
  const [customItems, setCustomItems] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const generated = isResults;
  const [clearFridge, setClearFridge] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [servings, setServings] = useState(2);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerLabel, setTimerLabel] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all');
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>('all');
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null);

  const allOptions = useMemo(() => ingredients.map((item) => ({ id: item.id, label: item.label, note: item.note, icon: item.icon })), []);
  const selectedLabels = selected.map((id) => ingredientById.get(id)?.label).filter(Boolean) as string[];
  const selectedHealthGoal = healthGoals.find((goal) => goal.id === healthGoal) ?? healthGoals[0];
  const customResolvedIds = useMemo(() => customItems.flatMap((item) => {
    const query = item.trim().toLowerCase();
    return ingredients.filter((ingredient) => [ingredient.label, ...ingredient.aliases].some((alias) => query === alias.toLowerCase())).map((ingredient) => ingredient.id);
  }), [customItems]);
  const ownedIds = useMemo(() => expandOwnedIngredients([...selected, ...customResolvedIds, ...defaultPantry].filter((id) => !avoided.includes(id))), [customResolvedIds, selected, avoided]);

  useEffect(() => {
    if (timerSeconds <= 0) return undefined;
    const timer = window.setInterval(() => setTimerSeconds((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [timerSeconds]);

  useEffect(() => () => { void wakeLockRef.current?.release(); }, []);

  const normalizedSearch = searchInput.trim().toLowerCase();
  const matchesSearch = (ingredient: Ingredient) => !normalizedSearch || [ingredient.label, ingredient.note, ...ingredient.aliases].some((value) => value.toLowerCase().includes(normalizedSearch));
  const filteredCategories = categories.map((category) => ({ ...category, options: category.ids.map((id) => ingredientById.get(id)).filter((item): item is Ingredient => Boolean(item && matchesSearch(item))) })).filter((category) => category.options.length > 0);

  const toggleIngredient = (id: string, targetMode: EntryMode = entryMode) => {
    if (targetMode === 'avoid') {
      setAvoided((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
      setSelected((current) => current.filter((item) => item !== id));
    } else {
      setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
      setAvoided((current) => current.filter((item) => item !== id));
    }
  };

  const toggleUrgent = (id: string) => setUrgent((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const addCustom = () => {
    const value = customInput.trim().replace(/\s+/g, ' ');
    if (!value || customItems.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setCustomItems((current) => [...current, value]);
    setCustomInput('');
  };

  const removeCustom = (value: string) => setCustomItems((current) => current.filter((item) => item !== value));

  const getMatch = (recipe: Recipe): MatchInfo => {
    const blocked = [...recipe.required, ...recipe.optional, ...recipe.ingredients.map((item) => item.id)].some((id) => avoided.includes(id));
    const missingIds = recipe.required.filter((id) => !ownedIds.has(id));
    const missing = missingIds.map((id) => ingredientById.get(id)?.label ?? id);
    const missingKey = missingIds.some((id) => isKeyMatchIngredient(id));
    const substituteHints = recipe.substitutes.filter((item) => missing.some((label) => label.toLowerCase() === item.missing.toLowerCase())).map((item) => `${item.missing} → ${item.replacement}`);
    const score = weightedMatchScore(recipe.required, ownedIds);
    const status = blocked ? 'blocked' : missingIds.length === 0 ? 'complete' : missingKey || missingIds.length > 2 ? 'stretch' : 'partial';
    return { status, score, missing, missingKey, usedUrgent: recipe.required.some((id) => urgent.includes(id)), substituteHints };
  };

  const displayedRecipes = useMemo(() => {
    const priority = { complete: 0, partial: 1, stretch: 2, blocked: 3 };
    const chosen = new Set([...selected.filter((id) => ingredientById.has(id)), ...customResolvedIds]);
    const goalScore = (recipe: Recipe) => {
      const tags = recipe.healthTags;
      if (healthGoal === 'lower-calorie') return (tags.includes('Low-Calorie') ? 5 : 0) + (recipe.calories <= 400 ? 2 : 0) + (tags.includes('High-Calorie Alert') ? -3 : 0);
      if (healthGoal === 'fat-loss') return (tags.includes('Fat-Loss Friendly') ? 5 : 0) + (tags.includes('Low-Calorie') ? 2 : 0) + (tags.includes('High-Calorie Alert') ? -3 : 0);
      if (healthGoal === 'muscle-gain') return (tags.includes('Muscle-Gain Friendly') ? 5 : 0) + (recipe.calories >= 500 ? 1 : 0);
      if (healthGoal === 'balanced') return (tags.includes('Balanced Choice') ? 5 : 0) + (tags.includes('High-Calorie Alert') ? -2 : 0);
      return 0;
    };
    return allRecipes
      .filter((recipe) => chosen.size > 0 && recipe.required.some((id) => chosen.has(id)))
      .filter((recipe) => timeFilter === 'all' || (timeFilter === 'quick' ? recipe.time <= 20 : recipe.time > 20))
      .filter((recipe) => methodFilter === 'all' || recipe.method === methodFilter)
      .filter((recipe) => audienceFilter === 'all' || recipe.audience.includes(audienceFilter))
      .filter((recipe) => recipeMatchesHealthGoal(recipe, healthGoal))
      .filter((recipe) => getMatch(recipe).status !== 'blocked')
      .filter((recipe) => mode !== 'strict' || getMatch(recipe).missing.length === 0)
      .sort((a, b) => {
        const aMatch = getMatch(a);
        const bMatch = getMatch(b);
        if (priority[aMatch.status] !== priority[bMatch.status]) return priority[aMatch.status] - priority[bMatch.status];
        if (aMatch.missingKey !== bMatch.missingKey) return aMatch.missingKey ? 1 : -1;
        if (bMatch.score !== aMatch.score) return bMatch.score - aMatch.score;
         if (goalScore(b) !== goalScore(a)) return goalScore(b) - goalScore(a);
        if (clearFridge && aMatch.usedUrgent !== bMatch.usedUrgent) return aMatch.usedUrgent ? -1 : 1;
        if (mode === 'survival' && a.time !== b.time) return a.time - b.time;
        return priority[aMatch.status] - priority[bMatch.status] || bMatch.score - aMatch.score;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [audienceFilter, avoided, clearFridge, healthGoal, methodFilter, mode, ownedIds, timeFilter, urgent, selected, customResolvedIds]);

  const clearAll = () => {
    setSelected([]);
    setAvoided([]);
    setUrgent([]);
    setCustomItems([]);
    setCustomInput('');
  };

  const generate = () => {
    navigate('/results');
  };

  const toggleWakeLock = async () => {
    if (wakeLockActive) {
      await wakeLockRef.current?.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
      return;
    }
    const navigatorWithWakeLock = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<{ release: () => Promise<void> }> } };
    if (!navigatorWithWakeLock.wakeLock) return;
    try {
      wakeLockRef.current = await navigatorWithWakeLock.wakeLock.request('screen');
      setWakeLockActive(true);
    } catch {
      setWakeLockActive(false);
    }
  };

  const startTimer = (label: string, minutes: number) => {
    setTimerLabel(label);
    setTimerSeconds(minutes * 60);
  };

  return (
    <main className="app-shell min-h-[100dvh] overflow-x-hidden pb-20 text-[#33291f]">
      {isPicker && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#ded6c8] bg-[#fffaf1] p-3 shadow-lg lg:hidden">
        <button type="button" onClick={generate} className="w-full rounded-xl bg-[#195d44] px-4 py-3 font-semibold text-white" data-testid="button-generate-mobile">
          Find my next meal · {selectedLabels.length} ingredients
        </button>
      </div>}
      <header className="mx-auto flex max-w-[1240px] items-center justify-between px-5 pb-8 pt-6 sm:px-8 lg:px-12">
        <div className="flex items-center gap-2.5"><span className="flex size-10 rotate-[-5deg] items-center justify-center rounded-[14px] bg-[#195d44] text-[#fbf8f1] shadow-[3px_4px_0_#d4b883]"><ChefHat size={21} strokeWidth={1.7} /></span><div><p className="font-serif text-[18px] font-semibold leading-none tracking-[-0.02em]">pinch &amp; pan</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#8c7c68]">a tiny recipe notebook</p></div></div>
        <button type="button" onClick={openBook} className="flex shrink-0 items-center gap-2 rounded-xl border border-[#195d44] px-3 py-2 text-xs font-semibold text-[#195d44]" aria-label={`Open my recipe book, ${savedRecipes.length} dishes`}>
          <NotebookPen size={16} /><span>My recipes ({savedRecipes.length})</span>
        </button>
      </header>

      {!isPicker && <nav aria-label="Recipe navigation" className="mx-auto flex max-w-[1240px] flex-wrap gap-3 px-5 pb-6 sm:px-8 lg:px-12">
        <button type="button" onClick={() => navigate(isIngredients ? '/' : '/ingredients')} className="rounded-xl border border-[#195d44] px-4 py-3 text-sm font-semibold text-[#195d44]">{isIngredients ? '← Done · Back to home' : '← Edit ingredients'}</button>
        {!isResults && <button type="button" onClick={generate} className="rounded-xl bg-[#195d44] px-4 py-3 text-sm font-semibold text-white">View meal results</button>}
      </nav>}
      {isPicker && <>
      <section className="mx-auto max-w-[1240px] px-5 pb-10 sm:px-8 lg:px-12 lg:pb-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="animate-rise order-2 lg:order-1">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#d9cfbe] bg-[#eef4df] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.13em] text-[#195d44]"><Leaf size={12} /> fresh &amp; healthy</p>
            <h1 className="hand-rule max-w-[740px] pb-4 font-serif text-[clamp(3.2rem,8vw,6.8rem)] font-semibold leading-[.88] tracking-[-0.065em] text-[#33291f]">What can we<br /><span className="text-[#195d44]">cook today?</span></h1>
            <p className="mt-7 max-w-[560px] text-[15px] leading-7 text-[#766856]">Turn your healthy, fresh ingredients into a nourishing meal. Tell us what you have, what you want to use first, and what to avoid. We will craft a sensible next meal.</p>
             <div className="mt-5 border-l-2 border-[#d4b883] pl-4">
               <p className="font-serif text-[18px] font-semibold text-[#195d44]">Cook more with what you already have.</p>
               <p className="mt-1 text-[11px] text-[#887765]">Waste less. Make healthier everyday choices.</p>
             </div>
            <div className="mt-8 hidden lg:block max-w-[400px]">
              <KitchenTip />
            </div>
          </div>
          <div className="relative animate-float order-1 lg:order-2 flex justify-center lg:justify-end">
            <HealthyVegetableIllustration className="w-full max-w-[460px] drop-shadow-2xl" />
          </div>
          <div className="order-3 lg:hidden mt-4">
            <KitchenTip />
          </div>
        </div>
      </section>
      </>}
      {isPicker && (
      <div className="mx-auto max-w-[1240px] px-5 pb-8 sm:px-8 lg:px-12">
        <section aria-labelledby="on-hand-title health-goal-title" className="overflow-hidden rounded-[22px] border border-[#d7e2cb] bg-[#fffaf1]">
          <div className="grid lg:grid-cols-2 lg:items-stretch">
            <div className="flex h-full flex-col bg-[#edf4e4] p-5 sm:p-7">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#52694e]">Your kitchen basket</p>
              <h2 id="on-hand-title" className="mt-2 font-serif text-3xl font-semibold text-[#195d44]">Already on hand</h2>
              <p className="mt-3 text-sm leading-6 text-[#52694e]">Basic seasonings are included automatically. Add your ingredients and tell us what to avoid on the selection page.</p>
              <p className="mt-3 text-xs leading-5 text-[#52694e]">Seasonings: {[...defaultPantry].filter((id) => !avoided.includes(id)).map((id) => ingredientById.get(id)?.label).join(', ') || 'None — all marked Avoid'}</p>
              <div className="mt-5 rounded-xl bg-white/60 p-4">
                <p className="text-sm font-semibold text-[#195d44]">{selectedLabels.length} ingredients · {avoided.length} avoided</p>
                <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#52694e]">{selectedLabels.length ? `${selectedLabels.slice(0, 6).join(', ')}${selectedLabels.length > 6 ? ` + ${selectedLabels.length - 6} more` : ''}` : 'Your basket is ready for something fresh.'}</p>
              </div>
              <button type="button" onClick={() => navigate('/ingredients')} data-testid="button-choose-ingredients" className="mt-5 inline-flex min-h-11 items-center gap-2 self-start rounded-xl bg-[#195d44] px-5 py-3 text-sm font-semibold text-white hover:bg-[#124b36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#195d44]">{selectedLabels.length || avoided.length ? 'Edit ingredients' : 'Choose ingredients'} <ArrowUpRight size={17} /></button>
            </div>
            <div className="flex h-full flex-col border-t border-[#ded6c8] p-5 sm:p-6 lg:border-l lg:border-t-0">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#8c7c68]">A little direction</p>
                  <h2 id="health-goal-title" className="mt-1 font-serif text-[24px] font-semibold text-[#33291f]">What&apos;s your goal today?</h2>
                </div>
                <p className="text-[11px] text-[#8a7966]">Ingredients still come first.</p>
              </div>
              <div className="mt-4 grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {healthGoals.map((goal) => <button key={goal.id} type="button" onClick={() => setHealthGoal(goal.id)} aria-pressed={healthGoal === goal.id} className={`flex h-full min-h-[88px] flex-col rounded-2xl border px-3 py-3 text-left transition-all ${healthGoal === goal.id ? 'border-[#195d44] bg-[#edf4e4] shadow-[0_5px_14px_rgba(25,93,68,0.08)]' : 'border-[#e1d7c8] bg-[#fffdf8] hover:border-[#8eaf92]'}`}>
                  <span className="block text-[12px] font-semibold text-[#42372b]">{goal.label}</span>
                  <span className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#887765]">{goal.description}</span>
                </button>)}
              </div>
            </div>
          </div>
        </section>
      </div>
      )}
      {(isPicker || isIngredients) && <>
      <div className={`mx-auto max-w-[1240px] gap-8 px-5 pb-20 sm:px-8 lg:px-12 ${isIngredients ? 'block' : 'grid items-stretch lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:gap-12'}`}>
        {isPicker ? <div className="flex h-full min-h-0 flex-col">
          <div className="grid h-full grid-cols-2 grid-rows-2 items-stretch gap-3 sm:gap-5">
            {([
              { dish: 'tomato-egg-rice', title: 'Tomato egg rice', note: 'A comforting classic to aim for.' },
              { dish: 'vegetable-bowl', title: 'Crisp veggie bowl', note: 'Fresh & colorful assembly.' },
              { dish: 'stir-fry', title: 'Weeknight stir-fry', note: 'Hot pan, whatever is on hand.' },
              { dish: 'noodle-bowl', title: 'Garlic noodle bowl', note: 'A slurpable, savory finish.' },
            ] as const).map((item) => (
              <div key={item.dish} className="flex h-full min-h-0 flex-col items-center rounded-[22px] border border-[#e8dfce] bg-[#fffaf1] px-2 pb-4 pt-2 text-center sm:px-5 sm:pb-6">
                <div className="flex w-full max-w-[220px] flex-1 items-center -mb-4">
                  <DishIllustration dish={item.dish} />
                </div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#a39380] mb-1">Inspiration</p>
                <h3 className="font-serif text-[17px] font-semibold text-[#42372b]">{item.title}</h3>
                <p className="mt-1 min-h-8 text-[12px] leading-4 text-[#8a7966]">{item.note}</p>
              </div>
            ))}
          </div>
        </div> : <section id="ingredient-picker" tabIndex={-1} aria-label="Choose ingredients" className="space-y-9 outline-none">
          <h1 className="font-serif text-4xl font-semibold text-[#195d44]">Choose your ingredients</h1>
          <div>
            <SectionHeading number="01" eyebrow="Start with what is around" title="Build your kitchen basket"><span className="rounded-full bg-[#195d44] px-3 py-1.5 font-mono text-[10px] text-[#fbf8f1]">{selected.length} have · {avoided.length} avoid</span></SectionHeading>
            <div className="rounded-[22px] border border-[#ded6c8] bg-[#f9f4eb] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-serif text-[17px] font-semibold text-[#42372b]">What is in the kitchen?</p>
                  <p className="mt-1 text-[11px] text-[#8a7966]">Search by ingredient name — try <span className="font-mono text-[#195d44]">tomato</span>.</p>
                </div>
                 <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#9b8b78]">Mode set on home</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2.5" role="tablist" aria-label="Ingredient entry mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={entryMode === 'have'}
                  onClick={() => setEntryMode('have')}
                  className={`entry-mode-card flex min-h-[76px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ${entryMode === 'have' ? 'entry-mode-card-active-have' : 'border-[#d9cebd] bg-[#fffaf1] text-[#756654] hover:border-[#79a488]'}`}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${entryMode === 'have' ? 'bg-[#195d44] text-[#fffaf1]' : 'bg-[#edf3e4] text-[#548060]'}`}><Check size={19} strokeWidth={2.5} /></span>
                  <span className="min-w-0"><span className="block text-[14px] font-bold">I have</span><span className="mt-1 block text-[10px] leading-4 opacity-75">Add what is in your kitchen</span></span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={entryMode === 'avoid'}
                  onClick={() => setEntryMode('avoid')}
                  className={`entry-mode-card flex min-h-[76px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left ${entryMode === 'avoid' ? 'entry-mode-card-active-avoid' : 'border-[#d9cebd] bg-[#fffaf1] text-[#756654] hover:border-[#d28b7c]'}`}
                >
                  <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${entryMode === 'avoid' ? 'bg-[#b24f3e] text-[#fffaf1]' : 'bg-[#f8e8e1] text-[#b45a49]'}`}><ShieldAlert size={18} /></span>
                  <span className="min-w-0"><span className="block text-[14px] font-bold">I avoid</span><span className="mt-1 block text-[10px] leading-4 opacity-75">Exclude allergies or dislikes</span></span>
                </button>
              </div>
              <div className="mt-5 rounded-2xl border border-[#d7e2cb] bg-[#edf4e4] p-4" aria-label="Basic seasonings">
                <h3 className="font-serif text-lg font-semibold text-[#195d44]">Basic seasonings · already on hand</h3>
                <p className="mt-1 text-xs leading-5 text-[#52694e]">Salt, oil, soy sauce and vinegar count automatically — no need to select them. Choose your main ingredients below.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[...defaultPantry].map((id) => <button key={id} type="button" aria-pressed={!avoided.includes(id)} onClick={() => {
                    setAvoided((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
                  }} className={`flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${avoided.includes(id) ? 'border-[#c45a48] bg-[#fff0eb] text-[#a34d3c]' : 'border-[#a6ba94] bg-white text-[#195d44]'}`}>
                    {avoided.includes(id) ? <ShieldAlert size={15} /> : <Check size={15} />}
                    {ingredientById.get(id)?.label} · {avoided.includes(id) ? 'Avoid' : 'On hand'}
                  </button>)}
                </div>
                <p className="mt-2 text-xs leading-5 text-[#52694e]">Tap a seasoning to mark it “Avoid” if you cannot use it. Recipes containing it will be excluded. Tap again to restore it.</p>
              </div>
              <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#ded4c4] bg-[#fffdf8] px-3.5 py-3"><Search size={16} className="shrink-0 text-[#9c8b77]" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search tomato, garlic, rice..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#33291f] outline-none placeholder:text-[#aaa092]" aria-label="Search ingredients" /><span className="hidden rounded-md bg-[#f2e9dc] px-2 py-1 font-mono text-[9px] text-[#958471] sm:inline">⌘ K</span></label>
              <div className="mt-4"><div className="mb-2 flex items-center gap-2"><Sparkles size={14} className="text-[#e06b3f]" /><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e7d69]">popular picks</span></div><div className="flex gap-2 overflow-x-auto pb-1">{quickPicks.map((id) => { const item = ingredientById.get(id); if (!item) return null; const picked = selected.includes(id); return <button key={id} type="button" onClick={() => toggleIngredient(id)} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold ${picked ? 'border-[#195d44] bg-[#195d44] text-[#fffaf1]' : 'border-[#d9cebd] bg-[#fffaf1] text-[#695947] hover:border-[#195d44]'}`}>{item.label}</button>; })}</div></div>
            </div>
             <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2">{filteredCategories.length === 0 && <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#cfc3b1] p-10 text-center sm:col-span-2">
              <DishIllustration dish="tomato-egg-rice" className="w-full max-w-[160px] mb-4 opacity-75 grayscale-[0.2]" />
              <p className="font-serif text-lg font-semibold text-[#44372b]">No ingredient found yet.</p>
              <p className="mt-1 text-[13px] text-[#877564]">Try another name or add it in Custom below.</p>
            </div>}{filteredCategories.map((category) => <div key={category.title} className="flex h-full flex-col rounded-[22px] border border-[#e2d9ca] bg-[#fffaf1] p-4 sm:p-5"><div className="mb-4 flex items-start justify-between gap-3 border-b border-[#ece3d6] pb-3"><div><h3 className="font-serif text-[19px] font-semibold leading-tight text-[#44372b]">{category.title}</h3><span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.1em] text-[#a39380]">{category.eyebrow}</span></div><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#edf4e4] font-mono text-[10px] text-[#195d44]">{category.options.length}</span></div><div className="grid grid-cols-2 gap-2.5">{category.options.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} avoided={avoided.includes(option.id)} urgent={urgent.includes(option.id)} onToggle={() => toggleIngredient(option.id)} onUrgent={() => toggleUrgent(option.id)} />)}</div></div>)}</div>
          </div>

          <div><SectionHeading number="02" eyebrow="How are we cooking?" title="Kitchen tools" /><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{toolOptions.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} onToggle={() => toggleIngredient(option.id)} />)}</div></div>

          <div><SectionHeading number="03" eyebrow="Anything else counts" title="Custom" /><div className="rounded-[22px] border border-dashed border-[#cfc3b1] bg-[#f9f4eb] p-4 sm:p-5"><div className="flex gap-2"><input value={customInput} onChange={(event) => setCustomInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom(); } }} placeholder="e.g. half a jar of pesto, leftover salmon" className="min-w-0 flex-1 rounded-xl border border-[#ded4c4] bg-[#fffdf8] px-3.5 py-3 text-[13px] text-[#33291f] placeholder:text-[#a99b89]" data-testid="input-custom-ingredient" aria-label="Add a custom ingredient" /><button type="button" onClick={addCustom} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e06b3f] text-[#fffaf2] transition-transform hover:-translate-y-0.5" data-testid="button-add-custom" aria-label="Add custom ingredient"><Plus size={19} /></button></div>{customItems.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{customItems.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efd7] px-3 py-1.5 text-[11px] font-medium text-[#195d44]">{item}<button type="button" onClick={() => removeCustom(item)} className="rounded-full text-[#588063] hover:text-[#195d44]" aria-label={`Remove ${item}`}><X size={13} /></button></span>)}</div> : <p className="mt-3 text-[11px] text-[#9b8c79]">Add a leftover, a craving, or an ingredient that is not in the list.</p>}</div></div>
          <button type="button" onClick={() => navigate('/')} className="min-h-11 rounded-xl bg-[#195d44] px-5 py-3 text-sm font-semibold text-white">Done · Back to home</button>
        </section>}

        {isIngredients && <section aria-labelledby="ingredient-actions-title" className="mt-8 rounded-[26px] border border-[#d8cebe] bg-[#efe7d9] p-4 shadow-[0_18px_40px_rgba(79,58,35,0.06)] sm:p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#8d7b67]">your basket</p><h2 id="ingredient-actions-title" className="mt-1 font-serif text-[22px] font-semibold text-[#33291f]">Ready for the next meal?</h2></div>
                {(selected.length > 0 || avoided.length > 0 || customItems.length > 0) && <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9b6950] hover:text-[#e06b3f]"><RotateCcw size={13} /> Clear</button>}
              </div>
              <p className="mt-1 text-[12px] text-[#756654]">{selected.length || customItems.length ? `${selected.length + customItems.length} clues ready` : 'Nothing selected yet'}</p>
              {selected.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{selected.map((id) => <button key={id} type="button" onClick={() => toggleUrgent(id)} title={urgent.includes(id) ? 'Use first' : 'Mark to use first'} className={`rounded-full px-2.5 py-1.5 text-[10px] font-medium ${urgent.includes(id) ? 'bg-[#f4d5c7] text-[#b95741]' : 'bg-[#f8f0e4] text-[#776653]'}`}>{ingredientById.get(id)?.label}{urgent.includes(id) && ' · first'}</button>)}</div>}
              {avoided.length > 0 && <p className="mt-3 text-[10px] text-[#a65242]">Avoiding: {avoided.map((id) => ingredientById.get(id)?.label).join(', ')}</p>}
              <p className="mt-3 text-[11px] text-[#857564]"><HeartPulse size={13} className="mr-1 inline text-[#e06b3f]" />Tap a selected ingredient to mark it “first”; those recipes will rise to the top.</p>
            </div>
            <div className="w-full shrink-0 lg:max-w-[360px]">
              <label className="flex items-center justify-between rounded-xl border border-[#d9cebd] bg-[#f8f0e4] px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] font-semibold text-[#685846]"><Refrigerator size={14} className="text-[#e06b3f]" /> Clear the fridge first</span><input type="checkbox" checked={clearFridge} onChange={(event) => setClearFridge(event.target.checked)} className="toggle-check" /></label>
              <button type="button" onClick={generate} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#195d44] px-4 py-3.5 text-[13px] font-semibold text-[#fbf8f1] shadow-[0_7px_0_#0f422f] transition-all hover:-translate-y-0.5 hover:shadow-[0_9px_0_#0f422f] active:translate-y-0.5 active:shadow-[0_4px_0_#0f422f]" data-testid="button-generate"><Search size={17} /> Find my next meal <ArrowUpRight size={16} /></button>
              <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[#978774]">ideas, not instructions</p>
            </div>
          </div>
        </section>}

        {isPicker && <aside className="flex h-full flex-col lg:sticky lg:top-5">
          <div className="rounded-[26px] border border-[#d8cebe] bg-[#efe7d9] p-4 shadow-[0_18px_40px_rgba(79,58,35,0.06)] sm:p-5">
            <div className="mb-4 flex items-center justify-between"><div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#8d7b67]">your kitchen</p><h2 className="mt-1 font-serif text-[22px] font-semibold text-[#33291f]">What kind of help?</h2></div><span className="flex size-9 items-center justify-center rounded-xl bg-[#f8f2e8] text-[#e06b3f]"><Refrigerator size={18} /></span></div>
            <div className="space-y-2">{modes.map((item) => <button key={item.id} type="button" onClick={() => setMode(item.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-all ${mode === item.id ? 'border-[#195d44] bg-[#f7fbef] shadow-[0_5px_14px_rgba(25,93,68,0.08)]' : 'border-[#ddd2c2] bg-[#f7f1e7] hover:border-[#b8aa97]'}`} aria-pressed={mode === item.id}><span className={`font-mono text-[10px] ${mode === item.id ? 'text-[#e06b3f]' : 'text-[#9a8a77]'}`}>{item.mark}</span><span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-[#42372b]">{item.label}</span><span className="mt-0.5 block text-[11px] text-[#8a7966]">{item.description}</span></span><span className={`size-2 rounded-full ${mode === item.id ? 'bg-[#195d44]' : 'bg-[#d1c5b4]'}`} /></button>)}</div>
            <div className="my-5 h-px bg-[#d9cebd]" />
            <div className="flex items-center justify-between gap-3"><div><p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#8d7b67]">basket</p><p className="mt-1 text-[12px] text-[#756654]">{selected.length || customItems.length ? `${selected.length + customItems.length} clues ready` : 'Nothing selected yet'}</p></div>{(selected.length > 0 || avoided.length > 0 || customItems.length > 0) && <button type="button" onClick={clearAll} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#9b6950] hover:text-[#e06b3f]"><RotateCcw size={13} /> Clear</button>}</div>
            {selected.length > 0 && <div className="mt-3 flex max-h-24 flex-wrap gap-1.5 overflow-y-auto">{selected.map((id) => <button key={id} type="button" onClick={() => toggleUrgent(id)} title={urgent.includes(id) ? 'Use first' : 'Mark to use first'} className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${urgent.includes(id) ? 'bg-[#f4d5c7] text-[#b95741]' : 'bg-[#f8f0e4] text-[#776653]'}`}>{ingredientById.get(id)?.label}{urgent.includes(id) && ' · first'}</button>)}</div>}
            {avoided.length > 0 && <p className="mt-3 text-[10px] text-[#a65242]">Avoiding: {avoided.map((id) => ingredientById.get(id)?.label).join(', ')}</p>}
            <label className="mt-4 flex items-center justify-between rounded-xl border border-[#d9cebd] bg-[#f8f0e4] px-3 py-2.5"><span className="flex items-center gap-2 text-[11px] font-semibold text-[#685846]"><Refrigerator size={14} className="text-[#e06b3f]" /> Clear the fridge first</span><input type="checkbox" checked={clearFridge} onChange={(event) => setClearFridge(event.target.checked)} className="toggle-check" /></label>
            <button type="button" onClick={generate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#195d44] px-4 py-3.5 text-[13px] font-semibold text-[#fbf8f1] shadow-[0_7px_0_#0f422f] transition-all hover:-translate-y-0.5 hover:shadow-[0_9px_0_#0f422f] active:translate-y-0.5 active:shadow-[0_4px_0_#0f422f]" data-testid="button-generate"><Search size={17} /> Find my next meal <ArrowUpRight size={16} /></button>
            <p className="mt-3 text-center font-mono text-[9px] uppercase tracking-[0.12em] text-[#978774]">ideas, not instructions</p>
          </div>
          <div className="mt-auto pt-6 rounded-[22px] border border-[#ded6c8] bg-[#fbf8f1] p-5"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f5dfd1] text-[#e06b3f]"><HeartPulse size={17} /></span><div><p className="font-serif text-[17px] font-semibold text-[#42372b]">Use first, waste less</p><p className="mt-1.5 text-[12px] leading-5 text-[#857564]">Mark a selected item with the heart pulse. Recipes using it will rise to the top.</p></div></div></div>
         </aside>}
      </div>

      </>}
      {isResults && <section id="ideas" tabIndex={-1} className="border-t border-[#ded6c8] bg-[#f1eadf] px-5 py-12 outline-none sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1240px]">
          <div role="status" className="mb-6 rounded-2xl border border-[#195d44] bg-[#edf4e4] p-5 text-[#195d44]">
            <p className="text-lg font-bold">{generated ? `${displayedRecipes.length} matching recipes found` : 'Choose ingredients, then find your meal'}</p>
            <p className="mt-2 text-sm">{allRecipes.length} recipes available from your sheet, each with calorie estimates and health tags. {generated && `Your ingredients: ${selectedLabels.join(', ') || customItems.join(', ') || 'none selected'}.`}</p>
            <p className="mt-2 text-sm">Basic seasonings count automatically unless marked “Avoid”. Other missing ingredients are listed on each card. Strict match requires every main ingredient.</p>
          </div>
           <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#e06b3f]">04 / the good part</p><h2 className="mt-2 font-serif text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[.94] tracking-[-0.05em] text-[#33291f]">{generated ? 'Here are a few places to start.' : 'Your next meal is hiding in here.'}</h2><p className="mt-3 max-w-[560px] text-[13px] leading-6 text-[#796a59]">{generated ? `Sorted for ${mode === 'fuzzy' ? 'flexible ideas' : mode === 'strict' ? 'your exact basket' : 'the fastest comfort'}${healthGoal !== 'none' ? ` · ${selectedHealthGoal.label.toLowerCase()}` : ''}${clearFridge && urgent.length ? ' · with use-first items up front' : ''}.` : 'Pick what you have, set a few boundaries, and open any result for step-by-step kitchen mode.'}</p></div><div className="flex flex-wrap gap-2"><FilterButton active={timeFilter === 'all'} onClick={() => setTimeFilter('all')}>Any time</FilterButton><FilterButton active={timeFilter === 'quick'} onClick={() => setTimeFilter('quick')}>15–20 min</FilterButton><FilterButton active={timeFilter === 'slow'} onClick={() => setTimeFilter('slow')}>30+ min</FilterButton></div></div>
          <div className="mb-6 rounded-2xl border border-[#ded3c4] bg-[#f9f4eb] p-4" role="group" aria-labelledby="results-goal-filter-title">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8e7d69]"><HeartPulse size={13} className="text-[#e06b3f]" /> goal</p>
                <h3 id="results-goal-filter-title" className="mt-1 font-serif text-[20px] font-semibold text-[#33291f]">What&apos;s your goal today?</h3>
              </div>
              <p className="text-[11px] text-[#8a7966]">{healthGoal === 'none' ? 'Showing every match from your basket.' : `Only dishes tagged ${healthGoalTag[healthGoal]}.`}</p>
            </div>
            <div className="grid grid-cols-2 items-stretch gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {healthGoals.map((goal) => (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setHealthGoal(goal.id)}
                  aria-pressed={healthGoal === goal.id}
                  data-testid={`button-results-goal-${goal.id}`}
                  className={`flex h-full min-h-[88px] flex-col rounded-2xl border px-3 py-3 text-left transition-all ${healthGoal === goal.id ? 'border-[#195d44] bg-[#edf4e4] shadow-[0_5px_14px_rgba(25,93,68,0.08)]' : 'border-[#e1d7c8] bg-[#fffdf8] hover:border-[#8eaf92]'}`}
                >
                  <span className="block text-[12px] font-semibold text-[#42372b]">{goal.label}</span>
                  <span className="mt-1 line-clamp-2 text-[10px] leading-4 text-[#887765]">{goal.description}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#ded3c4] bg-[#f9f4eb] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8e7d69]"><CookingPot size={13} /> method</span>{(['all', 'stir-fry', 'steam', 'boil', 'no-cook', 'air-fryer', 'oven'] as MethodFilter[]).map((value) => <FilterButton key={value} active={methodFilter === value} onClick={() => setMethodFilter(value)}>{value === 'all' ? 'All' : value.replace('-', ' ')}</FilterButton>)}</div><div className="flex items-center gap-2 overflow-x-auto"><span className="flex shrink-0 items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8e7d69]"><Sparkles size={13} /> for</span>{(['all', 'beginner', 'high-protein', 'comfort'] as AudienceFilter[]).map((value) => <FilterButton key={value} active={audienceFilter === value} onClick={() => setAudienceFilter(value)}>{value === 'all' ? 'Everyone' : value.replace('-', ' ')}</FilterButton>)}</div></div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={openBook} className="rounded-xl bg-[#195d44] px-4 py-3 font-semibold text-white">My recipe book ({savedRecipes.length})</button>
            <p role="status" className="text-sm text-[#195d44]">{bookNotice}</p>
            {storageError && <p role="alert" className="text-sm text-red-700">{storageError}</p>}
          </div>
          {generated && <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">{displayedRecipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} match={getMatch(recipe)} confirmed={savedIds.includes(recipe.id)} onConfirm={() => { if (confirm(recipe.id)) setBookNotice(`${recipe.title} added to My recipe book.`); }} onOpen={() => { setSelectedRecipe(recipe); setServings(recipe.baseServings); }} />)}</div>}
          {generated && displayedRecipes.length === 0 && <div role="status" className="rounded-2xl border border-dashed border-[#cfc3b1] bg-[#f9f4eb] p-6 text-center sm:p-10 flex flex-col items-center">
            <DishIllustration dish="stir-fry" className="w-full max-w-[220px] -mt-4 -mb-2 opacity-90" />
            <h3 className="mt-4 font-serif text-2xl font-semibold text-[#44372b]">No recipe yet — let’s try another way.</h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#756654]">
              {selectedLabels.length === 0 && customResolvedIds.length === 0
                ? 'Start with a main ingredient such as eggs, tomatoes or chicken. Basic seasonings alone do not count as a meal. Custom entries must match a listed ingredient name.'
                : mode === 'strict'
                  ? 'No dish has all its main ingredients available with your current filters. Try fuzzy match to see what you can make with one or two additions.'
                  : 'No dish in our current recipe collection fits these ingredients and filters. Try clearing filters, or choose a common ingredient such as eggs, tomatoes or chicken.'}
            </p>
            {avoided.length > 0 && <p className="mt-3 text-xs text-[#a34d3c]">Your {avoided.length} avoided ingredients stay excluded when you relax matching or clear filters.</p>}
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              {mode !== 'fuzzy' && <button type="button" onClick={() => setMode('fuzzy')} className="rounded-xl bg-[#195d44] px-4 py-3 text-sm font-semibold text-white">Try fuzzy match</button>}
              {(timeFilter !== 'all' || methodFilter !== 'all' || audienceFilter !== 'all' || healthGoal !== 'none') && <button type="button" onClick={() => { setTimeFilter('all'); setMethodFilter('all'); setAudienceFilter('all'); setHealthGoal('none'); }} className="rounded-xl border border-[#195d44] bg-white px-4 py-3 text-sm font-semibold text-[#195d44]">Clear recipe filters</button>}
              <button type="button" onClick={() => {
                navigate('/ingredients');
              }} className="rounded-xl border border-[#cdbfae] bg-white px-4 py-3 text-sm font-semibold text-[#5b4b3b]">Choose ingredients</button>
            </div>
          </div>}
          <div className="mt-9 flex items-center justify-center gap-2 text-center font-mono text-[10px] uppercase tracking-[0.13em] text-[#a08f7b]"><span className="h-px w-8 bg-[#d4c7b6]" /><span>keep tinkering</span><span className="h-px w-8 bg-[#d4c7b6]" /></div>
        </div>
      </section>}

      {location === '/recipes' && <section id="my-recipe-book" tabIndex={-1} aria-labelledby="recipe-book-title" className="mx-auto max-w-[1240px] px-5 py-12 outline-none sm:px-8 lg:px-12">
        <h2 id="recipe-book-title" className="font-serif text-3xl font-semibold text-[#195d44]">My recipe book ({savedRecipes.length})</h2>
        <p className="mt-3 text-sm text-[#766856]">All your confirmed dishes, saved in this browser. Changing ingredients or clearing your basket will not remove them.</p>
        {storageError && <p role="alert" className="mt-3 text-sm text-red-700">{storageError}</p>}
        {savedRecipes.length === 0 ? <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-[#cfc3b1] p-10 text-center">
          <DishIllustration dish="vegetable-bowl" className="w-full max-w-[200px] -mt-2 mb-4 opacity-80" />
          <p className="font-serif text-xl font-semibold text-[#44372b]">Your recipe book is empty.</p>
          <p className="mt-2 text-[14px] text-[#766856]">Choose “Confirm choice” on a result card to add a dish.</p>
        </div> :
          <div className="mt-6 grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((recipe) => <article key={recipe.id} data-testid={`saved-${recipe.id}`} className="flex h-full flex-col rounded-2xl border border-[#ded6c8] bg-[#fffdf8] p-5">
              <p className="mb-2 text-xs font-semibold text-[#195d44]"><Check size={14} className="mr-1 inline" />Confirmed</p>
              <h3 className="font-serif text-xl font-semibold leading-7">{recipe.title}</h3>
              <p className="mt-2 line-clamp-2 min-h-10 flex-1 text-sm text-[#766856]">~{recipe.calories} kcal / serving · {recipe.required.map((id) => ingredientById.get(id)?.label ?? id).join(', ')}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setSelectedRecipe(recipe); setServings(recipe.baseServings); }} className="rounded-xl bg-[#195d44] px-4 py-2 text-sm font-semibold text-white">View recipe</button>
                <button type="button" aria-label={`Remove ${recipe.title} from recipe book`} onClick={() => { if (remove(recipe.id)) setBookNotice(`${recipe.title} removed from My recipe book.`); }} className="rounded-xl border border-[#cdbfae] px-4 py-2 text-sm text-[#a34d3c]">Remove</button>
              </div>
            </article>)}
          </div>}
      </section>}
      <footer className="mx-auto flex max-w-[1240px] flex-col gap-3 px-5 py-8 text-[11px] text-[#8d7b67] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12"><p className="font-serif text-[16px] font-semibold text-[#195d44]">pinch &amp; pan</p><p>Made for the “what do I have?” moment.</p></footer>
      {selectedRecipe && <RecipeDetail recipe={selectedRecipe} match={getMatch(selectedRecipe)} servings={servings} onServings={setServings} wakeLockActive={wakeLockActive} onWakeLock={toggleWakeLock} timerSeconds={timerSeconds} timerLabel={timerLabel} onStartTimer={startTimer} onClose={() => setSelectedRecipe(null)} />}
    </main>
  );
}