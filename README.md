# iMIS SMS iPart

***This project documentation and code was generated with assistance from AI.***

A Vite + React iPart for the iMIS platform that allows staff to compose and send SMS messages to targeted member groups.

## Features

- Select a recipient group type: **Member**, **Committee**, or **iMIS Group** (dynamic)
- Refine recipients with a flexible **query builder** supporting async multi-select search, text, and date filters across member fields
- Compose messages with an **emoji picker** and a live character counter that adapts to GSM-7 (160 chars) or UCS-2 (70 chars) encoding
- Two authentication modes: **local** (OAuth2 password grant) and **cloud** (ASP.NET anti-forgery token)

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
    Client.ts                              # Axios instance with auth interceptor
  auth/
    imis/
      IAuthorization.ts                    # Auth strategy interface
      AuthorizationService.ts              # Factory — picks Local or Cloud strategy
      LocalAuthorization.ts                # OAuth2 password-grant (local dev)
      CloudAuthorization.ts                # ASP.NET request-verification token (cloud)
    airflow/
      IAuthorization.ts                    # Airflow credentials interface
      IJWT.ts                              # Airflow JWT response shape
      AuthorizationService.ts              # Fetches Airflow JWT
  components/
    SMS.tsx                                # Root form component — manages group type, query builder, and message state
    GroupTypeInput.tsx                     # Group type selector — fetches iMIS dynamic groups on mount
    SMSQueryBuilder.tsx                    # react-querybuilder wrapper with custom async multi-select value editor
    SMSMessageInput.tsx                    # SMS message textarea with emoji picker and live character counter
    AsyncQueryBuilderMultiSelect.tsx       # Reusable async multi-select (react-select) for use inside the query builder
    Example.tsx                            # Example component demonstrating API usage
    utils/
      FormHelpers.tsx                      # Shared constants, field definitions, async loader functions, and LoadOptionsMap
  models/
    Token.ts                               # iMIS OAuth2 token response model
  App.tsx
  main.tsx
```

## Query Builder

The query builder (`SMSQueryBuilder.tsx`) lets staff filter recipients before sending. It uses `react-querybuilder` with a custom `valueEditor` that routes `multiselect` fields through an async `react-select` dropdown (`AsyncQueryBuilderMultiSelect.tsx`).

Field definitions live in `FormHelpers.tsx` in two lists:
- `SMSQueryBuilderFields` — used for the **Member** and **iMIS Group** group types
- `SMSQueryBuilderCommitteeFields` — extends the above with committee-specific fields, used when **Committee** is selected

| Field | Type | Source |
|---|---|---|
| First Name | Text | — |
| Last Name | Text | — |
| Gender | Async multi-select | Static list |
| Nickname | Text | — |
| NRDS ID | Async multi-select | iMIS member lookup query |
| License Number | Text | — |
| Office | Async multi-select | iMIS office lookup query (search by name or `MajorKey`) |
| Local Association | Async multi-select | iMIS association lookup query |
| Member Type | Async multi-select | Static list |
| Secondary Out of State | Async multi-select | Static list (True/False) |
| License State | Async multi-select | iMIS state lookup query |
| Join Date | Date | — |
| Committee Name *(committee only)* | Async multi-select | iMIS committee lookup query |
| Committee Position *(committee only)* | Async multi-select | iMIS committee position lookup query |

### Adding a new async multi-select field

1. Write a `loadXxx` async function in `FormHelpers.tsx` that calls `api.get('/Query', ...)` and maps the response to `{ label, value }[]`.
2. Add the field to `SMSQueryBuilderFields` (or `SMSQueryBuilderCommitteeFields`) with `valueEditorType: 'multiselect'`.
3. Add an entry to `LoadOptionsMap` in `FormHelpers.tsx` keyed by the exact field `name`.

### Adding a new text/date/static field

1. Add the field to `SMSQueryBuilderFields` in `FormHelpers.tsx` — no `valueEditorType` needed for plain text or date fields.
2. For a static list without async search, add `values: [...]` to the field definition.

## Environment Configuration

The project uses Vite's environment modes to switch behavior between local development and deployed environments. Environment files go in the project root (next to `package.json`). Copy the appropriate `.env.*.example` file and fill in values.

> **Important:** Always restart the dev server after modifying `.env` files. Vite only reads them at startup.

### `.env.development`

Used during local development (`npm run dev` and `npm run build:dev`).

```
VITE_AUTH_MODE=local
VITE_AUTH_URL=https://your-imis-instance.com/token
VITE_API_URL=/api
VITE_AUTH_USERNAME=your-username
VITE_AUTH_PASSWORD=your-password
VITE_IMIS_BASE_URL=https://your-imis-instance.com

# iMIS Query names (configured in iMIS Query Manager)
VITE_IMIS_DYNAMIC_GROUP_LOOKUP_QUERY=YourDynamicGroupQuery
VITE_IMIS_ASSOCIATION_LOOKUP_QUERY=YourAssociationQuery
VITE_IMIS_COMMITTEE_LOOKUP_QUERY=YourCommitteeQuery
VITE_IMIS_COMMITTEE_NAME_LOOKUP_QUERY=YourCommitteeNameQuery
VITE_IMIS_COMMITTEE_POSITION_LOOKUP_QUERY=YourCommitteePositionQuery
VITE_IMIS_OFFICE_LOOKUP_QUERY=YourOfficeQuery
VITE_IMIS_MEMBER_LOOKUP_QUERY=YourMemberQuery
VITE_IMIS_STATE_LOOKUP_QUERY=YourStateQuery

# Airflow credentials (if applicable)
VITE_AIRFLOW_BASE_URL=https://your-airflow-instance.com
VITE_AIRFLOW_USERNAME=your-airflow-username
VITE_AIRFLOW_PASSWORD=your-airflow-password
```

### `.env.uat` and `.env.production`

Used for UAT and production builds. Set `VITE_AUTH_MODE` to `uat` or `production`. All `VITE_IMIS_*_QUERY` variables must match the query names configured in the target iMIS environment.

```
VITE_AUTH_MODE=uat
VITE_API_URL=/api
VITE_IMIS_BASE_URL=https://your-uat-imis-instance.com
# ... same VITE_IMIS_* query names as development
```

> **Note:** Only variables prefixed with `VITE_` are exposed to client code. Auth credentials in `.env.development` are used server-side by the Vite proxy and are never included in the browser bundle.

## Authentication

The project supports two authentication strategies, selected at build time via `VITE_AUTH_MODE`:

### Local Development (`VITE_AUTH_MODE=local`)

`LocalAuthorization` exchanges a username and password for a bearer token via the iMIS token endpoint. Credentials are stored in `.env.development` and proxied through Vite's dev server to avoid CORS issues. The Axios interceptor attaches the token as:

```
Authorization: Bearer <token>
```

### Production / UAT

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
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |

### `package.json` scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "build:dev": "vite build --mode development",
    "build:uat": "vite build --mode uat",
    "build:prod": "vite build --mode production",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

## API Client

The Axios client (`src/api/Client.ts`) is pre-configured with:

- A `baseURL` from `VITE_API_URL`
- An interceptor that automatically attaches the correct auth header based on the environment
- `Content-Type: application/json` default header

Import and use it in any component or service:

```typescript
import api from '../api/Client';

const response = await api.get('/Query', { params: { QueryName: 'YourQueryName' } });
```

## Adding API Endpoints

Group related endpoints in `src/api/`:

```typescript
// src/api/smsApi.ts
import api from './Client';

export const smsApi = {
  sendSMS: (payload: object) => api.post('/sms/send', payload),
};
```

## Deployment

1. Run the appropriate build command (`npm run build:prod` or `npm run build:uat`).
2. The output is in the `dist/` folder — static HTML, JS, and CSS files.
3. Deploy the contents of `dist/` to your iMIS instance as an iPart.
4. Ensure the host page includes the hidden `__RequestVerificationToken` element for authentication.

## Key Dependencies

- **React 19** — UI framework
- **TypeScript** — Type safety
- **Vite** — Build tool and dev server
- **Axios** — HTTP client
- **react-querybuilder** — Configurable query builder UI
- **react-select** — Async, searchable, multi-select dropdowns (`AsyncQueryBuilderMultiSelect`)
- **@emoji-mart/react** + **@emoji-mart/data** — Emoji picker with cursor-position insertion

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

Keep the `.env.*.example` files with placeholder values checked in for reference.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

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
