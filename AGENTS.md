# Reguli obligatorii pentru acest proiect

Aceste reguli se aplica oricarei schimbari facute in `business-api` si `business-front`.

## Mod de lucru

1. Pentru modificari izolate, cu risc redus, verificarile nu se ruleaza dupa fiecare task; se pastreaza ritmul 5/10 de mai jos. Rundele locale obisnuite folosesc `tsc --noEmit`, `eslint .` si `npm run test:affected` in `business-front`; `vendor/bin/pint --test` si `composer test:affected` in `business-api`. Pentru MySQL se foloseste `composer test:affected -- --configuration=phpunit.mysql.xml`, numai in baza dedicata cu sufixul `_test`. Optiunea `--list` doar afiseaza selectia, fara executarea testelor.
2. La al 5-lea task intreaba utilizatorul daca sa rulezi verificarile. Daca raspunsul este nu, ruleaza-le la al 10-lea task fara sa mai intrebi. Dupa fiecare runda de verificari ale aplicatiei, numaratoarea o ia de la capat. Sincronizarea documentatiei, simpla listare a selectiei si testele uneltelor de selectie nu reseteaza numaratoarea.
3. Un task este o cerere a utilizatorului; numaratoarea se face pe sesiunea de lucru.
4. Modificarile care afecteaza autentificarea, autorizarea, izolarea companiilor, rezervarile, incasarile, concurenta, migratiile, contractele API sau infrastructura comuna necesita verificarile relevante imediat dupa implementare, indiferent de numarul taskului. Acopera cel putin unitatile si fluxurile afectate; daca selectorul nu poate demonstra acoperirea, ruleaza suita completa relevanta. In celelalte cazuri, verificarile in afara ritmului se ruleaza la cererea explicita a utilizatorului.
5. Update-urile dependentelor se fac in runde separate de mentenanta, cerute explicit, nu in rundele selective. In runda de mentenanta cauta pachetele disponibile (`npm outdated` in ambele proiecte, `composer outdated --direct` in `business-api`), aplica update-urile compatibile si ruleaza toate verificarile: tipuri, lint, Jest complet, Pint, PHPUnit complet SQLite/MySQL si buildurile relevante pentru pachetele actualizate.
6. In runda de mentenanta autorizata, update-urile patch si minor se aplica fara aprobare individuala numai daca respecta `peerDependencies` si nu necesita schimbari incompatibile. Pentru React Native, React, navigare, autentificare, baze de date, build si module native verifica explicit compatibilitatea, testele si buildurile relevante. Update-urile major necesita aprobare explicita inainte de aplicare.
7. Pachetele cuplate se actualizeaza impreuna si respecta `peerDependencies`: `react-native` cu toate `@react-native/*`, `react` si `react-test-renderer` cu versiunea ceruta de `react-native`, `react-native-reanimated` cu `react-native-worklets`.
8. Nu forta instalarea cu `--force` sau `--legacy-peer-deps`; un conflict de `peerDependencies` se rezolva prin versiuni compatibile. Daca un update provoaca regresii, remediaza problema sau revino la versiunile anterioare, cu manifestele de dependente si lockfile-urile coerente, documentand motivul. Nu dezactiva verificarile pentru a accepta update-ul.
9. Orice schimbare de contract API, schema de baza de date, ecran sau flux se reflecta in `PROJECT_SCHEMA.md` in acelasi set de modificari coordonate cu implementarea, conform regulilor de sincronizare de mai jos.
10. In mediul local folosim doar aplicatia Android: o deschidem si folosim aplicatia prin interfata ei.
11. Selectorii compara ramura cu baza comuna fata de `origin/main` sau `--base`, plus staged, unstaged si untracked. Schimbarile globale, configurarile, dependentele, infrastructura testelor, stergerile/redenumirile, fisierele fara mapare/teste si baza Git indisponibila cer rulare completa. In CI, PR-urile draft folosesc `quality-affected`; PR-urile pregatite pentru merge, fiecare commit nou al lor, `main` si declansarea manuala folosesc `quality` cu suita completa. Un rezultat selectiv nu inlocuieste verificarea completa pentru merge sau livrare. Instructiunile si limitele sunt in `primary-docs/TEST_SELECTION.md`.

## Sincronizarea documentatiei si a contractelor

1. Repository-ul `your-business-planner-docs`, disponibil local in `primary-docs`, este sursa oficiala pentru `AGENTS.md` si `PROJECT_SCHEMA.md`. Pastreaza organizarea in cele trei repository-uri existente.
2. Modificarile comune se documenteaza in acelasi set de modificari coordonate cu implementarea. Fiecare schimbare din API/frontend care modifica regulile sau contractul identifica exact commitul docs asociat.
3. Dupa actualizarea surselor, copiaza explicit `AGENTS.md` si `PROJECT_SCHEMA.md` in radacina workspace-ului, `business-api` si `business-front`. Apoi ruleaza `node tools/documentation/check-sync.cjs --update` in fiecare repository al aplicatiei si verifica sincronizarea fara `--update`. Scriptul cu `--update` actualizeaza numai manifestul, nu copiaza documentele.
4. Manifestele `tools/documentation/manifest.json` se versioneaza impreuna cu copiile si se verifica in CI. CI trebuie sa verifice si corespondenta cu commitul docs asociat release-ului; verificarea copiilor sau a hashurilor locale nu este suficienta pentru aceasta dovada.
5. Fiecare release identifica exact commitul documentatiei, commitul API si commitul frontend/buildul Android. Nu se aproba release-ul daca documentatia si contractele implementate sunt incompatibile.
6. Actualizarea unui repository nu demonstreaza sincronizarea celorlalte. Verificarile CI sau legaturile intre revizii care nu au fost implementate si demonstrate se raporteaza ca limite in `primary-docs/ROADMAP_LANSARE.md`.

## Compatibilitatea API cu versiunile Android suportate

1. API-ul ramane compatibil cu versiunile mobile inca suportate conform `GET /api/mobile-policy`. Nu elimina si nu schimba incompatibil campuri, endpointuri, coduri de eroare sau tipuri de date fara analizarea consumatorilor existenti.
2. Modificarile incompatibile necesita o strategie documentata: camp aditiv, perioada de tranzitie, versiune noua de contract sau actualizare minima obligatorie a clientului. Orice incompatibilitate acceptata se reflecta in politica versiunilor mobile.
3. Inainte de release testeaza cel putin combinatiile API nou cu clientul curent si API nou cu cea mai veche versiune mobila suportata. Pastreaza versiunile exacte si probele; nu deduce compatibilitatea din testele cu API mock-uit.

## Actualizari live prin cPanel (pastrarea datelor)

1. Utilizatorul publica intotdeauna codul pe live. La o cerere obisnuita de actualizare, agentul se ocupa numai de migrarile bazei existente si, daca este necesar, de curatarea rutelor Laravel cacheuite. Nu face push/pull, upload, reinstalare sau inlocuire de cod pe server din proprie initiativa. Aceasta este o actualizare a instalarii existente, nu repetarea instalarii initiale.
2. Tinta configurata la 2026-10-31 este `https://ybp.gatify.ro`, cu backendul in `/home2/gatify/public_html/ybp.gatify.ro`, document root in subdirectorul `public` si baza `gatify_ybp_prod`. Confirma tinta si versiunea PHP asignata domeniului in cPanel la fiecare interventie; nu schimba baza sau document root pentru un update obisnuit.
3. Pastreaza `.env` live, `APP_KEY`, credentialele, conturile, setarile administrate din platforma, fisierele incarcate si continutul din `storage`. Nu copia mediul local, dumpuri sau fisiere de configurare peste live si nu genera chei sau parole noi pentru un update. Nu recrea administratorul ori alte conturi.
4. Nu crea alta baza, nu importa baza locala si nu reseta/reinitializa datele. Pe live sunt interzise in fluxul obisnuit `migrate:fresh`, `migrate:refresh`, `migrate:reset`, `db:wipe`, rollbackurile, stergerile/trunchierile de tabele, seederele generale si comenzile de demo, prezentare sau fixture-uri. Nu rula teste pe baza live.
5. Inainte de executie, identifica migrarile in asteptare, citeste efectele lor si asigura un backup privat recuperabil al bazei existente, conform procedurii din `primary-docs/RECUPERARE_SI_DEPLOY.md`. Migrarile trebuie sa pastreze inregistrarile si relatiile existente. Daca o migrare sterge sau suprascrie date ori elimina coloane cu date, opreste acea operatie si cere o decizie explicita cu impactul concret; nu o considera autorizata de simpla cerere de update.
6. Din radacina backendului foloseste binarul PHP al domeniului pentru `artisan migrate:status`, apoi `artisan migrate --force` doar pentru migrarile verificate in asteptare si din nou `artisan migrate:status` dupa executie. Daca nu sunt migrari noi, nu modifica baza. Nu adauga `--seed`; o transformare de date sau un seeder necesita o cerere explicita si verificarea faptului ca nu suprascrie date administrate pe live.
7. Foloseste contul SQL separat pentru migrari, pastrand contul si configuratia de executie ale aplicatiei. Credentialele se citesc numai din surse private autorizate; nu se scriu in acest fisier, Git, loguri, URL-uri sau argumente de proces. Un runner temporar poate configura conexiunea numai in propriul proces, fara sa rescrie `.env` si fara sa lase credentialele de migrare in cache-ul configuratiei aplicatiei.
8. Verifica daca rutele sunt cacheuite. Daca noile rute nu corespund cache-ului existent, ruleaza cu acelasi PHP `artisan route:clear`. Curatarea cache-ului de rute nu sterge datele aplicatiei. Nu folosi `optimize:clear` sau `cache:clear` ca scurtatura; nu curata cache-ul operational, sesiunile, lockurile ori cache-urile de configuratie/view-uri si nu modifica alte setari in cadrul acestui flux restrans.
9. Pentru cPanel foloseste sesiunea Chrome conectata si skillul de browser disponibil. Daca nu exista terminal, executia poate folosi un runner CLI temporar prin cron, aflat in afara directorului public, cu protectie contra executiilor concurente/repetate si rezultate fara secrete. Elimina numai runnerul si cronul temporar create pentru interventia curenta; pastreaza schedulerul permanent `artisan schedule:run` si celelalte joburi existente. Nu lasa un endpoint public de migrare si nu reutiliza scriptul de instalare initiala.
10. La final verifica statusul migrarilor si disponibilitatea aplicatiei prin controale de citire, fara a crea sau modifica date de business. Raporteaza ce migrari s-au aplicat, daca s-a curatat cache-ul rutelor si orice eroare ramasa. O executie partiala sau o incercare de comanda nu inseamna deploy finalizat; nu incerca repararea prin resetarea bazei ori restaurarea peste live fara o cerere explicita.
11. Cand modificarile de schema afecteaza contractele existente, foloseste strategia `expand -> migrate/backfill -> switch -> contract`, detaliata in `primary-docs/RECUPERARE_SI_DEPLOY.md`. Schema extinsa trebuie sa ramana compatibila cu aplicatia aflata in productie; migrarile aditive preced codul care depinde de ele. Backfill-ul necesita autorizarea explicita de la punctul 6, executie controlata si idempotenta si verificarea rezultatelor. Eliminarea coloanelor, tabelelor sau contractelor vechi necesita verificarea consumatorilor si aprobare explicita. Pastreaza cerintele de backup si conservare a datelor; daca revenirea nu este sigura, documenteaza recuperarea fara a promite rollback automat.

## Automatizari de calitate si Docker

1. Backendul verifica tipurile cu `composer analyze` (Larastan nivel 5), dependentele dintre domenii cu `composer architecture` si exportul HTTP cu `composer api:check`. Frontendul verifica tipurile generate cu `npm run api:check`, iar ESLint verifica dependentele dintre feature-uri. Aceste gate-uri se pastreaza in CI; local respecta ritmul si exceptiile din Mod de lucru.
2. `phpstan-baseline.neon` inventariaza numai constatarile preexistente de la introducerea analizorului. Nu regenera baseline-ul ca sa accepti o eroare noua si nu creste exceptiile din comoditate. Remediaza cauza; eliminarea unei constatari rezolvate actualizeaza inventarul. Limitele si codul legacy ramas sunt descrise in `primary-docs/QUALITY_AUTOMATION.md`.
3. Dependentele dintre domenii/feature-uri sunt explicite in `deptrac.php` si `tools/architecture/boundaries.cjs`. Un domeniu nou sau o legatura noua cere evaluarea responsabilitatilor si actualizarea coordonata a regulilor si selectiei testelor. Nu impune separarea prin servicii, DTO-uri sau contracte fara o nevoie concreta.
4. Verifica numele si structura campurilor in backend, contractul OpenAPI si schemele existente. Nu inventa aliasuri sau fallback-uri pentru campuri presupuse si nu folosi `as unknown as X` pentru a ascunde o incompatibilitate. O informatie lipsa se corecteaza la sursa.
5. `contracts/openapi.json` se exporta din API, apoi se sincronizeaza in frontend. Fisierele din `src/shared/api/generated` sunt generate si nu se editeaza manual. Pastreaza clientul HTTP, schemele runtime Zod, hook-urile si `queryKeys` existente. Un tip generat nu valideaza un raspuns primit la executie.
6. Tipurile pe care exportul nu le poate demonstra raman necunoscute, fara conversia implicita la string sau any. `contracts/limitations.json` pastreaza inventarul lor si diagnosticele generatorului; nu se actualizeaza automat in CI pentru mascarea unei regresii. Prezenta OpenAPI nu demonstreaza acoperirea completa a contractului sau compatibilitatea versiunilor Android.
7. `business-api/compose.local.yaml` este configuratia Docker locala oficiala. Copia din workspace o include, fara duplicarea serviciilor. Imaginile au digest fixat, secretele si datele runtime nu intra in contextul de build, iar containerele PHP folosesc un utilizator fara privilegii administrative.
8. PHPUnit si integrarea Android folosesc `compose.test.yaml`, proiecte Docker separate si baze `_test`. Imaginea de test contine codul si dependentele corespunzatoare buildului, fara bind mount pentru codul ori datele locale de business. PHPUnit si E2E nu ruleaza simultan pe aceeasi baza. Nu sterge automat volumele si nu migra automat baza de business la pornirea containerelor.
9. Nu adauga worker de queue, Redis, Octane sau stocare S3 doar pentru a reproduce infrastructura altui proiect. Schedulerul si Reverb au profile proprii; foloseste doar serviciile cerute de fluxul actual. Comenzile si limitele sunt in `primary-docs/QUALITY_AUTOMATION.md`.

## Reguli comune

1. Scrie cod simplu si explicit.
2. Evita abstractizarile premature.
3. Evita duplicarea logicii importante.
4. Pastreaza functiile si metodele concentrate pe o singura responsabilitate.
5. Foloseste nume descriptive.
6. Nu folosi abrevieri neclare.
7. Nu introduce valori magice; da-le un nume de constanta care le explica rostul.
8. Nu hardcoda URL-uri, chei, parole sau configurari dependente de mediu.
9. Valideaza toate datele externe.
10. Autorizeaza toate operatiunile sensibile.
11. Nu ignora erorile.
12. Nu loga date sensibile.
13. Nu modifica API-uri publice fara analizarea impactului.
14. Nu introduce complexitate pentru un caz ipotetic.
15. Orice schimbare trebuie sa poata fi testata.
16. Orice bug reparat trebuie sa primeasca un test de regresie atunci cand este rezonabil.
17. Rostul codului trebuie sa reiasa din nume, tipuri si structura. Nu adauga comentarii care repeta implementarea. Sunt permise explicatii scurte, actualizate si relevante pentru decizii tehnice neobisnuite, invariante de concurenta, constrangeri externe, workaround-uri necesare sau reguli de business care nu reies clar din cod. Comentariile nu inlocuiesc o implementare clara.
18. In `business-front`, docblock-urile sunt limitate la adnotarile JSDoc strict de tip (`/** @type {...} */`) din fisierele de configurare JS; directivele cerute de unelte (ex. `eslint-disable-next-line`, `/* global jest */`) sunt permise. Comentariile explicative respecta punctul 17, iar PHPDoc din `business-api` respecta regulile Laravel/PHP 26-28.
19. Nu pastra cod comentat sau comentarii redundante in repository.
20. Respecta conventiile existente atunci cand sunt sanatoase.

## Reguli Laravel/PHP

1. Respecta PSR-12 si conventiile Laravel.
2. Formateaza codul PHP cu Laravel Pint, instalat in `require-dev`.
3. Foloseste tipuri de retur si tipuri de parametri unde este potrivit.
4. Nu folosi `mixed` sau `array` fara structura acolo unde poate exista un tip clar.
5. Foloseste FormRequest pentru validari reutilizabile sau complexe.
6. Ownership-ul se verifica prin scoping pe `company_id` in serviciile din `app/Domain` (metodele `findForUser`, `listForUser`, `createForUser`); o resursa a altei companii intoarce `404`; `user_id` pastreaza autorul inregistrarii. Policies/Gates se folosesc doar pentru reguli care depasesc ownership-ul.
7. Controllerele trebuie sa coordoneze request-ul, nu sa contina toata logica de business.
8. Foloseste tranzactii pentru operatiuni cu mai multe scrieri dependente.
9. Evita query-uri in loops.
10. Previne N+1.
11. Foloseste API Resources pentru raspunsuri API consistente, unde este potrivit.
12. Jobs trebuie sa fie idempotente cand pot fi reluate.
13. Nu accesa `env()` direct in codul aplicatiei; valorile specifice aplicatiei stau in `config/gt.php`.
14. Nu folosi valori float pentru bani: calculele se fac in bani intregi prin `App\Support\Money`, iar sumele se stocheaza in coloane `decimal`.
15. Nu expune direct toate atributele modelelor.
16. Nu permite mass assignment pentru campuri sensibile.
17. Nu crea service sau repository doar pentru a impacheta o singura linie fara valoare suplimentara.
18. Nu folosi observers pentru logica critica greu de urmarit fara o justificare clara.
19. Nu ascunde side effects importante.
20. Migratiile noi au o strategie documentata de deployment si revenire sau recuperare. Pentru contracte existente foloseste expand/contract cand este necesar, conform sectiunii de actualizari live si `primary-docs/RECUPERARE_SI_DEPLOY.md`. Nu promite rollback automat pentru migrari care nu pot fi inversate in siguranta.
21. Logica de business sta in `app/Domain/<Arie>/`, validarea in `app/Http/Requests/<Arie>/`, raspunsurile in `app/Http/Resources/`; controllerele din `app/Http/Controllers/Api` doar le leaga.
22. Tabelele noi de business au cheie primara `uuid`, `company_id` pentru izolare si `user_id` pentru autor. Tabela `companies` este radacina si nu are `company_id`; operatiunile automate pot avea autor null.
23. Endpointurile de lista se pagineaza cu paginatorul Laravel si accepta `page` si `per_page`, limitat prin `Controller::perPage()`.
24. Rutele publice noi primesc `throttle`; fisierele private se descarca doar prin URL semnat temporar.
25. Fiecare endpoint nou sau modificat are test in `tests/Feature/<Entitate>ApiTest.php`, inclusiv cazul in care alt user incearca sa acceseze resursa.
26. Foloseste PHPDoc pentru contracte complexe, tipuri generice, array shapes, structuri de date, exceptii relevante sau comportamente insuficient exprimate prin tipurile native PHP. Adauga `@param`, `@return` si `@var` cand aduc informatii suplimentare; nu este obligatorie repetarea tipurilor native pentru fiecare metoda. Descrierile noi se scriu in romana, fara diacritice.
27. Docblock-urile existente se pastreaza si se actualizeaza cand raman utile; elimina numai informatia redundanta sau depasita, fara pierderea contractelor, structurilor ori explicatiilor relevante.
28. Configuratia Pint poate elimina tagurile PHPDoc redundante numai fara pierderea informatiei utile. Reactivarea `no_superfluous_phpdoc_tags` se face intr-o schimbare dedicata si verificata; pastrarea setarii curente nu obliga adaugarea de taguri care repeta tipurile native.
29. Raspunsurile de eroare intorc un cod de eroare stabil (identificator masina, documentat, parte din contractul API), nu un text destinat utilizatorului final; textul afisat il pune frontend-ul. Un mesaj tehnic poate fi intors doar pentru logare/diagnostic si nu se afiseaza utilizatorului (vezi `primary-docs/CONVENTII_TEXT_SI_ERORI.md`).

## Reguli React

1. Respecta Rules of Hooks.
2. Nu apela hooks conditional.
3. Nu duplica props in state fara un motiv real.
4. Nu stoca state derivat daca poate fi calculat.
5. Nu folosi `useEffect` pentru calcule care pot fi facute in render.
6. Curata listeners, timers si subscriptions.
7. Previne race conditions in request-uri.
8. Foloseste keys stabile pentru liste.
9. Nu folosi indexul drept key pentru liste care se pot reordona.
10. Nu adauga `useMemo` si `useCallback` fara un motiv concret.
11. Separa server state de UI state.
12. Nu stoca inutil date sensibile pe dispozitiv; tokenul sta doar in `shared/storage/authTokenStorage`.
13. Gestioneaza loading, empty, success si error states.
14. Dezactiveaza sau protejeaza submit-ul impotriva trimiterii multiple.
15. Foloseste componentele semantice potrivite si seteaza `accessibilityRole` si `accessibilityLabel` unde nu reies din componenta.
16. Toate campurile trebuie sa aiba label-uri corecte.
17. Actiunile apasabile folosesc `AppButton`, `IconButton` sau componente `Pressable`/`Touchable`, nu `View` cu handler de atingere.
18. Nu folosi `dangerouslySetInnerHTML` fara sanitizare si justificare.
19. Nu ignora erorile TypeScript.
20. Nu folosi `any` pentru a evita tiparea.
21. Nu pune reguli de business critice exclusiv in frontend.
22. Nu presupune ca ascunderea unei componente reprezinta autorizare.
23. Apelurile HTTP stau doar in `features/<feature>/api/*Api.ts` si trec prin `apiRequest`/`apiPageRequest` din `shared/api/client.ts`; nu apela `fetch` direct.
24. Componentele reutilizabile nu trebuie sa cunoasca detalii inutile despre paginile care le folosesc.
25. Optimizeaza performanta doar in urma unei probleme observabile.
26. Ecranele coordoneaza: aduc datele si compun componente, nu implementeaza toata logica si toate sub-vizualizarile.
27. Evalueaza fisierele care depasesc aproximativ 250 de linii pentru separarea responsabilitatilor. Extrage pasii de wizard, tab-urile sau panourile cand imbunatateste claritatea, reutilizarea ori testabilitatea; numarul de linii este un indicator de refactorizare, nu o limita rigida.
28. Nu duplica logica de formatare: banii trec prin `shared/utils/money`, datele prin `shared/utils/formatDate` (dayjs), etichetele de catalog prin `features/catalogs/utils/catalogLabels`.
29. Foloseste doar culorile din `theme.colors` (`src/shared/theme/theme.ts`) si tokenurile existente de spacing, radius si tipografie. Nu hardcoda valori si nu adauga culori, nuante sau tokenuri noi in tema din proprie initiativa; daca pare ca lipseste una, intreaba utilizatorul.
30. Nu lasa configurare moarta in proiect (preseturi nefolosite, fisiere de config duplicate).
31. Fiecare feature sta in `src/features/<feature>/` si include doar directoarele si fisierele necesare din `api/`, `components/`, `hooks/`, `schemas/`, `screens/`, `utils/` si `types.ts`. Nu crea directoare goale, componente sau abstractizari numai pentru respectarea unui sablon; ce folosesc mai multe feature-uri merge in `src/shared/`.
32. Importurile interne folosesc aliasul `@/`, nu cai relative.
33. Server state se citeste si se modifica prin hook-urile din `features/<feature>/hooks/`; ecranele si componentele nu apeleaza direct `useQuery`/`useMutation`.
34. Formularele folosesc `react-hook-form` cu schema `zod` din `schemas/` si campurile `Controlled*Field` din `shared/components`.
35. Inainte de a crea o componenta noua, verifica `src/shared/components` (`AppButton`, `Card`, `Screen`, `ScreenHeader`, `EmptyState`, `LoadingState`, `ErrorBanner`, `FormModalFrame`, `IconButton`, `MetaPill` etc.).
36. Iconitele vin doar din `@react-native-vector-icons/ionicons/static`.
37. Testele stau langa fisierul testat (`*.test.ts` / `*.test.tsx`), iar ecranele se monteaza cu `renderWithProviders` din `shared/test`.

## Reguli pentru server state (React Query)

1. Cheile de query se construiesc doar prin `queryKeys` din `shared/api/queryKeys`; fara chei scrise ca string brut.
2. Invalidarile care traverseaza feature-uri se descriu doar in `shared/api/queryInvalidation`, nu duplicate in fiecare mutatie.
3. Listele care cresc cu istoricul se pagineaza server-side (`useInfiniteQuery`), cu filtre; nu aduce toate paginile in memorie.
4. "Aduc toate paginile" (`apiPaginatedRequest`) este acceptabil doar pentru liste marginite prin natura lor, cum sunt cataloagele.
5. Datele statice primesc `staleTime` explicit; nu lasa cache-ul la intamplare.
6. Nu presupune comportamentul de web: in React Native, refetch la revenire in aplicatie si starea de online trebuie legate explicit la `AppState` si la conectivitate.
7. Tratarea erorilor globale (401, expirare sesiune) se face o singura data, la nivel de client de query, nu in fiecare ecran.
8. Mutatiile trebuie sa spuna clar ce invalideaza; nu invalida tot cache-ul din comoditate.
9. Cache-ul nu reprezinta automat starea actuala a serverului. Distinge intre date confirmate, date cacheuite nerevalidate, lipsa conexiunii si absenta reala a inregistrarilor. Operatiile care depind de disponibilitate, autorizare sau sume actuale necesita confirmarea serverului; o actualizare optimista nu demonstreaza succesul.
10. Retry-ul dupa un rezultat incert pastreaza aceeasi cheie de idempotency si intentia originala, conform contractului operatiei. Refoloseste mecanismele existente din `PROJECT_SCHEMA.md`, fara jurnale sau infrastructura paralele.

## Reguli React Native (layout, platforma, notificari)

1. Un inset de safe area se rezerva o singura data: daca bara de tab-uri sau alt chrome il acopera deja, ecranul nu il mai adauga.
2. Nu compensa cu valori magice de padding bare de sistem, tastatura sau chrome de navigare; foloseste inset-urile si masuratorile reale.
3. Verifica intotdeauna ce face deja platforma inainte de a adauga compensare proprie; dubla compensare este un bug la fel de grav ca lipsa ei.
4. In modale, inaltimea se exprima ca plafon (`maxHeight`) plus `flex`, nu ca inaltime fixa: fereastra de dialog se poate redimensiona singura.
5. Cand apare tastatura, inputul focusat si actiunile principale trebuie sa ramana vizibile.
6. Orice ecran care se poate deschide dintr-o notificare trebuie sa fie accesibil prin navigare programatica, cu handler de tap tratat.
7. Nu trimite o notificare cu payload pe care aplicatia nu il foloseste la deschidere.
8. Efectele care apeleaza module native se limiteaza la fereastra de date relevanta; nu itera peste tot setul de date la fiecare montare.
9. Programarea locala (notificari, alarme) trebuie sa fie idempotenta si sa se anuleze singura pentru inregistrarile anulate sau expirate; reminder-ele de eveniment se programeaza doar din `EventRemindersSync`.
10. Permisiunile native cerute din cod trebuie declarate si in manifest/Info.plist in aceeasi schimbare.

## Reguli de securitate si control al livrarii

1. Clientul mobil este un client public: poate fi inspectat sau reimplementat. CORS, ascunderea URL-ului, numele aplicatiei si un secret inclus in APK/IPA nu autorizeaza cereri. Identitatea, compania, rolul si functiile abonamentului se verifica pe server.
2. Baza de date este accesibila numai backendului prin retea privata sau firewall. Aplicatia mobila nu primeste credentiale SQL. Contul SQL al aplicatiei nu este root, nu are privilegii globale sau drept de acordare a privilegiilor; migrarile de productie folosesc un cont separat. Conexiunile SQL intre servere se cripteaza si verifica certificatul.
3. Credentialele de autentificare si SQL nu intra in Git, bundle, loguri, URL-uri sau argumente de proces. Un secret expus se revoca si se roteste; stergerea lui din ultimul commit nu rezolva expunerea din istoric.
4. API-ul mobil accepta tokenuri Bearer, separat de sesiunea web a operatorului. Tokenurile au termen finit; logout revoca sesiunea curenta, resetarea parolei revoca toate tokenurile, iar schimbarea parolei invalideaza si sesiunile web existente.
5. Logout elimina imediat identitatea, istoricul de navigare, cache-ul privat, navigarea amanata si reminder-ele. Schimbarea identitatii elimina cache-ul privat al sesiunii anterioare. Raspunsurile si callback-urile incepute intr-o sesiune veche nu pot modifica o sesiune noua. Scrierile si stergerile tokenului sunt serializate.
6. Linkurile semnate pentru fisiere private sunt legate de sesiunea emitenta si expira. La descarcare se reverifica sesiunea, contul, rolul, compania, abonamentul si modulul. Parametrii semnati contin identificatori publici, niciodata tokenul Bearer. URL-ul semnat complet este confidential si se redacteaza din loguri.
7. Raspunsurile private, inclusiv erorile API, folosesc no-store; paginile private restaurate din istoricul browserului reverifica sesiunea. Antetele impiedica interpretarea MIME neasteptata, incadrarea panoului in iframe si transmiterea URL-urilor private prin Referer.
8. Testele de autorizare includ acces anonim, cont blocat, token revocat sau expirat, alta companie, rol insuficient si modul dezactivat. Matricea se verifica pentru citire si scriere, inclusiv pentru linkuri emise anterior.
9. Deciziile concurente se iau sub lockuri intr-o tranzactie, inclusiv citirile din subquery-uri. Scenariile de concurenta se testeaza pe motorul SQL folosit in productie si numai intr-o baza dedicata cu sufixul _test; SQLite nu valideaza lockurile MySQL.
10. Structura datelor externe se valideaza inainte de conversii; un array primit in loc de string trebuie sa produca o eroare de validare, fara avertismente sau exceptii de conversie.
11. Ritmul verificarilor locale din sectiunea Mod de lucru nu inlocuieste CI. Pull request-urile si livrarile au gate-uri pentru tipuri, lint, teste, build relevant, vulnerabilitati ale dependentelor si scanarea secretelor. Verificarile se impun si prin protectia ramurii principale. CI instaleaza lockfile-urile; update-urile se pregatesc local. Actiunile CI se fixeaza la commit, imaginile de securitate la digest, iar permisiunile sunt minime.
12. Un gate esuat nu se ocoleste prin force, ignorare globala, teste slabite sau continue-on-error. Vulnerabilitatile fara remediere compatibila se documenteaza cu advisory, impact si actiunea urmatoare si raman blocaje explicite pentru lansare.
13. Producatia foloseste HTTPS, APP_DEBUG=false, cookie-uri Secure/HttpOnly si document root exclusiv business-api/public. Fisierele de mediu, vendor, storage privat, dumpurile si uneltele locale nu sunt servite de webserver. Accesul operatorilor necesita MFA sau un gateway de acces cu autentificare suplimentara.
14. Backupurile sunt private, criptate in afara serverului si au restaurarea verificata intr-o baza separata. Jurnalul de audit inregistreaza actorul si actiunea cu o lista explicita de campuri permise, fara payloaduri brute sau credentiale.
15. Actualizarile native se livreaza numai dupa verificarea proiectelor native si un build Android; iOS necesita verificare pe macOS. Instalarea npm si peerDependencies rezolvate nu demonstreaza compatibilitatea la executie.
16. Auditul precizeaza ce a fost verificat, rezultatele, limitarile si blocajele. Nu declara conformitate OWASP/WCAG sau securitate absoluta doar pentru ca testele automate trec.

## Reguli de calitate si livrare

1. Un task cu risc redus se poate incheia fara verificari conform ritmului din "Mod de lucru"; modificarile critice respecta exceptiile de verificare imediata. Erorile introduse de schimbarea curenta se remediaza inaintea continuarii. Erorile preexistente se raporteaza separat, cu dovezile disponibile, fara a fi atribuite schimbarii curente. Un gate esuat ramane blocaj pentru merge sau livrare, inclusiv cand eroarea este preexistenta.
2. Erorile neasteptate ajung doar in `shared/monitoring/reportError`; `console.error` direct nu este un mecanism de raportare.
3. Aplicatia trebuie sa aiba o bariera de erori la radacina; o exceptie in render nu are voie sa lase utilizatorul cu ecran gol.
4. Erorile aratate utilizatorului trec doar prin `showError`, mesajele prin `showMessage`, confirmarile prin `confirmAction` (toate din `shared/feedback`); nu folosi `Alert.alert` sau alte dialoguri de sistem.
5. Fiecare flux critic (autentificare, creare eveniment, incasare) are cel putin un test care monteaza ecranul cu API-ul mock-uit. Aceste teste nu inlocuiesc integrarea cu backend real si baza separata de test pentru autentificare, creare/editare rezervari, disponibilitatea salilor, incasari, conflicte de versiune si schimbarea companiei sau sesiunii. Integrarea verifica structura raspunsurilor, validarile, codurile de eroare, autorizarea si operatiile succesive. Refoloseste probele din `primary-docs/ANDROID_E2E.md` si `primary-docs/ROADMAP_LANSARE.md`, fara infrastructura paralela inutila.
6. Configurarile dependente de mediu se citesc din fisiere de mediu, cate unul per mediu (`.env`, `.env.production`, citite prin `@env` in `business-front`); nu exista valori de mediu in cod.
7. Textele afisate utilizatorului se scriu in romana, cu diacritice, consecvent cu restul aplicatiei (vezi `primary-docs/CONVENTII_TEXT_SI_ERORI.md`). Regula se refera doar la textul afisat in aplicatie; docblock-urile si descrierile din cod raman fara diacritice (vezi Reguli comune 17 si Laravel/PHP 26).
8. Accesibilitatea este parte din definitia de "terminat": contrast minim 4.5:1 pentru text mic si layout care rezista la font scaling.
9. Textul erorilor afisate utilizatorului provine din frontend, nu din backend: backend-ul intoarce un cod de eroare stabil, iar `business-front` mapeaza codul la textul in romana cu diacritice si il afiseaza prin `showError` din `shared/feedback`. Maparea cod->text sta intr-un loc reutilizabil, cu un mesaj generic (fallback) pentru coduri necunoscute (vezi `primary-docs/CONVENTII_TEXT_SI_ERORI.md`).
10. Optimizarea performantei necesita masuratori reproductibile. Endpointurile critice si ecranele importante au scenarii cu date reprezentative, volum documentat si hardware cunoscut. Investigheaza inainte de release cresterile semnificative ale latentei, numarului de interogari SQL, memoriei sau timpului de randare. Pragurile de acceptare se definesc in `primary-docs/PERFORMANCE.md` pe baza masuratorilor si capacitatii infrastructurii; nu inventa rezultate si nu declara praguri atinse fara dovezi.
11. Functionalitatile cu risc ridicat sau contractele activate etapizat trebuie sa poata fi activate controlat cand acest lucru reduce riscul operational. Foloseste feature flags numai pentru o nevoie concreta de activare progresiva sau dezactivare rapida; nu inlocuiesc autorizarea pe server. Documenteaza starea implicita, conditiile de activare, dezactivarea si eliminarea ulterioara a flagului. Nu introduce un sistem general de flags pentru functionalitati simple.
12. Un deploy este validat numai dupa verificarea versiunilor livrate, migrarilor si serviciilor relevante. Dupa livrare verifica endpointurile de sanatate, erorile aplicatiei, disponibilitatea serviciilor si executia joburilor critice, fara modificarea datelor reale pentru testare. Erorile trebuie sa poata fi corelate cu versiunile exacte API si Android. Refoloseste monitorizarea existenta si procedurile din `primary-docs/ROADMAP_LANSARE.md`; nu declara monitorizarea functionala fara proba efectiva de colectare si alertare.
13. La finalul fiecarui task de implementare, agentul raporteaza concis ce a modificat si in ce repository-uri, comportamentul rezultat, verificarile executate efectiv si rezultatele lor, verificarile omise conform ritmului si riscurile, limitarile sau pasii de livrare ramasi. O verificare neexecutata se declara explicit; inspectia codului nu demonstreaza succesul testelor. Nu declara un task testat, integrat, livrat sau validat fara dovezi corespunzatoare. Nu modifica functionalitati fara legatura si nu introduce refactorizari extinse fara justificare sau autorizare.
