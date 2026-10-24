# Remedierea auditului — 24 octombrie 2026

Au fost păstrate modificările funcționale existente și remediate cele zece constatări din auditul fișierelor modificate. Izolarea este pe companie; proprietarul și administratorii aceleiași companii au acces comun intenționat. Conturile din companii diferite nu trebuie să partajeze clienți, săli sau rezervări.

| ID | Problemă | Remediere și regresie |
| --- | --- | --- |
| A01 | Dialoguri private și confirmări rămase după logout | Golire la schimbarea sesiunii, blocarea callback-urilor vechi și ignorarea erorilor aborted. DialogHost verifică schimbarea sesiunii, coada și confirmarea capturată. |
| A02 | Editarea sălii fără versiune permitea suprascrierea | version obligatoriu pe PUT și verificare sub lock, inclusiv în serviciu. HallWriteSafetyApiTest verifică refuzul lipsei versiunii. |
| A03 | Telefonul retrimitea numele vechi; clienții nu aveau versiuni | PUT parțial cu phone și version, versiuni la editare/arhivare și reconciliere explicită în UI. Teste de păstrare a numelui/notelor, ciorne vechi, rollback și concurență MySQL. |
| A04 | JSON asociativ sau cu tipuri incompatibile în profilul sălii | Reguli list pentru toate colecțiile, canonizarea programului și migrare cu prevalidarea tuturor datelor. Regresii pentru forme greșite și conversie fără eliminări. |
| A05 | Retry-ul creării clientului fără telefon putea dubla datele | operation_id obligatoriu și jurnal durabil pe companie; payload și cheie recuperate la redeschiderea formularului. Teste pentru cereri concurente, rezultat pierdut, alte companii și arhivare/restaurare. |
| A06 | Fotografii arhivate fără curățare sau cotă | Cotă per companie sub lock, retenție și comandă idempotentă cu retry; ștergerea sălii arhivează galeria. Regresii pentru fișiere active, retenție, eșec de storage și quota atomică. |
| A07 | N+1 în calendarul zilnic | Eager loading venueDetails, cu regresie ce numără interogările pe o pagină de 20 de săli. |
| A08 | Contoare și preview rămase vechi după expirări | Reîncărcare la 30 de secunde a listei și detaliilor, inclusiv fără imagini. Test de expirare cu ceas controlat. |
| A09 | Numele clientului rămânea vechi în preview-ul sălii | Invalidarea detaliilor sălilor numai pentru compania curentă, cu test de separare a cache-urilor. |
| A10 | Contrast insuficient în agenda evidențiată | Culoare existentă mai închisă, cu verificarea raportului minim 4,5:1 pentru rândurile de text. |

Au fost investigate și erorile CI existente anterior: auditul plăților folosea reprezentarea SQL brută a sumei, acum canonizată prin Money; testul invitației folosea o parolă fără cifre și nu ajungea la verificarea codului expirat, acum folosește date valide. Alerta Gitleaks reprezenta exact hashul unui commit Git menționat în documentația auditului. Excepția verifică simultan calea documentului și acel hash complet; regulile implicite și scanarea întregului istoric rămân active.

react-hook-form a primit update minor compatibil. npm audit fix a actualizat dependențele tranzitive afectate de advisories body-parser și fast-uri, fără force sau legacy-peer-deps. Update-urile majore disponibile pentru Babel, resolvers, ESLint și TypeScript nu fac parte din această remediere și nu au fost instalate.

## Validare și limite

Testele de regresie au fost pregătite pentru autorizare, actualizări parțiale, concurență, rollback, retenție și recuperarea formularelor. Verificările complete de livrare se execută în GitHub Actions; rezultatele vor fi completate după rulare. Suitele standard locale nu au fost pornite în afara ritmului AGENTS.md. Prettier și Pint au fost folosite pentru formatare. Scanarea secretelor este executată și local, cu raport redactat.

Nu au fost schimbate datele din baza locală de business și nu s-au aplicat noile migrații acolo. Auditul nu validează configurația infrastructurii de producție, restaurarea backupurilor, un dispozitiv iOS, toate combinațiile de fonturi/lățimi sau TalkBack. Probele automate nu reprezintă o garanție că orice caz posibil este acoperit.

## Instalare și revenire

Se livrează API-ul și aplicația împreună, după backup verificat și oprirea scrierilor. Se aplică migrațiile noi și se actualizează clienții mobili; versiunile vechi care omit version sau operation_id primesc 422. PROJECT_SCHEMA.md documentează contractul complet.

BUSINESS_HALL_IMAGE_QUOTA_BYTES are implicit 1 GiB per companie; BUSINESS_HALL_IMAGE_RETENTION_HOURS are implicit 24 ore. Schedulerul Laravel trebuie să ruleze pentru business:purge-hall-images. Cota include fișierele arhivate până la curățarea reușită. Retenția se aliniază politicii de backup înainte de activarea curățării în producție.

Rollback-ul oprește scrierile și reconciliază operațiile incerte înainte de eliminarea coloanelor/jurnalului de deduplicare. Normalizarea JSON păstrează forma canonică echivalentă. Fișierele deja șterse fizic necesită restaurare din backup.
