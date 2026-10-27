# Your Business Planner — contractul actual

Actualizat la 26 octombrie 2026. Acest document descrie comportamentul curent; notele cronologice anterioare sunt in [istoricul pastrat](docs/PROJECT_SCHEMA_ISTORIC_2026-10-26.md). Istoricul nu defineste contracte alternative. Criteriile nevalidate pentru lansare sunt in [registrul de lansare](docs/ROADMAP_LANSARE.md), iar planul integral este in [planul de calitate](docs/PLAN_CALITATE_2026-10-26.md).

## Aplicatii si medii

- `business-api`: Laravel, MySQL, Bearer Sanctum pentru Android si sesiune web separata pentru operatorul platformei.
- `business-front`: React Native/TypeScript; local se foloseste aplicatia Android prin interfata ei.
- `company_id` izoleaza datele; `user_id` pastreaza autorul. `companies` este radacina. Identificatorii de business sunt UUID.
- Configuratia API este in `config/gt.php`, citita din mediu; clientul citeste `@env`. Credentialele SQL nu ajung in client.
- API-ul local este pe 8010; MySQL pe 3307, Mailpit web pe 8026. Porturile/configuratiile sunt ale mediului local, nu adrese de productie.

## Identitate si autorizare

Rolurile companiei sunt `owner`, `admin`, `employee`. Operatorul are `is_platform_admin`, separat de companie; contul mobil al companiei nu autorizeaza panoul web.

Tokenurile au termen finit. Logout revoca sesiunea curenta si curata identitatea, navigarea, cache-ul privat, navigarea amanata, jurnalele private locale si reminderele. Resetarea parolei revoca toate tokenurile, iar schimbarea parolei invalideaza si sesiunile web existente. Cererile si callbackurile sunt legate de generatia sesiunii; o sesiune veche nu poate modifica sesiunea noua. Scrierile tokenului si ale jurnalelor sunt serializate.

Serviciile din `app/Domain` scopeaza accesul la compania curenta. Resursele altei companii intorc 404. Contul blocat sau profilul de angajat inactiv nu pastreaza accesul. Angajatul vede numai rezervarile si remuneratia alocate, fara financiarul companiei sau datele nepermise ale clientilor.

Compania suspendata, abonamentul expirat sau categoria indisponibila blocheaza datele inclusiv prin linkuri emise anterior. Functiile `staff`, `finance`, `documents`, `reminders` sunt autorizate pe server. Dezactivarea nu sterge istoricul. Clientul ascunde fluxurile indisponibile si invalideaza numai interogarile relevante; ascunderea nu constituie autorizare.

Accesul comercial/trial necesita inceputul perioadei atins si sfarsitul strict dupa timpul serverului. Perioada comerciala valabila are prioritate fata de trial. Ziua finala aleasa in panou este inclusa in Europe/Bucharest; in UTC se stocheaza limita exclusiva. Limita locurilor numara conturile neblocate si invitatiile nefolosite cu termen strict in viitor. Verificarea cresterii se face sub lockul companiei.

## Reguli temporale normative

1. Datele calendaristice si introducerea/afisarea programului folosesc Europe/Bucharest. Timestampurile sunt UTC si se expun ISO 8601 cu offset.
2. Intersectia intervalelor este semi-deschisa: `[start, end)`. O rezervare care se termina exact la 00:00 nu ocupa ziua urmatoare.
3. Pentru agenda si filtre, un program complet este viitor cat timp `ends_at > now`; la `ends_at <= now` este trecut, inclusiv egalitatea exacta.
4. Fara program complet, rezervarea ocupa intreaga sa zi locala, de la 00:00 inclus la urmatorul 00:00 exclus. Ziua curenta ramane viitoare pana la limita ei exclusiva.
5. Provizoriile cu `expires_at <= now` sunt expirate chiar daca schedulerul nu a rulat. Anularile si provizoriile expirate nu blocheaza disponibilitatea.
6. La scriere se pastreaza si restrictia unei singure rezervari blocante pe aceeasi sala/data, chiar daca orele propuse nu se intersecteaza.
7. Orele inexistente la schimbarea orei sunt refuzate. Ora repetata necesita offset explicit +03:00 sau +02:00. Nu se reparseaza textul localizat produs de `toLocaleString`.
8. Serverul decide disponibilitatea, expirarea si autorizarea. Ceasul telefonului actualizeaza prezentarea si solicita revalidare, fara a prelungi o sesiune sau un abonament.

## Modelul de date si consistenta

| Arie | Structuri si responsabilitate |
| --- | --- |
| Companie/acces | companies, company_subscriptions, business_categories, subscription_plans, account_invitations, audit_entries; trial, functii si limite |
| Sali | halls, hall_images; profil, capacitate, minim garantat optional, dotari/program, galerie privata si versiune |
| Clienti | clients, client_contacts, client_locations, client_creation_operations; contact unic in companie, versiune si creare idempotenta |
| Rezervari | events, venue_booking_details, event_staff_assignments, booking_creation_operations; contract, sala, program, personal, versiune si deduplicare |
| Financiar | event_payments; incoming/outgoing, categorie, stare, versiune, operation_id si operation_hash |
| Documente | event_documents; versiune, fisier privat, stergere logica, confirmarea stergerii fizice |
| Personal | employees, invitatii/conturi si alocari; versiune, tarif, rol, disponibilitate si istoric |
| Operare | outgoing_mail cu payload criptat si retry; heartbeat-urile joburilor in cache operational |

Scrierile dependente sunt tranzactionale. Lockurile urmeaza companie → resursa; concurenta se verifica pe MySQL dedicat `_test`. SQLite nu demonstreaza lockurile MySQL. `companies.planner_revision` avanseaza explicit in tranzactiile planificatorului. Importurile directe necesita scrieri oprite si avansarea reviziei inaintea reluarii accesului.

Versiunile rezervarii, platii, clientului, salii, documentului si personalului se verifica pe resursa recitita sub lock. O versiune veche produce `RESOURCE_VERSION_CONFLICT / 409`, fara suprascrierea datelor curente. Nu se reintroduce implicit o resursa arhivata.

Cheia de creare este persistata impreuna cu intentia canonica si resursa. Retry-ul identic recupereaza aceeasi resursa; o intentie diferita cu aceeasi cheie produce codul de conflict specific. In mod normal, primul refuz explicit de disponibilitate reda editarea; dupa un rezultat incert se pastreaza cheia si payloadul original pana la reconciliere.

## Contracte HTTP

Prefix `/api`. Raspunsurile private, inclusiv erorile, au `Cache-Control: no-store`. Datele de lista sunt paginatori Laravel cu `page` si `per_page`, limitat de `Controller::perPage()`. Cataloagele sunt marginite natural; istoricul nu este descarcat integral in client.

| Resursa | Endpointuri actuale si acces |
| --- | --- |
| Autentificare | POST login, password/forgot, password/reset, invitations/accept, cu throttle; GET me si POST logout pentru cont activ |
| Rezervari | GET events, events/{id}; POST/PUT/DELETE pentru owner/admin cu acces activ; angajatul citeste numai alocarile proprii |
| Calendar | GET calendar?date_from&date_to&hall_id; GET calendar/day?date&hall_id&include_inactive&page&per_page&snapshot; owner/admin |
| Sali | GET/POST halls; GET/PUT/DELETE halls/{id}; POST halls/{id}/status; owner/admin |
| Clienti | GET/POST clients; GET/PUT/DELETE clients/{id}; owner/admin |
| Personal | GET/POST employees; GET/PUT/DELETE employees/{id}; GET staff-availability; modul staff si owner/admin |
| Firma/conturi | GET company, team, invitations; PUT profile/company si POST company/fiscal-lookup; administrarea firmei si invitarile respecta rolul owner |
| Plati | GET/POST events/{eventId}/payments; GET/PUT/DELETE event-payments/{id}; modul finance si owner/admin |
| Documente | GET/POST events/{eventId}/documents; GET/PUT/DELETE event-documents/{id}; GET event-documents/{id}/download-url; modul documents |
| Sumar | GET overview, owner/admin si finance; interval cel mult 366 zile |
| Remindere | GET reminder-events, fereastra limitata si numai pentru drepturile contului si modulul reminders |
| Operare publica | GET health; numai status ok/unavailable si HTTP 200/503, fara detalii de DB/disc/joburi |
| Compatibilitate publica | GET mobile-policy; mod, min_build, recommended_build, contract_version si store_url HTTPS optional |
| Telemetrie | POST telemetry/errors, cont activ si throttle 10/minut; numai categorii/context tehnic validat, fara mesaj/payload privat |

POST/PUT events folosesc hall_id, client_id, date, type, status, starts_at, ends_at, expires_at, minimum_guests, final_guests, menu_price, menu_name, agreed_advance, advance_due_at, extra_services, staff si notes. Crearea primeste operation_id, editarea version; identificatorii companiei si autorului nu vin din formular. extra_services este lista `{name, amount}`; staff este lista de alocari `{employee_id, job_role, pay_type, rate, starts_at, ends_at}`. Backendul calculeaza totalurile si costurile. Colectiile externe sunt validate inainte de conversie; obiectul JSON nu este acceptat in locul unei liste.

`GET events` include `meta.months` cu totalurile lunare complete ale filtrului si `meta.snapshot`. Pagina, totalul, amprenta, relatiile si totalurile lunare sunt citite intr-o tranzactie cu moment unic. Amprenta HMAC include revizia, identitatea/rolul, filtrele, marimea paginii, ziua locala si tranzitiile temporale indexate. Schimbarea paginarii produce `BOOKING_LIST_CHANGED / 409`; clientul reia prima pagina.

`GET calendar/day` expune pe sala id/name/capacity/minimum_guests/is_active si lista `bookings` cu id/status/type/starts_at/ends_at. Campurile booking_id/status/type/starts_at/ends_at de la nivelul salii pastreaza primul interval. Include toate intervalele care intersecteaza ziua, inclusiv continuari. O sala inactiva filtrata fara intervale apare ca inactive numai cu include_inactive=1. `meta.snapshot` se retransmite; schimbarea produce `CALENDAR_DAY_LIST_CHANGED / 409`.

Sumarul calendarului contine halls `{id,name,is_active}` si days `{date,confirmed,tentative,occupied_halls,active_capacity,active_occupied_halls,historical_occupied_halls,free}`. Ocuparea numara distinct sala–zi; confirmed/tentative numara inceputurile rezervarilor. `free` scade doar ocuparea activa din capacitatea activa. Statistica anuala nu inventeaza capacitate pentru sali inactive. Agregarile fiecarui raspuns sunt citite coerent sub lock comun al companiei; endpointurile distincte nu promit snapshot comun.

## Bani si stari

Calculele folosesc exclusiv bani intregi prin `App\Support\Money`; stocarea foloseste decimal, raspunsurile monetare folosesc siruri zecimale. Tariful maxim este 999.999,99, iar totalul maxim 99.999.999,99. Costul duratelor si soldul derivat sunt limitate inaintea salvarii si a produselor care pot depasi intervalul. Overflow-ul produce `BOOKING_AMOUNT_TOO_LARGE` sau `BOOKING_BALANCE_TOO_LARGE / 422`, cu rollback integral.

Sold = contract − incoming completed + outgoing refund completed. Celelalte cheltuieli nu micsoreaza artificial datoria clientului. Platile pending/cancelled nu intra in aceasta formula. Retry-ul unei plati nu dubleaza resursa sau auditul. Corectia/anularea cere versiunea actuala. Auditul financiar pastreaza numai campurile permise, fara notele brute.

Stari rezervare: tentative, confirmed, completed, cancelled, expired. Stari plata: pending, completed, cancelled. Galeria si documentele nu declara fisierul sters fizic pana la confirmare/absenta.

## Fisiere private si galerie

URL-urile de descarcare sunt temporare, semnate si legate de sesiunea emitenta; nu includ tokenul Bearer. Descarcarea revalideaza sesiunea, contul, rolul, compania, abonamentul si modulul. URL-ul semnat complet este confidential si nu este logat.

Galeria rezerva durabil metadatele in hall_images inaintea scrierii fisierului. hall_id poate fi null, iar deleted_at viitor este lease de 15 minute. Rezervarile nepublicate raman private si consuma cota. Publicarea si purgerul blocheaza compania; o rezervare curatata nu mai poate fi publicata (`HALL_IMAGE_UPLOAD_EXPIRED / 422`). Cleanup-ul confirma file_deleted_at numai dupa stergere/absenta. Rollback-ul la hall_id obligatoriu refuza fisiere pendinte necuratate.

## Ecrane, recuperare si accesibilitate

Agenda este paginata server-side, cu revalidare la 30 secunde cat tabul este activ si la revenire. Ceasul UI elimina rezervarile incheiate/expirate din datele deja incarcate, inclusiv offline. Numaratorile istorice complete provin din agregatele serverului, nu din suma paginilor incarcate.

Calendarul lunar pastreaza designul aprobat: card alb, zile rezervate mov deschis, azi cu contur mov, selectie mov in patrat rotunjit, legenda Azi/Selectat/Rezervat/Liber. Selectia are prioritate si pe o zi complet ocupata. Etichetele accesibile descriu ocuparea si lipsa datelor. La ecran ingust/font mare, lista zilelor distinge textual Liber/Parțial/Complet/Date indisponibile si pastreaza selectia. Titlul perioadei permite salt direct la luna/an fara pierderea filtrului salii. Vederea anuala si lista zilnica raman disponibile.

Pollingul calendarului si al listei zilnice se opreste cand ecranul este ascuns; revenirea revalideaza. Datele vechi si erorile raman distincte de o zi libera. Marcajul ultimei actualizari apare pentru date vechi. Lista salilor libere este numarata din randurile incarcate; cand mai exista pagini, eticheta spune explicit acest lucru.

Formularele folosesc react-hook-form/Zod si campurile comune. Submit-ul este protejat, ciornele sunt pastrate la refuzuri explicite, iar conflictele cer reconciliere. FormModalFrame masoara headerul/footerul si le muta in scroll cand spatiul real nu mai permite un footer separat. Inseturile si tastatura sunt rezervate o singura data. Erorile campurilor au anunt accesibil.

Inainte de POST-ul crearii unei rezervari, cheia si payloadul original sunt persistate in Keychain separat de token, cu cont/companie si generatie de sesiune. Coruperea sau imposibilitatea citirii jurnalului blocheaza o creare noua. O operatie mai veche de 30 zile necesita reconciliere explicita; nu este stearsa automat si nu primeste o cheie noua implicit. Jurnalul platilor pastreaza aceleasi reguli de identitate si retry. Se promit aceste recuperari pentru operatiile salvate, nu pentru orice editare nesalvata a unui formular sau pentru URI-uri temporare de fotografii.

Reminderele se programeaza numai prin EventRemindersSync, idempotent, cu anularea celor expirate/anulate. Limita locala ramane 40. Panoul Notificari afiseaza permisiunile, alarmele exacte, numarul programat si, dupa sincronizare, numerele amanate/nereusite. Fara mecanism push/reconciliere verificat, produsul nu promite sincronizarea anularilor de pe alt dispozitiv cat aplicatia este inchisa. Comportamentul la reboot/41+ necesita probele native din registrul de lansare.

## Compatibilitate mobila

Clientul trimite X-App-Build si X-App-Platform; acestea nu autorizeaza cereri. APP_BUILD din fisierul de mediu selectat este si versionCode Android. ENVFILE selecteaza acelasi mediu pentru Babel/Gradle; buildul release foloseste .env.production implicit. Cache-ul Metro include amprenta fisierului de mediu, pentru a separa aplicatia de business de E2E. Schimbarea fisierului cere restart Metro. Valorile nevalide opresc buildul Android.

Politica publica are modurile observe/recommend/enforce. Implicit este observe, min/recommended 0. Mai multe afiseaza recomandarea de actualizare cand exista un build recomandat mai nou si un URL verificat. Blocarea se activeaza numai dupa publicarea buildului compatibil si validarea URL-ului de actualizare. `MOBILE_POLICY_ENABLED` activeaza citirea anticipata; un CLIENT_UPDATE_REQUIRED primit activeaza verificarea chiar daca rolloutul anticipat era oprit.

In enforce, scrierile incompatibile ale companiei primesc 403 cu `CLIENT_UPDATE_REQUIRED`, fara a fi confundate cu abonamentul sau un 401. me/logout si citirile autorizate raman disponibile. Ecranul de actualizare pastreaza jurnalele; deconectarea explicita avertizeaza ca elimina datele locale. Un endpoint absent pe API-ul vechi nu produce singur o blocare, iar un esec offline nu confirma disparitia unei blocari cunoscute.

## Erori, monitorizare si operare

Backendul intoarce coduri stabile in `error.code`; frontendul detine textul romanesc cu diacritice si fallbackul. Toate erorile afisate trec prin showError, mesajele prin showMessage si confirmarile prin confirmAction. Nu se afiseaza mesajul brut al backendului.

Codurile curente includ UNAUTHENTICATED, SESSION_INACTIVE, FORBIDDEN, RESOURCE_NOT_FOUND, VALIDATION_FAILED, TOO_MANY_REQUESTS, SERVER_ERROR; SUBSCRIPTION_INACTIVE, CATEGORY_UNAVAILABLE, COMPANY_ACCESS_DENIED, MODULE_DISABLED; RESOURCE_VERSION_CONFLICT, BOOKING_OPERATION_CONFLICT, PAYMENT_OPERATION_CONFLICT, CLIENT_OPERATION_CONFLICT; HALL_ALREADY_BOOKED, EMPLOYEE_ALREADY_ASSIGNED; BOOKING_LIST_CHANGED, CALENDAR_DAY_LIST_CHANGED; CLIENT_UPDATE_REQUIRED. Maparea completa este in shared/api/apiError.ts, iar regulile requesturilor definesc codurile de validare specifice.

X-Request-ID accepta numai UUID; alte valori sunt inlocuite. Identificatorul se intoarce si se pastreaza in ApiError, inclusiv pentru raspunsuri invalide. reportError nu trimite mesaje arbitrare, payloaduri, URL-uri, note, telefon sau credentiale; 409/422, reteaua si timeouturile asteptate nu devin incidente critice. Cu MONITORING_ENABLED=true, API-ul colecteaza numai categoria, sursa, statusul, request_id si buildul validat. Livrarea catre serviciul extern si alertele cer configurarea mediului.

Canalele de logare folosesc lista explicita de evenimente/context tehnic; mesajele arbitrare si exceptiile brute sunt redactate inainte de handler. Pentru o exceptie se pastreaza tipul, numele fisierului si linia, fara mesaj, argumente sau query. Logurile de acces optionale descriu ruta sablon, nu URL-ul sau query-ul utilizatorului.

Schedulerul urmareste separat inceputul, succesul/esecul si durata pentru expire-bookings, deliver-mail, purge-documents si purge-hall-images. `php artisan business:health --json` expune numai operatorului CLI starea DB, storage, joburilor si backlogului agregat. GET health expune doar starea minima. Pragurile initiale configurabile sunt 180 secunde heartbeat, 300 secunde email pending si 900 secunde cleanup restant; nu sunt SLA demonstrate.

`business:backup --with-files --quiesced` necesita mentenanta si oprirea declarata a scrierilor; in testing ramane obligatorie declaratia de quiescenta. Creeaza SQL si copii private ale fisierelor referite, inclusiv cele arhivate, cu manifest/checksumuri si numerele tuturor tabelelor. Uploadurile viitoare fara continut sunt marcate separat. `business:verify-recovery` verifica integritatea; `--compare-database` compara numere numai intr-o baza restaurata testing/MySQL/_test. Nu importa SQL si nu certifica restaurarea. Procedura, criptarea externa si limitele sunt in `docs/RECUPERARE_SI_DEPLOY.md`.

## Validare si livrare

Verificarile locale respecta AGENTS.md; planul solicitat include validari explicite. CI foloseste lockfile-uri, actiuni fixate, scanare de secrete si gate-uri complete pe PR pregatit/main. Draftul poate folosi testele afectate; rezultatul selectiv nu inlocuieste gate-ul complet. `tools/documentation/check-sync.cjs` compara manifestul si, in workspace, toate copiile; `--update` actualizeaza numai manifestul dupa sincronizarea explicita.

Fixture-urile de calitate refuza orice mediu diferit de testing si orice DB MySQL fara sufix _test. Profile: smoke=1x10, A=100x1000, B=100x10000, C=1x100000 rezervari. Profilele mari adauga 100 clienti, 20 sali, 20 persoane si 10 documente/firma; profilul C are 100 identitati/tokenuri distincte. Tokenurile de fixture expira in sase ore. Importul in loturi suspenda temporar colectarea query-urilor in procesul seederului, apoi restaureaza dispatcherul; cererile masurate nu sunt afectate. Datele sunt sintetice; manifestele cu credentiale raman in storage privat. Serverul dedicat de test foloseste routerul de calitate, confirma contextul si nu serveste panoul web. Buildul qualityE2E are applicationId separat `.e2e`; helperii de introducere nativa nu intra in buildurile obisnuite/release. Testele nu curata aplicatia sau baza de business.

Pentru lansare sunt obligatorii separat: protectii GitHub demonstrate, infrastructura HTTPS/SQL/MFA, restaurare externa coerenta, benchmarkuri reprezentative, matrice nativa/TalkBack, upgrade semnat, cinci smoke-uri E2E stabile, pilot si probe pe reviziile exacte. Aceste cerinte si responsabilii sunt pastrati in ROADMAP_LANSARE. Nu se acorda automat note peste 9 sau conformitate OWASP/WCAG din existenta codului ori din testele automate.
