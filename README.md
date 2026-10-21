# Your Business Planner Mobile

Aplicație React Native pentru administrarea internă a sălilor de evenimente.

Repository: [ghedeonmolnar/your-business-planner-front](https://github.com/ghedeonmolnar/your-business-planner-front), ramura principală `main`.

Navigarea principală: Agendă, Calendar, Rezervări, Clienți și Mai multe. Conturile personalului au acces numai la evenimentele și remunerația proprie.

API_URL se configurează în .env, respectiv .env.production. Aplicația nouă folosește numai backendul și baza de date separate Your Business Planner.

## Instalare și pornire

Sunt necesare Node.js 22.11 sau mai nou și mediul nativ React Native pentru platforma aleasă. Android folosește Android Studio și JDK; iOS necesită macOS, Xcode și CocoaPods.

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

Comenzile frontend sunt `npx tsc --noEmit`, `npm run lint` și `npm test -- --runInBand`. Rularea lor și actualizarea dependențelor respectă ritmul din `AGENTS.md`.
