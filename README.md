# pinch & pan

A tiny English recipe notebook for the “what do I have?” moment.

Tell it what is already in your kitchen, set a health goal if you want one, and it suggests meals from a 100-dish catalog — with calorie estimates, health tags, and a YouTube search for each result.

**Live idea:** cook more with what you already have. Waste less. Make a sensible next meal.

Repository: [github.com/yulex-cmd/pick-pan](https://github.com/yulex-cmd/pick-pan)

## Features

- **Kitchen basket** — mark ingredients you have, ingredients you avoid, and items to use first
- **Basic seasonings on hand** — salt, cooking oil, soy sauce, and vinegar count automatically unless you mark them Avoid
- **Match modes**
  - **Fuzzy match** — flexible ideas; missing items are listed on each card
  - **Strict match** — only dishes whose main ingredients are all available
  - **Survival mode** — same basket matching, with quicker recipes sorted first
- **Health goals** — No preference, Lower calorie, Fat-loss friendly, Muscle-gain friendly, Balanced meal (same options on the home page and on the results page)
- **Results filters** — time, cooking method, and audience, on top of the goal filter
- **Calories and tags** — each dish shows a per-serving calorie estimate and the sheet’s health tags
- **Kitchen mode** — open a result for ingredients, steps when available, servings, a keep-awake option, and a YouTube tutorial link
- **My recipe book** — confirm a dish to save it in this browser (`localStorage`)

The UI is English-only.

## How matching works

1. Pick ingredients on `/ingredients`. Custom text only counts if it matches a listed ingredient name (or alias).
2. Choose a help mode on the home page (fuzzy / strict / survival).
3. Optionally set **What’s your goal today?**
4. Open **Find my next meal**. Results live at `/results`.

A recipe is a candidate when **at least one of your selected ingredients** appears in its required list. Basic seasonings alone are not a meal.

Match percentage is **weighted**. Meat, poultry, and seafood count most, then staples (rice, noodles, pasta, potato, and similar). Vegetables, aromatics, and pantry seasonings count less. A dish that is missing its main protein or staple is ranked below dishes that still have those key items, even if most of the other ingredients match.

| Goal | Keeps dishes tagged |
| --- | --- |
| No preference | All basket matches |
| Lower calorie | `Low-Calorie` |
| Fat-loss friendly | `Fat-Loss Friendly` |
| Muscle-gain friendly | `Muscle-Gain Friendly` |
| Balanced meal | `Balanced Choice` |

Goals chosen on the home page carry over to the results page. Changing the results filter updates the list immediately.

## Recipe catalog

The catalog is **100 dishes** generated from the uploaded workbook:

`attached_assets/菜谱_100道_含卡路里_健康标签.xlsx`

Runtime data lives in `artifacts/recipe-picker/src/data/sheetRecipes.json`.

**What the sheet supplies:** English titles, cuisines, main ingredients, calorie estimates, and health tags.

**What it does not supply:** precise quantities or full cooking methods (except Tomato Egg Rice, which has a detailed kitchen-mode recipe). Other dishes show an estimate time, list missing ingredients, and send you to YouTube for the method. Calories are **demo per-serving estimates**, not lab measurements.

Health tags used in the sheet:

- Low-Calorie
- Fat-Loss Friendly
- Muscle-Gain Friendly
- Balanced Choice
- High-Calorie Alert

## Pages

| Path | What you see |
| --- | --- |
| `/` | Home — basket summary, health goal, inspiration, match mode |
| `/ingredients` | Ingredient picker, tools, custom items |
| `/results` | Ranked / filtered meal ideas |
| `/recipes` | Confirmed dishes saved in this browser |

## Tech stack

- **App:** React 19, Vite 7, TypeScript, Tailwind CSS 4, wouter
- **Workspace:** pnpm, Node.js 24
- **Icons:** lucide-react

The product you use is the web artifact `@workspace/recipe-picker`. The repo is a pnpm workspace that also contains Replit scaffolding (`api-server`, `mockup-sandbox`, shared `lib/` packages). Those extras are **not required** to run pinch & pan locally.

## Project layout

```text
artifacts/recipe-picker/          # the app
  src/RecipePickerApp.tsx         # home, ingredients, results, recipe book
  src/kitchenData.ts              # ingredients, matching helpers, recipe mapping
  src/data/sheetRecipes.json      # 100-dish catalog
  src/components/                 # illustrations and UI
  src/useRecipeBook.ts            # localStorage recipe book
attached_assets/                  # source workbook
```

## Getting started

Use **pnpm**, not npm or yarn.

```bash
corepack enable
pnpm install
```

Start the recipe picker (Vite requires both env vars):

```bash
PORT=26110 BASE_PATH=/ pnpm --filter @workspace/recipe-picker run dev
```

Then open [http://127.0.0.1:26110/](http://127.0.0.1:26110/).

Other useful commands:

```bash
pnpm --filter @workspace/recipe-picker run typecheck
pnpm --filter @workspace/recipe-picker run build
```

Production build output: `artifacts/recipe-picker/dist/public`.

### Local install notes

This workspace was set up for Replit (Linux). `pnpm-workspace.yaml` pins platform optional-dependencies in a Linux-oriented way. If `vite` fails on macOS with a missing native binding (`@esbuild/darwin-arm64`, `lightningcss-darwin-arm64`, `@tailwindcss/oxide-darwin-arm64`, `@rollup/rollup-darwin-arm64`), install that package locally in the repo — do not commit those machine-specific fixes unless you intend to change the workspace for every platform.

## Suggested first path

1. On home, leave **Fuzzy match** selected (or pick Strict / Survival).
2. Optionally pick a health goal.
3. **Choose ingredients** — for example eggs and tomatoes.
4. **Done · Back to home**, then **Find my next meal**.
5. On results, filter by goal, time, or method.
6. Open **Cook this** or **YouTube**, or **Confirm choice** to save it.

## License

MIT. See `package.json`.
