# Administrarea sălilor — 23 octombrie 2026

Implementare pornită din `YBP_Hall_Details_Handoff` și captura cu lista, adăugarea, editarea, pagina de detalii și acțiunile sălii.

## Funcționalitate

- Lista sălilor: căutare, filtre Toate/Active/Inactive, totaluri pentru căutarea curentă, galerie configurată, paginare și reîncercare.
- Detalii: capacitate, minim comercial implicit, status, fotografii, facilități, următoarele trei rezervări, totaluri confirmate/provizorii, program standard, organizare și note interne.
- Adăugare/editare: formular validat, câmpuri opționale, program pe zile cu încheiere în ziua următoare, facilități existente/personalizate, până la zece fotografii cu alegerea copertei, CTA fix și protecție pentru ciornă/salvare dublă.
- Acțiuni: editare, calendar preselectat, duplicare într-o ciornă nouă, dezactivare/reactivare și ștergere logică numai fără istoric. Serverul verifică din nou compania, rolul, accesul, versiunea și referințele.
- Rezervările sălii pornesc cu filtrul Viitoare; Toate · istoric păstrează sala și deschide istoricul paginat. Apăsarea deschide detaliile rezervării.
- Minimul sălii precompletează un contract nou fără a rescrie minimul ales manual sau snapshotul rezervărilor existente.
- Calendarul include continuările peste miezul nopții și toate intervalele din zi, cu săli ocupate distincte și fără dublarea totalului lunar de rezervări.

## Fișiere

Frontend: feature-ul nou `src/features/halls/` conține API, scheme, hook-uri, componente, ecrane, utilitare și teste. Integrarea modifică `RootNavigator`, tipurile rutelor, cheile/invalidările React Query, maparea erorilor, transportul pentru timeoutul încărcărilor, directorul sălilor și formularele/calendarul rezervărilor. Generatorul existent de UUID pentru operațiuni este mutat în utilitarul comun `createOperationId`, păstrând exportul plăților.

Backend: migrarea `2026_10_23_040000_add_hall_profiles_and_images`, modelele `Hall`/`HallImage`, serviciile `HallService`/`HallImageAccess`, `HallRequest`, `HallController`/`CalendarController`, `HallResource`/`HallDayResource`, rutele API, `BookingSchedule`, `CalendarService` și `HallApiTest`.

Cele trei copii `PROJECT_SCHEMA.md` documentează aceeași schemă, contracte și fluxuri. `AGENTS.md` nu este modificat.

## Date și acces

Nu sunt salvate valori sau fotografii demonstrative. Câmpurile opționale lipsă rămân necompletate și au stări goale explicite. Minimul comercial al sălii este separat de cel contractual al rezervării. Numerele și stările rezervărilor provin din backend și exclud anulările, provizoriile expirate și evenimentele încheiate.

Imaginile sunt private, validate JPG/PNG/WebP, maximum 4 MB și 4096×4096 pixeli. URL-urile semnate expiră în zece minute și se leagă de sesiunea emitentă. Descărcarea reverifică accesul curent, categoria și abonamentul. Nu se expun tokenuri Bearer sau căi de stocare. Eliminarea imaginii/sălii este logică; fișierele rămase nu sunt publice. Curățarea fizică pe termen lung nu este introdusă în această schimbare. Proxy-ul trebuie să redacteze query stringurile linkurilor private din jurnale.

Crearea cu `operation_id` este idempotentă, iar modificările folosesc `version`. La conflict, ciorna rămâne disponibilă; încărcarea versiunii serverului cere confirmare. Pentru compatibilitate, API-ul acceptă în continuare vechea actualizare JSON fără versiune. Schimbarea stării și ștergerea cer obligatoriu versiune.

Callback-urile formularului, acțiunilor și pickerului verifică generația sesiunii înainte de navigare, dialoguri, invalidări sau aplicarea rezultatului. Un răspuns început înainte de logout nu modifică sesiunea următoare. Există și un test de regresie pentru salvarea întârziată peste schimbarea sesiunii.

## Limite explicite

Programul standard și timpii de pregătire/eliberare sunt repere orientative, etichetate în interfață. Nu există încă blocaje operaționale automate, excepții aprobate sau snapshoturi ale acestor timpi pe rezervări. Conflictele reale se verifică prin `BookingSchedule`, pe rezervările confirmate/finalizate și provizoriile valabile, în intervale absolute UTC.

Nu s-au adăugat dependențe sau permisiuni native. Pentru livrare sunt necesare migrarea și un server care acceptă zece fișiere și un post de peste 40 MB. Configurația PHP locală este suficientă: `post_max_size=64M`, `upload_max_filesize=32M`, `max_file_uploads=20`; validarea API limitează fiecare imagine la 4 MB. Migrarea este aplicată local. Rollbackul cere revenirea la clientul/API-ul anterior și backup al profilurilor și galeriei înainte de `down`.

## Validare

Prettier și Pint au fost folosite pentru formatare. Nu au fost executate `tsc`, ESLint, Jest, `pint --test` sau PHPUnit, conform ritmului din `AGENTS.md`; nu s-au căutat/aplicat update-uri de pachete în afara rundei de verificări.

Testele adăugate acoperă lista și filtrele, formularul și duplicarea, ciorna/datele opționale, salvarea dublă, meniul și confirmările, navigarea la calendar/istoric, snapshotul minimului, timeoutul/anularea încărcării și API-ul: izolare, acces, profil, galerie, MIME/dimensiuni/număr, URL-uri expirate/revocate, versiuni, idempotentă și păstrarea istoricului. Scenariile nu sunt declarate validate înainte de rularea lor.

În Android au fost observate lista cu totalurile API și pagina de detalii cu sala existentă, capacitatea reală, minimul necompletat, lipsa facilităților și programului, numărul rezervărilor și CTA-ul fix. Nu s-au făcut salvări, ștergeri, dezactivări sau uploaduri reale în această verificare.

Interacțiunile manuale au fost oprite când emulatorul a început să schimbe ecranele independent de comenzile agentului, pentru a nu interfera cu utilizarea lui. Meniul, formularele și calendarul din noul flux nu sunt declarate verificate manual în această sesiune. Compatibilitate: `include_inactive=1` permite noului client să reprezinte explicit sala inactivă selectată; clienții vechi păstrează comportamentul anterior pentru zilele fără rezervări ale sălilor inactive.

Rămân de validat în runda de verificări: suitele automate, concurența pe MySQL dedicat cu sufix `_test`, scrierile cap-coadă și uploadul unei fotografii de test autorizate, toate lățimile/fontScale, tastatura ancorată și TalkBack. Nu s-a făcut deploy.
