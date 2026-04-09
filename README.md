# iMIS-iPart-Template

***This project documentation and code was generated with assistance from AI.***

# iMIS iPart Template — React TypeScript

A React TypeScript template for building iMIS iParts. This project uses Vite for development and builds to static HTML/JS/CSS that can be deployed as an iPart in iMIS.

To run locally `npm run dev`. Ensure that you are using the `.env.development` env file with `VITE_AUTH_MODE=local` and valid iMIS credentials.

To run in iMIS use `npm run build:uat` or `npm run build:prod`. This will automatically build, change asset paths, and zip the project for import into iMIS.

## Prerequisites

- **Node.js** (v20+ recommended)
- **fnm** or **nvm** for Node version management

### Installing fnm (recommended)

**Windows (PowerShell):**

```
winget install Schniz.fnm
```

Add to your PowerShell profile (`$PROFILE`):

```powershell
fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
```

**WSL / Linux:**

```bash
sudo apt update && sudo apt install -y curl unzip
curl -fsSL https://fnm.vercel.app/install | bash
source ~/.bashrc
```

Then install Node:

```bash
fnm install 20
fnm use 20
fnm default 20
```

## Project Structure

```
src/
  api/
    client.ts              # Axios instance with auth interceptor
  auth/
    imis/
      IAuthorization.ts      # Auth service interface
      AuthorizationService.ts # Factory — returns service based on environment
      LocalAuthorization.ts  # Dev: username/password → bearer token
      CloudAuthorization.ts  # Prod: reads token from hidden HTML element
  components/
    common/                # Reusable UI components
    graph/                 # React Flow graph components
    layout/                # Header, sidebar, app layout
    Example.tsx            # Example component demonstrating API usage
  hooks/                   # Custom React hooks
  models/                  # Domain models (mirror backend entities)
  types/                   # Utility types, API wrappers, UI types
  pages/                   # Top-level route components
  utils/                   # Formatters, constants
  App.tsx
  main.tsx
  vite-env.d.ts            # TypeScript declarations for Vite env variables
```

## Environment Configuration

The project uses Vite's environment modes to switch behavior between local development and deployed environments. Environment files go in the project root (next to `package.json`).

### `.env.development`

Used during local development (`npm run dev` and `npm run build:dev`).

```
VITE_AUTH_MODE=local
VITE_AUTH_URL=https://your-imis-instance.com/token
VITE_API_URL=/api
VITE_AUTH_USERNAME=your-username
VITE_AUTH_PASSWORD=your-password
VITE_PROXY_TARGET=https://your-imis-instance.com
```

### `.env.uat`

Used for UAT builds (`npm run build:uat`).

```
VITE_AUTH_MODE=prod
VITE_API_URL=/api
```

### `.env.production`

Used for production builds (`npm run build:prod`).

```
VITE_AUTH_MODE=prod
VITE_API_URL=/api
```

> **Note:** Only variables prefixed with `VITE_` are exposed to client code. Auth credentials in `.env.development` are used server-side by the Vite proxy and are never included in the browser bundle.

> **Important:** Always restart the dev server after modifying `.env` files. Vite only reads them at startup.

## Authentication

The project supports two authentication strategies, selected at build time via `VITE_AUTH_MODE`:

### Local Development (`VITE_AUTH_MODE=local`)

`LocalAuthorization` exchanges a username and password for a bearer token via the iMIS token endpoint. Credentials are stored in `.env.development` and proxied through Vite's dev server to avoid CORS issues. The Axios interceptor attaches the token as:

```
Authorization: Bearer <token>
```

### Production / UAT (`VITE_AUTH_MODE=prod`)

`CloudAuthorization` reads a request verification token from a hidden HTML element injected by the iMIS server:

```html
<input type="hidden" id="__RequestVerificationToken" value="..." />
```

The Axios interceptor attaches the token as:

```
RequestVerificationToken: <token>
```

## Vite Proxy (Local Development)

To bypass CORS restrictions when developing locally, the Vite dev server proxies API and token requests to the iMIS instance. This is configured in `vite.config.ts`:

```typescript
server: {
  proxy: {
    '/api': {
      target: env.VITE_PROXY_TARGET,
      changeOrigin: true,
      secure: false,
    },
    '/token': {
      target: env.VITE_PROXY_TARGET,
      changeOrigin: true,
      secure: false,
    },
  },
},
```

This proxy only runs during `npm run dev`. In production, the iPart is served from the same origin as the iMIS API, so no proxy is needed.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server with hot reload |
| `npm run build:dev` | Build with development environment |
| `npm run build:uat` | Build with UAT environment |
| `npm run build:prod` | Build for production |
| `npm run preview` | Preview the production build locally |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build:dev": "tsc -b && vite build --mode development",
    "build:uat": "tsc -b && vite build --mode uat",
    "build:prod": "tsc -b && vite build --mode production",
    "preview": "vite preview",
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

## API Client

The Axios client (`src/api/client.ts`) is pre-configured with:

- A `baseURL` from `VITE_API_URL`
- An interceptor that automatically attaches the correct auth header based on the environment
- `Content-Type: application/json` default header

Import and use it in any component or service:

```typescript
import api from '../api/client';

const response = await api.get('/party');
```

## Adding API Endpoints

Group related endpoints in `src/api/`:

```typescript
// src/api/partyApi.ts
import api from './client';
import { Party } from '../models/party';

export const partyApi = {
  getAll: () => api.get<Party[]>('/party'),
  getById: (id: string) => api.get<Party>(`/party/${id}`),
};
```

## Testing

The project uses Vitest with jsdom for testing. Tests live alongside source files or in `__tests__` directories.

```bash
npm run test       # watch mode
npm run test:run   # single run
```

## Deployment

1. Run the appropriate build command (`npm run build:prod` or `npm run build:uat`).
2. The output is in the `dist/` folder — static HTML, JS, and CSS files.
3. Deploy the contents of `dist/` to your iMIS instance as an iPart.
4. Ensure the host page includes the hidden `__RequestVerificationToken` element for authentication.

## Key Dependencies

- **React** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Axios** — HTTP client
- **Vitest** — Test runner
- **@xyflow/react** — Node-and-edge graph visualization (React Flow)

## `.gitignore` Notes

Ensure the following are in your `.gitignore`:

```
node_modules/
dist/
.env
.env.development
.env.uat
.env.production
.env*.local
```

Keep a `.env.example` with placeholder values checked in for reference.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
