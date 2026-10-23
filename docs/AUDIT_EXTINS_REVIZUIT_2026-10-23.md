# Revizuirea auditului extins — 23 octombrie 2026

Auditul din 22 octombrie identifică defecte reale. Cele 16 constatări N01–N16 și cele 5 puncte C01–C05 sunt susținute de traseele de cod analizate, cu nuanțele de mai jos. Remedierile au fost implementate local și au primit teste de regresie. Testele noi nu au fost executate în această cerere; implementat nu înseamnă validat în execuție.

## Baza comparației

- API: `e3579adae187be14406355f5f278a6e65dffb538`.
- Frontend: `593d72ed97c25089a013642fd3d7b232f812b496`.
- Ambele coincid cu versiunile menționate în audit. Au fost analizate și modificările locale deja existente: agenda, navigarea sa, formatarea datei și documentația. Aceste modificări au fost păstrate.
- În agenda locală exista deja o filtrare parțială după stare. N07 rămânea relevant pentru paginare, intervale și contractul API; remedierea filtrează pe server înaintea paginării.

## Constatări și modificări

| ID | Rezultatul inspecției și remedierea implementată |
| --- | --- |
| N01 | Confirmată. Rezervările și plățile expun `version`; modificarea și anularea cer versiunea citită. Compararea are loc sub lock, înainte de scriere. Un formular vechi primește HTTP 409 / `RESOURCE_VERSION_CONFLICT`. Expirarea automată incrementează versiunea. Formularul rezervării păstrează ciorna și poate afișa versiunea curentă; reîncărcarea cere confirmarea înlocuirii ciornei. |
| N02 | Confirmată. Crearea unei plăți cere `operation_id` UUID. Serverul păstrează cheia și amprenta datelor canonice, cu unicitate pe companie și tranzacție comună. Retry-ul identic întoarce aceeași plată; alt payload primește `PAYMENT_OPERATION_CONFLICT`. Formularul păstrează aceeași cheie și același payload după un rezultat incert și blochează editarea acestuia până la rezolvare. Încercarea incertă rămâne în cache-ul privat al sesiunii și este recuperată la redeschiderea formularului. Cheia nu este persistată peste închiderea procesului aplicației; recuperarea după repornire rămâne o extensie distinctă. |
| N03 | Confirmată. Câmpurile nemodificate păstrează timestampul UTC original, inclusiv secundele, pentru eveniment și personal. Ora repetată se afișează și se introduce cu offset explicit `+03:00` sau `+02:00`. Ora ambiguă fără offset și ora inexistentă primăvara sunt refuzate. Secundele nenule sunt afișate și acceptate; comparațiile programului folosesc momente UTC. |
| N04 | Confirmată. Limita locală declanșează revalidarea `/me`, cu blocarea temporară a interacțiunii printr-un modal. Navigatorul și ciornele rămân montate până la răspunsul serverului. Offline se reîncearcă; un răspuns întârziat al unei sesiuni vechi nu se aplică altei sesiuni. |
| N05 | Confirmată. Invitațiile și resetarea parolei scriu mesaje în `outgoing_mail`, în tranzacția datelor. Conținutul este criptat. SMTP este apelat de `business:deliver-mail`, cu stări pending/sent/failed și retry. Retrimiterea aceleiași invitații valabile sau a aceluiași reset valabil păstrează codul. Revocarea și folosirea secretului anulează mesajul, iar expirarea elimină conținutul secret. Interfețele disting salvarea de expediere. |
| N06 | Confirmată. `type` are `bail` și `string`, iar `ActiveCatalogValue` verifică defensiv tipul înaintea serviciului. Structurile invalide produc validare, fără conversie la string. |
| N07 | Confirmată pentru contractul inițial. `agenda=upcoming` filtrează înainte de paginare: confirmed și tentative neexpirate, cu sfârșitul în viitor sau fără sfârșit începând de azi. Include evenimentele în desfășurare începute ieri; exclude completed, cancelled, expired și intervalele terminate. |
| N08 | Confirmată. Clientul arhivat poate rămâne pe rezervarea autorizată care îl folosea. Nu poate fi ales pentru o rezervare nouă sau pentru altă rezervare; scoping-ul pe companie se păstrează. |
| N09 | Confirmată. Calendarul transmite obiectul minim al sălii selectate. Formularul păstrează opțiunea și numele chiar dacă directorul paginat încărcat nu conține sala. |
| N10 | Confirmată. Jurnalul plății păstrează valorile anterioare și curente pentru sumă, sens, categorie, dată, metodă și stare, inclusiv la anulare. Notele brute nu intră în audit. |
| N11 | Confirmată. Lista zilnică încarcă anticipat `venueDetails` înainte de `keyBy('hall_id')`, eliminând interogarea per rezervare. A fost adăugat un test care numără interogările pentru o pagină cu 20 de săli rezervate. |
| N12 | Confirmată pentru MySQL 8.0. O migrare convertește coloanele planificabile în DATETIME, cu conexiune UTC explicită. Rezervările și personalul pot reprezenta anul 2040. Validarea programului refuză momentele UTC din afara intervalului DATETIME. Rollbackul verifică toate coloanele înainte de a refuza datele care nu încap în TIMESTAMP. |
| N13 | Confirmată, cu regulă de produs necesară. O invitație străină activă sau folosită rămâne refuzată. O invitație străină nefolosită și expirată/revocată poate fi reutilizată, cu secret nou și audit. Conturile existente nu se transferă. Acceptarea reverifică firma după lock, pentru o invitație mutată concurent. |
| N14 | Confirmată. DELETE arhivează documentul în DB; URL-urile și listele îl exclud imediat. `business:purge-documents` reîncearcă ștergerea fizică, verifică rezultatul storage și marchează `file_deleted_at` numai după succes sau constatarea absenței fișierului. Rollbackul arhivării nu șterge fișierul. |
| N15 | Confirmată. Formularele rezervării, plății, directoarelor și invitației blochează câmpurile, acțiunile intermediare și închiderea în timpul salvării. Câmpurile text ignoră și un callback de editare întârziat cât sunt blocate. |
| N16 | Confirmată. Limitele de invitați, sume, texte și dimensiuni de liste sunt aliniate în formular. Erorile API 422 cunoscute sunt atașate câmpurilor cu text local, fără mesajul tehnic al serverului. Se deschide primul pas cu eroare, inclusiv când modulul de personal lipsește; câmpurile necunoscute păstrează fallbackul global. |
| C01 | Confirmată. Refresh-ul coordonează toate interogările active ale calendarului și lista zilnică, inclusiv decembrie folosit pentru comparația anuală. Erorile parțiale rămân vizibile și pot fi reîncercate. |
| C02 | Confirmată. Sumarul și lista zilnică au revalidare periodică la 30 de secunde, în plus față de revalidarea la revenirea în aplicație. Nu este promisă actualizarea exact în milisecunda expirării. |
| C03 | Confirmată. API-ul păstrează sala arhivată selectată în lista filtrelor chiar când perioada nu conține rezervări pentru ea. Sala nu este declarată disponibilă pentru rezervări noi. |
| C04 | Confirmată. Cererea lunară acoperă întreaga grilă luni–duminică, inclusiv zilele vecine. Lipsa datelor are marcaj `?` și etichetă de disponibilitate necunoscută; lipsa sălilor active este diferențiată de disponibilitate. |
| C05 | Confirmată pentru perechile de culori citate. Textele mici problematice folosesc o culoare existentă mai închisă, fără modificarea temei. Ocuparea are și simbol, iar lipsa datelor și stările sunt exprimate pentru cititorul de ecran. Verificarea completă TalkBack/fontScale rămâne necesară pe Android. |

Limita TIMESTAMP este documentată de [MySQL 8.0 — Date and Time Data Type Syntax](https://dev.mysql.com/doc/refman/8.0/en/date-and-time-type-syntax.html). DATETIME nu efectuează conversia automată de fus orar a TIMESTAMP; aplicația și conexiunea folosesc explicit UTC.

## Riscurile separate din audit

- R01: a fost definită și implementată o regulă conservatoare: cu staff dezactivat și alocări existente, modificarea datei sau a intervalului rezervării este refuzată cu `BOOKING_STAFF_SCHEDULE_LOCKED`. Alte detalii pot fi editate. Nu s-au restrâns intervalele personalului la intervalul evenimentului.
- R02: nu este o regulă complet nedefinită în proiect. `PROJECT_SCHEMA.md` descria deja prioritatea perioadei cu începutul cel mai recent și criteriile de departajare. Nu s-a schimbat politica comercială a suprapunerilor.
- R03: păstrarea tipului istoric neschimbat este permisă acum numai pentru rezervarea autorizată care îl avea. Selectarea sa pentru o rezervare nouă rămâne refuzată.
- R04: s-au adăugat departajări prin UUID la sortările directoarelor și calendarului. Versiunea verificată sub lock împiedică scrierea pornită din sala veche după o mutare concurentă. Schedulerul omite candidatul dacă sala s-a schimbat după selecție. Cursele au teste MySQL noi, neexecutate aici.
- R05: limita de 40 de notificări și lipsa unui mecanism push verificat pentru aplicația închisă rămân limitări reale. Nu s-a introdus un serviciu push și nu este promisă sincronizarea imediată în fundal.
- R06: plafonul modalului respectă spațiul efectiv rămas, fără minimul forțat de 240 dp; celula lunară nu mai cere lățimea minimă de 40 dp. Verificarea vizuală landscape, split-screen, fontScale 2 și TalkBack rămâne neexecutată.

## Validare și limitări

Au fost citite auditul, instrucțiunile și traseele relevante din cele două proiecte, inclusiv modificările locale anterioare. Codul modificat a fost formatat cu Prettier și Laravel Pint. Inspecția Git a verificat consistența diff-urilor; documentele de schemă și regulile comune sunt sincronizate.

Probele punctuale executate au reconfirmat coliziunea Intl pentru `2026-10-25T00:30:00Z` și `2026-10-25T01:30:00Z`, ambele afișate 03:30 în Europe/Bucharest. Calculul contrastelor a dat 4,344:1 și 4,180:1 pentru perechile inițiale, respectiv 16,519:1 și 15,518:1 pentru perechile folosite acum. Aceste probe nu reprezintă testarea formularului sau a aplicației Android.

Au fost adăugate teste API pentru scrieri vechi, retry financiar, audit, date structurate, istoric arhivat, agendă, anul 2040, limita SQL, invitații, SMTP și ștergerea documentelor. Testele MySQL includ două plăți simultane cu aceeași cheie și mutări concurente ale aceleiași rezervări. Frontendul are regresii pentru DST/secunde, limite și erori 422, revalidarea abonamentului, câmpuri blocate, retry financiar, sala preselectată, refresh coordonat și accesibilitatea calendarului.

Nu au fost rulate `tsc --noEmit`, `eslint .`, Jest, `pint --test`, `php artisan test`, migrările sau buildul Android. Aceasta este prima cerere de implementare din sesiune; ritmul AGENTS.md nu declanșează o rundă de verificări. Nu au fost rulate nici actualizări de dependențe în afara unei asemenea runde. Au fost scrise teste, fără a fi raportate drept trecute.

Conectorul GitHub disponibil a întors liste goale pentru workflow-uri asociate PR-urilor și statusurile clasice ale commiturilor. Aceste instrumente nu confirmă joburile Actions pornite de push; rezultatele CI citate în audit nu au fost reconfirmate și nu sunt prezentate drept verificări ale modificărilor locale.

Blocajele de livrare pentru vulnerabilitățile tranzitive documentate anterior, protecția ramurii, infrastructură, MFA/gateway, privilegii SQL, backup/restaurare și monitorizare rămân de verificat separat. Versiunile actuale ale remediilor pentru advisories trebuie reevaluate în următoarea rundă de verificări. Nu s-a făcut deploy, push, trimitere reală de email, migrare sau modificare a datelor de business prin aplicație.

## Livrare și rollback

Sunt trei migrări noi: `2026_10_23_000000_protect_booking_and_payment_writes`, `2026_10_23_010000_create_outgoing_mail` și `2026_10_23_020000_extend_booking_datetime_range`.

API-ul și aplicația mobilă trebuie livrate coordonat. Noua versiune API cere `version` la PUT/DELETE și `operation_id` la POST-ul plății; un client vechi este refuzat prin validare. Înainte de activare sunt necesare runda de verificări, buildul Android, backupul și migrarea în mentenanță. Schedulerul trebuie să execute comenzile de expediere și curățare. Până la migrare și validare, codul local nu trebuie tratat ca versiune gata de producție.

Pentru rollback se opresc scrierile și schedulerul și se salvează backupul inclusiv pentru mesajele în așteptare. Conversia înapoi la TIMESTAMP este refuzată înainte de modificări dacă există date în afara intervalului vechi; acestea se rezolvă printr-un plan de migrare/backup, fără trunchiere automată. Eliminarea celorlalte migrări pierde versiunile, identitățile de retry și registrul de expediere; operațiile incerte și mesajele nelivrate trebuie reconciliate înainte de revenire.
