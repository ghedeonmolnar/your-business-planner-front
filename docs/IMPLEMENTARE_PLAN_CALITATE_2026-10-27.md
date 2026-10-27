# Implementare si dovezi locale — 27 octombrie 2026

Referinte: [planul integral](PLAN_CALITATE_2026-10-26.md), [registrul lansarii](ROADMAP_LANSARE.md), [recuperare/deploy](RECUPERARE_SI_DEPLOY.md), [inventarul legacy](INVENTAR_LEGACY_2026-10-27.md). Starea de lansare nu este echivalenta cu integrarea codului in main.

## Schimbari implementate

- Calendarul lunar pastreaza aspectul de referinta, selectia are prioritate, iar starea zilei ramane accesibila fara culoare. Exista lista pentru font mare/ecran ingust si salt direct luna/an. Pollingul se opreste pe tabul ascuns; revenirea revalideaza.
- Problema locala API(200)/schema a fost investigata impreuna cu pornirea proiectului: backup local inaintea migrarilor restante, aplicarea lor si folosirea pachetului Android cu versiunea nativa compatibila. Validarea raspunsurilor API ramane stricta.
- Crearea incerta a rezervarii este salvata in Keychain inaintea POST-ului, cu aceeasi cheie/payload la retry, identitate si generatie de sesiune. Jurnalul corupt blocheaza crearea; vechimea de 30 zile cere reconciliere, fara stergere implicita. Submitul si reconcilierea sunt protejate de executare dubla.
- Politica mobila are observe/recommend/enforce; implicit observe. Buildul/headers nu autorizeaza operatii. Refuzul unei versiuni nu produce logout fals si nu sterge operatiile incerte. Recomandarea este vizibila in Mai multe, iar blocarea cunoscuta ramane conservatoare offline. Gradle/Babel folosesc acelasi ENVFILE/APP_BUILD; cache-urile Metro sunt separate dupa amprenta mediului.
- Request ID validat/generat, loguri cu lista explicita de metadate, colector mobil autentificat si limitat, health public minimal si inspectie operationala CLI. Heartbeatul distinge pornire/succes/esec, inclusiv evenimente in aceeasi milisecunda.
- Pachet privat SQL-fisiere cu manifest/checksumuri si verificator separat. Sunt cerute oprirea scrierilor si mentenanta; copia externa criptata/restaurarea nu sunt declarate efectuate prin simpla generare a manifestului.
- Formularele pot muta headerul/footerul in scroll cand tastatura lasa prea putin spatiu. Erorile au anunt accesibil. Panoul Notificari arata permisiuni, programari si numere agregate pentru fereastra de 40.
- Fixtures smoke/A/B/C refuza alte medii decat testing/MySQL/_test. Importul in loturi evita pastrarea query-urilor de import in memorie si restaureaza dispatcherul dupa import. Profilele mari au clienti, sali, personal de director si documente sintetice; alocarile de personal reprezentative suplimentare trebuie incluse in pregatirea benchmarkului de lansare.
- Identificatori nativi, E01/E02/E03, E04 cu raspuns pierdut dupa commit, runner Maestro 2.12.0 fara retry de mascare si harness k6 2.3.0. Credentialele sintetice nu sunt argumente sau inputText logat; helperul este exclus din buildurile Android obisnuite/release.
- Contractul curent este separat de arhiva; CI verifica manifestul copiilor comune. Nu au fost sterse fisiere/tabele legacy pe baza unei singure cautari.

## Probe locale inregistrate

| Proba | Rezultat observat |
| --- | --- |
| TypeScript `tsc --noEmit`, ESLint cu zero warnings | Trecute pe schimbarea locala; se repeta in CI pe revizia PR |
| Jest complet | 161 suite / 603 teste trecute; testele Node din tools au runner propriu si sunt excluse din descoperirea Jest |
| Regresii selectoare/formular sala | 3 suite / 10 teste trecute, inclusiv raspuns pierdut si pastrarea multipartului |
| PHPUnit SQLite pe 13.4.5 | 226 teste / 6.778 asertiuni; 15 scenarii exclusiv MySQL sarite explicit |
| PHPUnit MySQL complet pe 13.4.5 | 225 teste / 6.895 asertiuni trecute, exclusiv in baza dedicata _test |
| Regresii noi de operare/contract | Autorizare colector, redactare cu santinele, politica mobila, heartbeat, guard _test, checksum alterat si traversare de cale |
| Pachet SQL-fisiere real | Generat cu API-ul de test oprit; 32 tabele si 10 fisiere, checksumuri si numere comparate cu baza sursa. Nu reprezinta import/restaurare externa |
| Financiar generativ | 1.000 cazuri deterministe si 50 secvente de operatii, parte din suita completa |
| Unelte Node | Frontend 13 teste, API/frontend operator 19 teste trecute |
| Pint | Verificare completa trecuta; s-au corectat si formatari preexistente, fara schimbarea regulilor de business |
| Android normal | `assembleDebug` x86_64 trecut; CI pastreaza buildul arm64 |
| Android dedicat E2E | APK `.e2e` compilat si instalat separat; autentificarea cu API real a fost parcursa |
| Fixture C | O companie cu exact 100.000 de rezervari generata complet dupa remedierea consumului de memorie |
| Vite operator | Build trecut |
| Audituri | npm frontend/API: zero vulnerabilitati; Composer: zero advisory dupa patch-ul PHPUnit autorizat separat |

Suita MySQL completa si toate joburile CI trebuie sa fie verzi pe commitul pregatit pentru merge. Rezultatele selective, SQLite si fisierele de configurare nu inlocuiesc aceasta conditie. Rapoartele CI ale PR-urilor/commitului final sunt dovada publicarii; logurile locale brute si manifestele cu credentiale raman private.

S-a detectat initial o coliziune intre runnerul `node:test` al uneltelor si descoperirea Jest; configuratia separa acum cele doua suite, iar ambele ruleaza in CI. Un timeout local al testului de sala a fost investigat si regresia a fost rerulata separat; suita completa curata a trecut ulterior, fara cresterea timeoutului sau slabirea asertiunilor.

## Diagnostic de performanta, fara acceptare de capacitate

k6 diagnostic: 2 VU, 45 secunde, profil C. 27 cereri HTTP, 22 iteratii, zero erori HTTP neasteptate si zero 500. Pragurile citirilor **nu au trecut**:

| Operatie | p95 observat | Buget propus |
| --- | --- | --- |
| Lista | 6,61 s | 500 ms |
| Zi | 2,18 s | 500 ms |
| Luna | 1,75 s | 700 ms |
| An | 4,92 s | 1.200 ms |
| Overview | 6,64 s | 1.200 ms |
| Creare | 385 ms | 800 ms |
| Editare | 328 ms | 800 ms |
| Plata | 192 ms | 800 ms |

Mediul a folosit serverul PHP local cu un singur worker si Docker Desktop, simultan cu verificari si importuri locale. Baza de diagnostic contine si fixture-uri anterioare, inclusiv importuri partiale esuate inaintea remedierii; nu este o rulare de acceptare comparabila. Nu s-au redus pragurile si nu s-au aplicat optimizari SQL/cache speculative. Profilul C de stres se raporteaza separat. Sunt obligatorii staging cu resurse documentate, baza curata, profilele A/B, trei rulari rece/cald si masurarea query-urilor/lockurilor inaintea deciziei de optimizare.

## Blocaje ramase pentru lansare

- Protectiile GitHub demonstrate prin configuratie/export si un PR cu gate esuat. Citirea lor prin integrarea disponibila a intors 403 pentru ambele proiecte; aceasta nu dovedeste singura o limitare de abonament.
- Acces CI securizat la API-ul privat, runner Android si activarea gate-ului android-e2e dupa cinci smoke-uri complete consecutive. Fisierele YAML si loginul parcurs nu sunt aceasta dovada. Probe locale ale selectorului cu tastatura au aratat o interactiune nativa care necesita verificare suplimentara; nu este marcata acceptata.
- E05-E10, matricea 320/360/412 dp, font 1/1,4/2, landscape/tastatura, TalkBack, reboot, telefon fizic modest/mediu si trei utilizatori reprezentativi.
- Restaurarea externa SQL-fisiere, criptarea/copia externa, PITR, RPO/RTO masurate, repetarea migrarilor pe schema veche populata si verificarea financiara dupa restaurare.
- HTTPS/SQL privat/TLS, identitati SQL separate, MFA inclusiv acces direct la origine, colector/alerte externe si incidente controlate cu dovada inchiderii.
- Benchmarkurile reprezentative si remedierea bugetelor de citire, upgrade semnat, instalare noua, client vechi/API nou si pilot de 7 zile.

Nu se declara pragul 9/10, conformitate OWASP/WCAG, performanta pentru 100 de companii sau pregatire de productie pe baza acestor probe locale.
