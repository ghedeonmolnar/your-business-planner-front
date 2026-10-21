# Audit de cod, acces și securitate

Data: 21 octombrie 2026. Proiect: Your Business Planner.

Au fost corectate probleme în izolarea sesiunilor, revocarea descărcărilor private, concurența MySQL și interfața panoului. Au fost adăugate teste și reguli executabile, iar dependențele compatibile au fost actualizate. Lansarea publică rămâne blocată de vulnerabilitățile tranzitive documentate și de controalele de producție și GitHub care nu sunt încă activate.

## Domeniul verificării

Inventarul a inclus 385 de fișiere livrabile în API și 497 în frontend, inclusiv modificările locale existente și fișierele noi. Numerele sunt din inventarul intermediar, înaintea adăugării acestui raport. Au fost inventariate 190 de fișiere PHP din app și 411 fișiere TypeScript din src, inclusiv testele. Niciun fișier de producție TypeScript inventariat nu depășea 250 de linii.

Analiza a urmărit rutele efectiv înregistrate, middleware-urile, serviciile de business, validările, resursele API, stocarea tokenului, cache-ul și navigarea, notificările, documentele private, configurările native, dependențele, fișierele excluse din Git și configurația MySQL locală. Au fost citite și setările disponibile ale ramurilor main de pe GitHub.

Lista primită este utilă și se suprapune mult cu AGENTS.md. Au fost adăugate 16 reguli concrete de securitate și livrare în cele trei copii. Recomandarea generică despre comentarii explicative nu a fost preluată: proiectul păstrează regula sa privind codul explicit, fără comentarii explicative în frontend și cu PHPDoc în backend. SOLID, DRY și KISS sunt aplicate pentru claritate și responsabilități, fără introducerea unor straturi suplimentare doar pentru a bifa o listă.

Aceasta este o verificare de cod și configurație locală, cu teste automate. Nu este o certificare OWASP/WCAG, un pentest al unui server de producție sau o garanție că fiecare ramură posibilă de execuție este acoperită.

## Probleme corectate

| Problemă | Comportamentul rezultat și dovada |
| --- | --- |
| Un răspuns 401 întârziat putea șterge tokenul unei autentificări noi | Cererile sunt legate de generația sesiunii. Răspunsurile vechi, inclusiv succes, 401 și blocarea abonamentului, devin anulări înainte de efecte. Teste în client.session.test.ts. |
| Ștergerea și scrierea tokenului se puteau suprapune | Operațiile din authTokenStorage sunt serializate. Un login nou rămâne după curățarea veche; markerul de revocare rămâne pentru erorile Keychain. Test de regresie în authTokenStorage.test.ts. |
| Notificarea inițială putea reveni după logout | Callback-ul întârziat verifică dacă fluxul mai este activ. Navigatorul este separat după companie, utilizator și rol. RootNavigator.session.test.ts verifică rutele rămase și imposibilitatea de Back către rezervare. |
| Un link semnat rămânea valabil după logout | Semnătura include identificatorul public al tokenului emitent. Descărcarea verifică existența și expirarea lui, contul, compania, rolul, abonamentul și funcția documents. Testul HTTP verifică logout, reutilizarea tokenului revocat și păstrarea celeilalte sesiuni. |
| API-ul putea prelua implicit sesiunea web prin Sanctum | Guard-ul mobil acceptă exclusiv Bearer. Cookie-ul operatorului nu autentifică /api/me sau /api/logout. Tokenurile configurate au termen pozitiv finit. |
| Sesiunea web putea rămâne deschisă după schimbarea parolei | auth.session verifică hashul parolei și trimite sesiunea invalidată la login. Test în PlatformApiTest. |
| Cache-ul putea păstra răspunsuri private | API-ul folosește no-store inclusiv pentru erori. Panoul reîncarcă paginile restaurate din bfcache. Sunt prezente nosniff, no-referrer, DENY și directivele CSP pentru încadrare, baza URL și formulare. |
| Formularul lateral din panou se oprea prin ReferenceError | Referința greșită invalidă a fost corectată și cazul fără eroare de validare este protejat. Cele trei teste Node noi execută JavaScript-ul panoului, inclusiv pageshow. |
| Vite genera o intrare legacy nefolosită de pagini | Configurația compilează numai platform.js, intrarea folosită de layout. Build-ul nu mai generează pachetul app.js nefolosit. |
| Același angajat putea fi alocat simultan în două săli | Lockul exterior nu făcea și subquery-ul rezervării o citire curentă MySQL. Subquery-ul folosește acum locking read. Cursa reală a demonstrat inițial două răspunsuri 201; după corecție rezultatul este 201 și 409. |
| advance_due_at era citit ca string și producea 500 la serializare | Cast-ul de dată a fost restabilit. Testul existent pentru editarea rezervării verifică și scadența în format YYYY-MM-DD. |
| Identificatorul de login primit ca array putea produce avertisment de conversie | Normalizarea rulează numai pentru string. Payload-ul structurat este refuzat prin 422/VALIDATION_FAILED. |
| Editarea plății legacy putea pierde prelungirea inițială | Abonarea useWatch precedă resetarea formularului. Testul păstrează totalul 650 fără pierdere sau dublare. Acest flux legacy nu este expus de rutele produsului curent. |

Unele teste existente reutilizau obiecte Eloquent și relații dinaintea blocării contului sau schimbării companiei. Testele au fost ajustate la o identitate reîncărcată și la sesiuni distincte; verificările reale cu Bearer și descărcările nu au fost înlocuite cu mock-uri. Testul plății abonamentului verifică data calendaristică prin model, fără să impună reprezentarea internă SQLite a unei coloane date.

## Matricea de acces

SecurityGatesApiTest construiește cereri HTTP pentru toate metodele private înregistrate în API. Verifică accesul anonim, refuzul rutelor administrative pentru personal și blocarea tuturor operațiilor după expirarea abonamentului. /me și logout rămân disponibile pentru identificare și închiderea sesiunii.

Testele existente și cele extinse verifică izolarea între companii, drepturile proprietarului, refuzul escaladării administratorilor, conturile blocate, funcțiile dezactivate, invitațiile, termenul tokenurilor și documentele. PlatformApiTest activează explicit middleware-ul CSRF real: loginul fără token nu autentifică, suspendarea fără token primește 419, iar acțiunea cu token valid funcționează.

Logout local ascunde imediat contul. Dacă rețeaua este indisponibilă, aplicația poate curăța dispozitivul, însă serverul nu poate confirma revocarea unui token pe care nu a primit-o; termenul tokenului rămâne limita sesiunii serverului. Fișierele deja descărcate nu pot fi retrase de pe dispozitiv.

## Baza de date și altă aplicație

În configurația locală verificată, MySQL ascultă numai pe 127.0.0.1:3307, contul aplicației nu este root și nu are privilegii globale. Fișierele de mediu reale, cheile și dumpurile sunt excluse din Git. Frontendul nu conține credențiale SQL.

Copierea aplicației nu oferă acces direct la baza de date. Un alt client poate apela API-ul dacă obține credențiale sau un token valid și este supus acelorași verificări pe server. CORS și un secret comun inclus în aplicație nu împiedică un client nativ să formuleze cereri.

Pentru producție trebuie configurate și verificate pe server: rețea privată/firewall pentru SQL, cont de aplicație cu privilegii minime, cont separat pentru migrări, TLS verificat între servere, HTTPS, APP_DEBUG=false, cookie-uri Secure/HttpOnly, document root exclusiv public și backup extern cu restaurare testată. Panoul nu are încă MFA; accesul public al operatorilor necesită MFA sau un gateway suplimentar. Aceste cerințe nu sunt îndeplinite automat de Docker Compose local.

## Dependențe și platforme

Au fost actualizate versiunile patch/minor compatibile înaintea verificărilor. Laravel este 13.38.0, Guzzle 8.3.0, PHPUnit 13.4.3, Sail 1.69.0 și Ignition 2.12.1. Vite este 8.3.5.

Cu acordul utilizatorului au fost migrate React Native și pachetele @react-native/* la 0.88.0, Gesture Handler la 3.4.0 și Ionicons la 14.0.0. React și react-test-renderer sunt cuplate la 19.3.1; Reanimated 4.7.1 și Worklets 0.13.0 rămân compatibile. Configurația ESLint folosește o versiune compatibilă ft-flow 3.0.11, fără forțarea peerDependencies.

Migrarea include noile tipuri stricte React Native, referințele ScrollView, props-urile listelor, tema de navigare și callback-urile timerelor. Android urmează template-ul oficial 0.88: Gradle 9.4.1, compile SDK și Build Tools 37, target SDK 36, ReactHost și opțiunile tranzitorii AGP 9. Directorul CMake derivat din directorul temporar al sistemului scurtează căile obiectelor pe Windows.

Au rămas la versiunile compatibile:

- Babel 7: pluginurile folosite de presetul React Native cer încă @babel/core 7.
- ESLint 9: configurația React Native 0.88 declară peer pentru ESLint 8 sau 9.
- TypeScript 6: parserul TypeScript ESLint declară intervalul sub 6.1.
- resolvers 5.9.2: încercarea versiunii 6 a fost refuzată pentru conflictul dintre Effect 4 și integrarea TypeSchema care cere Effect 3. Nu s-au folosit force sau legacy-peer-deps.

API-ul are audituri npm și Composer fără advisories. Frontendul are 48 de intrări propagate, reprezentând două advisories distincte:

| Pachet | Advisory | Starea la verificare |
| --- | --- | --- |
| braces 3.0.3 | [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) | Nu există versiune publicată corectată. |
| sprintf-js 1.1.3 | [GHSA-hp3w-g68c-fv3c](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) | Nu există versiune publicată corectată. |

Acestea apar în lanțurile dependențelor instrumentelor; auditul nu demonstrează singur exploatabilitatea în APK. Gate-ul de audit rămâne activ și blochează lansarea, fără excluderea vulnerabilităților. launch-editor a fost actualizat la 2.14.2 pentru eliminarea advisories corectate.

## Gate-uri de cod și GitHub

ESLint refuză any explicit, directive TypeScript de evitare a verificărilor, importurile interne relative, accesul direct la hook-uri React Query în afara hook-urilor feature-urilor, fetch direct în feature-uri și console în afara raportării centrale.

Workflow-urile locale quality.yml conțin verificări de tipuri, lint fără warnings, teste, build relevant și scanarea secretelor. API-ul verifică SQL și concurența pe baza dedicată _test. Acțiunile sunt fixate la commit, imaginea Gitleaks la digest, iar permisiunile sunt contents:read. Aceste fișiere trebuie integrate în repository-uri pentru a rula pe GitHub; rularea lor pe runner-ele GitHub nu a fost încă observată.

Citirea GitHub a confirmat:

- main nu este protejată în frontend și nu are ruleset-uri.
- main nu este protejată în API; citirea ruleset-urilor este refuzată cu mesajul că repository-ul privat necesită un plan GitHub Pro pentru această funcție.

După integrarea workflow-urilor trebuie impuse pull request-uri, verificările quality/android/dependencies/secrets pentru frontend și quality/secrets pentru API, precum și interzicerea force-push și a ștergerii ramurii principale. API-ul trebuie păstrat privat; publicarea sa nu este o soluție propusă pentru limitarea planului.

Scanarea Gitleaks a acoperit codul livrabil curent și tot istoricul local disponibil: un commit frontend și două API. Nu au fost identificate chei reale. Alarmele API erau parole fictive din două fișiere de teste; excepția este limitată la acele căi și trei valori exacte. Nu există excepție generală pentru folderul tests sau pentru chei reale.

## Verificări și limite

| Verificare | Rezultat |
| --- | --- |
| TypeScript | tsc --noEmit: trecut. |
| ESLint | Trecut, zero erori și zero warnings, inclusiv regulile noi. |
| Jest | 95 de suite, 382 de teste trecute. |
| Pint | Toate fișierele verificate: trecut. |
| PHP / SQLite | 99 de teste, 830 de aserțiuni; numai cele trei curse MySQL sunt omise aici. |
| PHP / MySQL | 102 teste, 851 de aserțiuni, inclusiv cele trei curse și CSRF real; nicio omitere. |
| Scripturi web Node | 6 teste trecute. |
| Vite | Build reușit pentru intrarea efectiv folosită. |
| Android | assembleDebug arm64-v8a și createBundleReleaseJsAndAssets reușite cu React Native 0.88. |
| Audit API npm/Composer | Fără advisories. |
| Audit frontend npm | Blocat: 48 de intrări propagate din cele două advisories distincte de mai sus. |
| Gitleaks | Codul curent și istoricul local disponibil verificate; fără chei reale identificate, cu excepție strictă pentru parolele fictive de test. |

Logurile, inventarul, rapoartele redactate și diff-urile de dinaintea auditului sunt în .codex-run/audit-2026-10-21. Verificările au fost cerute explicit în acest task; numărătoarea locală dintre rundele de verificări se reia de la zero.

Pe Windows au fost verificate Android debug arm64-v8a și generarea bundle-ului release/Hermes. Bundle-ul release folosește temporar adresa HTTPS fictivă din .env.production.example, deoarece infrastructura de producție nu este configurată; fișierul temporar a fost eliminat. Nu reprezintă un APK release semnat sau o lansare. iOS necesită macOS.

Nu s-au publicat modificări, nu s-au schimbat protecțiile repository-urilor și nu s-au aplicat migrări în baza aplicației. Testele MySQL au folosit exclusiv your_business_planner_test. Comportamentul bfcache a fost verificat prin executarea scriptului într-un harness DOM, iar Back prin navigatorul montat în teste; verificarea manuală pe dispozitive și browsere reale rămâne necesară înainte de lansare.

Monitorizarea durabilă, restaurarea backupului extern, măsurătorile de performanță pe volum reprezentativ și o verificare completă WCAG cu cititor de ecran rămân lucrări de producție. Codul legacy fără rute curente este păstrat și identificat în PROJECT_SCHEMA.md; nu a fost eliminat printr-o refactorizare generală.

## Repere consultate

- [OWASP ASVS 5.0](https://asvs.owasp.org/) și [OWASP MASVS Authentication](https://mas.owasp.org/MASVS/07-MASVS-AUTH/).
- [Laravel Sanctum 4.x](https://github.com/laravel/sanctum/tree/4.x), inclusiv verificarea și revocarea tokenurilor.
- [React Native 0.88](https://reactnative.dev/blog/2026/10/19/react-native-0.88) și pachetul oficial @react-native-community/template 0.88.0.
- [Chrome: bfcache și no-store](https://developer.chrome.com/docs/web-platform/bfcache-ccns).
