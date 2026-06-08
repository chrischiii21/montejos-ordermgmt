# Astro Starter Kit: Basics

```sh
bun create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `bun install`             | Installs dependencies                            |
| `bun dev`             | Starts local dev server at `localhost:4321`      |
| `bun build`           | Build your production site to `./dist/`          |
| `bun preview`         | Preview your build locally, before deploying     |
| `bun astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## Netlify Deployment

Quick steps to prepare and deploy this Astro app to Netlify:

- Install Netlify CLI (optional but recommended for manual deploys):

```bash
npm install -g netlify-cli
```

- (Optional) Install the Astro Netlify adapter to enable server-side routes:

```bash
npm install -D @astrojs/netlify
```

Then update `astro.config.mjs` to use the Netlify adapter instead of Vercel. Example:

```js
import { defineConfig } from 'astro/config';
import netlify from '@astrojs/netlify';

export default defineConfig({
	output: 'server',
	adapter: netlify(),
});
```

- Build and deploy:

```bash
npm run build
npm run netlify:deploy
```

Notes:
- If you keep using the Vercel adapter locally, Netlify will still be able to deploy a static build. For server routes under `src/pages/api` you should install and configure the Netlify adapter above.
- The `netlify.toml` at the project root contains defaults (`command = "npm run build"`, `publish = "dist"`).

