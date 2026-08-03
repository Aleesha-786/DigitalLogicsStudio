# Frontend Folder Structure

```text
frontend/
|-- docs/                            # Project documentation
|-- public/                          # Static public assets
|   |-- favicon.ico                  # App favicon
|   |-- index.html                   # HTML template
|   |-- manifest.json                # Web app manifest
|   |-- og-image.png                 # Default Open Graph social preview
|   |-- robots.txt                   # Search engine crawler instructions
|   `-- sitemap.xml                  # Dynamic / static site map
|
|-- scripts/                         # Build & maintenance automation
|   |-- generateSeoAssets.js         # Generates SEO assets from route metadata
|   |-- runReactSnap.js              # Controls post-build prerendering workflows
|   `-- updateArithmeticPages.js     # Content maintenance script
|
|-- src/
|   |-- app/                         # Application orchestration & global shell
|   |   |-- providers/               # Global state wrappers (ThemeContext, UI providers)
|   |   |-- HomePage.jsx             # Landing page / dashboard hub
|   |   `-- routes.jsx               # Central route definitions with React lazy loading
|   |
|   |-- auth/                        # Global Auth Infrastructure
|   |   |-- components/              # ProtectedRoute.jsx, AuthModal, LoginForm
|   |   |-- context/                 # AuthContext.jsx
|   |   `-- services/                # authService.js (auth API endpoints)
|   |
|   |-- features/                    # Domain-driven Feature Pods (Independent Modules)
|   |   |-- arithmetic-hdls/         # Arithmetic functions & HDL tools
|   |   |-- boolean-algebra/         # Boolean algebra explorer & simplification engines
|   |   |-- boolforge/               # Boolforge interactive playground
|   |   |-- encoder-decoder/         # Encoder and Decoder visualizer
|   |   |-- kmap/                    # K-Map solver & generator
|   |   |-- memory/                  # Memory architecture modules
|   |   |-- multiplexers-demux/      # MUX and DEMUX interactive tools
|   |   |-- number-systems/          # Number systems converter & theory
|   |   |-- problems/                # Question bank, quizzes & challenge runner
|   |   |-- registers-transfers/     # Registers & RTL transfer simulators
|   |   |-- sequential-circuits/     # Sequential circuits & flip-flop tools
|   |   `-- trainer-board/           # Trainer Board virtual laboratory
|   |
|   |-- shared/                      # Universal UI primitives, cross-cutting logic & assets
|   |   |-- components/              # Design system primitives (TruthTables, KMapDisplay, ResultCards)
|   |   |-- constants/               # Feature catalog metadata & global configuration
|   |   |-- hooks/                   # Generic hooks (useDebounce, useLocalStorage)
|   |   |-- services/                # apiClient.js (Axios base), progressService.js
|   |   |-- styles/                  # Design tokens, CSS variables, and global resets
|   |   `-- utils/                   # Logic parsers, expression evaluation, math helpers
|   |
|   |-- seo/                         # Centralized SEO Metadata & Prerender Helpers
|   |   |-- seoCatalog.mjs           # Metadata map per route
|   |   `-- seoUtils.js              # Head management & prerender detection helpers
|   |
|   |-- App.css                      # Global layout shell styles
|   |-- App.jsx                      # Root application container
|   |-- index.css                    # Entry styles & CSS resets
|   `-- index.jsx                    # React DOM entry point
|
|-- .env.example                     # Frontend environment variables template
|-- package.json                     # Dependencies, scripts, and build lifecycles
|-- package-lock.json                # Locked dependency tree
|-- react-snap-routes.json           # Whitelisted routes for build-time static prerendering
`-- vercel.json                      # Vercel deployment & routing configuration

```

---

## Architectural Principles

### 1. Separation of Infrastructure vs. Learning Features

To keep domain-specific learning modules focused purely on educational tools, core infrastructure concerns operate at the top level under `src/`:

* **`src/auth/`**: Core user session management, API authentication services, and route protection guards (`ProtectedRoute.jsx`).
* **`src/seo/`**: Centralized metadata dictionary (`seoCatalog.mjs`) used both at runtime and during pre-build prerendering scripts.

### 2. Feature Pod Isolation

Every interactive workbench or learning topic lives inside `src/features/<feature-name>/` as an isolated module. Standard internal structure for a feature:

```text
src/features/kmap/
├── components/          # PRIVATE sub-components (e.g., KMapCell, KMapGrid)
├── hooks/               # PRIVATE feature hooks
├── styles/              # Scoped CSS Modules (e.g., KMap.module.css)
├── utils/               # Feature-specific calculation algorithms
├── KmapGenerator.jsx    # Feature entry view
└── index.js             # Public API barrel export

```

### 3. Public API Barrier (`index.js`)

External files MUST NOT import deeply from inside a feature's private subfolders. External access must go through the feature's `index.js`:

```javascript
// ✅ Allowed: Clean public import
import { KmapGenerator } from '@features/kmap';

// ❌ Forbidden: Deep internal import
import KMapCell from '@features/kmap/components/KMapCell';

```

### 4. Two-Tier Styling System

* **Shared Tier (`src/shared/styles/`)**: Holds design tokens, CSS variables (`var(--primary-color)`), dark mode definitions, and base resets.
* **Feature Tier (`src/features/*/styles/`)**: Co-located CSS Modules consuming shared variables.

---

## Directory & File Breakdown

### Root Configuration

* **`package.json`**: Defines dependencies and project scripts (`npm start`, `npm run build`, `npm test`, `npm run eject`).
* **`jsconfig.json`**: Configures clean path aliases to eliminate relative path clutter (`../../`).
* **`.env.example`**: Template documenting required environment variables (API endpoints, public base URLs).
* **`react-snap-routes.json`**: Pre-rendering route whitelist generated/used during build processes.
* **`vercel.json`**: Header overrides, rewrite rules, and static asset caching for deployment.

### `public/` & `scripts/`

* **`public/`**: Static files served directly by the server (icons, fallback HTML, manifest, SEO assets).
* **`scripts/`**: Build automation scripts:
* `generateSeoAssets.js`: Reads `seoCatalog.mjs` to create static meta files.
* `runReactSnap.js`: Manages post-build prerendering tasks.
* `updateArithmeticPages.js`: Content maintenance and page synchronization utility.

### Infrastructure (`src/app`, `src/auth`, `src/seo`)

* **`src/app/`**: Application shell setup containing global providers (`ThemeContext.jsx`), the main landing view (`HomePage.jsx`), and central route mapping (`routes.jsx`).
* **`src/auth/`**:
* `ProtectedRoute.jsx`: Higher-order component/guard restricting unauthenticated route access.
* `AuthContext.jsx`: Global context managing authentication state and tokens.
* `authService.js`: Network handlers for login, registration, and session renewal endpoints.

* **`src/seo/`**:
* `seoCatalog.mjs`: Central dictionary containing page titles, descriptions, and Open Graph parameters for all routes.
* `seoUtils.js`: Runtime head tag injection and static prerender environment detectors.

### Features (`src/features/`)

Isolated domain modules containing specialized interactive visualizers, simulators, and theory content:

* **`arithmetic-hdls/`**: Hardware description language converters and arithmetic visualizers.
* **`boolean-algebra/`**: Expression simplification tools, truth tables, and canonical form transformers.
* **`boolforge/`**: Interactive circuit and Boolean logic workbench.
* **`encoder-decoder/`**: Visualizers for digital binary encoders and decoders.
* **`kmap/`**: Karnaugh map matrix visualizer and solver engine.
* **`memory/`**: RAM, ROM, and memory matrix architecture visualizers.
* **`multiplexers-demux/`**: Multiplexer (MUX) and Demultiplexer (DEMUX) simulation tools.
* **`number-systems/`**: Radix conversions (Binary, Octal, Hex, Decimal) and representations.
* **`problems/`**: Practice question bank, quizzes, and automated submission grading.
* **`registers-transfers/`**: Shift registers and Register Transfer Logic (RTL) visualizers.
* **`sequential-circuits/`**: Flip-flops (SR, JK, D, T), counters, and state machine tools.
* **`trainer-board/`**: Virtual breadboard simulator and digital logic lab environment.

### Shared Domain (`src/shared/`)

Universal primitives reused across multiple feature pods:

* **`components/`**: Core reusable UI primitives (`TruthTable.jsx`, `KMapDisplay.jsx`, `ResultCard.jsx`, UI controls).
* **`constants/`**: Single sources of truth, such as feature catalog indexes for the homepage dashboard.
* **`services/`**:
* `apiClient.js`: Global Axios instance configured with base URLs and request/response interceptors.
* `progressService.js`: User progress tracking and local/remote state synchronization.

* **`styles/`**: Central CSS variable definitions for color palettes, spacing scales, and typography tokens.
* **`utils/`**: Shared algorithms including expression parsers, math helpers, analytics utilities, and search logic.

---
