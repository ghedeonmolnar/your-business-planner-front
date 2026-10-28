# Prezentarea Gatify pentru proprietarii de săli

Cont: `owner1@example.test`, compania **Gatify Software SRL**. Durată: 10–15 minute, exclusiv în aplicația Android. Profilul `venue-2026-2027-v1` a fost aplicat local la 27 octombrie 2026, ora 16:10, Europe/Bucharest. Abonamentul existent expiră la **20 noiembrie 2026, ora 20:50**; prezentarea se programează înainte de expirare.

## Datele disponibile

| Resursă | Total după import |
| --- | ---: |
| Săli active | 5 |
| Personal | 80: 76 activi și 4 inactivi cu istoric |
| Conturi | 6: proprietarul existent, 2 administratori și 3 angajați |
| Clienți | 1.800; 600 au rezervări repetate |
| Rezervări | 2.400: câte 1.200 în 2026 și 2027 |
| Înregistrări financiare | 5.462, inclusiv cea existentă |
| Documente private | 20, atașate la 10 rezervări de referință |

Sala Imperial existentă, de 350 de persoane, este păstrată. Sălile adăugate sunt Royal — 500, Magnolia — 250, Garden — 150 și Studio — 80. Echipa cuprinde 6 responsabili de sală, 44 de ospătari, 12 bucătari, 10 barmani și 8 persoane auxiliare. Doi ospătari, un bucătar și un barman au istoric anterior datei de 1 iulie 2026 și sunt acum inactivi.

Distribuția lunară este aceeași în ambii ani și include toate stările rezervărilor:

| Luna | Ian | Feb | Mar | Apr | Mai | Iun | Iul | Aug | Sep | Oct | Noi | Dec |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Rezervări/an | 65 | 60 | 75 | 90 | 120 | 125 | 140 | 140 | 135 | 100 | 65 | 85 |

La import existau 884 rezervări finalizate, 1.089 confirmate, 81 provizorii active, 222 anulate și 124 expirate. Calendarul include 225 de evenimente peste miezul nopții, dintre care 40 trec între luni și 2 între ani. În fiecare dintre cele 24 de luni există zile cu 0, 1, 2, 3, 4 și 5 săli ocupate, inclusiv continuările nocturne. Provizoriile își păstrează expirarea normală; aceste totaluri descriu momentul importului.

Numele și textele adăugate sunt fictive. Telefoanele noi folosesc intervalele internaționale rezervate pentru ficțiune [publicate de Ofcom](https://www.ofcom.org.uk/phones-and-broadband/phone-numbers/numbers-for-drama), pentru a evita folosirea numerelor unor persoane reale. Notele contactelor precizează acest lucru. Datele demonstrative nu se folosesc pentru apeluri sau mesaje.

## Pregătirea sesiunii

Pornește infrastructura locală, API-ul și Metro conform README-urilor proiectelor, apoi deschide aplicația Android obișnuită Gatify. Aplicația separată cu identificatorul `.e2e` folosește mediul dedicat testelor și nu reprezintă acest cont.

Autentifică proprietarul și verifică în **Mai multe** compania Gatify Software SRL și abonamentul activ. Parolele proprietarului rămân cele existente. Cele cinci credențiale noi sunt generate aleator și se găsesc numai în fișierul privat descris mai jos; nu sunt incluse în acest ghid sau în Git.

| Rol | Nume | Email demonstrativ |
| --- | --- | --- |
| Administrator | Andreea Sălăgean | `admin-1.3a3f9fb328@example.test` |
| Administrator | Mihai Bodea | `admin-2.3a3f9fb328@example.test` |
| Angajat — responsabil de sală | Andrei Dumitrescu | `employee-1.3a3f9fb328@example.test` |
| Angajat — ospătar | Sofia Dumitrescu | `employee-2.3a3f9fb328@example.test` |
| Angajat — barman | Călin Stan | `employee-3.3a3f9fb328@example.test` |

Pentru segmentul de angajat este util un al doilea emulator sau telefon, deja autentificat cu unul dintre cele trei conturi. Acesta vede evenimentele la care este alocat și remunerația proprie. Conturile noi sunt verificate local, fără invitații sau e-mailuri trimise.

## Parcursul de 10–15 minute

### 1. Calendarul — minutele 0–3

Deschide **Calendar**, selectează toate sălile și luna **noiembrie 2026** prin titlul perioadei. Arată pe rând:

| Data | Săli ocupate | Rezultatul așteptat |
| --- | ---: | --- |
| 2 noiembrie 2026 | 0 | Toate cele 5 săli sunt libere |
| 3 noiembrie 2026 | 2 | 2 ocupate și 3 libere |
| 4 noiembrie 2026 | 3 | 3 ocupate și 2 libere |
| 7 noiembrie 2026 | 5 | Toate cele 5 săli sunt ocupate |
| 10 iunie 2027 | 0 | Toate cele 5 săli sunt libere |
| 11 iunie 2027 | 2 | 2 ocupate și 3 libere |
| 12 iunie 2027 | 3 | 3 ocupate și 2 libere |
| 13 iunie 2027 | 5 | Toate cele 5 săli sunt ocupate |

Selectează 7 noiembrie și aplică filtrul **Sala Royal**: lista zilei trebuie să arate sala și rezervarea ei. Golește filtrul, treci la vederea anuală, apoi revino la luna selectată. Explică faptul că ocuparea numără săli distincte și include evenimentele care continuă după miezul nopții. Anulările și provizoriile expirate rămân în istoric, fără să blocheze sălile.

Filtrul sălii este în antet. Zilele complet ocupate sunt verzi, inclusiv când sunt selectate; legenda le numește **Complet**. În lista zilnică apar întâi sălile libere, pe verde deschis, apoi grupul sălilor ocupate. Orele din aceste rânduri nu mai au sufixul „(+1 zi)”. Schimbarea lunii refolosește sumarul anual din cache; serverul este verificat printr-o revizie mică la 30 de secunde cât calendarul este vizibil, iar datele sunt reîncărcate când revizia diferă. O zi nouă, un an nou sau un filtru nou pot necesita prima lor cerere.

### 2. Fișa rezervării — minutele 3–6

În **7 noiembrie 2026**, deschide rezervarea **Sorin Diaconu — Sala Royal**. Rezultatele inițiale sunt:

| Câmp | Valoare |
| --- | --- |
| Stare | Confirmată |
| Total contract | 63.000,00 RON |
| Avans încasat | 15.750,00 RON |
| Rest de încasat | 47.250,00 RON |
| Documente | Contract demonstrativ și fișă de organizare, ambele PDF |

Arată clientul, invitații, meniul, personalul și remunerațiile, apoi extinde **Plăți și cheltuieli** și **Documente**. Deschide unul dintre PDF-uri; fișierul trebuie descărcat prin mecanismul privat existent. Documentele sunt exemple generice, marcate fără valoare contractuală sau fiscală.

Pentru serviciile suplimentare, deschide **Raluca Diaconu — Sala Imperial**, în aceeași zi: total 105.220,00 RON, rest 79.915,00 RON. Pentru detalii încă necompletate, exemplul inițial este **Elena Diaconu — Sala Magnolia — 31 octombrie 2026**: provizorie, fără program și meniu, total zero. Această provizorie expiră natural; după expirare se prezintă ca exemplu istoric, iar o provizorie încă activă se alege din lista filtrată.

### 3. Financiar — minutele 6–9

În rezervarea Sorin Diaconu, compară avansul încasat cu încasarea în așteptare și restul de plată. O înregistrare în așteptare nu micșorează soldul. Poți deschide formularul pentru o încasare nouă și închide formularul după explicarea câmpurilor. Salvarea unei încasări schimbă soldul și totalurile din acest ghid.

Pentru exemple deja înregistrate, folosește istoricul rezervărilor sau căutarea clientului:

| Exemplu | Rezervare exactă | Rezultatul așteptat |
| --- | --- | --- |
| Încasare integrală și cheltuieli | Ioana Popescu — Royal — 3 ianuarie 2026 | Finalizată, contract 91.600,00 RON, avans 21.375,00 RON și încasare finală 70.225,00 RON; sold zero; personal 8.840,00 RON și furnizori 11.450,00 RON |
| Rambursare | Sofia Popescu — Imperial — 5 ianuarie 2026 | Anulată, avans încasat și restituit de 19.800,00 RON; sala este liberă de această rezervare |
| Încasare parțială | Alina Avram — Magnolia — 13 iunie 2027 | Confirmată, contract 36.480,00 RON, sold 18.240,00 RON |

Explică formula soldului: contract minus încasările finalizate plus rambursările finalizate. Cheltuielile cu personalul sau furnizorii nu reduc datoria clientului. La rezervarea anulată valoarea istorică a contractului rămâne vizibilă; ea este exclusă din contractele active ale statisticilor.

### 4. Echipa și accesul — minutele 9–12

Deschide **Mai multe → Personal**, caută **Andrei Dumitrescu** și arată rolul și tariful. În fișa rezervării sau în formularul de editare, arată intervalele alocate și costul estimat al personalului. Disponibilitatea este verificată pentru intervalul concret, inclusiv după miezul nopții. Există remunerații fixe și pe oră.

În **Mai multe → Conturi și invitații**, arată cele șase conturi și rolurile lor. Contul angajatului de pe al doilea dispozitiv prezintă propriile evenimente și remunerația proprie, cu acces limitat la datele companiei. Revino la proprietar pentru statistici.

### 5. Statisticile — minutele 12–15

Deschide **Mai multe → Financiar și statistici**, prezintă 2026 și apasă **Anul următor** pentru 2027. Valorile de referință la import sunt:

| Indicator afișat | 2026 | 2027 |
| --- | ---: | ---: |
| Rezervări confirmate, inclusiv finalizate | 1.019 | 954 |
| Provizorii active | 8 | 73 |
| Ocupare săli active, fără provizorii | 55,89% | 52,27% |
| Valoare contractată | 62.747.360,00 RON | 55.540.940,00 RON |
| Rest de încasat | 11.857.391,78 RON | 31.400.249,19 RON |
| Încasări efective după data plății | 76.418.704,00 RON | 0,00 RON |

Cele 1.200 de rezervări pe an includ și anulările, expirările și provizoriile; indicatorul de contracte active are altă semnificație. Încasările sunt grupate după data plății, contractele după data evenimentului. Avansurile deja primite pentru evenimente din 2027 apar în 2026; pentru 2027 există și plăți în așteptare. De aceea cifra zero a încasărilor efective din 2027 este potrivită unei prezentări făcute în octombrie 2026.

## Comanda locală și reluarea importului

Din directorul `business-api`, previzualizare fără scrieri în DB sau fișiere:

```powershell
php artisan business:presentation-data --owner=owner1@example.test
```

Aplicare explicită:

```powershell
php artisan business:presentation-data --owner=owner1@example.test --apply
```

`--dry-run` este disponibil ca alias explicit al previzualizării. Comanda refuză combinarea lui cu `--apply` și orice mediu diferit de `local`. Proprietarul trebuie să fie activ, cu companie și abonament active și toate modulele necesare. Datele inițiale incompatibile cu țintele sau cu o zi fixă de prezentare produc refuz înainte de import; nu sunt mutate pentru a potrivi profilul.

Înainte de prima scriere în DB este creat un backup MySQL. Resursele sunt create prin serviciile existente ale aplicației, iar rezervările și plățile lor se confirmă împreună în loturi de 50. Manifestul păstrează planificarea inițială, identificatorii resurselor și cheile stabile ale operațiilor. O reluare după întrerupere completează loturile lipsă. După finalizare, aceeași comandă cu `--apply` devine o operație fără modificări și păstrează editările făcute ulterior pentru demonstrație. Nu șterge manifestul pentru a reimporta profilul.

Directorul privat pentru contul pregătit este:

```text
business-api/storage/app/private/presentation/
  01a15a02-06b9-700a-81d1-1e88bc1e9ed0/venue-2026-2027-v1/
```

| Fișier | Conținut |
| --- | --- |
| `before-presentation.sql` | Backupul bazei înainte de populare |
| `manifest.json` | Inventarul inițial, resursele create, calendarul și punctele de reluare |
| `credentials.json` | Cele cinci conturi noi și parolele generate; acces local privat |
| `report.json` | Totalurile și exemplele publicate la final de comandă |
| `acceptance.json` | Rezultatele inspecției locale a datelor aplicate, din 27 octombrie 2026 |
| `run.lock` | Protecție împotriva a două importuri simultane ale aceluiași profil |

Aceste fișiere sunt în afara directorului public și sunt ignorate de Git. Backupul include baza locală; restaurarea se pregătește separat conform `RECUPERARE_SI_DEPLOY.md`, într-o bază izolată. Copia locală nu reprezintă o restaurare verificată sau un backup extern criptat.

## Acceptare și verificări

Inspecția datelor aplicate a confirmat totalurile, toate cele opt zile fixe și toate cele șase grade de ocupare în fiecare lună. A găsit zero suprapuneri între alocările personalului, zero suprapuneri de intervale blocante pentru aceeași sală, zero depășiri de capacitate și zero diferențe între solduri/costuri și înregistrările financiare/alocările de personal. Toate cele 20 de fișiere atașate există. Resursele inițiale sunt prezente și au rămas cu timestampurile de actualizare anterioare importului. Nicio înregistrare de business a celorlalte companii nu are o actualizare din perioada importului, iar coada de e-mailuri este goală. Reluarea comenzii complete s-a încheiat fără modificări.

Testele pregătite sunt `PresentationDataCommandTest`, `PresentationCalendarTest` și `PresentationGeneratorTest`. Acoperă previzualizarea fără scrieri, refuzul mediilor nepermise, calendarul, păstrarea istoricului, reluarea după o eroare, izolarea altei companii, rolul angajatului, banii, personalul și documentele. **Suitele automate nu au fost executate în acest task**, conform ritmului din `AGENTS.md`; inspecția datelor aplicate și formatarea codului nu înlocuiesc acea rundă.

Parcurgerea manuală în Android, din 27 octombrie 2026, a confirmat în sesiunea proprietarului:

- Cele opt zile fixe, cu numărul așteptat de săli libere, filtrul Royal și vederea anuală pentru 2026/2027.
- Rezervarea Sorin Diaconu din 7 noiembrie, cu program, invitați, meniu, avans de 15.750 lei, total de 63.000 lei și sold de 47.250 lei.
- Plata în așteptare separată de avansul încasat, 15 persoane alocate cu un cost estimat de 5.075 lei și cele două documente atașate.
- Descărcarea și afișarea fișei de organizare PDF în vizualizatorul Android.
- Cele 5 săli active și capacitățile lor, lista personalului și conturile companiei cu rolurile așteptate.
- Statisticile pe 2026 și 2027, cu aceleași valori ca raportul privat și tabelul de mai sus.

Parcurgerea a fost de citire: nu au fost salvate încasări sau editări și nu s-au schimbat roluri. Schimbarea sesiunii către un angajat și fluxurile de salvare nu au fost executate în această parcurgere; pentru segmentul de angajat se pregătește autentificarea pe al doilea dispozitiv. Testele dedicate acoperă accesul angajatului și izolarea, dar rămân neexecutate până la runda prevăzută în `AGENTS.md`. Vizualizarea PDF a necesitat prima deschidere a Chrome și alegerea vizualizatorului PDF; pregătește această etapă pe dispozitiv înainte de prezentare.
