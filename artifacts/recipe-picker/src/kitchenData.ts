import {
  Apple,
  Bean,
  CookingPot,
  Egg,
  Fish,
  Flame,
  Leaf,
  Soup,
  Sprout,
  Utensils,
  Wheat,
  type LucideIcon,
} from 'lucide-react';
import sheetRecipes from './data/sheetRecipes.json';

export type RecipeMethod = 'stir-fry' | 'steam' | 'boil' | 'no-cook' | 'air-fryer' | 'oven';
export type RecipeAudience = 'beginner' | 'high-protein' | 'comfort';

export type Ingredient = {
  id: string;
  label: string;
  category: string;
  note: string;
  aliases: string[];
  icon: LucideIcon;
};

export type Amount = {
  id: string;
  label: string;
  quantity: number;
  unit: string;
};

export type Step = {
  title: string;
  instruction: string;
  minutes?: number;
};

export type Recipe = {
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
  calories: number;
  healthTags: string[];
};

type SheetRecipe = {
  id: string;
  title: string;
  cuisine: string;
  proteinGroup: string;
  required: string[];
  calories: number;
  healthTags: string[];
  method: RecipeMethod;
  time: number;
  audience: RecipeAudience[];
  ingredientsRaw: string;
};

export const categories: { title: string; eyebrow: string; ids: string[] }[] = [
  { title: 'Vegetables & mushrooms', eyebrow: 'produce drawer', ids: ['asparagus', 'bean-sprouts', 'bell-pepper', 'bok-choy', 'broccoli', 'cabbage', 'carrot', 'cauliflower', 'celery', 'cucumber', 'eggplant', 'garlic', 'green-beans', 'green-onion', 'lettuce', 'mushroom', 'onion', 'romaine', 'spinach', 'tomato', 'zucchini'] },
  { title: 'Meat & poultry', eyebrow: 'protein shelf', ids: ['beef', 'ground-beef', 'pork', 'ground-pork', 'pork-chops', 'pork-sausage', 'chicken', 'ground-chicken', 'ground-turkey', 'lamb', 'ground-lamb'] },
  { title: 'Fish & seafood', eyebrow: 'from the sea', ids: ['shrimp', 'fish', 'salmon', 'cod', 'mussels'] },
  { title: 'Beans & tofu', eyebrow: 'plant-forward', ids: ['peas', 'tofu', 'chickpeas', 'black-beans'] },
  { title: 'Eggs & dairy', eyebrow: 'fridge friends', ids: ['eggs', 'butter', 'cheese', 'cheddar', 'cream', 'sour-cream'] },
  { title: 'Staples', eyebrow: 'pantry shelf', ids: ['rice', 'arborio-rice', 'pasta', 'egg-noodles', 'ramen-noodles', 'rice-noodles', 'tortilla', 'potato', 'sweet-potato', 'flour'] },
  { title: 'Fruit', eyebrow: 'bright extras', ids: ['avocado', 'lemon', 'pear', 'pineapple'] },
  { title: 'Herbs, sauces & extras', eyebrow: 'flavor makers', ids: ['basil', 'cilantro', 'ginger', 'lemongrass', 'chili-bean-paste', 'coconut-milk', 'miso', 'red-curry-paste', 'bbq-sauce', 'peanut-butter', 'tahini'] },
];

export const ingredients: Ingredient[] = [
  { id: 'asparagus', label: 'Asparagus', note: 'springy + green', aliases: ['asparagus'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'bean-sprouts', label: 'Bean sprouts', note: 'crisp + light', aliases: ['bean sprouts', 'beansprouts'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'bell-pepper', label: 'Bell pepper', note: 'sweet crunch', aliases: ['bell pepper', 'pepper'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'bok-choy', label: 'Bok choy', note: 'tender greens', aliases: ['bok choy', 'bokchoi', 'pak choi'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'broccoli', label: 'Broccoli', note: 'green + crisp', aliases: ['broccoli'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'cabbage', label: 'Cabbage', note: 'sweet + sturdy', aliases: ['cabbage'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'carrot', label: 'Carrot', note: 'sweet crunch', aliases: ['carrot'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'cauliflower', label: 'Cauliflower', note: 'mild + hearty', aliases: ['cauliflower'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'celery', label: 'Celery', note: 'fresh + aromatic', aliases: ['celery'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'cucumber', label: 'Cucumber', note: 'cool + crisp', aliases: ['cucumber'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'eggplant', label: 'Eggplant', note: 'silky when cooked', aliases: ['eggplant', 'aubergine'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'garlic', label: 'Garlic', note: 'one clove is plenty', aliases: ['garlic'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'green-beans', label: 'Green beans', note: 'snappy + green', aliases: ['green beans', 'green bean'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'green-onion', label: 'Green onion', note: 'fresh finish', aliases: ['green onion', 'green onions', 'scallion', 'spring onion'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'lettuce', label: 'Lettuce', note: 'cool wraps', aliases: ['lettuce'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'mushroom', label: 'Mushrooms', note: 'deep + savory', aliases: ['mushroom', 'mushrooms'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'onion', label: 'Onion', note: 'the good base', aliases: ['onion'], category: 'Vegetables & mushrooms', icon: Sprout },
  { id: 'romaine', label: 'Romaine', note: 'crunchy leaves', aliases: ['romaine', 'romaine lettuce'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'spinach', label: 'Spinach', note: 'wilts in seconds', aliases: ['spinach'], category: 'Vegetables & mushrooms', icon: Leaf },
  { id: 'tomato', label: 'Tomatoes', note: 'juicy + bright', aliases: ['tomato', 'tomatoes'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'zucchini', label: 'Zucchini', note: 'mild + quick', aliases: ['zucchini', 'courgette'], category: 'Vegetables & mushrooms', icon: Apple },
  { id: 'beef', label: 'Beef', note: 'quick-cooking cuts', aliases: ['beef'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-beef', label: 'Ground beef', note: 'fast + versatile', aliases: ['ground beef', 'minced beef'], category: 'Meat & poultry', icon: Utensils },
  { id: 'pork', label: 'Pork', note: 'thin slices work', aliases: ['pork'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-pork', label: 'Ground pork', note: 'juicy + quick', aliases: ['ground pork', 'minced pork'], category: 'Meat & poultry', icon: Utensils },
  { id: 'pork-chops', label: 'Pork chops', note: 'pan-ready', aliases: ['pork chops', 'pork chop'], category: 'Meat & poultry', icon: Utensils },
  { id: 'pork-sausage', label: 'Pork sausage', note: 'savory + filling', aliases: ['pork sausage', 'sausage'], category: 'Meat & poultry', icon: Utensils },
  { id: 'chicken', label: 'Chicken', note: 'thighs or breast', aliases: ['chicken'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-chicken', label: 'Ground chicken', note: 'lean + light', aliases: ['ground chicken', 'minced chicken'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-turkey', label: 'Ground turkey', note: 'lean poultry', aliases: ['ground turkey', 'turkey'], category: 'Meat & poultry', icon: Utensils },
  { id: 'lamb', label: 'Lamb', note: 'rich + warming', aliases: ['lamb'], category: 'Meat & poultry', icon: Utensils },
  { id: 'ground-lamb', label: 'Ground lamb', note: 'kofta-ready', aliases: ['ground lamb', 'minced lamb'], category: 'Meat & poultry', icon: Utensils },
  { id: 'shrimp', label: 'Shrimp', note: 'cooks in minutes', aliases: ['shrimp', 'prawn'], category: 'Fish & seafood', icon: Fish },
  { id: 'fish', label: 'Fish', note: 'fillets welcome', aliases: ['fish'], category: 'Fish & seafood', icon: Fish },
  { id: 'salmon', label: 'Salmon', note: 'rich + tender', aliases: ['salmon'], category: 'Fish & seafood', icon: Fish },
  { id: 'cod', label: 'Cod', note: 'mild white fish', aliases: ['cod'], category: 'Fish & seafood', icon: Fish },
  { id: 'mussels', label: 'Mussels', note: 'briny + quick', aliases: ['mussels', 'mussel'], category: 'Fish & seafood', icon: Fish },
  { id: 'peas', label: 'Peas', note: 'sweet + easy', aliases: ['peas', 'pea'], category: 'Beans & tofu', icon: Bean },
  { id: 'tofu', label: 'Tofu', note: 'soft or firm', aliases: ['tofu'], category: 'Beans & tofu', icon: Bean },
  { id: 'chickpeas', label: 'Chickpeas', note: 'hearty pantry staple', aliases: ['chickpeas', 'chickpea'], category: 'Beans & tofu', icon: Bean },
  { id: 'black-beans', label: 'Black beans', note: 'rich + creamy', aliases: ['black beans', 'black bean'], category: 'Beans & tofu', icon: Bean },
  { id: 'eggs', label: 'Eggs', note: 'the great fixer', aliases: ['egg', 'eggs'], category: 'Eggs & dairy', icon: Egg },
  { id: 'butter', label: 'Butter', note: 'a little richness', aliases: ['butter'], category: 'Eggs & dairy', icon: Soup },
  { id: 'cheese', label: 'Cheese', note: 'something melty', aliases: ['cheese'], category: 'Eggs & dairy', icon: Soup },
  { id: 'cheddar', label: 'Cheddar', note: 'sharp melt', aliases: ['cheddar', 'cheddar cheese'], category: 'Eggs & dairy', icon: Soup },
  { id: 'cream', label: 'Cream', note: 'silky finish', aliases: ['cream', 'heavy cream'], category: 'Eggs & dairy', icon: Soup },
  { id: 'sour-cream', label: 'Sour cream', note: 'cool + tangy', aliases: ['sour cream'], category: 'Eggs & dairy', icon: Soup },
  { id: 'rice', label: 'Rice', note: 'white, brown, sticky', aliases: ['rice'], category: 'Staples', icon: Wheat },
  { id: 'arborio-rice', label: 'Arborio rice', note: 'risotto grain', aliases: ['arborio rice', 'arborio', 'risotto rice'], category: 'Staples', icon: Wheat },
  { id: 'pasta', label: 'Pasta', note: 'pantry reliable', aliases: ['pasta', 'spaghetti'], category: 'Staples', icon: Wheat },
  { id: 'egg-noodles', label: 'Egg noodles', note: 'springy strands', aliases: ['egg noodles', 'egg noodle'], category: 'Staples', icon: Wheat },
  { id: 'ramen-noodles', label: 'Ramen noodles', note: 'slurpable bowls', aliases: ['ramen noodles', 'ramen'], category: 'Staples', icon: Wheat },
  { id: 'rice-noodles', label: 'Rice noodles', note: 'light + quick', aliases: ['rice noodles', 'rice noodle'], category: 'Staples', icon: Wheat },
  { id: 'tortilla', label: 'Tortilla', note: 'wrap it up', aliases: ['tortilla'], category: 'Staples', icon: Wheat },
  { id: 'potato', label: 'Potatoes', note: 'always dependable', aliases: ['potato', 'potatoes'], category: 'Staples', icon: Apple },
  { id: 'sweet-potato', label: 'Sweet potato', note: 'sweet + filling', aliases: ['sweet potato', 'sweet potatoes'], category: 'Staples', icon: Apple },
  { id: 'flour', label: 'Flour', note: 'for pancakes and batter', aliases: ['flour'], category: 'Staples', icon: Wheat },
  { id: 'avocado', label: 'Avocado', note: 'creamy + rich', aliases: ['avocado'], category: 'Fruit', icon: Apple },
  { id: 'lemon', label: 'Lemon', note: 'a bright finish', aliases: ['lemon'], category: 'Fruit', icon: Apple },
  { id: 'pear', label: 'Pear', note: 'sweet + juicy', aliases: ['pear'], category: 'Fruit', icon: Apple },
  { id: 'pineapple', label: 'Pineapple', note: 'tropical brightness', aliases: ['pineapple'], category: 'Fruit', icon: Apple },
  { id: 'basil', label: 'Basil', note: 'fresh + fragrant', aliases: ['basil'], category: 'Herbs, sauces & extras', icon: Leaf },
  { id: 'cilantro', label: 'Cilantro', note: 'bright herbs', aliases: ['cilantro', 'coriander'], category: 'Herbs, sauces & extras', icon: Leaf },
  { id: 'ginger', label: 'Ginger', note: 'warm + sharp', aliases: ['ginger'], category: 'Herbs, sauces & extras', icon: Sprout },
  { id: 'lemongrass', label: 'Lemongrass', note: 'citrus perfume', aliases: ['lemongrass', 'lemon grass'], category: 'Herbs, sauces & extras', icon: Leaf },
  { id: 'chili-bean-paste', label: 'Chili bean paste', note: 'savory heat', aliases: ['chili bean paste', 'doubanjiang'], category: 'Herbs, sauces & extras', icon: Flame },
  { id: 'coconut-milk', label: 'Coconut milk', note: 'creamy + mellow', aliases: ['coconut milk'], category: 'Herbs, sauces & extras', icon: Soup },
  { id: 'miso', label: 'Miso', note: 'deep broth', aliases: ['miso'], category: 'Herbs, sauces & extras', icon: Soup },
  { id: 'red-curry-paste', label: 'Red curry paste', note: 'Thai heat', aliases: ['red curry paste', 'curry paste'], category: 'Herbs, sauces & extras', icon: Flame },
  { id: 'bbq-sauce', label: 'BBQ sauce', note: 'sweet smoke', aliases: ['bbq sauce', 'barbecue sauce'], category: 'Herbs, sauces & extras', icon: Flame },
  { id: 'peanut-butter', label: 'Peanut butter', note: 'rich sauce base', aliases: ['peanut butter'], category: 'Herbs, sauces & extras', icon: Bean },
  { id: 'tahini', label: 'Tahini', note: 'nutty drizzle', aliases: ['tahini', 'sesame paste'], category: 'Herbs, sauces & extras', icon: Bean },
  { id: 'soy-sauce', label: 'Soy sauce', note: 'instant depth', aliases: ['soy', 'soy sauce'], category: 'Seasonings & herbs', icon: Soup },
  { id: 'vinegar', label: 'Vinegar', note: 'a bright finish', aliases: ['vinegar'], category: 'Seasonings & herbs', icon: Soup },
  { id: 'oil', label: 'Cooking oil', note: 'for the hot pan', aliases: ['oil', 'cooking oil'], category: 'Seasonings & herbs', icon: CookingPot },
  { id: 'salt', label: 'Salt', note: 'always nearby', aliases: ['salt'], category: 'Seasonings & herbs', icon: Soup },
];

export const ingredientById = new Map(ingredients.map((item) => [item.id, item]));

export const defaultPantry = new Set(['salt', 'oil', 'soy-sauce', 'vinegar']);
export const quickPicks = ['eggs', 'tomato', 'potato', 'garlic', 'pork'];

const KEY_PROTEIN_CATEGORIES = new Set(['Meat & poultry', 'Fish & seafood']);
const KEY_STAPLE_CATEGORY = 'Staples';

export function isKeyMatchIngredient(id: string) {
  const item = ingredientById.get(id);
  if (!item) return false;
  return KEY_PROTEIN_CATEGORIES.has(item.category) || item.category === KEY_STAPLE_CATEGORY;
}

export function ingredientMatchWeight(id: string) {
  const item = ingredientById.get(id);
  if (!item) return 1;
  if (KEY_PROTEIN_CATEGORIES.has(item.category)) return 4;
  if (item.category === KEY_STAPLE_CATEGORY) return 3;
  if (defaultPantry.has(id)) return 0.5;
  return 1;
}

export function weightedMatchScore(required: string[], owned: Iterable<string>) {
  const ownedSet = owned instanceof Set ? owned : new Set(owned);
  const total = required.reduce((sum, id) => sum + ingredientMatchWeight(id), 0);
  if (total <= 0) return 0;
  const earned = required.reduce((sum, id) => sum + (ownedSet.has(id) ? ingredientMatchWeight(id) : 0), 0);
  return Math.round((earned / total) * 100);
}

const groupAccents: Record<string, string> = {
  Beef: '#c87952',
  Pork: '#b8753b',
  Poultry: '#6e9541',
  Lamb: '#8f6e4b',
  Seafood: '#d97755',
  Vegetarian: '#58a474',
};

const groupIcons: Record<string, LucideIcon> = {
  Beef: Utensils,
  Pork: Utensils,
  Poultry: Utensils,
  Lamb: Utensils,
  Seafood: Fish,
  Vegetarian: Leaf,
};

const tomatoEggRiceDetail: Pick<Recipe, 'description' | 'ingredients' | 'steps' | 'substitutes' | 'optional'> = {
  description: 'Soft eggs, glossy tomatoes, and warm rice make the kind of dinner that always works.',
  optional: ['onion'],
  ingredients: [
    { id: 'tomato', label: 'Tomatoes', quantity: 2, unit: 'medium' },
    { id: 'eggs', label: 'Eggs', quantity: 3, unit: 'large' },
    { id: 'rice', label: 'Cooked rice', quantity: 300, unit: 'g' },
    { id: 'green-onion', label: 'Green onion', quantity: 2, unit: 'stalks' },
    { id: 'oil', label: 'Cooking oil', quantity: 1, unit: 'tbsp' },
    { id: 'soy-sauce', label: 'Soy sauce', quantity: 1, unit: 'tsp' },
  ],
  steps: [
    { title: 'Prep', instruction: 'Cut the tomatoes into wedges, slice the green onion, and whisk the eggs with a pinch of salt.' },
    { title: 'Soft scramble', instruction: 'Heat oil in a pan. Cook the eggs until just set, then slide them onto a plate.', minutes: 2 },
    { title: 'Bring it together', instruction: 'Cook tomatoes until jammy. Return the eggs, add rice and soy sauce, and toss until hot. Finish with green onion.', minutes: 5 },
  ],
  substitutes: [{ missing: 'Soy sauce', replacement: 'Use a pinch of salt plus a splash of water.' }],
};

function labelsFor(ids: string[]) {
  return ids.map((id) => ingredientById.get(id)?.label.toLowerCase() ?? id);
}

function makeRecipe(recipe: SheetRecipe): Recipe {
  const detail = recipe.id === 'tomato-egg-rice' ? tomatoEggRiceDetail : undefined;
  return {
    id: recipe.id,
    title: recipe.title,
    description: detail?.description ?? `A ${recipe.cuisine} kitchen idea built around ${labelsFor(recipe.required).join(', ')}.`,
    time: recipe.id === 'tomato-egg-rice' ? 15 : recipe.time,
    method: recipe.method,
    tags: [recipe.cuisine, recipe.proteinGroup],
    audience: recipe.audience,
    required: recipe.required,
    optional: detail?.optional ?? [],
    accent: groupAccents[recipe.proteinGroup] ?? '#8f6e4b',
    icon: groupIcons[recipe.proteinGroup] ?? CookingPot,
    baseServings: 2,
    ingredients: detail?.ingredients ?? recipe.required.map((id) => ({ id, label: ingredientById.get(id)?.label ?? id, quantity: 1, unit: 'as needed' })),
    steps: detail?.steps ?? [
      { title: 'Recipe sheet reference', instruction: 'Your recipe sheet lists the main ingredients, calories, and health tags, but does not provide quantities or cooking instructions. Use the YouTube tutorial link for the full method. Times shown are estimates.' },
    ],
    substitutes: detail?.substitutes ?? [],
    calories: recipe.calories,
    healthTags: recipe.healthTags,
  };
}

export const allRecipes: Recipe[] = (sheetRecipes as SheetRecipe[]).map(makeRecipe);

export function expandOwnedIngredients(ids: Iterable<string>) {
  const owned = new Set(ids);
  if (owned.has('salmon') || owned.has('cod')) owned.add('fish');
  if (owned.has('cheddar')) owned.add('cheese');
  return owned;
}

export function healthTagClass(tag: string) {
  return tag === 'High-Calorie Alert'
    ? 'rounded-full bg-[#f8ead6] px-2.5 py-1 text-[10px] font-medium text-[#9a6a28]'
    : 'rounded-full bg-[#edf4e4] px-2.5 py-1 text-[10px] font-medium text-[#416847]';
}
