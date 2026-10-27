# Pregatire si blocaje de lansare

Referinta: [planul integral din 26 octombrie 2026](PLAN_CALITATE_2026-10-26.md). Acest registru separa implementarea de probele executate. O functie pregatita sau o suita unitara verde nu demonstreaza pragul de 9/10, capacitatea infrastructurii sau un SLA.

## Situatia interventiei

| Pachet | Lucru local | Proba care ramane obligatorie |
| --- | --- | --- |
| PR01 | Manifest de sincronizare in CI, template PR, separarea contractului actual de istoric | Owner: exportul protectiilor si PR de proba blocat de un test esuat. Citirea protectiilor prin conexiunea curenta a fost refuzata cu 403 `Resource not accessible by integration` pentru ambele repository-uri; nu echivaleaza cu dovada unui plan GitHub insuficient. |
| PR02 | Proceduri de backup, restaurare si livrare; pregatirea probelor SQL-fisiere | Owner/DevOps: mediu separat, conturi SQL distincte, criptare externa, PITR, restaurare masurata si acces MFA inclusiv direct la origine. |
| PR03 | Request ID, redactare, colector API pentru metadate mobile, heartbeat si proba CLI | DevOps: conectarea colectorului/monitorului, destinatarul alertelor si incidentele provocate in staging. |
| PR04 | Identificatori nativi stabili si pregatirea smoke-urilor/fixture-urilor | QA/owner: rulare Maestro pe API dedicat, cinci smoke-uri consecutive fara retry de mascare, activarea gate-ului si acces CI la repository-ul API privat si la reviziile ambelor proiecte. |
| PR05 | Lista accesibila a zilelor, salt luna/an, footer derulabil cand nu incape, stari accesibile | QA: matrice 320/360/412 dp, font 1/1.4/2, landscape, tastatura, TalkBack, telefon fizic modest si mediu; trei utilizatori reprezentativi. |
| PR06 | Pregatirea profilurilor sintetice si a masuratorilor reproductibile | Backend/DevOps: trei rulari comparabile A/B, profil C separat, 30 minute + varf 5 minute, hardware si retea documentate. Nicio latenta nu este declarata masurata doar din existenta harness-ului. |
| PR07 | Polling oprit pentru calendarul ascuns; revalidare la revenire | Optimizari SQL/cache numai dupa PR06, cu planuri de executie si raport inainte/dupa. Nu se elimina lockuri pentru a imbunatati artificial cifrele. |
| PR08 | Politica mobila cu activare progresiva si jurnal criptat al crearii incerte | QA/release: upgrade semnat, restart dupa commit cu raspuns pierdut, client vechi/API nou, offline, 41+ notificari si reboot. Push-ul pentru anulari cu aplicatia inchisa necesita un pachet separat daca produsul va promite acest comportament. |
| PR09 | Regresii generative financiare, teste de contract si redactare | Gate complet pe reviziile livrate, inclusiv MySQL dedicat si matricea de autorizare; inventarul legacy nu autorizeaza stergeri fara consumatori verificati. |
| PR10 | Checklistul de mai jos | Owner/QA: cheie release autorizata, instalare noua/upgrade, restaurare repetata, pilot de 7 zile si evaluare pe fiecare domeniu. |

## Ordinea activarii

1. Configurati staging cu DB si fisiere separate, email de test si secrete proprii. Uneltele de fixture/performance trebuie sa refuze o baza care nu se termina in `_test` si un mediu diferit de `testing`.
2. Rezolvati drepturile pentru protectiile GitHub. Pastrati `quality`, `secrets`, `android` si `dependencies` din frontend; API cere cel putin `quality` si `secrets`. Impuneti PR, commit actual verificat, fara force-push/stergere si fara bypass administrativ. Adaugati gate-ul E2E numai dupa provisioningul accesului privat si rularea lui demonstrata.
3. Centralizati logurile redactate si monitorizati `GET /api/health` plus `php artisan business:health --json` printr-un agent cu acces autorizat la server. Detaliile operationale nu au endpoint HTTP public.
4. Activati `MONITORING_ENABLED=true` pentru buildul mobil autorizat; colectorul aplicatiei este `POST /api/telemetry/errors`, autentificat si limitat. Configurati transportul extern al canalului Laravel si accesul la colector in infrastructura aleasa.
5. Activati `MOBILE_POLICY_ENABLED=true` in buildul compatibil. Serverul incepe cu `BUSINESS_MOBILE_POLICY_MODE=observe`, apoi `recommend`. `enforce` este permis numai cand buildul compatibil este disponibil la URL-ul HTTPS verificat si upgrade-ul a trecut. `APP_BUILD`, versionCode Android si buildul publicat trebuie sa corespunda.
6. Verificati ca `CLIENT_UPDATE_REQUIRED` nu produce logout, nu sterge jurnalele si nu schimba cheia unei operatii incerte. Logoutul explicit sterge datele private locale si cere reconciliere prealabila a operatiilor.
7. Rulati masuratorile, matricea nativa si toate gate-urile pe commiturile exacte ale ambelor proiecte. Rezolvati orice P0/P1 si orice P2 care afecteaza operatiile critice.
8. Semnati/livrati in mediul autorizat, executati pilotul si completati fisele de dovezi. Nu stocati cheile release sau credentialele fixture-urilor in Git/artefacte publice.

## Probe de operare si recuperare

- Propuneri de proiectare: RPO cel mult 15 minute si RTO cel mult 60 minute; trebuie aprobate si demonstrate, nu sunt SLA oferit. Dumpul zilnic existent nu atinge singur RPO-ul.
- Backupul extern trebuie sa contina SQL, fisierele private referite, manifestul/checksumurile si operatiile idempotente. Criptati copia externa si pastrati cheia separat, recuperabil. APP_KEY si datele criptate se restaureaza impreuna; nu rotiti cheia fara o procedura de recriptare verificata.
- Opriti scrierile HTTP si schedulerul inaintea snapshotului coerent sau folositi un mecanism de snapshot/PITR demonstrat. Un SQL si o copie de fisiere luate independent nu constituie o restaurare coerenta.
- Restaurati intr-o baza separata cu cont SQL limitat acelei baze; dezactivati livrarile reale de email/notificari. Verificati relatiile, soldurile, fisierele si retry-ul aceleiasi chei, inclusiv intre doua companii.
- Repetati upgrade-ul unei scheme vechi populate; `migrate:fresh` nu este aceasta proba. Verificati numere, versiuni, chei, referinte si fisiere inainte/dupa.
- La rollbackul uploadurilor pendinte opriti scrierile, reconciliati operatiile si curatati rezervarile fara sala inainte de `down`. Nu ocoliti refuzul `HALL_IMAGE_UPLOADS_REQUIRE_CLEANUP`.

## Probe de securitate a mediului

- HTTPS verificat, `APP_DEBUG=false`, document root `business-api/public`, cookie-uri Secure/HttpOnly, proxy-uri de incredere configurate explicit.
- Originea nu permite ocolirea gateway-ului MFA al operatorului. Testati accesul direct la IP/origine, nu doar domeniul public.
- SQL este privat/firewall; contul aplicatiei are numai drepturile necesare de citire/scriere in propria baza, fara administrare, GRANT sau privilegii globale. Migrarile folosesc identitate separata; TLS SQL verifica certificatul intre servere.
- Linkurile semnate se refuza dupa revocarea sesiunii, suspendare, schimbarea rolului sau dezactivarea modulului. Fisierele private nu sunt servite direct de webserver.
- Inventarul de secrete identifica proprietarul, stocarea, expirarea si rotatia; nu include valorile lor. Secretele expuse se revoca, inclusiv daca au fost sterse ulterior din Git.

## Incidente de provocat in staging

| Proba | Prag initial configurabil | Inchidere demonstrata |
| --- | --- | --- |
| Scheduler oprit | Ultimul succes mai vechi de 180 secunde | Reluare si succes nou pentru toate cele patru comenzi |
| SMTP indisponibil | Mesaj pending/failed mai vechi de 300 secunde | Livrare reluata fara dublarea mesajelor confirmate |
| Storage/cleanup refuzat | Upload expirat ramas peste 900 secunde | Fisier curatat si cota eliberata numai dupa confirmare |
| 500 controlat | Incident neprevazut corelat prin request_id | Identificare in colector, remediere si proba repetata |

Destinatarul trebuie sa primeasca alerta in cel mult 5 minute dupa depasirea pragului. Nu expuneti in loguri valori-santinela private folosite in proba. Pastrati si dovada inchiderii alertei.

## Fisa de acceptare pentru fiecare domeniu

Completati pentru fiecare dintre cele noua domenii: commit API, commit/build Android, mediu/dispozitiv, comanda sau scenariu, data, rezultat, artefact privat, responsabil si limita ramasa. Lasati criteriile neexecutate nebifate. Un scor se acorda numai dupa verificarea probelor pe revizia livrata.

Surse oficiale: [protectii GitHub](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches), [Maestro CLI](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli), [praguri k6](https://grafana.com/docs/k6/latest/using-k6/thresholds/).
