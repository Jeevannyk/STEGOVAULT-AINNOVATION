# Graph Report - C:\Users\jeeva\git-workshop-24\StegoVault-AINNOVATION  (2026-06-07)

## Corpus Check
- Corpus is ~6,757 words - fits in a single context window. You may not need a graph.

## Summary
- 178 nodes · 197 edges · 24 communities (18 shown, 6 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 8,500 input · 2,200 output

## Community Hubs (Navigation)
- [[_COMMUNITY_React Frontend Components|React Frontend Components]]
- [[_COMMUNITY_Crypto & Stego Core|Crypto & Stego Core]]
- [[_COMMUNITY_Frontend Pkg Dependencies (nested)|Frontend Pkg Dependencies (nested)]]
- [[_COMMUNITY_React App Views & UI|React App Views & UI]]
- [[_COMMUNITY_Frontend Package (main)|Frontend Package (main)]]
- [[_COMMUNITY_AI Carrier Scoring|AI Carrier Scoring]]
- [[_COMMUNITY_Frontend DevDependencies|Frontend DevDependencies]]
- [[_COMMUNITY_Django Bootstrap|Django Bootstrap]]
- [[_COMMUNITY_App Entry Point|App Entry Point]]
- [[_COMMUNITY_ESLint & Build Config|ESLint & Build Config]]
- [[_COMMUNITY_Claude Dev Settings|Claude Dev Settings]]
- [[_COMMUNITY_MCP Server Config|MCP Server Config]]
- [[_COMMUNITY_Root Package|Root Package]]
- [[_COMMUNITY_Config Files|Config Files]]
- [[_COMMUNITY_Django Init|Django Init]]
- [[_COMMUNITY_World Map Component|World Map Component]]
- [[_COMMUNITY_React SVG Asset|React SVG Asset]]

## God Nodes (most connected - your core abstractions)
1. `App.jsx` - 24 edges
2. `devDependencies` - 13 edges
3. `devDependencies` - 10 edges
4. `views.py` - 10 edges
5. `analyze` - 8 edges
6. `package.json` - 7 edges
7. `ai_scorer` - 7 edges
8. `stego` - 7 edges
9. `encode` - 7 edges
10. `decode` - 7 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Steganographic Encode Pipeline** —  [INFERRED 0.85]
- **AI Carrier Scoring Metrics** —  [INFERRED 0.95]
- **Django Application Bootstrap** —  [INFERRED 0.95]
- **End-to-End Encode Pipeline** — app_jsx_EncodeModal, views_encode_view, readme_concept_aes256, readme_concept_lsb_stego [INFERRED 1.00]
- **End-to-End Decode Pipeline** — app_jsx_DecodeView, views_decode_view, readme_concept_lsb_stego, readme_concept_aes256 [INFERRED 1.00]
- **AI Carrier Analysis Pipeline** — app_jsx_AnalyzeView, views_analyze_view, readme_concept_ai_carrier_selection [INFERRED 1.00]

## Communities (24 total, 6 thin omitted)

### Community 0 - "React Frontend Components"
Cohesion: 0.09
Nodes (10): activityData, capacityData, ContextMenu(), GEO_DATA, linkPerfData, MOCK_SECRETS, ProfileDropdown(), TABS (+2 more)

### Community 1 - "Crypto & Stego Core"
Cohesion: 0.15
Nodes (23): bytes, str, bytes, str, AES-256-GCM Encryption, int, crypto, decrypt (+15 more)

### Community 2 - "Frontend Pkg Dependencies (nested)"
Cohesion: 0.09
Nodes (22): dependencies, react, react-dom, devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh (+14 more)

### Community 3 - "React App Views & UI"
Cohesion: 0.13
Nodes (21): AdvancedOptions, AnalyticsView, AnalyzeView, App, DecodeView, EncodeModal, EncodeView, FileDropZone (+13 more)

### Community 4 - "Frontend Package (main)"
Cohesion: 0.13
Nodes (14): dependencies, react, react-dom, name, private, scripts, build, dev (+6 more)

### Community 5 - "AI Carrier Scoring"
Cohesion: 0.21
Nodes (15): bytes, str, AI Carrier Scoring, LSB Steganography, float, ndarray, ai_scorer, analyze (+7 more)

### Community 6 - "Frontend DevDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+5 more)

### Community 7 - "Django Bootstrap"
Cohesion: 0.29
Nodes (7): AppConfig, manage.py, stegovault.settings, stegovault.urls, stegovault.wsgi, VaultConfig, VaultConfig

### Community 8 - "App Entry Point"
Cohesion: 0.33
Nodes (4): App, index.html, main.jsx, vite.svg

### Community 9 - "ESLint & Build Config"
Cohesion: 0.50
Nodes (5): eslint.config.js, stegovault-frontend package.json, package.json, root package.json, vite.config.js

### Community 10 - "Claude Dev Settings"
Cohesion: 0.50
Nodes (3): enabledMcpjsonServers, permissions, allow

## Knowledge Gaps
- **57 isolated node(s):** `allow`, `enabledMcpjsonServers`, `npx`, `name`, `private` (+52 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.