# Fluxuri Android cu API real

Maestro CLI este fixat la **2.12.0**. Runnerul verifica versiunea, refuza un dispozitiv care nu este emulatorul dedicat `Planner_E2E_*`, ruleaza E01/E02/E03 consecutiv de cinci ori si se opreste la primul esec. Nu exista retry care transforma primul rezultat in PASS. `QUALITY_PASSES=1` este diagnostic, nu proba celor cinci rulari. E04 este separat in `extended/`.

## Pregatire

1. Creati o baza MySQL dedicata cu sufix `_test`, email `array`, `APP_ENV=testing`, secrete proprii si un `BUSINESS_QUALITY_RUN_ID` UUID. Copiati aceste valori in `.env.e2e` privat al API-ului. Nu folositi DB de business, productie, credentiale sau date reale. Uneltele `tools/quality-artisan.php` si routerul citesc exclusiv acest fisier si valideaza mediul.
2. `php tools/quality-artisan.php migrate` si `php tools/quality-artisan.php business:quality-fixtures --profile=smoke --run-id=<uuid-referinta>` pregatesc o singura referinta privata. Nu folositi `migrate:fresh` intr-o baza existenta. Manifestele din `storage/app/private/quality/` contin credentiale sintetice si nu se publica.
3. Porniti `php -S 127.0.0.1:8011 -t public tools/quality-router.php` in API. Routerul nu serveste administrarea web. `/api/quality-context` confirma separat identitatea mediului; ruta nu este inregistrata in afara `testing` si refuza MySQL fara `_test`.
4. In frontend creati `.env.e2e` privat cu `API_URL=http://127.0.0.1:8012/api`, `APP_BUILD=1`, `MONITORING_ENABLED=true`, `MOBILE_POLICY_ENABLED=true`. Setati `ENVFILE=.env.e2e` pentru Gradle/Babel si construiti `:app:assembleDebug -PqualityE2E=true`. Acest build include bundle-ul JavaScript de debug (HTTP loopback ramane permis numai in debug) si dezactiveaza DevSupport; nu depinde de Metro sau Fast Refresh. Instalati numai in emulatorul dedicat. ID-ul aplicatiei este `.e2e`, separat de aplicatia de business. Conectati prin `adb -s <dispozitiv> reverse tcp:8012 tcp:8012`. Buildul obisnuit de dezvoltare pastreaza Metro.
5. Porniti `node tools/e2e/quality-control.cjs` cu `QUALITY_API_URL` (127.0.0.1:8011/api), `QUALITY_API_PROJECT`, `QUALITY_MANIFEST` (referinta privata), `QUALITY_DEVICE` si `QUALITY_PORT=8012`. Controlerul este legat numai de loopback, refuza alt context si creeaza conturi/date noi pentru fiecare scenariu. Nu expune aceste porturi in retea sau productie. Pierderea raspunsului este simulata numai dupa commitul real al platii.
6. Setati `QUALITY_MAESTRO_HOME` la directorul distributiei oficiale, `QUALITY_JAVA` la executabilul Java, `QUALITY_DEVICE` la emulatorul dedicat. Rulati din frontend `node tools/e2e/run-smoke.cjs`. In Windows eliminati `DEBUG` din mediul CLI si folositi un JDK compatibil cu Android command-line tools; runnerul elimina `DEBUG` pentru procesele Maestro.

Credentialele se introduc prin helperul nativ de test si un fisier privat transmis prin stdin. Nu sunt argumente, variabile Maestro sau comenzi `inputText` logate. Helperul exista numai in source set-ul `qualityE2E` debug, verifica pachetul `.e2e`/debug si nu intra in buildurile normale/release. Clipboardul sensibil este curatat dupa fiecare camp, iar fisierul privat la final. Nu rulati acest APK pe date reale. Artefactele sunt in `e2e/results/`, ignorate de Git; se pastreaza privat, cu retentie limitata.

## Scenarii si limite

- E01: login -> creare -> plata de 1.000 lei; invarianta exact o rezervare/plata si sold 34.000 lei este verificata prin API, impreuna cu afisarea detaliului.
- E02: al doilea administrator ocupa sala inaintea submitului; 409 pastreaza ciorna, sala este corectata si ramane o singura rezervare pe fiecare sala/data.
- E03: anulare, revalidare luna/an/zi si sala libera; backendul confirma lipsa ocuparii.
- E04: plata comisa cu raspuns pierdut, restart fara stergere de date, retry din jurnal si o singura plata.

E05-E10, matricea completa de ecrane/font/TalkBack, reboot, upgrade semnat si telefonul fizic raman in `docs/ROADMAP_LANSARE.md`. Un YAML sau un APK compilat nu este o proba executata. Inaintea activarii jobului obligatoriu `android-e2e`, provisionati runnerul Android si accesul CI la repository-ul API privat si reviziile exacte ale ambelor proiecte, apoi demonstrati cinci smoke-uri complete fara retry. Nu introduceti un secret de productie si nu folositi `continue-on-error` pentru gate.
