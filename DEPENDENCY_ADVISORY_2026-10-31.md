# Mentenanta dependente — 31 octombrie 2026

Runda a fost autorizata explicit dupa identificarea unor vulnerabilitati high in ambele repository-uri. Au fost aplicate actualizarile compatibile cu intervalele existente, fara `--force`, `--legacy-peer-deps`, ignorari de advisory sau schimbarea pragurilor CI.

## Actualizari

- API npm: axios 1.21.0, follow-redirects 1.16.2, postcss 8.5.32 si actualizarile tranzitive compatibile. [GHSA-mrwp-f3q8-3g9p](https://github.com/advisories/GHSA-mrwp-f3q8-3g9p) este remediat. `npm audit --audit-level=high` raporteaza zero vulnerabilitati.
- API Composer: Laravel 13.39.0 si actualizarile tranzitive compatibile, inclusiv Symfony 8.1.10 si Carbon 3.15.1. `composer audit` nu raporteaza advisories sau pachete abandonate.
- Android: React Native si pachetele sale `@react-native/*` au fost actualizate impreuna la 0.88.1. React/react-test-renderer raman impreuna la 19.3.1, compatibil cu peerDependencies React Native. Reanimated 4.7.1 accepta Worklets 0.13.x; Worklets este 0.13.1. Au fost actualizate si React Query 5.105.0, Safe Area Context 5.11.0 si Screens 4.30.1.
- joi 17.13.9 remediaza [GHSA-4528-x5fx-h6hg](https://github.com/advisories/GHSA-4528-x5fx-h6hg). Frontendul trece pragul CI high, cu zero vulnerabilitati high/critical.

## Advisories ramase si impact

Auditul frontend raporteaza 40 de intrari: 6 low si 34 moderate. Acestea includ lanturile dependente ale urmatoarelor trei advisories tranzitive; nu reprezinta 40 de defecte independente in aplicatie.

| Advisory | Impact raportat | Situatie si actiunea urmatoare |
| --- | --- | --- |
| [deepmerge / GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) | Alterarea prototipului rezultatului la date controlate de atacator | Lanturile CLI/Jest nu au o remediere compatibila demonstrata. Nu se aplica retrogradarea majora CLI sugerata de npm. Se urmareste remedierea upstream. |
| [glob / GHSA-3g3m-2fjr-6pw4](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | Traversarea fisierelor poate continua dupa anularea unei operatii | Corectia publicata este 14.0.2, in afara intervalelor cerute de consumatorii existenti. Se asteapta consumatori compatibili actualizati sau o migrare majora verificata separat. |
| [minimatch / GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) | Consum excesiv de CPU/memorie pentru anumite sabloane controlate extern | Corectia publicata este 11.0.1, in afara intervalelor curente ale consumatorilor. Se urmareste actualizarea acestora; nu se forteaza un override major global. |

Expunerea practica depinde de datele procesate de uneltele CLI/Jest/ESLint si de lantul inclus in build. Trecerea auditului la prag high nu demonstreaza absenta exploatabilitatii in APK. Aceste advisories raman blocaje explicite pentru lansarea publica, conform AGENTS.md. Integrarea in main nu reprezinta lansare publica.

Versiunile majore Babel 8, resolvers 6, ESLint 10, TypeScript 7 si Guzzle 8 nu au fost aplicate. Verificarea iOS necesita macOS si nu este declarata executata pe Windows. Lockfile-urile actualizate se instaleaza in CI; validarea include suitele complete, tipuri, lint/Pint, build Android si build Vite. Rezultatele efective se consemneaza in pull request-urile acestei runde.
