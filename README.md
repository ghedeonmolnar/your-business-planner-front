# Your Business Planner Mobile

Aplicație React Native pentru administrarea internă a sălilor de evenimente.

Repository: [ghedeonmolnar/your-business-planner-front](https://github.com/ghedeonmolnar/your-business-planner-front), ramura principală `main`.

Navigarea principală: Agendă, Calendar, Rezervări, Clienți și Mai multe. Conturile personalului au acces numai la evenimentele și remunerația proprie.

API_URL se configurează în .env, respectiv .env.production. Aplicația nouă folosește numai backendul și baza de date separate Your Business Planner.

## Audit de securitate și CI

[AUDIT_SECURITATE_2026-10-21.md](AUDIT_SECURITATE_2026-10-21.md) documentează verificările și controalele de lansare. Workflow-ul quality verifică tipurile, lint-ul fără warnings, testele, build-ul Android, dependențele și secretele. [Verificarea dependențelor din 28 octombrie](docs/DEPENDENCY_ADVISORY_2026-10-28.md) consemnează rezultatul actual: pragul CI pentru severitate mare trece, iar advisory-ul tranzitiv de severitate mică fără remediere publicată rămâne blocaj pentru lansarea publică. Limitarea protecției automate a ramurii main rămâne documentată mai jos.

Logout elimină istoricul protejat și cache-ul, iar răspunsurile unei sesiuni vechi nu afectează o autentificare nouă. Tokenul este în Keychain și nu există credențiale SQL în aplicație. În producție, API_URL din .env.production trebuie să fie un URL HTTPS real.

## Instalare și pornire

Sunt necesare Node.js 22.13+, 24.3+ sau 26+, conform intervalului din package.json, și mediul React Native 0.88. Android folosește JDK 17+, compile SDK/Build Tools 37, target SDK 36 și Gradle 9.4.1. iOS necesită macOS, Xcode și CocoaPods.

Din rădăcina acestui repository:

```powershell
npm ci
Copy-Item .env.example .env
```

Configurează `API_URL` în `.env` pentru backendul Laravel disponibil. Exemplul inclus folosește adresa gazdei din emulatorul Android. Pentru un dispozitiv fizic sau simulatorul iOS, adaptează adresa la mediul tău. Backendul și baza de date se configurează separat.

Pornește Metro:

```powershell
npm start
```

În alt terminal, pornește aplicația Android:

```powershell
npm run android
```

Pe macOS, instalează dependențele native înainte de prima pornire iOS:

```sh
bundle install
cd ios
bundle exec pod install
cd ..
npm run ios
```

Pentru configurația de producție, creează `.env.production` din `.env.production.example` și setează URL-ul HTTPS al API-ului. Fișierele de mediu locale și cheile de semnare release sunt ignorate de Git. Cheia Android debug inclusă este numai pentru dezvoltare.

## Structură și convenții

- `src/app`: provideri și navigare.
- `src/features`: funcționalități, ecrane, formulare și acces API.
- `src/shared`: componente, temă, client HTTP, stocare și utilitare comune.
- `android` și `ios`: proiectele native; `assets`: fonturi, licențe și imagini.

Interfața folosește React Native Paper și tema centralizată Material Design 3 în modul luminos. Componentele comune extind Paper. După schimbarea dependențelor native trebuie reconstruită aplicația; pe iOS se reinstalează dependențele CocoaPods.

Autentificarea separă ecranele publice de cont. Tokenul este păstrat în stocarea securizată; lipsa lui sau un răspuns HTTP 401 închide sesiunea și revine la login.

Regulile proiectului sunt în [AGENTS.md](AGENTS.md), convențiile de text și erori în [CONVENTII_TEXT_SI_ERORI.md](CONVENTII_TEXT_SI_ERORI.md), iar ecranele și contractele frontend/backend în [PROJECT_SCHEMA.md](PROJECT_SCHEMA.md). Documentația contractului descrie și backendul, menținut separat de acest repository.

## Verificări

Rundele locale folosesc `npx tsc --noEmit`, `npm run lint` și `npm run test:affected`, la ritmul 5/10 din `AGENTS.md`. Pentru previzualizare, fără executarea testelor: `npm run test:affected -- --list`. Baza implicită este `origin/main`; poate fi schimbată prin `--base=<ref>`.

Pe PR draft se rulează testele afectate, în jobul `quality-affected`. La trecerea în „Ready for review” și la fiecare commit ulterior, jobul `quality` rulează toate testele. Pe `main` și la declanșare manuală se verifică integral. Tipurile, lint-ul, build-ul Android și scanările de securitate se păstrează. În protecția ramurii trebuie cerut `quality`; `quality-affected` nu îl înlocuiește. Limitarea planului GitHub pentru repository-uri private rămâne de rezolvat pentru impunerea automată.

Rularea completă rămâne `npm test -- --runInBand`. Actualizările dependențelor se fac separat, la cerere, și necesită verificare completă. Politica de selecție, comenzile și limitele sunt în [docs/TEST_SELECTION.md](docs/TEST_SELECTION.md).

## Prezentarea Gatify în Android

[docs/DEMO_PREZENTARE.md](docs/DEMO_PREZENTARE.md) descrie parcursul de 10–15 minute pentru contul `owner1@example.test`: calendar, rezervare, financiar, echipă și statistici. Profilul local cu 5 săli, 80 de persoane și 2.400 de rezervări în 2026–2027 se pregătește din backend prin `business:presentation-data`, cu previzualizare implicită și `--apply` explicit. Parolele sunt păstrate numai în storage privat al API-ului. Se folosește aplicația Android obișnuită conectată la API-ul local de business; aplicația `.e2e` are un mediu separat.

Calendarul păstrează sumarul pe an și filtru în cache, separă sălile libere de cele ocupate și marchează verde zilele complete. Sincronizarea verifică numai `GET /calendar/revision` la 30 de secunde, cât ecranul este vizibil; datele se actualizează când revizia diferă. Nu necesită WebSocket. API-ul cu acest endpoint trebuie livrat înaintea aplicației mobile care îl folosește.
