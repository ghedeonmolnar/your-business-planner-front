# Remedierea auditului suplimentar — 24 octombrie 2026

Surse: raportul furnizat pentru frontend `e2a4f00` și API `7fdd5a9`. Schimbările de mai jos sunt implementate local, fără aplicarea migrațiilor bazei de business și fără rularea suitelor automate în această cerere.

## Corecții

| Punct | Comportament implementat | Regresii pregătite |
| --- | --- | --- |
| 1 | `extra_services` și `staff` cer liste JSON și obiecte cu câmpuri permise. Serviciul normalizează cheile înainte de salvare. Migrarea verifică toate serviciile istorice, inclusiv rezervările arhivate, înainte de prima scriere. | Obiecte asociative, indici discontinui, elemente și câmpuri invalide, răspuns canonic și migrare fără modificări parțiale. |
| 2 | Cotă de documente per companie, rezervată durabil sub lock înainte de scrierea fișierului. Arhivele și uploadurile eșuate consumă cotă până la curățarea fizică. | Limita exactă, depășire, izolare, ștergere eșuată, publicare eșuată și uploaduri concurente pe MySQL. |
| 3 | Documentele au `version`, obligatoriu la PUT. Comparația și incrementarea se fac sub lock, în tranzacție. | Două editări ale versiunii 1: una reușește, cealaltă primește `RESOURCE_VERSION_CONFLICT / 409`; acces străin refuzat. |
| 4 | Conflictul plății păstrează ciorna și invalidează lista. Încărcarea datelor curente cere confirmare și înlocuiește atât valorile, cât și versiunea. Anularea în conflict oferă aceeași recuperare, fără retrimitere automată. | Editare și anulare în conflict, ciornă păstrată, renunțare la reîncărcare, confirmare și următorul PUT cu versiunea curentă. |
| 5 | Filtrul clienților folosește `ends_at > start`, la fel ca rezervările și calendarul. | Eveniment încheiat exact la 00:00 comparat între clienți, rezervări și calendar. |
| 6 | `occupied_hall_days` însumează perechi distincte sală activă–zi, intersectate în fusul companiei. Calendarul și statisticile folosesc `HallDayOccupancy`. | Interval nocturn, multizilnic, început anterior raportului și sfârșit la 00:00. |
| 7 | Calendarul expune separat `active_capacity`, `active_occupied_halls` și `historical_occupied_halls`. Statistica anuală nu mai reconstruiește capacitatea din ocuparea totală și locurile libere. | Zero săli active cu istoric și combinații de săli active/inactive. |
| 8 | Pagina, totalul, amprenta, relațiile încărcate și lunile sunt citite în aceeași tranzacție. Momentul filtrării și al stării efective este comun. | Scriere MySQL coordonată între citirea paginii și agregarea lunilor. |
| 9 | Calendarul zilnic întoarce `meta.snapshot`; următoarea pagină retransmite amprenta. `CALENDAR_DAY_LIST_CHANGED / 409` resetează paginile și reia prima pagină. | Redenumire, dezactivare, rezervare nouă între pagini și reluare în frontend. |
| 10 | Crearea rezervării cere `operation_id` UUID, cu jurnal durabil și amprentă canonică. Retry-ul identic recuperează rezervarea curentă fără rescriere; alt payload produce `BOOKING_OPERATION_CONFLICT / 409`. | Răspuns pierdut, redeschidere, retry canonic, payload diferit, expirare între încercări, izolare și două cereri MySQL simultane. |
| 11 | Amprenta nu mai parcurge identificatorii tuturor rezervărilor. Folosește revizia companiei și tranziții temporale găsite prin indecși. | Harness separat pentru 1.000/10.000/100.000 de rânduri, pagini succesive, polling și doi cititori concurenți; emite latență, interogări și memorie. |

## Contract și stocare

`BUSINESS_DOCUMENT_QUOTA_BYTES` configurează cota documentelor, implicit 1.073.741.824 bytes per companie, separat de cota fotografiilor sălilor. Se însumează `size_bytes` pentru toate documentele cu `file_deleted_at IS NULL`, inclusiv arhivele. O companie deja peste cotă își păstrează fișierele, dar nu poate adăuga altele până la eliberarea spațiului.

Uploadul creează mai întâi o înregistrare privată rezervată, invizibilă listelor normale. `deleted_at` este temporar în viitor, cu 15 minute, pentru recuperarea unui proces întrerupt. Scrierea pe disc și publicarea sunt protejate de lockul companiei. Publicarea elimină marcajul de arhivare; eșecul o face eligibilă pentru curățare. `business:purge-documents`, deja programată în scheduler, ignoră rezervările neexpirate și păstrează cota când ștergerea fizică eșuează. După o întrerupere, fișierul și cota se reconciliază din înregistrarea durabilă, fără dependență de memoria procesului.

GET `/api/event-documents/{id}` și GET `/api/event-payments/{id}` permit reîncărcarea punctuală. Au aceleași middleware-uri de autentificare, cont activ, companie, abonament, rol și modul ca editarea; serviciile păstrează scoping-ul pe companie. Documentele includ `version` în listă, creare, citire și actualizare. PUT fără versiune întoarce 422. Codurile noi au texte centralizate în frontend.

`booking_creation_operations` are UUID, `company_id`, autor nullable, `event_id`, `operation_id`, amprentă și timestamps; cheia companie–operație este unică. Amprenta normalizează sumele, tipurile numerice, momentele UTC, ordinea cheilor și alocările personalului. Recuperarea nu depinde de faptul că termenul provizoriu sau o opțiune de catalog mai sunt active. Se păstrează validarea structurală, autorizarea și comparația amprentei; recuperarea nu permite o scriere nouă cu date devenite invalide. PUT ignoră identitatea creării și continuă să ceară versiunea.

Formularul rezervării păstrează cheia, valorile și payloadul exact în memoria privată a sesiunii, izolate pe companie și cont. După rezultat incert, blochează modificarea câmpurilor și retrimite aceeași operație, inclusiv după închidere/redeschidere. Un refuz definitiv la prima trimitere permite corectarea; după un rezultat incert, un refuz ulterior nu șterge încercarea. Logout schimbă generația și golește memoria. Restartul procesului nu păstrează această ciornă; lista serverului trebuie consultată înainte de reintroducerea unei rezervări incerte după restart. Jurnalul criptat existent al plăților nu este modificat de acest mecanism.

Revizia `companies.planner_revision` avansează explicit în tranzacțiile rezervărilor, plăților, clienților, sălilor, documentelor și expirării automate. Scrierile iau lockul companiei înaintea resurselor. Citirile paginate țin un lock comun până la obținerea întregului rezultat. Amprenta este conservatoare: poate cere reluare și pentru o modificare din alt filtru. Acoperă și trecerea timpului fără scheduler prin data locală și maximele expirărilor/sfârșiturilor deja trecute, folosind indecși compuși. Importurile sau reparațiile SQL în afara serviciilor trebuie făcute cu scrierile oprite și cu avansarea reviziei înainte de reluarea accesului.

Paginatorul și agregarea lunilor rămân în SQL; costul lor depinde în continuare de filtre și volum. Eliminarea parcurgerii PHP pentru amprentă nu reprezintă o măsurătoare de latență și nu transformă întregul endpoint în cost constant. Raportul de statistici este limitat la 366 de zile pentru a păstra agregarea zilelor limitată; depășirea întoarce `OVERVIEW_RANGE_TOO_LARGE / 422`.

## Livrare și rollback

1. Backup verificat al SQL și fișierelor private; oprirea scrierilor și reconcilierea operațiilor mobile incerte.
2. Configurarea cotei documentelor și aplicarea migrațiilor `2026_10_24_020000` și `2026_10_24_030000`, după migrațiile anterioare. Normalizarea refuză explicit datele neconvertibile, cu identificatorul rezervării; nu elimină elemente pentru a ascunde problema.
3. Livrarea coordonată a API-ului și aplicației Android. Versiunile mobile vechi care omit cheia creării sau versiunea documentului primesc 422; nu există bypass pentru versiuni vechi.
4. Menținerea schedulerului pentru curățarea documentelor. La rollback se opresc scrierile, se reconciliază rezervările de upload și crearile incerte, se revine la API/clientul anterior, apoi se execută `down` dacă este necesar. Eliminarea jurnalului pierde deduplicarea; rezervările, documentele și fișierele nu sunt șterse de migrarea inversă. Normalizarea JSON echivalentă rămâne.

## Validare și limite

Au fost revizuite static traseele modificate și au fost aplicate formatările Pint și Prettier. Nu au fost rulate `tsc --noEmit`, `eslint .`, `jest`, `pint --test`, `php artisan test`, verificările de update sau benchmarkurile: aceasta este prima cerere de lucru din sesiune, iar AGENTS.md cere păstrarea ritmului de verificări. Nu s-au schimbat dependențe.

Testele MySQL și cele de volum refuză baze fără sufixul `_test`. Harnessul de volum este în suita `Performance` și cere suplimentar `BUSINESS_RUN_VOLUME_TESTS=true`; nu se activează implicit și recreează numai baza de test dedicată. Testele de concurență folosesc procese distincte, secrete transmise prin stdin/mediu și fișiere temporare proprii. Matricea din `SecurityGatesApiTest` include automat rutele noi și a fost extinsă pentru tokenuri revocate/expirate și cont blocat.

Rezultatele în execuție pentru MySQL, latență/memorie și Android, inclusiv font scaling, tastatură și TalkBack, rămân de validat la runda autorizată de verificări. Nu se atribuie rezultat verde CI sau garanție de securitate pe baza acestei revizii statice.
