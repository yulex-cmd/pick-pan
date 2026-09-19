import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useRecipeBook } from './useRecipeBook';
import KitchenTip from './components/KitchenTip';
import HealthyVegetableIllustration from './components/HealthyVegetableIllustration';
import DishIllustration from './components/DishIllustration';
import { useLocation } from 'wouter';
import {
  Apple,
  ArrowUpRight,
  Bean,
  ChefHat,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock3,
  CookingPot,
  Egg,
  Flame,
  Fish,
  HeartPulse,
  Leaf,
  Minus,
  NotebookPen,
  Pause,
  Play,
  Plus,
  Refrigerator,
  RotateCcw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Soup,
  Sparkles,
  Sprout,
  Timer,
  TimerReset,
  Utensils,
  Wheat,
  X,
  type LucideIcon,
} from 'lucide-react';

type Mode = 'fuzzy' | 'strict' | 'survival';
type EntryMode = 'have' | 'avoid';
type TimeFilter = 'all' | 'quick' | 'slow';
type MethodFilter = 'all' | RecipeMethod;
type AudienceFilter = 'all' | RecipeAudience;
type RecipeMethod = 'stir-fry' | 'steam' | 'boil' | 'no-cook' | 'air-fryer' | 'oven';
type RecipeAudience = 'beginner' | 'high-protein' | 'comfort';

type Ingredient = {
  id: string;
  label: string;
  category: string;
  note: string;
  aliases: string[];
  icon: LucideIcon;
};

type Option = {
  id: string;
  label: string;
  note: string;
  icon: LucideIcon;
};

type Amount = {
  id: string;
  label: string;
  quantity: number;
  unit: string;
};

type Step = {
  title: string;
  instruction: string;
  minutes?: number;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  time: number;
  method: RecipeMethod;
  tags: string[];
  audience: RecipeAudience[];
  required: string[];
  optional: string[];
  accent: string;
  icon: LucideIcon;
  baseServings: number;
  ingredients: Amount[];
  steps: Step[];
  substitutes: { missing: string; replacement: string }[];
};

type MatchInfo = {
  status: 'complete' | 'partial' | 'stretch' | 'blocked';
  score: number;
  missing: string[];
  usedUrgent: boolean;
  substituteHints: string[];
};

const categories: { title: string; eyebrow: string; ids: string[] }[] = [
  { title: 'Vegetables & mushrooms', eyebrow: 'produce drawer · 10+', ids: ['broccoli', 'bell-pepper', 'onion', 'tomato', 'cabbage', 'carrot', 'potato', 'mushroom', 'cucumber', 'garlic', 'greens'] },
  { title: 'Meat & poultry', eyebrow: 'protein shelf · 7', ids: ['beef', 'ground-beef', 'pork', 'ground-pork', 'pork-chops', 'chicken', 'ground-chicken'] },
  { title: 'Fish & shrimp', eyebrow: 'from the sea · 2', ids: ['shrimp', 'fish'] },
  { title: 'Beans & tofu', eyebrow: 'plant-forward · 5+', ids: ['peas', 'tofu', 'chickpeas', 'lentils', 'black-beans', 'beans'] },
  { title: 'Eggs & dairy', eyebrow: 'fridge friends · 3', ids: ['eggs', 'yogurt', 'cheese'] },
  { title: 'Staples', eyebrow: 'pantry shelf · 3+', ids: ['pasta', 'tortilla', 'rice', 'noodles', 'bread'] },
  { title: 'Extra seasonings & herbs', eyebrow: 'optional pantry picks · 3', ids: ['chili-bean-paste', 'basil', 'spices'] },
  { title: 'Other cooking ingredients', eyebrow: 'special extras · 1', ids: ['coconut-milk'] },
];

const ingredients: Ingredient[] = [
  { id: 'broccoli', label: 'Broccoli', note: '西兰花 · green + crisp', aliases: ['broccoli', '西兰花', 'xlh'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'bell-pepper', label: 'Bell pepper', note: '彩椒 · sweet crunch', aliases: ['bell pepper', 'pepper', '彩椒', '青椒', '椒', 'cj'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'tomato', label: 'Tomatoes', note: '番茄 · juicy + bright', aliases: ['tomato', 'tomatoes', '番茄', '西红柿', '洋柿子', 'fq', 'xhs'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'onion', label: 'Onion', note: '洋葱 · the good base', aliases: ['onion', '洋葱', 'yc'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'cabbage', label: 'Cabbage', note: '卷心菜 · sweet + sturdy', aliases: ['cabbage', '卷心菜', '包菜', 'jx菜'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'carrot', label: 'Carrot', note: '胡萝卜 · sweet crunch', aliases: ['carrot', '胡萝卜', '萝卜', 'hll'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'potato', label: 'Potatoes', note: '土豆 · always dependable', aliases: ['potato', 'potatoes', '土豆', '马铃薯', 'td'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'mushroom', label: 'Mushrooms', note: '菌菇 · deep + savory', aliases: ['mushroom', 'mushrooms', '菌菇', '蘑菇', 'mg'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'cucumber', label: 'Cucumber', note: '黄瓜 · cool + crisp', aliases: ['cucumber', '黄瓜', 'hg'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'garlic', label: 'Garlic', note: '大蒜 · one clove is plenty', aliases: ['garlic', '大蒜', '蒜', 'ds'], category: 'Seasonings & herbs', icon: Sprout },
  { id: 'greens', label: 'Leafy greens', note: '菠菜 · spinach, kale, chard', aliases: ['greens', 'spinach', 'kale', '菠菜', '青菜', 'sc'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'beef', label: 'Beef', note: '牛肉 · quick-cooking cuts', aliases: ['beef', '牛肉', '牛', 'nr'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-beef', label: 'Ground beef', note: '牛肉末 · fast + versatile', aliases: ['ground beef', 'minced beef', '牛肉末', 'nrm'], category: 'Meat & poultry', icon: Utensils },
  { id: 'pork', label: 'Pork', note: '猪肉 · thin slices work', aliases: ['pork', '猪肉', '五花肉', '猪', 'zr'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-pork', label: 'Ground pork', note: '猪肉末 · juicy + quick', aliases: ['ground pork', 'minced pork', '猪肉末', 'zrm'], category: 'Meat & poultry', icon: Utensils },
  { id: 'pork-chops', label: 'Pork chops', note: '猪排 · pan-ready', aliases: ['pork chops', 'pork chop', '猪排', 'zp'], category: 'Meat & poultry', icon: Utensils },
  { id: 'chicken', label: 'Chicken', note: '鸡肉 · thighs or breast', aliases: ['chicken', '鸡肉', '鸡胸', 'jr'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-chicken', label: 'Ground chicken', note: '鸡肉末 · lean + light', aliases: ['ground chicken', 'minced chicken', '鸡肉末', 'jrm'], category: 'Meat & poultry', icon: Utensils },
  { id: 'shrimp', label: 'Shrimp', note: '虾 · cooks in minutes', aliases: ['shrimp', 'prawn', '虾', 'xia'], category: 'Fish & shrimp', icon: Fish },
  { id: 'fish', label: 'Fish', note: '鱼 · fillets welcome', aliases: ['fish', '鱼', '鱼肉', 'yu'], category: 'Fish & shrimp', icon: Fish },
  { id: 'peas', label: 'Peas', note: '豌豆 · sweet + easy', aliases: ['peas', 'pea', '豌豆', 'wd'], category: 'Beans & tofu', icon: Bean },
  { id: 'tofu', label: 'Tofu', note: '豆腐 · soft or firm', aliases: ['tofu', '豆腐', 'df'], category: 'Beans & tofu', icon: Bean },
  { id: 'chickpeas', label: 'Chickpeas', note: '鹰嘴豆 · hearty pantry staple', aliases: ['chickpeas', 'chickpea', '鹰嘴豆', 'yzd'], category: 'Beans & tofu', icon: Bean },
  { id: 'lentils', label: 'Lentils', note: '扁豆 · earthy + filling', aliases: ['lentils', 'lentil', '扁豆', 'bd'], category: 'Beans & tofu', icon: Bean },
  { id: 'black-beans', label: 'Black beans', note: '黑豆 · rich + creamy', aliases: ['black beans', 'black bean', '黑豆', 'hd'], category: 'Beans & tofu', icon: Bean },
  { id: 'beans', label: 'Beans', note: '豆类 · canned counts', aliases: ['beans', 'bean', '豆子', '豆类', 'dz'], category: 'Beans & tofu', icon: Bean },
  { id: 'eggs', label: 'Eggs', note: '鸡蛋 · the great fixer', aliases: ['egg', 'eggs', '鸡蛋', '蛋', 'jd'], category: 'Eggs & dairy', icon: Egg },
  { id: 'yogurt', label: 'Yogurt', note: '酸奶 · cool + tangy', aliases: ['yogurt', 'yoghurt', '酸奶', 'sn'], category: 'Eggs & dairy', icon: Soup },
  { id: 'cheese', label: 'Cheese', note: '奶酪 · something melty', aliases: ['cheese', '奶酪', '芝士', 'nl'], category: 'Eggs & dairy', icon: Soup },
  { id: 'pasta', label: 'Pasta', note: '意大利面 · pantry reliable', aliases: ['pasta', '意大利面', '意面', 'spaghetti'], category: 'Staples', icon: Wheat },
  { id: 'tortilla', label: 'Tortilla', note: '墨西哥薄饼 · wrap it up', aliases: ['tortilla', '墨西哥薄饼', '薄饼', 'bj'], category: 'Staples', icon: Wheat },
  { id: 'rice', label: 'Rice', note: '米 · white, brown, sticky', aliases: ['rice', '米', '米饭', '大米', 'm'], category: 'Staples', icon: Wheat },
  { id: 'noodles', label: 'Noodles', note: '面条 · any shape works', aliases: ['noodle', 'noodles', '面', '面条', 'mt'], category: 'Staples', icon: Wheat },
  { id: 'bread', label: 'Bread', note: '面包 · even slightly stale', aliases: ['bread', '面包', 'mb'], category: 'Staples', icon: Wheat },
  { id: 'chili-bean-paste', label: 'Chili bean paste', note: '辣豆瓣酱 · savory heat', aliases: ['chili bean paste', 'doubanjiang', '辣豆瓣酱', '豆瓣酱', 'ldb'], category: 'Seasonings & herbs', icon: Flame },
  { id: 'soy-sauce', label: 'Soy sauce', note: '酱油 · instant depth', aliases: ['soy', 'soy sauce', '生抽', '酱油', 'sc'], category: 'Seasonings & herbs', icon: Soup },
  { id: 'vinegar', label: 'Vinegar', note: '醋 · a bright finish', aliases: ['vinegar', '醋', 'cu'], category: 'Seasonings & herbs', icon: Soup },
  { id: 'basil', label: 'Basil', note: '罗勒 · fresh + fragrant', aliases: ['basil', '罗勒', 'le'], category: 'Seasonings & herbs', icon: Leaf },
  { id: 'oil', label: 'Cooking oil', note: '油 · for the hot pan', aliases: ['oil', 'cooking oil', '食用油', '油'], category: 'Seasonings & herbs', icon: CookingPot },
  { id: 'salt', label: 'Salt', note: '盐 · always nearby', aliases: ['salt', '盐', 'yan'], category: 'Seasonings & herbs', icon: Soup },
  { id: 'spices', label: 'Dried spices', note: '香料 · open the cupboard', aliases: ['spice', 'spices', '香料', '辣椒', 'xl'], category: 'Seasonings & herbs', icon: Flame },
  { id: 'coconut-milk', label: 'Coconut milk', note: '椰奶 · creamy + mellow', aliases: ['coconut milk', '椰奶', 'yn'], category: 'Other cooking ingredients', icon: Soup },
];

const toolOptions: Option[] = [
  { id: 'stovetop', label: 'Stovetop', note: 'one warm burner', icon: Flame },
  { id: 'steamer', label: 'Steamer', note: 'soft + gentle heat', icon: CookingPot },
  { id: 'oven', label: 'Oven', note: 'let it do the work', icon: CookingPot },
  { id: 'air-fryer', label: 'Air fryer', note: 'crisp with less oil', icon: Sparkles },
  { id: 'blender', label: 'Blender', note: 'smooth or chunky', icon: Soup },
  { id: 'one-pan', label: 'One pan only', note: 'less washing up', icon: CookingPot },
];

const quickPicks = ['eggs', 'tomato', 'potato', 'garlic', 'pork'];
const defaultPantry = new Set(['salt', 'oil', 'soy-sauce', 'vinegar']);

const recipes: Recipe[] = [
  {
    id: 'tomato-egg-rice',
    title: 'Tomato egg rice',
    description: 'Soft eggs, glossy tomatoes, and warm rice make the kind of dinner that always works.',
    time: 15,
    method: 'stir-fry',
    tags: ['15-minute', 'one pan'],
    audience: ['beginner', 'comfort'],
    required: ['tomato', 'eggs', 'rice'],
    optional: ['onion', 'scallion'],
    accent: '#e06b3f',
    icon: Egg,
    baseServings: 2,
    ingredients: [
      { id: 'tomato', label: 'Tomatoes', quantity: 2, unit: 'medium' },
      { id: 'eggs', label: 'Eggs', quantity: 3, unit: 'large' },
      { id: 'rice', label: 'Cooked rice', quantity: 300, unit: 'g' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
      { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      { title: 'Prep', instruction: 'Cut the tomatoes into wedges and whisk the eggs with a pinch of salt.' },
      { title: 'Soft scramble', instruction: 'Heat oil in a pan. Cook the eggs until just set, then slide them onto a plate.', minutes: 2 },
      { title: 'Bring it together', instruction: 'Cook tomatoes until jammy. Return the eggs, add rice and soy sauce, and toss until hot.', minutes: 5 },
    ],
    substitutes: [{ missing: 'Soy sauce', replacement: 'Use a pinch of salt plus a splash of water.' }],
  },
  {
    id: 'garlic-pork-stir-fry',
    title: 'Garlic pork stir-fry',
    description: 'Thin pork, sweet onion, and plenty of garlic turn into a fast, savory plate of food.',
    time: 20,
    method: 'stir-fry',
    tags: ['high-protein', 'weeknight'],
    audience: ['high-protein', 'beginner'],
    required: ['pork', 'onion', 'garlic'],
    optional: ['greens', 'spices'],
    accent: '#c87952',
    icon: Utensils,
    baseServings: 2,
    ingredients: [
      { id: 'pork', label: 'Thin-sliced pork', quantity: 250, unit: 'g' },
      { id: 'onion', label: 'Onion', quantity: 1, unit: 'small' },
      { id: 'garlic', label: 'Garlic cloves', quantity: 3, unit: 'cloves' },
      { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tbsp' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { title: 'Slice', instruction: 'Slice pork and onion thinly. Keep the garlic close to the pan.' },
      { title: 'Sear', instruction: 'Heat the pan until very hot. Sear pork in a single layer until browned.', minutes: 4 },
      { title: 'Finish', instruction: 'Add onion and garlic. Toss with soy sauce until glossy and cooked through.', minutes: 5 },
    ],
    substitutes: [{ missing: 'Pork', replacement: 'Chicken thigh or thinly sliced beef works well here.' }],
  },
  {
    id: 'crispy-potato-tofu',
    title: 'Crispy potato tofu bowl',
    description: 'Golden potatoes meet tender tofu with a bright, savory drizzle for a filling plant-forward bowl.',
    time: 30,
    method: 'air-fryer',
    tags: ['clear the fridge', 'plant-forward'],
    audience: ['beginner', 'comfort'],
    required: ['potato', 'tofu'],
    optional: ['greens', 'garlic'],
    accent: '#c69032',
    icon: CookingPot,
    baseServings: 2,
    ingredients: [
      { id: 'potato', label: 'Potatoes', quantity: 400, unit: 'g' },
      { id: 'tofu', label: 'Firm tofu', quantity: 250, unit: 'g' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
      { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tbsp' },
      { id: 'garlic', label: 'Garlic', quantity: 2, unit: 'cloves' },
    ],
    steps: [
      { title: 'Cube', instruction: 'Cut potatoes and tofu into bite-sized cubes. Toss with oil, salt, and spices.' },
      { title: 'Crisp', instruction: 'Air fry at 200°C until golden and crisp, shaking once halfway through.', minutes: 18 },
      { title: 'Drizzle', instruction: 'Warm soy sauce and garlic in a small pan, then spoon over the crispy bowl.', minutes: 3 },
    ],
    substitutes: [{ missing: 'Tofu', replacement: 'Use canned beans or chickpeas for a similar hearty texture.' }],
  },
  {
    id: 'shrimp-garlic-noodles',
    title: 'Shrimp garlic noodles',
    description: 'Bouncy noodles, garlicky shrimp, and a quick sauce come together before the hunger gets loud.',
    time: 18,
    method: 'boil',
    tags: ['quick', 'high-protein'],
    audience: ['high-protein', 'beginner'],
    required: ['shrimp', 'noodles', 'garlic'],
    optional: ['greens', 'onion'],
    accent: '#d97755',
    icon: Fish,
    baseServings: 2,
    ingredients: [
      { id: 'shrimp', label: 'Peeled shrimp', quantity: 250, unit: 'g' },
      { id: 'noodles', label: 'Noodles', quantity: 180, unit: 'g' },
      { id: 'garlic', label: 'Garlic', quantity: 3, unit: 'cloves' },
      { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tbsp' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { title: 'Boil', instruction: 'Cook noodles according to the package, then reserve a splash of noodle water.' },
      { title: 'Sizzle', instruction: 'Sauté garlic in oil. Add shrimp and cook until pink and just firm.', minutes: 4 },
      { title: 'Toss', instruction: 'Add noodles, soy sauce, and a splash of noodle water. Toss until coated.', minutes: 2 },
    ],
    substitutes: [{ missing: 'Shrimp', replacement: 'Use a beaten egg or tofu for a quick vegetarian version.' }],
  },
  {
    id: 'mushroom-rice-bowl',
    title: 'Mushroom soy rice bowl',
    description: 'Deeply browned mushrooms over rice, with an optional egg for a little extra comfort.',
    time: 20,
    method: 'stir-fry',
    tags: ['pantry-friendly', 'cozy'],
    audience: ['beginner', 'comfort'],
    required: ['mushroom', 'rice'],
    optional: ['eggs', 'greens'],
    accent: '#8f6e4b',
    icon: Soup,
    baseServings: 2,
    ingredients: [
      { id: 'mushroom', label: 'Mushrooms', quantity: 250, unit: 'g' },
      { id: 'rice', label: 'Cooked rice', quantity: 300, unit: 'g' },
      { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tbsp' },
      { id: 'garlic', label: 'Garlic', quantity: 2, unit: 'cloves' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
    ],
    steps: [
      { title: 'Brown', instruction: 'Slice mushrooms and cook in a hot pan without moving until the edges turn golden.', minutes: 6 },
      { title: 'Season', instruction: 'Add garlic and soy sauce. Stir until the mushrooms are glossy.', minutes: 2 },
      { title: 'Serve', instruction: 'Spoon over hot rice. Top with a fried egg or wilted greens if you have them.' },
    ],
    substitutes: [{ missing: 'Mushrooms', replacement: 'Thinly sliced zucchini or eggplant can take their place.' }],
  },
  {
    id: 'sheet-pan-chicken',
    title: 'Sheet-pan chicken & vegetables',
    description: 'An easy tray of golden chicken and whatever vegetables need using up first.',
    time: 38,
    method: 'oven',
    tags: ['clear the fridge', 'hands-off'],
    audience: ['high-protein', 'comfort'],
    required: ['chicken', 'potato', 'onion'],
    optional: ['carrot', 'greens'],
    accent: '#b8753b',
    icon: Flame,
    baseServings: 2,
    ingredients: [
      { id: 'chicken', label: 'Chicken thighs', quantity: 400, unit: 'g' },
      { id: 'potato', label: 'Potatoes', quantity: 350, unit: 'g' },
      { id: 'onion', label: 'Onion', quantity: 1, unit: 'medium' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
      { id: 'spices', label: 'Dried spices', quantity: 1, unit: 'tsp' },
    ],
    steps: [
      { title: 'Heat the oven', instruction: 'Heat the oven to 220°C. Cut vegetables into pieces about the same size.' },
      { title: 'Season', instruction: 'Toss chicken and vegetables with oil, salt, and spices on one tray.' },
      { title: 'Roast', instruction: 'Roast until the chicken is cooked through and the potatoes are crisp.', minutes: 28 },
    ],
    substitutes: [{ missing: 'Chicken', replacement: 'Firm tofu or fish fillets can roast on the same tray; adjust the timing.' }],
  },
  {
    id: 'steamed-tofu-egg',
    title: 'Steamed tofu egg cups',
    description: 'Silky, savory, and gentle enough for a tired night when you still want something warm.',
    time: 15,
    method: 'steam',
    tags: ['soft + gentle', 'high-protein'],
    audience: ['beginner', 'high-protein'],
    required: ['tofu', 'eggs'],
    optional: ['mushroom', 'onion'],
    accent: '#6e9541',
    icon: Egg,
    baseServings: 2,
    ingredients: [
      { id: 'tofu', label: 'Soft tofu', quantity: 200, unit: 'g' },
      { id: 'eggs', label: 'Eggs', quantity: 3, unit: 'large' },
      { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tsp' },
      { id: 'water', label: 'Warm water', quantity: 120, unit: 'ml' },
    ],
    steps: [
      { title: 'Whisk', instruction: 'Whisk eggs with warm water and a splash of soy sauce. Place tofu in a heat-safe bowl.' },
      { title: 'Steam', instruction: 'Pour egg mixture over tofu. Steam gently with the lid slightly ajar.', minutes: 10 },
      { title: 'Rest', instruction: 'Let the bowl rest for one minute, then finish with oil or chopped greens.' },
    ],
    substitutes: [{ missing: 'Tofu', replacement: 'Use extra egg and a small handful of mushrooms instead.' }],
  },
  {
    id: 'tomato-cucumber-salad',
    title: 'Tomato cucumber salad',
    description: 'A crisp, no-cook plate for warm days, with vinegar, oil, and a little salt doing the work.',
    time: 10,
    method: 'no-cook',
    tags: ['10-minute', 'no-cook'],
    audience: ['beginner', 'comfort'],
    required: ['tomato', 'cucumber'],
    optional: ['onion', 'spices'],
    accent: '#58a474',
    icon: Leaf,
    baseServings: 2,
    ingredients: [
      { id: 'tomato', label: 'Tomatoes', quantity: 2, unit: 'medium' },
      { id: 'cucumber', label: 'Cucumber', quantity: 1, unit: 'medium' },
      { id: 'vinegar', label: 'Vinegar', quantity: 1, unit: 'tbsp' },
      { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
      { id: 'salt', label: 'Salt', quantity: 0.5, unit: 'tsp' },
    ],
    steps: [
      { title: 'Slice', instruction: 'Slice tomatoes and cucumber into bite-sized pieces.' },
      { title: 'Dress', instruction: 'Toss with vinegar, oil, and salt. Add onion or spices if you have them.' },
      { title: 'Chill', instruction: 'Let the salad stand for five minutes so the juices mingle.', minutes: 5 },
    ],
    substitutes: [{ missing: 'Cucumber', replacement: 'Shredded cabbage or leafy greens add a similar fresh crunch.' }],
  },
];

const modes: { id: Mode; label: string; description: string; mark: string }[] = [
  { id: 'fuzzy', label: 'Fuzzy match', description: 'Creative ideas with flexible swaps.', mark: '01' },
  { id: 'strict', label: 'Strict match', description: 'Only ideas that fit your basket.', mark: '02' },
  { id: 'survival', label: 'Survival mode', description: 'Simple, forgiving, and filling.', mark: '03' },
];

const ingredientById = new Map(ingredients.map((item) => [item.id, item]));

type SpreadsheetRecipe = {
  title: string;
  cuisine: string;
  required: string[];
  method: RecipeMethod;
  time: number;
  audience: RecipeAudience[];
  icon: LucideIcon;
  accent: string;
};

// Imported from the user's recipe workbook. Tomato egg rice already exists above
// as a detailed recipe, so the rest of the workbook becomes the expanded catalog.
const spreadsheetRecipes: SpreadsheetRecipe[] = [
  { title: 'Beef and Broccoli Stir-Fry', cuisine: 'East Asian', required: ['beef', 'broccoli', 'garlic'], method: 'stir-fry', time: 20, audience: ['high-protein', 'beginner'], icon: Utensils, accent: '#6e9541' },
  { title: 'Beef and Bell Pepper Stir-Fry', cuisine: 'East Asian', required: ['beef', 'bell-pepper', 'onion'], method: 'stir-fry', time: 20, audience: ['high-protein', 'beginner'], icon: Utensils, accent: '#c87952' },
  { title: 'Spaghetti Bolognese', cuisine: 'Italian', required: ['ground-beef', 'pasta', 'tomato', 'onion'], method: 'stir-fry', time: 35, audience: ['comfort'], icon: Soup, accent: '#b8753b' },
  { title: 'Beef Tacos', cuisine: 'Mexican / Tex-Mex', required: ['ground-beef', 'tortilla', 'tomato'], method: 'stir-fry', time: 25, audience: ['beginner', 'high-protein'], icon: Utensils, accent: '#e06b3f' },
  { title: 'Beef Keema', cuisine: 'South Asian', required: ['ground-beef', 'onion', 'tomato', 'peas'], method: 'stir-fry', time: 35, audience: ['high-protein', 'comfort'], icon: CookingPot, accent: '#c69032' },
  { title: 'Beef Kofta Rice Bowl', cuisine: 'Middle Eastern', required: ['ground-beef', 'rice', 'onion', 'yogurt'], method: 'oven', time: 35, audience: ['high-protein', 'comfort'], icon: CookingPot, accent: '#8f6e4b' },
  { title: 'Pork and Cabbage Stir-Fry', cuisine: 'East Asian', required: ['pork', 'cabbage', 'carrot'], method: 'stir-fry', time: 20, audience: ['high-protein', 'beginner'], icon: Utensils, accent: '#58a474' },
  { title: 'Mapo Tofu with Pork', cuisine: 'Chinese', required: ['ground-pork', 'tofu', 'chili-bean-paste'], method: 'stir-fry', time: 25, audience: ['high-protein', 'comfort'], icon: Flame, accent: '#d97755' },
  { title: 'Pork Fried Rice', cuisine: 'East Asian', required: ['pork', 'rice', 'eggs', 'carrot'], method: 'stir-fry', time: 25, audience: ['high-protein', 'beginner'], icon: CookingPot, accent: '#c69032' },
  { title: 'Filipino Pork Adobo', cuisine: 'Filipino', required: ['pork', 'soy-sauce', 'vinegar', 'garlic'], method: 'stir-fry', time: 40, audience: ['high-protein', 'comfort'], icon: CookingPot, accent: '#8f6e4b' },
  { title: 'Garlic Pork Chops', cuisine: 'European / American', required: ['pork-chops', 'garlic', 'potato'], method: 'stir-fry', time: 30, audience: ['high-protein', 'beginner'], icon: Utensils, accent: '#b8753b' },
  { title: 'Chicken and Mushroom Stir-Fry', cuisine: 'East Asian', required: ['chicken', 'mushroom', 'onion'], method: 'stir-fry', time: 20, audience: ['high-protein', 'beginner'], icon: Utensils, accent: '#6e9541' },
  { title: 'Chicken Curry', cuisine: 'South Asian', required: ['chicken', 'onion', 'tomato'], method: 'stir-fry', time: 35, audience: ['high-protein', 'comfort'], icon: Flame, accent: '#e06b3f' },
  { title: 'Chicken Quesadilla', cuisine: 'Mexican / Tex-Mex', required: ['chicken', 'tortilla', 'cheese'], method: 'stir-fry', time: 20, audience: ['beginner', 'comfort'], icon: Utensils, accent: '#dcae35' },
  { title: 'Chicken Shawarma Rice Bowl', cuisine: 'Middle Eastern', required: ['chicken', 'rice', 'cucumber', 'yogurt'], method: 'stir-fry', time: 30, audience: ['high-protein', 'comfort'], icon: CookingPot, accent: '#c87952' },
  { title: 'Thai Basil Chicken', cuisine: 'Thai', required: ['ground-chicken', 'basil', 'garlic'], method: 'stir-fry', time: 20, audience: ['high-protein', 'beginner'], icon: Leaf, accent: '#58a474' },
  { title: 'Chicken Vegetable Soup', cuisine: 'European / American', required: ['chicken', 'potato', 'carrot', 'onion'], method: 'boil', time: 40, audience: ['comfort'], icon: Soup, accent: '#6e9541' },
  { title: 'Garlic Shrimp Pasta', cuisine: 'Mediterranean', required: ['shrimp', 'pasta', 'garlic', 'tomato'], method: 'stir-fry', time: 25, audience: ['high-protein', 'beginner'], icon: Fish, accent: '#d97755' },
  { title: 'Shrimp Fried Rice', cuisine: 'East Asian', required: ['shrimp', 'rice', 'eggs', 'carrot'], method: 'stir-fry', time: 25, audience: ['high-protein', 'beginner'], icon: Fish, accent: '#c69032' },
  { title: 'Fish Tacos', cuisine: 'Mexican', required: ['fish', 'tortilla', 'cabbage'], method: 'stir-fry', time: 25, audience: ['beginner', 'high-protein'], icon: Fish, accent: '#58a474' },
  { title: 'Baked Fish and Potatoes', cuisine: 'Mediterranean', required: ['fish', 'potato', 'tomato'], method: 'oven', time: 35, audience: ['high-protein', 'comfort'], icon: Fish, accent: '#b8753b' },
  { title: 'Tofu Broccoli Stir-Fry', cuisine: 'East Asian', required: ['tofu', 'broccoli', 'garlic'], method: 'stir-fry', time: 20, audience: ['beginner', 'comfort'], icon: Bean, accent: '#6e9541' },
  { title: 'Chana Masala', cuisine: 'South Asian', required: ['chickpeas', 'tomato', 'onion'], method: 'stir-fry', time: 35, audience: ['comfort'], icon: Bean, accent: '#c69032' },
  { title: 'Shakshuka', cuisine: 'Middle Eastern / North African', required: ['eggs', 'tomato', 'bell-pepper'], method: 'stir-fry', time: 25, audience: ['beginner', 'comfort'], icon: Egg, accent: '#e06b3f' },
  { title: 'Mujadara', cuisine: 'Middle Eastern', required: ['lentils', 'rice', 'onion'], method: 'boil', time: 40, audience: ['comfort'], icon: Bean, accent: '#8f6e4b' },
  { title: 'Pasta al Pomodoro', cuisine: 'Italian', required: ['pasta', 'tomato', 'garlic'], method: 'boil', time: 25, audience: ['beginner', 'comfort'], icon: Soup, accent: '#e06b3f' },
  { title: 'Black Bean Tacos', cuisine: 'Mexican / Tex-Mex', required: ['black-beans', 'tortilla', 'tomato'], method: 'stir-fry', time: 20, audience: ['beginner', 'comfort'], icon: Bean, accent: '#8f6e4b' },
  { title: 'Thai Coconut Vegetable Curry', cuisine: 'Thai', required: ['coconut-milk', 'carrot', 'bell-pepper'], method: 'stir-fry', time: 30, audience: ['beginner', 'comfort'], icon: CookingPot, accent: '#6e9541' },
  { title: 'Spanish Tortilla', cuisine: 'Spanish', required: ['potato', 'eggs', 'onion'], method: 'stir-fry', time: 35, audience: ['beginner', 'comfort'], icon: Egg, accent: '#c69032' },
];

const makeSpreadsheetRecipe = (recipe: SpreadsheetRecipe): Recipe => ({
  id: `sheet-${recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`,
  title: recipe.title,
  description: `A ${recipe.cuisine} kitchen idea built around ${recipe.required.map((id) => ingredientById.get(id)?.label.toLowerCase() ?? id).join(', ')}.`,
  time: recipe.time,
  method: recipe.method,
  tags: [recipe.cuisine, 'from your recipe sheet'],
  audience: recipe.audience,
  required: recipe.required,
  optional: [],
  accent: recipe.accent,
  icon: recipe.icon,
  baseServings: 2,
  ingredients: recipe.required.map((id) => ({ id, label: ingredientById.get(id)?.label ?? id, quantity: 1, unit: 'as needed' })),
  steps: [
    { title: 'Recipe sheet reference', instruction: 'Your recipe sheet lists the main ingredients, but does not provide quantities or cooking instructions. Use the YouTube tutorial link for the full method. Times shown are estimates.' },
  ],
  substitutes: [],
});

const allRecipes: Recipe[] = [...recipes, ...spreadsheetRecipes.map(makeSpreadsheetRecipe)];

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
    <div className={`selection-card relative flex min-h-[78px] w-full items-center gap-3 rounded-2xl border bg-[#fbf8f1] px-3 py-3 text-left ${avoided ? 'border-[#d97868] bg-[#fff4ef]' : 'border-[#ded6c8]'}`} data-selected={selected} data-avoided={avoided}>
      <button type="button" className="flex min-w-0 flex-1 items-center gap-3 text-left" onClick={onToggle} aria-pressed={selected} data-testid={`button-option-${option.id}`}>
        <span className={`option-mark flex size-10 shrink-0 items-center justify-center rounded-xl text-[#195d44] transition-colors ${avoided ? 'bg-[#f6dcd4] text-[#b44d3b]' : 'bg-[#f1e9da]'}`}>
          <Icon size={18} strokeWidth={1.8} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-semibold tracking-[-0.01em] text-[#33291f]">{option.label}</span>
          <span className="mt-0.5 block text-[11px] leading-4 text-[#857867]">{option.note}</span>
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
  return (
    <article className="result-card overflow-hidden rounded-[22px] border border-[#ded6c8] bg-[#fffdf8] shadow-[0_12px_28px_rgba(79,58,35,0.06)]" style={{ animationDelay: `${index * 70}ms` }} data-testid={`card-recipe-${recipe.id}`}>
      <div className="h-1.5" style={{ backgroundColor: recipe.accent }} />
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-[#f4eddf] text-[#195d44]"><Icon size={21} strokeWidth={1.7} /></span>
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8b7965]">idea {String(index + 1).padStart(2, '0')}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${match.status === 'complete' ? 'bg-[#e8f0da] text-[#195d44]' : match.status === 'blocked' ? 'bg-[#f7dfd7] text-[#ad4b3c]' : 'bg-[#f7edda] text-[#92702a]'}`}>{statusLabel}</span>
              </div>
              <h3 className="font-serif text-[24px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#33291f]">{recipe.title}</h3>
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-[#f7f0e4] px-2.5 py-1 text-[11px] font-medium text-[#796b5a]"><Clock3 size={13} />{recipe.time} min</span>
        </div>
        <p className="mt-4 max-w-[50ch] text-[13px] leading-6 text-[#6f6253]">{recipe.description}</p>
        {match.missing.length > 0 && match.status !== 'blocked' && (
          <div className="mt-4 rounded-xl bg-[#fbf2e1] px-3 py-2.5 text-[11px] text-[#806640]"><span className="font-semibold">Still need:</span> {match.missing.join(', ')}{match.substituteHints.length > 0 && <span className="mt-1 block text-[#9b7c50]">Swap tip: {match.substituteHints[0]}</span>}</div>
        )}
        {match.status === 'blocked' && <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#fff0eb] px-3 py-2.5 text-[11px] text-[#a65242]"><CircleAlert size={14} /> This recipe uses something you marked to avoid.</div>}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[#eee6d9] pt-4">
          <div className="flex flex-wrap gap-1.5">{recipe.tags.map((tag) => <span key={tag} className="rounded-full border border-[#e4dacb] px-2.5 py-1 text-[10px] font-medium text-[#887967]">{tag}</span>)}</div>
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
  const customResolvedIds = useMemo(() => customItems.flatMap((item) => {
    const query = item.trim().toLowerCase();
    return ingredients.filter((ingredient) => [ingredient.label, ...ingredient.aliases].some((alias) => query === alias.toLowerCase())).map((ingredient) => ingredient.id);
  }), [customItems]);
  const ownedIds = useMemo(() => new Set([...selected, ...customResolvedIds, ...defaultPantry].filter((id) => !avoided.includes(id))), [customResolvedIds, selected, avoided]);

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
    const substituteHints = recipe.substitutes.filter((item) => missing.some((label) => label.toLowerCase() === item.missing.toLowerCase())).map((item) => `${item.missing} → ${item.replacement}`);
    const score = Math.round(((recipe.required.length - missingIds.length) / recipe.required.length) * 100);
    return { status: blocked ? 'blocked' : missingIds.length === 0 ? 'complete' : missingIds.length <= 2 ? 'partial' : 'stretch', score, missing, usedUrgent: recipe.required.some((id) => urgent.includes(id)), substituteHints };
  };

  const displayedRecipes = useMemo(() => {
    const priority = { complete: 0, partial: 1, stretch: 2, blocked: 3 };
    const chosen = new Set([...selected.filter((id) => ingredientById.has(id)), ...customResolvedIds]);
    return allRecipes
      .filter((recipe) => chosen.size > 0 && recipe.required.some((id) => chosen.has(id)))
      .filter((recipe) => timeFilter === 'all' || (timeFilter === 'quick' ? recipe.time <= 20 : recipe.time > 20))
      .filter((recipe) => methodFilter === 'all' || recipe.method === methodFilter)
      .filter((recipe) => audienceFilter === 'all' || recipe.audience.includes(audienceFilter))
      .filter((recipe) => getMatch(recipe).status !== 'blocked')
      .filter((recipe) => mode !== 'strict' || getMatch(recipe).missing.length === 0)
      .sort((a, b) => {
        const aMatch = getMatch(a);
        const bMatch = getMatch(b);
        if (priority[aMatch.status] !== priority[bMatch.status]) return priority[aMatch.status] - priority[bMatch.status];
        if (bMatch.score !== aMatch.score) return bMatch.score - aMatch.score;
        if (clearFridge && aMatch.usedUrgent !== bMatch.usedUrgent) return aMatch.usedUrgent ? -1 : 1;
        if (mode === 'survival' && a.time !== b.time) return a.time - b.time;
        return priority[aMatch.status] - priority[bMatch.status] || bMatch.score - aMatch.score;
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [audienceFilter, avoided, clearFridge, methodFilter, mode, ownedIds, timeFilter, urgent, selected, customResolvedIds]);

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
      {(isPicker || isIngredients) && <>
      <div className="mx-auto grid max-w-[1240px] gap-8 px-5 pb-20 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,460px)] lg:gap-12 lg:px-12">
        {isPicker ? <div className="flex flex-col gap-6 self-start">
          <section aria-labelledby="on-hand-title" className="rounded-[22px] border border-[#d7e2cb] bg-[#edf4e4] p-5 sm:p-7">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#52694e]">Your kitchen basket</p>
            <h2 id="on-hand-title" className="mt-2 font-serif text-3xl font-semibold text-[#195d44]">Already on hand</h2>
            <p className="mt-3 text-sm leading-6 text-[#52694e]">Basic seasonings are included automatically. Add your ingredients and tell us what to avoid on the selection page.</p>
            <p className="mt-3 text-xs leading-5 text-[#52694e]">Seasonings: {[...defaultPantry].filter((id) => !avoided.includes(id)).map((id) => ingredientById.get(id)?.label).join(', ') || 'None — all marked Avoid'}</p>
            <div className="mt-5 rounded-xl bg-white/60 p-4">
              <p className="text-sm font-semibold text-[#195d44]">{selectedLabels.length} ingredients · {avoided.length} avoided</p>
              <p className="mt-2 text-sm leading-6 text-[#52694e]">{selectedLabels.length ? `${selectedLabels.slice(0, 6).join(', ')}${selectedLabels.length > 6 ? ` + ${selectedLabels.length - 6} more` : ''}` : 'Your basket is ready for something fresh.'}</p>
            </div>
            <button type="button" onClick={() => navigate('/ingredients')} data-testid="button-choose-ingredients" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#195d44] px-5 py-3 text-sm font-semibold text-white hover:bg-[#124b36] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#195d44]">{selectedLabels.length || avoided.length ? 'Edit ingredients' : 'Choose ingredients'} <ArrowUpRight size={17} /></button>
          </section>
          
          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-5">
            <div className="rounded-[22px] border border-[#e8dfce] bg-[#fffaf1] px-2 pb-4 pt-2 sm:px-5 sm:pb-6 text-center flex flex-col items-center">
              <div className="w-full max-w-[220px] -mb-4">
                <DishIllustration dish="tomato-egg-rice" />
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#a39380] mb-1">Inspiration</p>
              <h3 className="font-serif text-[17px] font-semibold text-[#42372b]">Tomato egg rice</h3>
              <p className="mt-1 text-[12px] text-[#8a7966]">A comforting classic to aim for.</p>
            </div>
            <div className="rounded-[22px] border border-[#e8dfce] bg-[#fffaf1] px-2 pb-4 pt-2 sm:px-5 sm:pb-6 text-center flex flex-col items-center">
              <div className="w-full max-w-[220px] -mb-4">
                <DishIllustration dish="vegetable-bowl" />
              </div>
              <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#a39380] mb-1">Inspiration</p>
              <h3 className="font-serif text-[17px] font-semibold text-[#42372b]">Crisp veggie bowl</h3>
              <p className="mt-1 text-[12px] text-[#8a7966]">Fresh &amp; colorful assembly.</p>
            </div>
          </div>
        </div> : <section id="ingredient-picker" tabIndex={-1} aria-label="Choose ingredients" className="space-y-9 outline-none">
          <h1 className="font-serif text-4xl font-semibold text-[#195d44]">Choose your ingredients</h1>
          <div>
            <SectionHeading number="01" eyebrow="Start with what is around" title="Build your kitchen basket"><span className="rounded-full bg-[#195d44] px-3 py-1.5 font-mono text-[10px] text-[#fbf8f1]">{selected.length} have · {avoided.length} avoid</span></SectionHeading>
            <div className="rounded-[22px] border border-[#ded6c8] bg-[#f9f4eb] p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-serif text-[17px] font-semibold text-[#42372b]">What is in the kitchen?</p>
                  <p className="mt-1 text-[11px] text-[#8a7966]">Search English, Chinese names, or pinyin initials — try <span className="font-mono text-[#195d44]">fq</span>.</p>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.13em] text-[#9b8b78]">Choose a mode first</span>
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
              <label className="mt-4 flex items-center gap-2 rounded-xl border border-[#ded4c4] bg-[#fffdf8] px-3.5 py-3"><Search size={16} className="shrink-0 text-[#9c8b77]" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search tomato, fq, 洋柿子..." className="min-w-0 flex-1 bg-transparent text-[13px] text-[#33291f] outline-none placeholder:text-[#aaa092]" aria-label="Search ingredients" /><span className="hidden rounded-md bg-[#f2e9dc] px-2 py-1 font-mono text-[9px] text-[#958471] sm:inline">⌘ K</span></label>
              <div className="mt-4"><div className="mb-2 flex items-center gap-2"><Sparkles size={14} className="text-[#e06b3f]" /><span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#8e7d69]">popular picks</span></div><div className="flex gap-2 overflow-x-auto pb-1">{quickPicks.map((id) => { const item = ingredientById.get(id); if (!item) return null; const picked = selected.includes(id); return <button key={id} type="button" onClick={() => toggleIngredient(id)} className={`shrink-0 rounded-full border px-3 py-2 text-[11px] font-semibold ${picked ? 'border-[#195d44] bg-[#195d44] text-[#fffaf1]' : 'border-[#d9cebd] bg-[#fffaf1] text-[#695947] hover:border-[#195d44]'}`}>{item.label}</button>; })}</div></div>
            </div>
            <div className="mt-6 space-y-6">{filteredCategories.length === 0 && <div className="flex flex-col items-center rounded-2xl border border-dashed border-[#cfc3b1] p-10 text-center">
              <DishIllustration dish="tomato-egg-rice" className="w-full max-w-[160px] mb-4 opacity-75 grayscale-[0.2]" />
              <p className="font-serif text-lg font-semibold text-[#44372b]">No ingredient found yet.</p>
              <p className="mt-1 text-[13px] text-[#877564]">Try another name or add it in Custom below.</p>
            </div>}{filteredCategories.map((category) => <div key={category.title}><div className="mb-3 flex items-baseline gap-2"><h3 className="font-serif text-[19px] font-semibold text-[#44372b]">{category.title}</h3><span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#a39380]">{category.eyebrow}</span></div><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{category.options.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} avoided={avoided.includes(option.id)} urgent={urgent.includes(option.id)} onToggle={() => toggleIngredient(option.id)} onUrgent={() => toggleUrgent(option.id)} />)}</div></div>)}</div>
          </div>

          <div><SectionHeading number="02" eyebrow="How are we cooking?" title="Kitchen tools" /><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">{toolOptions.map((option) => <OptionButton key={option.id} option={option} selected={selected.includes(option.id)} onToggle={() => toggleIngredient(option.id)} />)}</div></div>

          <div><SectionHeading number="03" eyebrow="Anything else counts" title="Custom" /><div className="rounded-[22px] border border-dashed border-[#cfc3b1] bg-[#f9f4eb] p-4 sm:p-5"><div className="flex gap-2"><input value={customInput} onChange={(event) => setCustomInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addCustom(); } }} placeholder="e.g. half a jar of pesto, leftover salmon" className="min-w-0 flex-1 rounded-xl border border-[#ded4c4] bg-[#fffdf8] px-3.5 py-3 text-[13px] text-[#33291f] placeholder:text-[#a99b89]" data-testid="input-custom-ingredient" aria-label="Add a custom ingredient" /><button type="button" onClick={addCustom} className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e06b3f] text-[#fffaf2] transition-transform hover:-translate-y-0.5" data-testid="button-add-custom" aria-label="Add custom ingredient"><Plus size={19} /></button></div>{customItems.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{customItems.map((item) => <span key={item} className="inline-flex items-center gap-1.5 rounded-full bg-[#e8efd7] px-3 py-1.5 text-[11px] font-medium text-[#195d44]">{item}<button type="button" onClick={() => removeCustom(item)} className="rounded-full text-[#588063] hover:text-[#195d44]" aria-label={`Remove ${item}`}><X size={13} /></button></span>)}</div> : <p className="mt-3 text-[11px] text-[#9b8c79]">Add a leftover, a craving, or an ingredient that is not in the list.</p>}</div></div>
          <button type="button" onClick={() => navigate('/')} className="min-h-11 rounded-xl bg-[#195d44] px-5 py-3 text-sm font-semibold text-white">Done · Back to home</button>
        </section>}

        <aside className="lg:sticky lg:top-5 lg:self-start">
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
          <div className="mt-6 rounded-[22px] border border-[#ded6c8] bg-[#fbf8f1] p-5"><div className="flex items-start gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f5dfd1] text-[#e06b3f]"><HeartPulse size={17} /></span><div><p className="font-serif text-[17px] font-semibold text-[#42372b]">Use first, waste less</p><p className="mt-1.5 text-[12px] leading-5 text-[#857564]">Mark a selected item with the heart pulse. Recipes using it will rise to the top.</p></div></div></div>
        </aside>
      </div>

      </>}
      {isResults && <section id="ideas" tabIndex={-1} className="border-t border-[#ded6c8] bg-[#f1eadf] px-5 py-12 outline-none sm:px-8 lg:px-12 lg:py-16">
        <div className="mx-auto max-w-[1240px]">
          <div role="status" className="mb-6 rounded-2xl border border-[#195d44] bg-[#edf4e4] p-5 text-[#195d44]">
            <p className="text-lg font-bold">{generated ? `${displayedRecipes.length} matching recipes found` : 'Choose ingredients, then find your meal'}</p>
            <p className="mt-2 text-sm">{allRecipes.length} recipes available, including all 30 from your sheet. {generated && `Your ingredients: ${selectedLabels.join(', ') || customItems.join(', ') || 'none selected'}.`}</p>
            <p className="mt-2 text-sm">Basic seasonings count automatically unless marked “Avoid”. Other missing ingredients are listed on each card. Strict match requires every main ingredient.</p>
          </div>
          <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><div><p className="font-mono text-[10px] uppercase tracking-[0.17em] text-[#e06b3f]">04 / the good part</p><h2 className="mt-2 font-serif text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[.94] tracking-[-0.05em] text-[#33291f]">{generated ? 'Here are a few places to start.' : 'Your next meal is hiding in here.'}</h2><p className="mt-3 max-w-[560px] text-[13px] leading-6 text-[#796a59]">{generated ? `Sorted for ${mode === 'fuzzy' ? 'flexible ideas' : mode === 'strict' ? 'your exact basket' : 'the fastest comfort'}${clearFridge && urgent.length ? ' · with use-first items up front' : ''}.` : 'Pick what you have, set a few boundaries, and open any result for step-by-step kitchen mode.'}</p></div><div className="flex flex-wrap gap-2"><FilterButton active={timeFilter === 'all'} onClick={() => setTimeFilter('all')}>Any time</FilterButton><FilterButton active={timeFilter === 'quick'} onClick={() => setTimeFilter('quick')}>15–20 min</FilterButton><FilterButton active={timeFilter === 'slow'} onClick={() => setTimeFilter('slow')}>30+ min</FilterButton></div></div>
          <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-[#ded3c4] bg-[#f9f4eb] p-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap items-center gap-2"><span className="flex items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8e7d69]"><CookingPot size={13} /> method</span>{(['all', 'stir-fry', 'steam', 'boil', 'no-cook', 'air-fryer', 'oven'] as MethodFilter[]).map((value) => <FilterButton key={value} active={methodFilter === value} onClick={() => setMethodFilter(value)}>{value === 'all' ? 'All' : value.replace('-', ' ')}</FilterButton>)}</div><div className="flex items-center gap-2 overflow-x-auto"><span className="flex shrink-0 items-center gap-1.5 px-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#8e7d69]"><Sparkles size={13} /> for</span>{(['all', 'beginner', 'high-protein', 'comfort'] as AudienceFilter[]).map((value) => <FilterButton key={value} active={audienceFilter === value} onClick={() => setAudienceFilter(value)}>{value === 'all' ? 'Everyone' : value.replace('-', ' ')}</FilterButton>)}</div></div>
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <button type="button" onClick={openBook} className="rounded-xl bg-[#195d44] px-4 py-3 font-semibold text-white">My recipe book ({savedRecipes.length})</button>
            <p role="status" className="text-sm text-[#195d44]">{bookNotice}</p>
            {storageError && <p role="alert" className="text-sm text-red-700">{storageError}</p>}
          </div>
          {generated && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{displayedRecipes.map((recipe, index) => <RecipeCard key={recipe.id} recipe={recipe} index={index} match={getMatch(recipe)} confirmed={savedIds.includes(recipe.id)} onConfirm={() => { if (confirm(recipe.id)) setBookNotice(`${recipe.title} added to My recipe book.`); }} onOpen={() => { setSelectedRecipe(recipe); setServings(recipe.baseServings); }} />)}</div>}
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
              {(timeFilter !== 'all' || methodFilter !== 'all' || audienceFilter !== 'all') && <button type="button" onClick={() => { setTimeFilter('all'); setMethodFilter('all'); setAudienceFilter('all'); }} className="rounded-xl border border-[#195d44] bg-white px-4 py-3 text-sm font-semibold text-[#195d44]">Clear recipe filters</button>}
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
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedRecipes.map((recipe) => <article key={recipe.id} data-testid={`saved-${recipe.id}`} className="rounded-2xl border border-[#ded6c8] bg-[#fffdf8] p-5">
              <p className="mb-2 text-xs font-semibold text-[#195d44]"><Check size={14} className="mr-1 inline" />Confirmed</p>
              <h3 className="font-serif text-xl font-semibold">{recipe.title}</h3>
              <p className="mt-2 text-sm text-[#766856]">{recipe.required.map((id) => ingredientById.get(id)?.label ?? id).join(', ')}</p>
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