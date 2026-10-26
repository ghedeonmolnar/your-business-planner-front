# Remedierea auditului reverificat — 26 octombrie 2026

Baza verificată: frontend `cc670d1`, API `5e40d80`. Au fost analizate cele șase constatări V01–V06 din raportul furnizat, inclusiv N04. Cele 20 de puncte declarate anterior rezolvate nu sunt revendicate ca o nouă reverificare integrală în această schimbare.

## Constatări și corecții

| ID | Verdict în codul inițial | Corecție |
| --- | --- | --- |
| V01 | Confirmat | Primul `HALL_ALREADY_BOOKED` sau `EMPLOYEE_ALREADY_ASSIGNED` este refuz definitiv: tentativa se elimină, ciorna rămâne editabilă, disponibilitatea se invalidează și se selectează pasul relevant. După un rezultat incert se păstrează aceeași cheie și același payload. `BOOKING_OPERATION_CONFLICT` blochează retrimiterea și cere reconciliere explicită, cu confirmare după verificarea listei. |
| V02 / N04 | Confirmat | Un răspuns autoritar încheie explicit verificarea chiar dacă termenul nu se schimbă. După confirmarea accesului, verificările continuă în fundal la 30 s, fără reblocarea formularului pe baza ceasului local. Înaintea primei confirmări, erorile au retry la 5 s și păstrează ciorna. Răspunsurile sesiunilor vechi sunt ignorate. |
| V03 | Confirmat | Calendarul lunar/anual și overview citesc toate agregările într-o tranzacție cu lock comun pe companie. Scrierile folosesc lockul exclusiv al aceleiași revizii. Fiecare sumar capturează un singur moment pentru expirări. Nu se promite atomicitate între două endpointuri distincte. |
| V04 | Confirmat | `BookingPricing.refresh` validează soldul derivat în intervalul ±99.999.999,99 înainte de salvare și întoarce `BOOKING_BALANCE_TOO_LARGE / 422`. Calculul orar folosește cât/rest și o limită verificată înaintea produselor mari; depășirea costului alocării devine `BOOKING_AMOUNT_TOO_LARGE / 422`. Crearea, editarea, anularea plății și editarea contractului păstrează rollbackul atomic. |
| V05 | Confirmat | `hall_images` permite rezervări private cu `hall_id=null`. Calea, autorul și dimensiunea sunt confirmate în registru înainte de scrierea oricărui fișier, într-o tranzacție separată de publicarea sălii. Publicarea leagă imaginile de sală atomic. Rollbackul sau întreruperea lasă rezervările în cotă și eligibile pentru cleanup; nu depinde de o listă de căi din memorie. |
| V06 | Confirmat | `employees.version` este expus în listă/profil și obligatoriu la update și arhivare în API-ul activ. Serviciul recitește sub lock în ordinea companie → persoană și refuză ciornele vechi cu `RESOURCE_VERSION_CONFLICT / 409`. Directorul personalului și formularul vechi păstrează ciorna și încarcă versiunea curentă numai după confirmare. |

A fost corectată și observația R04 rămasă: disponibilitatea personalului sortează după `name,id`, cu regresie pentru nume identice între pagini.

## Galerie și recuperare

O rezervare nouă are `deleted_at` în viitor cu 15 minute și nu apare în galeria publicată. Registrul consumă cotă inclusiv înaintea scrierii fizice. Publicarea și purgerul iau mai întâi lockul companiei; purgerul nu poate elimina fișierul în timpul publicării protejate de acel lock. Dacă rezervarea a fost curățată înainte ca publicarea să înceapă, se întoarce `HALL_IMAGE_UPLOAD_EXPIRED / 422` și se cere reluarea uploadului.

La terminarea cu eșec, rezervările nepublicate sunt marcate pentru cleanup fără eliberarea cotei. După o oprire a procesului, expirarea de 15 minute permite recuperarea programată. Imaginile publicate și ulterior arhivate păstrează retenția existentă. Marcajul `file_deleted_at` se scrie numai după ștergere fizică reușită sau confirmarea absenței fișierului.

## Regresii pregătite

- UI/hook creare: primul 409, corectare și cheie nouă; timeout urmat de 409 și redeschidere cu payload identic; conflict al cheii, anularea reconcilierii și confirmarea explicită.
- Abonament: același termen activ cu ceas înainte, corectarea ceasului, profil inactiv cu ceas în urmă, offline/retry și răspuns întârziat după logout.
- MySQL: activare sală plus rezervare în timpul citirii sumarului; schimbarea unei plăți incoming → outgoing între agregări; două editări ale personalului; arhivare concurentă cu alocarea personalului.
- Finanțe: sold pozitiv și negativ la limită, depășire cu un ban, restituire maximă, mai multe încasări, editare/anulare/contract cu rollback și retry; durată extremă și rotunjire la limită.
- Galerie: prima scriere reușită și a doua refuzată, cleanup refuzat și reluat, eroare după scriere înainte de commit, rezervare abandonată, cotă ocupată și protejarea lease-ului activ.
- Personal: versiune obligatorie, editare/editare, editare/arhivare, tarif/rol/stare curente, izolare între companii și reconciliere UI confirmată.

## Migrare și livrare

1. Backup verificat al bazei și fișierelor private, oprirea scrierilor și reconcilierea uploadurilor în curs.
2. Aplicarea `2026_10_26_010000_add_employee_versions` și `2026_10_26_020000_allow_pending_hall_image_uploads` înaintea API-ului nou.
3. Livrare coordonată API/client: clienții fără versiunea personalului primesc 422. Pentru o lansare publică rămâne necesară o politică explicită de versiune minimă/compatibilitate, nu presupunerea că toate dispozitivele au fost actualizate.
4. Schedulerul trebuie să continue `business:purge-hall-images`; eșecurile rămân vizibile și păstrează cota până la recuperare.
5. La rollback, se opresc scrierile, se reconciliază și se curăță rezervările fără sală, apoi se revine la API/clientul anterior. Migrarea inversă refuză eliminarea registrului care mai urmărește fișiere necurățate. Profilurile personalului și imaginile publicate nu sunt șterse de aceste migrări inverse.

## Validare și limite

Validare locală la 26 octombrie 2026:

| Verificare | Rezultat |
| --- | --- |
| Frontend TypeScript și ESLint | Succes după corectarea fixture-urilor pentru versiunea personalului. |
| Jest complet | 157 suite, 594 teste trecute; raportul final are `success=true`, fără teste eșuate. |
| Selector frontend | 12 teste trecute. |
| Laravel Pint | Succes pe proiectul complet. |
| PHPUnit SQLite complet | 194 teste trecute, 15 omise, 2.009 aserțiuni. |
| PHPUnit MySQL complet | 207 din 208 teste au trecut în runda completă; scenariul overview avea un payload de test invalid la PUT, cu `operation_id` interzis. |
| Reexecutarea scenariului MySQL corectat | Succes: 1 test, 10 aserțiuni. Toate cele 208 scenarii MySQL au rezultat de succes între aceste rulări; nu se pretinde o nouă rundă completă verde după corectarea testului. |
| Selector backend | 13 teste trecute. |
| Documentație și diff | Cele trei copii AGENTS.md și PROJECT_SCHEMA.md sunt sincronizate; `git diff --check` trece în ambele repository-uri. |

Runda MySQL completă și reexecutarea sunt în `business-api/storage/logs/audit26-mysql.txt`, respectiv `audit26-mysql-retry.txt`, cu rapoarte JUnit alături. SQLite are `audit26-sqlite.txt` și raport JUnit. Aceste dovezi locale sunt ignorate de Git. Rezultatul complet MySQL/CI pe commitul livrat rămâne obligatoriu înainte de merge; nu este înlocuit de această reexecutare țintită.

Docker Desktop a fost recuperat prin izolarea directoarelor de runtime cu socketuri AF_UNIX inaccesibile (`dockerInference` și `engine.sock`), păstrând directoarele vechi, containerele și volumele. Motorul și containerele MySQL/Mailpit au pornit sănătos; o repornire ulterioară normală a reușit fără reapariția erorii.

Migrațiile au fost executate numai de suitele de teste; nu au fost aplicate în baza aplicației. Concurența s-a verificat în baza MySQL dedicată `your_business_planner_test`; SQLite nu demonstrează lockurile sau limitele DECIMAL. Nu au fost actualizate dependențe și nu a fost rulat un build Android pentru această rundă; gate-urile de build/securitate și validarea nativă rămân necesare pentru livrare.

Matricea Android cu tastatură, fontScale, TalkBack, restart și pierderea conexiunii rămâne separată de testele rendererului. Nu se declară executată, nu se revendică deploy, conformitate OWASP/WCAG sau securitate absolută. Benchmarkul de volum, configurația producției și restaurarea backupurilor nu sunt validate prin aceste regresii.
