# Recuperare si deployment

Aceasta procedura pregateste o copie coerenta locala. Un manifest corect nu demonstreaza restaurarea, criptarea externa sau atingerea RPO/RTO. Blocajele si responsabilii sunt in `ROADMAP_LANSARE.md`.

## Copie SQL si fisiere

1. Alegeti fereastra de mentenanta si opriti scrierile HTTP (`php artisan down`), schedulerul, workerii si orice import sau acces SQL care scrie. Asteptati finalizarea cererilor/joburilor incepute. `--quiesced` este declaratia operatorului ca a verificat aceste conditii, nu o detectie automata a proceselor externe.
2. Rulati `php artisan business:backup --with-files --quiesced`. In afara mediului `testing`, comanda refuza daca aplicatia nu este deja in mentenanta. Dumpul se creeaza in aceasta fereastra; nu se combina un dump vechi cu fisiere curente.
3. Pachetul `storage/app/private/backups/package-<uuid>` contine `database.sql`, `files/` si `manifest.json`: momentul, checksum SQL, numere pentru toate tabelele, fisiere active/arhivate si rezervari de upload inca fara continut. Tabelele operatiilor idempotente nu sunt excluse. Lipsa manifestului final indica un pachet incomplet. O rezervare viitoare de upload fara fisier este marcata separat; lipsa unui fisier activ sau arhivat esueaza.
4. Rulati `php artisan business:verify-recovery <director-pachet>`. Pastrati stdout-ul generic, revizia, momentul, durata si rezultatul, fara continut privat. Comanda verifica toate copiile si checksumurile, fara import SQL.
5. Criptati pachetul cu mecanismul aprobat al infrastructurii, copiati-l extern, verificati checksumul copiei criptate si proba de decriptare. Cheia de decriptare si `APP_KEY` se pastreaza separat, recuperabil, in seiful autorizat. Nu incarcati pachetul local necriptat, `.env` sau cheile in Git/CI public. Comanda locala nu pretinde ca face aceasta copie externa.
6. Reluati workerii/schedulerul si `php artisan up` numai dupa finalizarea copiei sau decizia explicita a operatorului de a abandona fereastra. Pachetele incomplete raman private pentru diagnostic; nu se sterg automat. Retentia pachetelor externe/local-complete se configureaza separat de retentia dumpurilor `.sql` existente.

## Restaurare separata

Restaurati intai intr-un mediu izolat, cu email/notificari reale dezactivate. Contul SQL primeste drepturi doar pe baza dedicata cu sufixul `_test`; aplicatia de productie nu se indreapta spre ea. Importati SQL printr-un client care citeste credentialele din fisier privat/stdin, fara parola in argumente. Copiati `files/` in radacina privata a diskului `local`, pastrand caile relative. Restaurati cheia aplicatiei din seif, fara rotire improvizata.

Dupa import, `php artisan business:verify-recovery <director-pachet> --compare-database` compara numerele tabelelor si refuza alte medii decat `testing`/MySQL/`_test`. Pachetul se plaseaza in directorul privat `backups` al mediului de restaurare. Egalitatea numerelor nu dovedeste singura corectitudinea randurilor: verificati solduri, relatii, fisiere prin linkuri autorizate, izolarea a doua companii si retry-ul aceleiasi chei de rezervare/plata. Reconciliati uploadurile marcate fara continut. Pastrati raportul si timpul observat.

## Migrare, lansare si revenire

- Repetati migrarile pe o schema veche populata reprezentativ, cu fisiere si operatii istorice. Inventariati versiuni, chei idempotente, relatii, numere si checksumuri inainte/dupa. `migrate:fresh` nu inlocuieste aceasta proba.
- Salvati reviziile API si Android, backupul verificat si punctul de revenire. Aplicati schema si API-ul compatibil inaintea activarii politicii pentru clienti. Verificati `/api/health`, `business:health --json`, fluxurile critice si joburile.
- Treceti politica `observe` -> `recommend` -> `enforce` numai dupa ce APK-ul semnat compatibil este disponibil si upgrade-ul a fost demonstrat. Nu blocati un client cu operatii incerte fara ruta verificata de actualizare.
- La revenire opriti din nou scrierile. Preferati versiunea API anterioara compatibila cu schema; rollbackul bazei necesita proba sa separata. Inaintea `down` pentru uploadurile pendinte reconciliati/curatati rezervarile fara sala; nu ocoliti `HALL_IMAGE_UPLOADS_REQUIRE_CLEANUP`.
- Copy-ul extern criptat, PITR, verificarea MFA inclusiv direct la origine, HTTPS/SQL/TLS, restaurarea masurata si pilotul raman conditii explicite pentru lansare. Nu sunt demonstrate de comenzile locale.
