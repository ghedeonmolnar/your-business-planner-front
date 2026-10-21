# Your Business Planner — modelul curent

Actualizat: 2026-10-21.

Acest document descrie contractul pentru companii și săli. Schema și fluxurile istorice GT Events sunt păstrate separat în docs/LEGACY_GT_EVENTS_SCHEMA.md; nu reprezintă API-ul actual.

## Arhitectură și ownership

Backend Laravel în business-api, aplicație React Native în business-front. MySQL comun, cu izolarea explicită pe company_id în serviciile din app/Domain. Nu există înregistrare publică, marketplace sau rezervare făcută de client.

Un cont aparține unei singure companii. is_platform_admin este separat de rolul companiei și nu conferă acces la datele sale operaționale. Ownership-ul, rolul și abonamentul sunt verificate în backend; o resursă din altă companie răspunde cu 404. user_id păstrează autorul înregistrării și nu determină dreptul echipei de acces.

Panoul web folosește sesiunea Laravel și cookie-ul de sesiune, separat de tokenul Sanctum al aplicației mobile. GET/HEAD/POST /platform/login sunt exclusiv pentru vizitatori: operatorii cu sesiune validă sunt trimiși la /platform/companies, inclusiv când accesează rădăcina site-ului. Toate rutele private cer un operator activ; fără sesiune se revine la login, iar blocarea operatorului îi închide sesiunea. Sesiunile web ale conturilor de companie sunt eliminate la intrarea pe login și nu conferă acces la panoul platformei.

Paginile platformei folosesc Cache-Control no-store/private. Browserul revalidează sesiunea la revenirea în filă, din istoric și la termenul de expirare configurat; loginul și delogarea se sincronizează între file prin BroadcastChannel, fără stocarea tokenurilor în browser. Verificarea folosește HEAD /platform/login și nu face polling periodic care să prelungească artificial sesiunea. Un formular trimis cu CSRF expirat după pierderea sesiunii redirecționează la login; un CSRF invalid al unei sesiuni încă valide rămâne refuzat cu 419. Erorile API fără token rămân JSON cu error.code=UNAUTHENTICATED și HTTP 401, inclusiv fără antet Accept JSON.

Sumele se calculează în bani întregi prin App\Support\Money și se persistă decimal. Contractele noi de rezervare returnează sumele ca șiruri zecimale. Datele calendaristice sunt date ale evenimentului în România; timestampurile sunt persistate în UTC și expuse ISO 8601. Afișarea și introducerea programului folosesc Europe/Bucharest, inclusiv trecerea peste miezul nopții.

## Entități

Toate tabelele noi de business au UUID, company_id și user_id; companies este rădăcina și nu are company_id. Jurnalul automat poate avea user_id null pentru scheduler.

| Entitate | Date și reguli principale |
| --- | --- |
| users | company_id nullable pentru operator, rol owner/admin/employee, employee_id pentru personal, blocked_at, is_platform_admin protejate de mass assignment |
| companies | identitate, categorie principală, plan pentru perioade viitoare, note interne, suspendare, excepții de funcții/conturi și trial; autorul creării este operatorul |
| company_subscriptions | preț manual RON, interval UTC, paid_at și referință, plan și snapshot de condiții; istoricul perioadelor este păstrat |
| business_categories | catalog global UUID cu VENUE, ENTERTAINMENT, PHOTO_VIDEO, RENTAL; company_id nul, autor opțional; disponibilitatea este stabilită de cod |
| subscription_plans | catalog global UUID: denumire, preț orientativ opțional, limită de conturi, trial_days, funcții și arhivare; company_id nul |
| platform_settings | contacte publice de suport; înregistrări globale cu company_id nul și autorul modificării |
| venue_booking_details | relație unică event_id, company_id și autor: hall_id, minimum_guests, final_guests, menu_price, menu_name |
| account_invitations | companie, identitate, rol, profil de personal opțional, hash secret, expires_at, used_at; secret de 40 de caractere, valabil 3 zile, utilizare unică |
| halls | nume, capacitate, adresă, is_active; arhivarea păstrează rezervările |
| clients/contacte/locații | izolate pe companie, notele discuțiilor și istoricul; identitatea telefonică este unică pe companie |
| employees | nume, job_role, tarif implicit opțional, is_active; profesia este distinctă de rolul de acces |
| events | sală, client, data evenimentului, interval UTC, stare, termen provizoriu, minim garantat, invitați finali, preț/meniu negociat, avans convenit/scadență, servicii suplimentare, note |
| event_staff_assignments | persoană, rol operațional, interval propriu UTC, remunerare fixed/hourly, rate și estimated_cost snapshot |
| event_payments | încasare/cheltuială manuală, categorie, sumă, dată, metodă, stare; anularea păstrează înregistrarea |
| event_documents | contract/meniu/alte documente, metadata și cale privată în directorul companiei |
| audit_entries | actor, companie, acțiune, resursă și valori comerciale relevante; fără parole, coduri sau tokenuri |

Rolurile operaționale sunt hall_manager, waiter, cook, bartender și other. Proprietarul și administratorii văd și gestionează informațiile financiare. Personalul primește numai evenimentele alocate și alocarea/remunerația proprie; prețurile clientului, soldul, telefonul clientului, notele interne și documentele nu sunt expuse.

Coloanele și tabelele istorice necesare lanțului de migrări rămân în schemă. Mascotele, maparea limitată la Bihor, review-urile publice, prelungirile animatorilor și plata staff_auto nu fac parte din fluxurile sau rutele produsului curent.

## Abonamente și invitații

Accesul este activ dacă firma nu este suspendată și există o perioadă comercială începută sau un trial început, cu finalul strict după timpul serverului. O perioadă comercială valabilă are prioritate față de trial; dintre perioadele suprapuse se selectează cea cu începutul cel mai recent, apoi data creării și UUID-ul descrescător. Panoul interpretează ultima zi introdusă ca zi inclusă în Europe/Bucharest și persistă limita exclusivă în UTC.

Loginul mobil folosește email unic, în câmpul API username, și parolă. Operatorii nu se autentifică mobil. Autentificarea și GET /me sunt disponibile pentru identificarea accesului inactiv; datele operaționale sunt blocate. Aplicația elimină cache-ul și reminder-ele după blocare și aplică local termenul cunoscut al abonamentului.

Operatorul are sesiune web separată, cu CSRF și limitare pentru autentificare. Creează și configurează companii, invită/reinvită proprietari înainte de activare, înregistrează perioade și plăți, suspendă/reactivează companii, configurează planuri și blochează/reactivează conturi de companie. Nu poate consulta rezervările sau documentele prin contul de operator.

Numai proprietarul invită administratori și personal, revocă invitații și blochează/reactivează conturi. Nu poate exista transfer de proprietar prin formularul de invitație al echipei. Dezactivarea unui angajat invalidează accesul său și împiedică activarea invitației cât timp profilul este inactiv.

## Fundația SaaS și panoul Super Admin

Prima categorie operațională este VENUE. ENTERTAINMENT, PHOTO_VIDEO și RENTAL sunt vizibile cu statutul „În pregătire”; backendul refuză atribuirea lor prin CATEGORY_UNAVAILABLE. Un cont aparține unei singure companii, iar o companie are o categorie principală. Nu există încă module operaționale pentru celelalte industrii, comutare între companii sau transfer de proprietate.

Panoul Blade folosește Vite, fonturile Inter, Ionicons și variabile CSS preluate din tema Paper existentă. Navigarea include /platform/dashboard, /platform/companies, /platform/users, /platform/categories, /platform/plans, /platform/settings și /platform/audit. Companiile au căutare pe identitate/proprietar/contact, filtre de acces/categorie/plan, sortări permise și paginare server-side. Formularul lateral de creare/editare are taburi Informații generale, Setări și Abonament; erorile păstrează valorile și selectează tabul relevant. Jurnalul global include numai resurse administrative și permite company_id nul pentru operațiunile globale. Operatorii nu primesc acces la rezervări sau documente.

Planurile au preț orientativ opțional, user_limit nullable pentru nelimitat, trial_days între 0 și 365 și funcțiile staff, documents, finance, reminders. O perioadă comercială păstrează numele planului, limita și funcțiile într-un snapshot. Modificările catalogului afectează doar perioadele viitoare. Excepțiile explicite ale companiei se aplică imediat: limita personalizată înlocuiește limita acordată, iar fiecare funcție poate fi moștenită, activată sau dezactivată. Categoria limitează funcțiile implementate. Planurile arhivate nu pot fi acordate pentru perioade noi.

Trialul se configurează înainte de activarea proprietarului și începe o singură dată la acceptarea invitației, în aceeași tranzacție cu contul. Trialul și condițiile lui sunt persistate; retrimiterea invitației, suspendarea și reactivarea nu îl repornesc. Companiile existente primesc VENUE și planul Personalizat cu toate funcțiile și fără limită nouă, păstrând toate perioadele și suspendările; nu primesc trial automat. Crearea fără perioadă permite activarea identității proprietarului, dar accesul operațional rămâne blocat.

Locurile ocupate sunt conturile neblocate, inclusiv proprietarul, plus invitațiile nefolosite cu expires_at strict în viitor. Personalul fără cont nu consumă locuri. Invitațiile și reactivările blochează compania în tranzacție înainte de verificarea limitei. Retrimiterea unei invitații valabile pentru același email nu consumă încă un loc. Acceptarea transformă locul rezervat într-un cont și rămâne permisă dacă limita a fost redusă între timp. Reducerea sub consum nu închide conturile existente; blochează creșterile viitoare de consum.

Rezervările, calendarul, sălile, clienții și condițiile comerciale negociate sunt de bază. staff controlează directorul de personal, disponibilitatea și modificarea alocărilor; documents controlează documentele, inclusiv URL-urile deja semnate; finance controlează plăți, cheltuieli și rapoarte; reminders controlează planificarea locală. Dezactivarea nu șterge date, iar editarea rezervării cu staff dezactivat păstrează alocările. Câmpurile financiare privind încasările/soldul nu sunt expuse când finance este dezactivat; prețul și avansul convenit rămân în contract. Reminderele dezactivate se anulează prin EventRemindersSync.

GET /api/me și răspunsul autentificării adaugă business_category {code,name}, features[], plan {id,name,user_limit,users_used}, trial {days,started_at,ends_at} și subscription.trial. Frontendul validează câmpurile prin Zod, ascunde rutele și oprește cererile funcțiilor dezactivate. Câmpurile noi sunt opționale în parser pentru compatibilitatea lansării; profilurile vechi fără features păstrează comportamentul VENUE anterior. Backendul rămâne autoritatea pentru toate operațiunile.

API-ul /api/events păstrează câmpurile VENUE existente. Citirea atributelor specifice folosește venue_booking_details, încărcate anticipat. În această etapă tranzitorie serviciul sincronizează și coloanele istorice din events pentru interogările SQL existente și revenirea la codul anterior. Scrierile de business se fac prin EventService, nu direct în modele. Migrarea copiază datele existente; rollbackul sincronizează valorile curente în coloanele istorice înainte de eliminarea extensiei.

Coduri noi stabile: MODULE_DISABLED (403), USER_LIMIT_REACHED (409), CATEGORY_UNAVAILABLE (403 pentru acces, 422 pentru configurare), PLAN_UNAVAILABLE (422). Interfețele mobile și web au mapări proprii în română și fallback generic. PATCH /platform/companies/{company}/subscriptions/{subscription}/payment înregistrează sau corectează paid_at și payment_reference pentru o perioadă existentă, cu scoping pe companie și jurnal explicit; nu duplică perioada și nu îi modifică suma ori condițiile. Veniturile Dashboard sunt numai sumele din company_subscriptions cu paid_at în perioada aleasă, nu încasările operaționale ale companiilor.

### Livrare și rollback SaaS

În checkoutul API: npm ci, npm run build, business:backup, apoi o fereastră scurtă de mentenanță pentru php artisan migrate și revenire cu php artisan up. Se livrează aplicația mobilă cu profilul extins înainte de configurarea restricțiilor noi. Variabilele de infrastructură rămân în mediu; contactele de suport sunt date de business editabile, cu valorile din config/gt.php ca fallback.

Migrările 2026_10_21_000000_add_platform_foundation și 2026_10_21_010000_create_venue_booking_details sunt aditive și nu resetează datele. Pentru revenire la această versiune anterioară, în mentenanță și înaintea altor migrări, php artisan migrate:rollback --step=2 copiază mai întâi detaliile VENUE înapoi și păstrează perioadele comerciale originale. Configurația nouă de plan/trial și jurnalul global se recuperează din backup dacă se revine ulterior la versiunea SaaS; o revenire cu trialuri reale necesită restaurarea backupului corespunzător.

Teste adăugate: PlatformFoundationApiTest, CompanyCapabilitiesApiTest, VenueBookingMigrationTest, cursa MySQL pentru ultimul loc de acces și scenarii mobile pentru navigare și rezervări cu funcții dezactivate. Verificările periodice și actualizările de dependențe respectă AGENTS.md; nu sunt declanșate de simpla împărțire a implementării în pași. Etapele următoare sunt Entertainment, Photo/Video și Rental.

## Rezervări și concurență

Stări: tentative, confirmed, completed, cancelled, expired.

- O sală poate avea o singură rezervare activă pentru data evenimentului. Provizoriile active blochează ziua.
- Intervalele cunoscute ale aceleiași săli nu se suprapun nici între date consecutive.
- Provizoria are termen ales de administrator; după termen nu mai blochează, chiar dacă schedulerul întârzie.
- Confirmarea/finalizarea cer client, sală, început/sfârșit, minim garantat pozitiv și preț pozitiv.
- Personalul are interval propriu și nu poate fi alocat simultan între sălile companiei.
- Salvarea blochează sălile și persoanele în ordine stabilă, înainte de citirile de disponibilitate; verificările și scrierile sunt într-o tranzacție.
- Schedulerul blochează sala și rezervarea, reverifică starea și termenul și înregistrează expirarea idempotent.
- Anularea păstrează rezervarea, documentele și plățile. Restituirile sunt operațiuni financiare explicite.

Fișa mobilă are cinci pași: sală/program, client existent sau nou, condiții comerciale, personal, recapitulare.

Formularul verifică data începerii față de data evenimentului, termenul viitor al provizoriei, alocările duplicate și intervalele de personal. Jurnalul păstrează actorul și valorile anterioare/noi pentru sală, dată, program, stare, preț și numărul invitaților.

## Financiar

Minimul contractual = minimum_guests × menu_price.

Numărul facturabil = maximum dintre minimul garantat și final_guests; dacă numărul final lipsește, se folosește minimul. Totalul adaugă valorile serviciilor suplimentare.

Soldul = total contractual − încasări completed + restituiri completed. O operațiune incoming/full insuficientă nu închide artificial soldul.

Personalul se calculează separat, din suma fixă sau minutele efective și tariful snapshot. Modificarea tarifului implicit al angajatului nu schimbă alocarea existentă. Nu se generează plăți de personal automat.

Arhivarea personalului păstrează alocările istorice. La editarea rezervării, o alocare a unei persoane arhivate poate rămâne identică, dar nu poate fi creată sau renegociată. Selectoarele păstrează sala, clientul și personalul fișei chiar când nu sunt în pagina curentă a listelor. Scadența avansului este expusă în format YYYY-MM-DD.

Raportul separă valoarea contractată, costul estimat al personalului, încasările și cheltuielile efective. Contractele sunt grupate după data evenimentului; cash-flow-ul după paid_at. Ocuparea este raportată la inventarul curent de săli active, în zile-sală, cu valoare procentuală transmisă în basis points întregi.

## API curent

Răspunsurile individuale sunt obiecte fără înveliș data; listele paginate folosesc data, meta și links. Listele acceptă page și per_page, maximum 100. Calendarul agregat este limitat la maximum 366 de zile.

| Grup | Rute |
| --- | --- |
| Autentificare | POST /api/login, /password/forgot, /password/reset, /invitations/accept; GET /api/me; POST /api/logout |
| Companie și profil | GET/PUT /api/company; PUT /api/profile; POST /api/company/fiscal-lookup, numai proprietar |
| Conturi | GET /api/team; POST /api/team/{id}/block și /unblock |
| Invitații | GET/POST /api/invitations; DELETE /api/invitations/{id}, numai proprietar |
| Săli | GET/POST /api/halls; PUT /api/halls/{id}; lista acceptă search |
| Clienți | GET/POST /api/clients; GET/PUT/DELETE /api/clients/{id}; lista acceptă search, date_from/date_to, sort, page și per_page; fiecare rând include bookings_count |
| Personal | GET/POST /api/employees; PUT/DELETE /api/employees/{id}; lista acceptă search |
| Rezervări | GET/POST /api/events; GET/PUT/DELETE /api/events/{id}; DELETE înseamnă anulare |
| Filtre rezervări | date_from, date_to, hall_id, client_id, status |
| Calendar | GET /api/calendar?date_from&date_to&hall_id; GET /api/calendar/day?date&hall_id, paginat pe săli, cu filtrare pe server |
| Disponibilitate personal | GET /api/staff-availability?starts_at&ends_at&exclude_event_id, paginat |
| Financiar | GET/POST /api/events/{eventId}/payments; PUT/DELETE /api/event-payments/{id} |
| Documente | GET/POST /api/events/{eventId}/documents; PUT/DELETE /api/event-documents/{id}; GET /api/event-documents/{id}/download-url |
| Descărcare | GET /api/event-documents/{document}/download, semnat temporar, 10 minute, cu actor inclus în semnătură; reverifică rolul, blocarea contului, compania și abonamentul |
| Raport | GET /api/overview?date_from&date_to |
| Reminder-e | GET /api/reminder-events, numai fereastra următoarelor 30 de zile și evenimentele recent încheiate |
| Cataloage | GET /api/catalogs, opțiuni globale și ale companiei |

POST/PUT /api/events primesc fișa completă: hall_id, client_id, date, type, status, starts_at, ends_at, expires_at, minimum_guests, final_guests, menu_price, menu_name, agreed_advance, advance_due_at, extra_services, staff, notes. company_id și user_id nu se primesc din formular.

extra_services conține name și amount. staff conține employee_id, job_role, pay_type, rate, starts_at, ends_at. Backendul calculează totalurile și costurile.

Categoriile incoming sunt advance, partial, full și other; outgoing sunt staff, suppliers, refund și other. Stările sunt pending, completed și cancelled.

Formularul financiar permite creare, editare și anulare explicită. La schimbarea tipului operațiunii selectează o categorie compatibilă; sumele se trimit ca șiruri zecimale. Panoul platformei afișează perioadele în zile locale, cu ultima zi inclusă.

Codurile noi de eroare sunt COMPANY_ACCESS_DENIED, SUBSCRIPTION_INACTIVE, ACCOUNT_EMAIL_IN_USE, HALL_ALREADY_BOOKED, HALL_NOT_AVAILABLE, EMPLOYEE_ALREADY_ASSIGNED, EMPLOYEE_NOT_AVAILABLE, BOOKING_INVALID_INTERVAL, BOOKING_DETAILS_INCOMPLETE, BOOKING_AMOUNT_TOO_LARGE și CALENDAR_RANGE_TOO_LARGE. Rămân codurile comune și INVITATION_INVALID. Backendul trimite error.code; mesajele românești sunt mapate în frontend.

## Aplicația mobilă și notificări

Sistemul vizual folosește React Native Paper 5.15.3 și Material Design 3. AppThemeProvider aplică MD3LightTheme la rădăcină, cu fontul Inter; navigarea preia aceeași temă. Aplicația păstrează modul luminos: schimbarea automată light/dark nu este activată, deoarece stilurile ecranelor folosesc încă tokenuri statice.

Paleta din shared/theme/theme.ts provine exclusiv din rolurile MD3 ale Paper. Numele semantice existente sunt aliasuri ale aceleiași palete: success/greenSoft folosesc tertiary/tertiaryContainer, warning/orangeSoft folosesc secondary/secondaryContainer, iar danger/redSoft folosesc error/errorContainer. Aceste aliasuri nu reprezintă palete independente de verde, galben sau roz.

Componentele comune extind Paper: Button/IconButton, Card, TextInput, Searchbar, Switch, Chip, SegmentedButtons, ActivityIndicator, Banner, HelperText, Divider și Surface. Textele folosesc Paper Text. React Native UI Lib, uilib-native și configurarea lor nativă au fost eliminate. Componentele noi pornesc de la Paper și se extind în shared/components numai pentru cerințe care nu sunt acoperite de biblioteca standard, folosind tema centrală.

Selectoarele cu căutare și selecție multiplă, calendarul și butoanele cu text pe mai multe rânduri rămân extensii comune. Dialogurile combină componentele Paper cu Modal nativ pentru accesibilitate și afișare peste formulare; formularele păstrează calculul tastaturii și inset-urilor. Iconițele provin numai din Ionicons static, inclusiv cele cerute de Paper prin adaptorul PaperIcon; Babel tratează importurile opționale ale pachetelor de iconițe din Paper.

Navigare: Agendă, Calendar, Rezervări, Clienți, Mai multe. Pentru personal rămân Agendă, Rezervări și Mai multe. Detaliile sunt accesibile programatic prin ruta EventDetails pentru tap pe notificare.

Navigatorul mobil separă complet fluxurile publice (login, invitație și resetare parolă) de rutele contului. La pornire verifică tokenul și profilul înainte de alegerea fluxului; lipsa tokenului sau HTTP 401 duce la login. La delogare dispare imediat contul și se golește cache-ul, înainte de curățarea asincronă a tokenului și reminder-elor. Cererile de profil întârziate nu pot reface sesiunea, iar o autentificare nouă așteaptă curățarea sesiunii anterioare. Tokenul este reverificat la revenirea în aplicație și profilul este actualizat la intervalul existent de 60 de secunde; erorile 401 nu sunt reîncercate de React Query.

React Query folosește chei care includ compania. Listele de rezervări, clienți, personal, săli, plăți, documente și invitații sunt paginate. Căutarea directorului se face server-side; calendarul anual folosește agregate, nu toate fișele evenimentelor. Invalidările comune sunt centralizate în shared/api/queryInvalidation.

Invalidările sunt separate pentru rezervări, plăți, documente, directoare și echipă; fiecare operațiune actualizează numai grupele de date afectate din compania curentă.

EventRemindersSync este singurul loc care programează reminder-e. Folosește timestampurile complete, notifică înainte de start cu 24/6/1 ore și administratorii după final pentru resturi de încasat. Planificarea este limitată la 40 de notificări apropiate și la termenul abonamentului cunoscut. Identificatorii sunt stabili, notificările vechi sunt anulate, iar datele se resincronizează la revenirea în aplicație.

WhatsApp se deschide numai după afișarea și confirmarea mesajului de către administrator. Nu există trimitere automată, semnare electronică sau generare PDF în această versiune. Documentele se atașează privat.

## Instalare, deployment și rollback

Inițializare pe bază nouă: composer install, mediu local cu secrete proprii, MySQL separat, php artisan migrate, CatalogOptionSeeder. Migrarea companiilor refuză importul implicit peste utilizatori/clienți/evenimente existente.

Operatorul se creează prin business:platform-admin, cu parolă cerută interactiv. PlannerDemoSeeder funcționează numai local/testing și creează două companii fictive. Parolele demonstrative se salvează local în .codex-run/local-accounts.json, ignorat de Git.

Serviciile locale sunt izolate prin compose.local.yaml: MySQL și Mailpit. Mediul local folosește MySQL 3307, SMTP 1026, inbox 8026 și API 8010. Infrastructura de producție nu este configurată.

Frontendul se publică separat în https://github.com/ghedeonmolnar/your-business-planner-front, pe ramura main. Folderul business-front este repository Git propriu, cu origin către această adresă. Include codul React Native, proiectele native Android/iOS, fișierele de blocare a dependențelor, asseturile și documentația contractului; backendul rămâne separat. Fișierele .env reale, cheile release, node_modules și rezultatele de build sunt ignorate. Checkoutul separat folosește instrucțiunile din README.md al frontendului.

API-ul se publică în repository-ul privat https://github.com/ghedeonmolnar/your-business-planner-api, pe main, păstrând istoricul inițial. Folderul business-api are propriul origin și include codul Laravel, migrările, testele, fișierele de blocare a dependențelor, documentația și compose.local.yaml. Din checkoutul API, Docker se pornește cu --env-file .env -f compose.local.yaml; configurația comună a workspace-ului rămâne disponibilă separat la rădăcină. Fișierele de mediu reale, vendor, node_modules, cheile, dumpurile, fișierele utilizatorilor și datele runtime nu se publică.

business:expire-bookings rulează în fiecare minut. business:backup folosește mysqldump cu credentiale într-un fișier temporar privat, nu în linia de comandă. Backupurile au retenție configurabilă, implicit 14 zile. Activarea zilnică folosește BUSINESS_BACKUPS_ENABLED; binarul se configurează prin BUSINESS_MYSQLDUMP_PATH.

Lansarea necesită SMTP real, HTTPS, scheduler, stocare și backup extern configurate pentru mediul ales. Revenirea după o schimbare cu date reale se face prin backup verificat, bază separată și codul corespunzător, nu prin ștergerea structurii tenantului.

## Securitate și audit din 21 octombrie 2026

API-ul mobil autentifică exclusiv tokenuri Bearer; cookie-ul panoului web nu este acceptat pentru /api/me, /api/logout sau datele companiei. Panoul verifică și hashul parolei asociat sesiunii, astfel încât schimbarea parolei cere o autentificare nouă.

Linkurile de documente includ actor și access_token, identificatorul public al tokenului emitent, în semnătura temporară. Tokenul Bearer nu apare în URL. Descărcarea verifică existența și expirarea sesiunii, rolul, blocarea contului, compania, abonamentul și funcția documents. Logout invalidează linkurile sesiunii închise; o altă sesiune validă rămâne activă. Linkurile emise înaintea acestei schimbări trebuie regenerate din aplicație, iar fișierele deja descărcate nu pot fi retrase de pe dispozitiv.

Răspunsurile API și paginile panoului folosesc no-store. Răspunsurile au nosniff, Referrer-Policy: no-referrer, X-Frame-Options: DENY și o politică CSP pentru frame-ancestors, base-uri și form-action. La restaurarea panoului din bfcache, pageshow cu persisted reîncarcă pagina pentru reverificarea sesiunii.

Clientul mobil validează API_URL: HTTPS obligatoriu în producție, fără credențiale, query sau fragment în configurare. HTTP este permis numai în development. Fiecare cerere este legată de generația sesiunii în care a pornit. După schimbarea sesiunii, răspunsurile vechi sunt anulate logic înainte de procesarea datelor, a unui 401 sau a blocării abonamentului. Operațiile Keychain sunt serializate. Notificările inițiale întârziate sunt ignorate după închiderea fluxului protejat.

Navigatorul are identitate proprie pentru utilizator, companie și rol. Logout elimină rutele protejate și istoricul; Back nu poate redeschide rezervarea. Un răspuns vechi de profil nu poate reconecta utilizatorul.

Verificarea concurenței personalului folosește locking reads și în subquery-ul rezervării. Aceasta previne citirea unui snapshot vechi MySQL după așteptarea lockului persoanei și dubla alocare simultană în săli diferite.

ESLint impune lipsa tipului any explicit, restricțiile ts-ignore, importurile interne cu alias, server state în hook-uri, folosirea clientului HTTP comun și raportarea centrală a erorilor. Fișierele quality.yml din ambele repository-uri definesc verificările automate și scanarea secretelor. CI instalează lockfile-urile existente; update-urile se pregătesc și se validează în runda locală.

React Native și pachetele @react-native/* sunt actualizate împreună la 0.88.0, React și react-test-renderer la 19.3.1, Gesture Handler la 3.4.0 și Ionicons la 14.0.0. Android folosește configurația template-ului 0.88: compile SDK/Build Tools 37, target SDK 36, Gradle 9.4.1, hostul ReactHost și compatibilitatea temporară pentru Kotlin/DSL din AGP 9. Pachetele Reanimated 4.7.1 și Worklets 0.13.0 rămân cuplate. Babel 8, ESLint 10, TypeScript 7 și resolvers 6 rămân în afara migrării din cauza incompatibilităților documentate în raport.

Baza MySQL locală ascultă numai pe 127.0.0.1:3307. Producția necesită firewall/rețea privată, cont SQL fără privilegii globale și cont separat pentru migrări; configurația locală nu demonstrează aceste controale pentru un server viitor. Aplicația mobilă conține numai adresa API și niciodată credențiale SQL. Un alt client poate apela API-ul cu o identitate validă, supus acelorași autorizări; CORS nu constituie protecție pentru clienți nativi.

Nu există încă infrastructură de producție configurată sau MFA în panou. Lansarea publică cere acces administrativ suplimentar protejat, TLS, cookie-uri securizate, APP_DEBUG=false, document root public, backup extern restaurat în test și rezolvarea blocajelor de dependențe din raportul de audit.

## Teste și etapă următoare

Testele de API urmăresc izolarea companiilor, rolurile, abonamentele, invitațiile, rezervările/suprapunerile, disponibilitatea personalului, calculele, plățile și fișierele semnate. Fluxurile mobile de autentificare, creare rezervare și avans au teste cu API mock-uit. Matricea HTTP verifică toate metodele private fără autentificare, drepturile administrative ale personalului și blocarea operațiilor după expirarea abonamentului. Rezultatele rundei complete cerute în 21 octombrie sunt în AUDIT_SECURITATE_2026-10-21.md.

BookingConcurrencyApiTest pornește două procese HTTP independente, sincronizate, pentru aceeași sală și pentru personal comun între săli. Rulează numai pe MySQL cu baza terminată în _test, prin phpunit.mysql.xml; nu folosește baza aplicației. Pregătirea bazei de test nu execută teste.

Ulterior: meniuri detaliate și costuri, contracte PDF generate, istoric vizibil, notificări extinse pentru scadențe, plăți online și facturare fiscală. Utilizatorii nu pot comuta între companii în v1.

## Corecții mobile și profil fiscal din 21 octombrie 2026

Conversiile pentru afișare în Europe/Bucharest folosesc Intl.DateTimeFormat.formatToParts și construiesc date ISO explicite pentru dayjs. Nu reparsăm Date.toLocaleString, deoarece Hermes poate produce text localizat incompatibil cu parserul de date. companyNow furnizează data calendaristică a firmei, inclusiv pentru filtrele agendei, calendarului și raportului lunar. Conversia programului introdus păstrează verificarea orelor inexistente la schimbarea orei.

Acasă afișează salutul, firma, acțiunea de rezervare, indicatorii lunii și evenimentele viitoare. Listele de clienți, săli, personal și rezervări au un singur padding exterior. Căutarea directorului este amânată cu 300 ms și rulează pe server; lista clienților are editare contextuală, telefon explicit când lipsește și acces la istoricul rezervărilor. Tabul Clienți nu afișează un buton Înapoi către alt tab. Mai multe grupează contul, administrarea și abonamentul în carduri. Câmpurile de căutare trimit explicit iconițele către adaptorul Ionicons, evitând pătratele afișate de iconițele implicite ale Searchbar.

Calendarul lunar/anual păstrează sincronizate perioada și ziua selectată. Filtrul hall_id al listei zilnice se aplică înainte de paginare și verifică apartenența sălii; o sală din altă companie produce 404. Calendarul lunar afișează și zilele vecine ale lunii pentru completarea săptămânilor; selectarea lor navighează în luna potrivită. Vederea anuală selectează o lună, iar Vezi luna deschide acea lună în vederea zilnică.

Proprietarul deschide Mai multe → Profil și facturare. Profilul personal permite modificarea numelui prin PUT /api/profile, cu body name; emailul de autentificare și rolul nu se modifică în acest flux. Profilul firmei se citește prin GET /api/company și se salvează prin PUT /api/company. Compania este luată exclusiv din sesiune; identificatorii de companie/proprietar trimiși pentru modificare sunt interziși. Administratorii și personalul nu pot folosi aceste rute. Accesul cere cont activ, token valid și abonament activ, fără a depinde de modulul financiar.

companies.billing_profile este JSON nullable, cu structura validată: fiscal_code, legal_name, trade_register_number, address, city, county, postal_code, country (RO), vat_registered, iban, bank_name. Denumirea comercială rămâne name. CUI-ul, denumirea juridică, adresa fiscală, țara și statutul TVA sunt obligatorii când se salvează un profil fiscal. Profilul complet gol se salvează ca null; obiectele fiscale parțiale sau cu chei necunoscute sunt respinse. IBAN-ul opțional are format românesc. Profilul salvat precompletează formularul și rezumatul datelor de facturare din același ecran; emiterea facturilor și integrarea e-Factura sunt etape separate.

POST /api/company/fiscal-lookup primește fiscal_code string, cu sau fără prefix RO, și întoarce datele publice disponibile fără a scrie în companie. Maparea preia CUI, denumire, număr registrul comerțului, adresă fiscală, localitate, județ, cod poștal și statut TVA. Banca și contul bancar se completează separat. Un răspuns întârziat nu înlocuiește câmpurile editate între timp și este ignorat dacă s-a schimbat CUI-ul. Proprietarul revizuiește și salvează explicit datele.

Integrarea folosește [serviciul public ANAF v9](https://static.anaf.ro/static/10/Anaf/Informatii_R/Servicii_web/doc_WS_V9.txt), cu ANAF_LOOKUP_URL în mediul API. ANAF_CA_BUNDLE poate indica un bundle CA local când PHP nu are configurat trust store-ul; verificarea TLS rămâne activă. Răspunsurile externe sunt validate structural înainte de conversii, inclusiv identificatorul firmei. Datele găsite sunt cache-uite cel mult 24 de ore și pe data interogării. Un lock comun și intervalul minim de o secundă limitează cererile către furnizor; ruta are și throttle per client. Timeoutul cererii este 12 secunde, iar al conexiunii 4 secunde. Erorile stabile sunt FISCAL_COMPANY_NOT_FOUND (404), FISCAL_LOOKUP_UNAVAILABLE (503), FISCAL_LOOKUP_BUSY (429); textele utilizatorului provin din maparea frontendului.

Deployment: se aplică migrarea aditivă 2026_10_21_020000_add_company_billing_profile înaintea API-ului și se configurează ANAF_LOOKUP_URL. Companiile existente primesc null și pot continua folosirea aplicației. Rollback: se exportă întâi datele fiscale care trebuie păstrate, se revine la codul anterior, apoi se elimină coloana prin down; revenirea șterge profilurile fiscale.

Au fost adăugate teste de regresie pentru datele localizate Hermes, programul la schimbarea orei, montarea agendei/calendarului, filtrarea zilnică pe sală, lista clienților, precompletarea profilului și izolarea/autorizarea API-ului fiscal. Rularea suitelor rămâne în ritmul AGENTS.md. În această cerere au fost urmărite manual cererile API locale și afișarea Home pe Android; interogarea reală ANAF a întors datele unui CUI public de probă, fără salvarea lor în profilul unei companii.

## Ecranul Mai multe și componentele sale

Ecranul Mai multe urmează handoff-ul YBP_MoreTab: antet, card de cont, grilă de administrare, abonament, suport, setări și deconectare. Datele contului, planul, locurile ocupate, expirarea și contactele platformei provin în continuare din sesiunea validată. API-ul nu furnizează o fotografie a companiei; cardul folosește un avatar cu iconiță, fără fotografie demonstrativă sau acțiune de editare a imaginii.

Componentele comune sunt în shared/components: ContentSection (title, subtitle, size și stiluri de text), IconBadge (icon, tone, size, style), ActionTile (variant card/row/soft/danger, icon, tone, label, description, disabled și stiluri pentru container/text), ActionGrid (items, columns, style, itemStyle) și ActionList (items, style). Grilele folosesc implicit două coloane și trec la una sub 360 dp sau la fontScale peste 1.2; columns=1 permite și afișarea explicită într-o singură coloană. Elementele au chei stabile, înălțimi minime și text care se poate extinde. Culorile furnizate în handoff sunt centralizate în theme.colors.menu; spacing, radius și tipografia folosesc tokenurile deja existente.

AccountOverviewCard și SubscriptionCard sunt componentele specifice companiei, cu date și callback-uri primite prin props, fără navigare sau cereri HTTP în interior. MoreScreen compune secțiunile, păstrează condițiile pe rol și pe module și deschide rutele existente CompanyProfile, CompanyHalls, CompanyStaff, CompanyOverview și CompanyTeam. Proprietarul vede profilul/facturarea, invitațiile și gestionarea abonamentului; administratorul și personalul nu primesc aceste acțiuni. Starea abonamentului folosește active/suspended/trial din backend, fără praguri locale pentru apropierea expirării.

Suportul și gestionarea abonamentului deschid un dialog MoreInfoModal cu datele reale ale platformei; abonamentul se modifică în continuare prin administratorul platformei. Emailul și telefonul se validează înainte de construirea linkurilor mailto/tel; apăsarea deschide aplicația potrivită, fără a trimite automat mesaje. Lipsa datelor are un mesaj explicit. Ajutor și ghiduri oferă instrucțiuni pentru fluxurile implementate, filtrate după rol și module. Setările disponibile sunt Notificări (explicație și acces la setările aplicației de pe dispozitiv) și Despre aplicație; nu există preferințe locale noi pentru limbă sau aspect.

Deconectarea folosește confirmAction și păstrează curățarea existentă a sesiunii. Acțiunile întârziate sunt protejate prin generația sesiunii; deschiderea repetată a aplicațiilor externe este blocată cât timp prima încercare este în curs. Bara de taburi existentă primește aspectul din handoff și continuă să fie gestionată de React Navigation, cu insetul inferior rezervat o singură dată. Setările și deconectarea se pot derula integral deasupra barei. Tema curentă a aplicației este luminoasă; acest ecran nu introduce un mod întunecat separat.

Componenta comună Card desface fragmentele React înainte de a trimite conținutul către Paper Card, păstrând ordinea, cheile și gap-ul existent și evitând proprietățile interne index/total pe Fragment. FormModalFrame acceptă fitContent pentru dialogurile informative scurte și closeLabel pentru eticheta accesibilă a închiderii; formularele existente păstrează implicit comportamentul anterior.

## Lista compactă de clienți și filtrarea după evenimente

Tabul Clienți folosește CustomersScreen și componentele CustomerListHeader, CustomerEventFilter și CustomerCard din feature-ul company. Cardul are doar numele, telefonul și totalul istoric al rezervărilor, fără avatar sau observații. Apăsarea deschide CustomerHistory, unde sunt disponibile profilul, observațiile, editarea clientului și lista rezervărilor. Crearea clientului rămâne accesibilă din antet. Dimensiunile folosesc tokenurile existente; cardurile au minimum 72 dp și spațiu de 8 dp între ele, iar acțiunile și selectoarele păstrează ținte tactile de cel puțin 48 dp.

Panoul Filtrează după evenimente este închis implicit. Datele De la/Până la sunt valori de formular distincte de intervalul aplicat. Aplică filtrul validează ambele date, aplică intervalul și închide panoul; alegerea unei date singure nu lansează cererea. Un indicator cu intervalul DD.MM.YYYY – DD.MM.YYYY și acțiune de eliminare rămâne vizibil când panoul este închis. Resetează sau eliminarea indicatorului șterg intervalul și datele formularului, păstrând căutarea; acțiunea Resetează filtrele din starea fără rezultate elimină și căutarea și restabilește sortarea implicită. Hook-ul comun useSingleColumnLayout trece grilele, panoul și sortarea la o singură coloană sub 360 dp sau la fontScale peste 1.2. Etichetele barei de navigare permit mai multe rânduri, iar înălțimea barei urmărește înălțimea măsurată a celei mai mari etichete și insetul inferior.

GET /api/clients acceptă search (nume sau telefon, maximum 255 caractere), perechea opțională date_from/date_to în format YYYY-MM-DD și sort=name_asc|name_desc|bookings_desc. Ambele date sunt obligatorii dacă este transmisă una dintre ele; intervalul inversat sau o structură invalidă răspunde cu HTTP 422 și error.code=CLIENT_FILTERS_INVALID. Frontend-ul mapează codul la un mesaj în română. Paginarea rămâne cea Laravel, page/per_page, maximum 100; meta.total indică numărul tuturor clienților care corespund filtrelor. Aplicația folosește implicit name_asc; fără sort, API-ul păstrează ordinea istorică de creare. Sortările au departajare stabilă după id.

Filtrarea se execută în SQL prin existența unei rezervări, astfel încât clientul apare o singură dată, înainte de paginare. Zilele sunt incluse integral în Europe/Bucharest, configurat prin gt.company_timezone; limitele sunt convertite în UTC. Un eveniment cu program este inclus când starts_at este înainte de începutul zilei de după date_to și ends_at este cel puțin începutul date_from. Sunt incluse evenimentele care trec de miezul nopții sau încep înaintea intervalului și se termină în el. Dacă lipsește începutul sau sfârșitul programului, se folosește data calendaristică date, inclusiv ambele limite.

Fiecare client din listă include bookings_count, un întreg nenegativ calculat separat pe toate rezervările sale neșterse logic, inclusiv cele anulate sau expirate, fără restrângere la intervalul selectat. Atât existența, cât și numărătoarea sunt limitate explicit la company_id al sesiunii, inclusiv dacă o referință incorectă din altă companie indică acel client. Nu sunt încărcate toate paginile pentru filtrare, sortare sau numărătoare; frontend-ul validează răspunsul și folosește useInfiniteQuery cu filtrele în queryKeys. Modificarea unei rezervări invalidează listele de clienți ale aceleiași companii, iar modificarea clientului invalidează și profilul din istoric.

DatePickerField/ControlledDateField acceptă afișare numerică și stiluri pentru container/câmp. SearchField și selectorul reutilizabil acceptă stiluri de câmp, ContentSection acceptă o acțiune în antet, iar MetaPill acceptă stilul textului. Nu sunt introduse culori, tokenuri, biblioteci sau preferințe native noi. Schimbarea este aditivă, fără migrare SQL; se livrează întâi backend-ul cu bookings_count, apoi aplicația. La deployment se reface configurația cache-uită pentru gt.company_timezone. Rollback: se revine întâi la aplicația anterioară, apoi la API-ul anterior.

Regresiile acoperă limitele inclusive, suprapunerile, evenimentele fără program, deduplicarea, totalul istoric, combinația cu căutare/sortare/paginare, izolarea companiilor, validarea și autorizarea. Testele mobile montează lista cu API mock-uit, verifică aplicarea explicită, indicatorul, resetarea, validarea intervalului inversat și accesul la editare din istoric. Rularea suitelor rămâne în ritmul AGENTS.md.

Verificarea manuală în aplicația Android a acoperit panoul închis implicit, selectarea datelor, refuzarea intervalului inversat, aplicarea unui interval cu rezultate și a unuia fără rezultate, resetarea, căutarea combinată cu sortarea și accesul la formularul de editare precompletat. Afișarea a fost verificată și la 320 dp cu fontScale 1.4; setările emulatorului au fost apoi restaurate. Jurnalul ReactNativeJS al aplicației repornite nu a conținut avertismente sau erori. Cazurile SQL de limită și matricea de autorizare sunt pregătite ca teste automate și nu au fost executate în această cerere.

## Calendarul lunar și anual al sălilor

CalendarScreen coordonează CalendarControls, CalendarLegend, CalendarMonth, CalendarYear, CalendarMonthSummary și CalendarDayHalls. CalendarHallRow afișează compact numele sălii, tipul evenimentului, programul și starea. Componentele folosesc theme.colors.menu și tokenurile existente; nu adaugă culori sau dependențe. AppSegmentedControl acceptă iconițe Ionicons și atribute pentru culorile active/inactive și stilul segmentelor; OccupancyBar este componenta comună pentru bara segmentată cu gradient și valoare accesibilă.

useCalendarNavigation păstrează ziua selectată și modul lunar/anual. Luna și intervalul cererii sunt derivate din zi; schimbarea perioadei păstrează ziua pe cât permite luna destinație. Selectarea unei luni anuale nu schimbă automat modul. Vezi luna deschide calendarul lunar cu selecția și filtrul sălii păstrate. Butonul calendar din antet revine la data curentă a companiei, păstrând modul și sala. Săptămânile încep luni. Azi are contur, selecția are fundal primar și colțuri rotunjite, iar o zi cu cel puțin o rezervare activă are marcaj discret și etichetă accesibilă cu numerele reale.

Vederea anuală afișează 12 carduri, câte trei pe rând; sub 360 dp sau la fontScale peste 1.2 folosește o singură coloană. Numărul rezervărilor însumează confirmed și tentative din sumarul zilnic al perioadei și al sălii filtrate. Calendarul păstrează regula existentă de ocupare pe câmpul date al rezervării; tentativele expirate și anulările nu blochează, iar rezervările finalizate rămân în istoricul calendaristic. Un eveniment este numărat o singură dată, pe ziua contractului. Indicarea (+1 zi) din program nu îl multiplică în sumar.

Gradul de ocupare este numărul rezervărilor împărțit la suma rezervărilor și a locurilor libere zi/sală din sumar. Etichetele sunt Liber pentru zero rezervări, Mai liber sub 1/3, Moderat sub 2/3, Aglomerat sub 85% și Foarte aglomerat de la 85%. Lunile fără săli afișează Fără săli. Nu se compară relativ cu cea mai aglomerată lună a anului. Datele incomplete sunt marcate ca indisponibile.

Rezumatul lunii arată rezervările totale, weekendurile cu cel puțin o rezervare și zilele în care toate sălile vizibile sunt libere. Un weekend este perechea sâmbătă/duminică și este numărat o singură dată; sunt incluse perechile care ating luna chiar dacă una dintre zile aparține lunii vecine. Fără săli, disponibilitatea afișează —. Comparația folosește luna precedentă; când aceasta are zero rezervări se afișează diferența absolută, fără împărțire la zero. Pentru ianuarie se cere separat doar decembrie al anului precedent. Sumarul anual rămâne limitat la maximum 366 de zile și nu descarcă istoricul rezervărilor.

GET /api/calendar/day păstrează paginarea, izolarea company_id, rolurile și filtrul hall_id. Fiecare sală adaugă type, starts_at și ends_at, nullable; orele sunt ISO UTC, iar o sală liberă are toate cele trei valori null. Nu sunt expuse datele clientului, observațiile sau valorile financiare. Frontend-ul validează câmpurile și acceptă lipsa lor pentru compatibilitate cu API-ul anterior. Tipul se afișează prin catalogLabels. formatCompanyTimeRange convertește în Europe/Bucharest și marchează trecerea în altă zi, inclusiv la schimbarea orei. Apăsarea unei săli rezervate deschide rezervarea, iar o sală liberă deschide formularul cu data și sala precompletate. Listele zilnice rămân paginate.

Schimbarea nu necesită migrare SQL. Se livrează întâi câmpurile aditive ale API-ului, apoi interfața mobilă; rollback-ul poate reveni separat la versiunile anterioare. Testele adăugate verifică programul UTC și izolarea endpointului, weekendurile fără dublare, anul bisect, lipsa datelor/sălilor, comparația cu zero, programul care trece de miezul nopții și tranziția anual/lunar cu filtrul păstrat. Verificările locale automate respectă în continuare ritmul AGENTS.md; verificările CI pornesc la push pe main.

Verificarea manuală din 21 octombrie a urmărit calendarul lunar și anual, ziua curentă/selecția, programul care trece în ziua următoare, filtrarea sălii, rezumatul pentru ianuarie comparat cu decembrie, revenirea la lună și deschiderea formularului cu data și sala precompletate. Afișarea a fost verificată la 320 dp cu fontScale 1.4, iar emulatorul a fost readus la densitatea și fontul inițiale. Butonul de rezervare permite mai multe rânduri. Runda automată cerută în 22 octombrie are 109 suite și 439 de teste Jest trecute, TypeScript și ESLint fără erori, Pint trecut și 115 teste PHP cu 990 de aserțiuni trecute pe SQLite; cele trei curse MySQL sunt omise local și au trecut în CI pe MySQL. Detaliile și limitările sunt consemnate în AUDIT_SECURITATE_2026-10-21.md. Instalarea SDK în workflow cere identificatorul oficial platforms;android-37.0, fără schimbarea nivelului compile SDK 37.
