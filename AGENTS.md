# Reguli obligatorii pentru acest proiect

Aceste reguli se aplica oricarei schimbari facute in `business-api` si `business-front`.

## Mod de lucru

1. Verificarile nu se ruleaza dupa fiecare task. Rundele locale obisnuite folosesc `tsc --noEmit`, `eslint .` si `npm run test:affected` in `business-front`; `vendor/bin/pint --test` si `composer test:affected` in `business-api`. Pentru MySQL se foloseste `composer test:affected -- --configuration=phpunit.mysql.xml`, numai in baza dedicata cu sufixul `_test`. Optiunea `--list` doar afiseaza selectia, fara executarea testelor.
2. La al 5-lea task intreaba utilizatorul daca sa rulezi verificarile. Daca raspunsul este nu, ruleaza-le la al 10-lea task fara sa mai intrebi. Dupa fiecare rulare, numaratoarea o ia de la capat.
3. Un task este o cerere a utilizatorului; numaratoarea se face pe sesiunea de lucru.
4. In afara acestui ritm, verificarile se ruleaza doar cand utilizatorul le cere explicit.
5. Update-urile dependentelor se fac in runde separate de mentenanta, cerute explicit, nu in rundele selective. In runda de mentenanta cauta pachetele disponibile (`npm outdated` in ambele proiecte, `composer outdated --direct` in `business-api`), aplica update-urile compatibile si ruleaza toate verificarile: tipuri, lint, Jest complet, Pint, PHPUnit complet SQLite/MySQL si buildurile relevante pentru pachetele actualizate. Nu reseta numaratoarea pentru simpla listare a selectiei sau pentru testele uneltelor de selectie.
6. Update-urile patch si minor se aplica direct. Pentru un update major intreaba intai, pentru ca poate cere schimbari de cod sau native (React Native, React, Babel, Jest, ESLint, TypeScript, PHPUnit, Guzzle).
7. Pachetele cuplate se actualizeaza impreuna si respecta `peerDependencies`: `react-native` cu toate `@react-native/*`, `react` si `react-test-renderer` cu versiunea ceruta de `react-native`, `react-native-reanimated` cu `react-native-worklets`.
8. Nu forta instalarea cu `--force` sau `--legacy-peer-deps`; un conflict de `peerDependencies` se rezolva prin versiuni compatibile.
9. Orice schimbare de contract API, schema de baza de date, ecran sau flux se reflecta in `PROJECT_SCHEMA.md` in aceeasi schimbare.
10. In mediul local folosim doar aplicatia Android: o deschidem si folosim aplicatia prin interfata ei.
11. Selectorii compara ramura cu baza comuna fata de `origin/main` sau `--base`, plus staged, unstaged si untracked. Schimbarile globale, configurarile, dependentele, infrastructura testelor, stergerile/redenumirile, fisierele fara mapare/teste si baza Git indisponibila cer rulare completa. In CI, PR-urile draft folosesc `quality-affected`; PR-urile pregatite pentru merge, fiecare commit nou al lor, `main` si declansarea manuala folosesc `quality` cu suita completa. Un rezultat selectiv nu inlocuieste verificarea completa pentru merge sau livrare. Instructiunile si limitele sunt in `primary-docs/TEST_SELECTION.md`.

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
17. Nu adauga comentarii pe linie sau blocuri explicative in cod (`//`, `#`, `/* */`); rostul codului trebuie sa reiasa din nume, tipuri si structura. In `business-front` nu se folosesc nici docblock-uri; in `business-api` docblock-urile PHPDoc se pastreaza si sunt recomandate (vezi regulile Laravel/PHP 26-28).
18. Exceptii in `business-front`: directivele cerute de unelte (ex. `eslint-disable-next-line`, `/* global jest */`) si adnotarile JSDoc strict de tip (`/** @type {...} */`) din fisierele de configurare JS.
19. Nu pastra cod comentat in repository.
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
20. Migratiile noi trebuie sa aiba strategie de rollback si deployment.
21. Logica de business sta in `app/Domain/<Arie>/`, validarea in `app/Http/Requests/<Arie>/`, raspunsurile in `app/Http/Resources/`; controllerele din `app/Http/Controllers/Api` doar le leaga.
22. Tabelele noi de business au cheie primara `uuid`, `company_id` pentru izolare si `user_id` pentru autor. Tabela `companies` este radacina si nu are `company_id`; operatiunile automate pot avea autor null.
23. Endpointurile de lista se pagineaza cu paginatorul Laravel si accepta `page` si `per_page`, limitat prin `Controller::perPage()`.
24. Rutele publice noi primesc `throttle`; fisierele private se descarca doar prin URL semnat temporar.
25. Fiecare endpoint nou sau modificat are test in `tests/Feature/<Entitate>ApiTest.php`, inclusiv cazul in care alt user incearca sa acceseze resursa.
26. Fiecare metoda noua sau modificata are docblock PHPDoc: o descriere scurta a rolului, `@param` pentru fiecare parametru (tipul si ce primeste) si `@return` (ce intoarce), chiar daca tipurile native le exprima deja. Proprietatile si constantele cu structura primesc `@var`. Descrierile noi se scriu in romana, fara diacritice.
27. Docblock-urile existente nu se sterg; se actualizeaza odata cu semnatura sau comportamentul metodei.
28. `business-api/pint.json` dezactiveaza `no_superfluous_phpdoc_tags`, ca Pint sa nu stearga tag-urile `@param`/`@return` care repeta tipurile native; nu reactiva regula.
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
27. Nu lasa un fisier sa creasca peste ~250 de linii; extrage pasii de wizard, tab-urile si panourile in fisiere proprii.
28. Nu duplica logica de formatare: banii trec prin `shared/utils/money`, datele prin `shared/utils/formatDate` (dayjs), etichetele de catalog prin `features/catalogs/utils/catalogLabels`.
29. Foloseste doar culorile din `theme.colors` (`src/shared/theme/theme.ts`) si tokenurile existente de spacing, radius si tipografie. Nu hardcoda valori si nu adauga culori, nuante sau tokenuri noi in tema din proprie initiativa; daca pare ca lipseste una, intreaba utilizatorul.
30. Nu lasa configurare moarta in proiect (preseturi nefolosite, fisiere de config duplicate).
31. Fiecare feature sta in `src/features/<feature>/`, cu `api/`, `components/`, `hooks/`, `schemas/`, `screens/`, `utils/` si `types.ts`; ce folosesc mai multe feature-uri merge in `src/shared/`.
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
5. Logout elimina imediat identitatea, istoricul de navigare, cache-ul privat, navigarea amanata si reminder-ele. Raspunsurile si callback-urile incepute intr-o sesiune veche nu pot modifica o sesiune noua. Scrierile si stergerile tokenului sunt serializate.
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
16. Auditul precizeaza ce a fost verificat, rezultatele, limitarile si blocajele. Nu declara conformitate OWASP/WCAG sau securitate absoluta doar pentru ca testele automate trec. Sursele AGENTS.md si PROJECT_SCHEMA.md sunt in primary-docs; cele trei copii din radacina workspace-ului, business-api si business-front se pastreaza sincronizate cu ele.

## Reguli de calitate si livrare

1. Un task se poate incheia fara verificari; ele ruleaza in ritmul din "Mod de lucru". In runda de verificari toate trebuie sa treaca, iar erorile gasite se repara inainte de orice alt task.
2. Erorile neasteptate ajung doar in `shared/monitoring/reportError`; `console.error` direct nu este un mecanism de raportare.
3. Aplicatia trebuie sa aiba o bariera de erori la radacina; o exceptie in render nu are voie sa lase utilizatorul cu ecran gol.
4. Erorile aratate utilizatorului trec doar prin `showError`, mesajele prin `showMessage`, confirmarile prin `confirmAction` (toate din `shared/feedback`); nu folosi `Alert.alert` sau alte dialoguri de sistem.
5. Fiecare flux critic (autentificare, creare eveniment, incasare) are cel putin un test care monteaza ecranul cu API-ul mock-uit.
6. Configurarile dependente de mediu se citesc din fisiere de mediu, cate unul per mediu (`.env`, `.env.production`, citite prin `@env` in `business-front`); nu exista valori de mediu in cod.
7. Textele afisate utilizatorului se scriu in romana, cu diacritice, consecvent cu restul aplicatiei (vezi `primary-docs/CONVENTII_TEXT_SI_ERORI.md`). Regula se refera doar la textul afisat in aplicatie; docblock-urile si descrierile din cod raman fara diacritice (vezi Reguli comune 17 si Laravel/PHP 26).
8. Accesibilitatea este parte din definitia de "terminat": contrast minim 4.5:1 pentru text mic si layout care rezista la font scaling.
9. Textul erorilor afisate utilizatorului provine din frontend, nu din backend: backend-ul intoarce un cod de eroare stabil, iar `business-front` mapeaza codul la textul in romana cu diacritice si il afiseaza prin `showError` din `shared/feedback`. Maparea cod->text sta intr-un loc reutilizabil, cu un mesaj generic (fallback) pentru coduri necunoscute (vezi `primary-docs/CONVENTII_TEXT_SI_ERORI.md`).
