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
| companies | nume, email, telefon, adresă, suspended_at; autorul creării este operatorul |
| company_subscriptions | preț manual RON, starts_at/ends_at, paid_at și referință; perioadele sunt adăugate, fără rescrierea istoricului |
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

Accesul este activ dacă firma nu este suspendată și există o perioadă începută, cu ends_at strict după timpul serverului. Panoul interpretează ultima zi introdusă ca zi inclusă în Europe/Bucharest și persistă limita exclusivă în UTC.

Loginul mobil folosește email unic, în câmpul API username, și parolă. Operatorii nu se autentifică mobil. Autentificarea și GET /me sunt disponibile pentru identificarea accesului inactiv; datele operaționale sunt blocate. Aplicația elimină cache-ul și reminder-ele după blocare și aplică local termenul cunoscut al abonamentului.

Operatorul are sesiune web separată, cu CSRF și limitare pentru autentificare. Creează companii, invită/reinvită proprietari înainte de activare, înregistrează perioade și plăți, suspendă/reactivează companii. Nu poate consulta rezervările sau documentele prin contul de operator.

Numai proprietarul invită administratori și personal, revocă invitații și blochează/reactivează conturi. Nu poate exista transfer de proprietar prin formularul de invitație al echipei. Dezactivarea unui angajat invalidează accesul său și împiedică activarea invitației cât timp profilul este inactiv.

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
| Companie | PUT /api/company, numai proprietar |
| Conturi | GET /api/team; POST /api/team/{id}/block și /unblock |
| Invitații | GET/POST /api/invitations; DELETE /api/invitations/{id}, numai proprietar |
| Săli | GET/POST /api/halls; PUT /api/halls/{id}; lista acceptă search |
| Clienți | GET/POST /api/clients; GET/PUT/DELETE /api/clients/{id}; lista acceptă search |
| Personal | GET/POST /api/employees; PUT/DELETE /api/employees/{id}; lista acceptă search |
| Rezervări | GET/POST /api/events; GET/PUT/DELETE /api/events/{id}; DELETE înseamnă anulare |
| Filtre rezervări | date_from, date_to, hall_id, client_id, status |
| Calendar | GET /api/calendar?date_from&date_to&hall_id; GET /api/calendar/day?date, paginat pe săli |
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

business:expire-bookings rulează în fiecare minut. business:backup folosește mysqldump cu credentiale într-un fișier temporar privat, nu în linia de comandă. Backupurile au retenție configurabilă, implicit 14 zile. Activarea zilnică folosește BUSINESS_BACKUPS_ENABLED; binarul se configurează prin BUSINESS_MYSQLDUMP_PATH.

Lansarea necesită SMTP real, HTTPS, scheduler, stocare și backup extern configurate pentru mediul ales. Revenirea după o schimbare cu date reale se face prin backup verificat, bază separată și codul corespunzător, nu prin ștergerea structurii tenantului.

## Teste și etapă următoare

Testele de API urmăresc izolarea companiilor, rolurile, abonamentele, invitațiile, rezervările/suprapunerile, disponibilitatea personalului, calculele, plățile și fișierele semnate. Fluxurile mobile de autentificare, creare rezervare și avans au teste cu API mock-uit. Execuția și actualizările dependențelor respectă AGENTS.md; runda periodică nu a fost executată în acest task.

BookingConcurrencyApiTest pornește două procese HTTP independente, sincronizate, pentru aceeași sală și pentru personal comun între săli. Rulează numai pe MySQL cu baza terminată în _test, prin phpunit.mysql.xml; nu folosește baza aplicației. Pregătirea bazei de test nu execută teste.

Ulterior: meniuri detaliate și costuri, contracte PDF generate, istoric vizibil, notificări extinse pentru scadențe, plăți online și facturare fiscală. Utilizatorii nu pot comuta între companii în v1.
