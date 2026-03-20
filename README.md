# Astro Starter Template

A production-ready Astro starter template with TypeScript, SCSS, Prettier, and GitHub Pages deployment.

## Setup

```bash
# Clone the template
git clone https://github.com/your-username/astro-starter.git my-site
cd my-site

# Install dependencies
yarn install

# Start dev server
yarn dev
```

## Configure for GitHub Pages

Update `astro.config.mjs` with your GitHub Pages URL:

```js
export default defineConfig({
  site: 'https://your-username.github.io',
  base: '/your-repo-name',
  // ...
})
```

Then enable GitHub Pages in your repository settings under **Settings > Pages > Source > GitHub Actions**.

## Scripts

| Command        | Description                         |
| -------------- | ----------------------------------- |
| `yarn dev`     | Start the dev server                |
| `yarn build`   | Build for production                |
| `yarn preview` | Preview the production build        |
| `yarn lint`    | Check code formatting with Prettier |
| `yarn format`  | Auto-format code with Prettier      |

## Stack

- [Astro](https://astro.build) — static site framework
- [TypeScript](https://www.typescriptlang.org) — strict mode
- [SCSS](https://sass-lang.com) — global styles + component-scoped
- [Prettier](https://prettier.io) — code formatting
