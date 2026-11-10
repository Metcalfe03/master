# Fantasy Anime League

Fantasy Anime League (FAL) is a web app for drafting anime and competing with friends throughout an anime season. The planned app includes accounts, private leagues, snake drafts, weekly lineups, head-to-head matchups, and season standings.

## Current status

The project currently provides a working React and TypeScript foundation with a minimal startup page. Vite serves the app locally and updates the browser when source files change. ESLint, Prettier, TypeScript checks, and a production build command are configured.

The homepage design, navigation, accounts, league features, backend, and database are not implemented yet. Temporary AI-generated page concepts are indexed in [documents/designs](documents/designs/designGuide.md).

## Technology

| Area             | Technology                        | Status               |
| ---------------- | --------------------------------- | -------------------- |
| Frontend         | React 19, TypeScript 6, Vite 8    | Configured           |
| Styling          | CSS                               | Basic startup styles |
| Code checks      | ESLint, TypeScript                | Configured           |
| Formatting       | Prettier                          | Configured           |
| Shared UI styles | Bootstrap and CSS                 | Planned              |
| Backend          | NestJS and TypeScript             | Planned              |
| Database         | MySQL through Prisma              | Planned              |
| Automated tests  | Playwright and backend rule tests | Planned              |

## Run locally

Install Node.js 26 LTS, which includes npm. No database, API credentials, or backend server are needed for the current frontend.

Open a terminal in `fantasyAnimeLeague/`, the folder containing this README and `package.json`. From the repository root, enter it with:

```sh
cd fantasyAnimeLeague
```

Install the recorded dependencies and start the development server:

```sh
npm ci
npm run dev
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Keep the terminal running while developing; press **Control+C** to stop it. Saving a React or CSS file updates the browser automatically.

Run `npm ci` after cloning or when installing dependencies from an updated lockfile; it is not needed every time the server starts. If port 5173 is already in use, stop the existing server before starting another instance. The server listens only on your computer.

## File structure

Paths below are relative to `fantasyAnimeLeague/`.

```text
fantasyAnimeLeague/
├── app/
│   └── frontend/
│       └── react/
│           ├── index.html        HTML document and React container
│           ├── main.tsx          React entry point and shared CSS import
│           ├── app.tsx           Top-level component and startup page
│           ├── styles/
│           │   └── global.css    Shared page styles
│           ├── tsconfig.json     Frontend TypeScript settings
│           └── vite.config.ts    React plugin and local server settings
├── documents/
│   └── designs/                  Page concept images and image index
├── .vscode/settings.json         Project formatter and format-on-save settings
├── .gitignore                    Exclusions for local and generated files
├── .prettierignore               Files excluded from formatting
├── .prettierrc.json              Prettier configuration
├── eslint.config.mjs             JavaScript, TypeScript, and React lint rules
├── package.json                  Dependencies and npm commands
├── package-lock.json             Exact dependency versions for installation
└── README.md
```

The frontend starts with `index.html`, which loads `main.tsx`. That file starts React inside the HTML container and renders the `App` component from `app.tsx`. The component returns JSX: HTML-like markup that describes the interface. React components use `.tsx` files; ordinary TypeScript uses `.ts` files.

As features are added, complete screens belong in `app/frontend/react/pages/`, reusable interface elements in `components/`, and images, icons, and fonts in `assets/`.

The planned backend belongs in `app/backend/nestJs/`, Prisma schema and migrations in `app/backend/prisma/`, and automated tests in `app/tests/`. The browser will call the backend, and the backend will access MySQL through Prisma. Database contents are separate from the source code.

## Commands

Run these from `fantasyAnimeLeague/`.

| Command                | Purpose                                                                               |
| ---------------------- | ------------------------------------------------------------------------------------- |
| `npm ci`               | Install dependencies using the lockfile. Replaces an existing `node_modules/` folder. |
| `npm run dev`          | Start the local frontend at port 5173.                                                |
| `npm run lint`         | Check JavaScript, TypeScript, and React code without changing files.                  |
| `npm run typecheck`    | Check TypeScript without generating files.                                            |
| `npm run format:check` | Check formatting without changing files.                                              |
| `npm run format`       | Apply Prettier formatting to supported, non-excluded files.                           |
| `npm run build`        | Check TypeScript and build the frontend into `app/frontend/react/dist/`.              |
| `npm run preview`      | Serve an existing build locally at port 4173.                                         |

The preview server is for inspecting a build locally, not for production hosting. Automated application tests have not been added yet; linting and type checking do not replace behavior tests.

## Development configuration

There is one root `package.json` and lockfile for the app. Dependencies are saved at exact versions to keep installations consistent. React and React DOM render the browser interface; development dependencies provide the build and code-checking tools.

ESLint uses recommended JavaScript, TypeScript, and React rules. Prettier uses its default formatting style. The VS Code ESLint and Prettier extensions provide editor feedback; the npm commands also work without those extensions.

The `minimatch` override in `package.json` selects patched version 11.0.5 instead of 10.2.6 for the lint tools, addressing [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Because this crosses a major version boundary, verify lint behavior and file matching when changing those dependencies. Remove the override once the lint dependencies request a patched version themselves.

Keep source, configuration, and the lockfile in Git. Downloaded packages (`node_modules/`), generated builds (`dist/`), coverage output, and environment files are excluded. Never commit credentials or local database contents.
