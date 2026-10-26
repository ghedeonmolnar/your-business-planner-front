# Selecția testelor după impact

Rundele locale păstrează ritmul 5/10 cereri din AGENTS.md. Testele afectate înlocuiesc rularea repetată a tuturor testelor în aceste runde. Tipurile și lint-ul rămân verificări integrale. Testele uneltelor de selecție sunt independente de suitele aplicației.

## Comenzi

Din `business-front`:

```powershell
npm run test:affected -- --list
npm run test:affected
npm run test:affected -- --base=origin/main
npm test -- --runInBand
node --test tools/testing/changes.test.cjs tools/testing/frontend-impact.test.cjs
```

Din `business-api`, cu Node.js instalat pentru selector și PHP pentru execuție:

```powershell
composer test:affected -- --list
composer test:affected
composer test:affected -- --base=origin/main --configuration=phpunit.mysql.xml
php artisan test
php vendor/bin/phpunit --configuration=phpunit.mysql.xml
node --test tools/testing/changes.test.cjs tools/testing/backend-impact.test.cjs
```

`--list` afișează selecția fără să execute teste. În frontend, Jest își construiește graful și listează fișierele; în backend se citesc directoarele din configurația PHPUnit. Nu se pornesc aplicația sau baza de date pentru listare. `--base <ref>` și `--base=<ref>` sunt echivalente. Nu sunt acceptate argumente care ar putea relaxa rezultatul runnerului.

## Calculul impactului

Baza implicită este `origin/main`. Se calculează `git merge-base <base> HEAD`, apoi se reunesc diferențele comise pe ramură, staged, unstaged și fișierele untracked neignorate. Nu se face fetch automat local: referința trebuie actualizată înaintea verificării dacă este veche. În CI se folosește SHA-ul bazei PR-ului, cu istoric Git complet și codul rezultat din merge-ul de test al PR-ului.

Raportul arată baza cerută, baza comună, toate fișierele schimbate cu statusul Git, motivul selecției și fișierele de teste. CI îl publică și în rezumatul jobului. Execuția afișează durata și propagă codul de ieșire al runnerului. O descoperire defectă sau un runner terminat anormal nu poate produce succes.

### Frontend

Jest identifică pentru fiecare sursă modificată testele dependente direct sau indirect prin `--findRelatedTests`. Se execută reuniunea deduplicată cu `--runTestsByPath`. Testele noi/modificate sunt incluse prin același mecanism.

Clientul API, stocarea, autentificarea, sesiunea/navigarea aplicației și infrastructura de testare cer rulare completă. Componentele și utilitarele comune din restul proiectului folosesc graful de dependențe; selecția poate traversa mai multe feature-uri. O componentă de sală poate selecta și testele navigatorului. Loginul poate fi omis pentru o schimbare izolată, dar nu pentru schimbări în infrastructura autentificării.

Graful static nu descrie toate efectele de business sau importurile dinamice. Din acest motiv păstrăm verificarea completă înainte de merge, fără promisiunea că selecția dovedește absența regresiilor.

### Backend

`tools/testing/backend-impact.cjs` conține liste explicite de surse verificate și teste dependente. Modificările mapate în rezervări, săli, calendar, disponibilitate și plăți selectează și fluxurile dependente: clienți, personal, documente, remindere și rapoarte. Rapoartele au o selecție mai restrânsă. Matricea de securitate și contractul erorilor se adaugă fiecărei selecții backend.

Un test nou/modificat declarat de configurația PHPUnit se include direct. Selecția folosește clasele complet calificate, cu filtru ancorat, pentru a nu potrivi accidental nume asemănătoare. Testele în afara configurației alese nu sunt adăugate artificial.

Sursele noi dintr-un domeniu mapat nu moștenesc automat maparea: până la verificarea dependențelor lor declanșează rularea completă. Configurația și toate testele unui domeniu trebuie revizuite când se adaugă o dependență între domenii. Nu deducem dependențele Laravel din importurile PHP, deoarece containerul, rutele, modelele și baza de date introduc legături suplimentare.

Concurența rămâne pe MySQL, într-o bază dedicată cu sufix `_test`. SQLite nu validează lockurile. Nu introducem ParaTest sau paralelizarea proceselor PHP.

### Când rulăm complet

- Configurare, dependențe, proiecte native, infrastructură de testare, autentificare/sesiune comună și surse globale sau fără clasificare verificată.
- Backend: modele, migrări, rute, middleware, autorizare și surse fără mapare explicită.
- Ștergeri, redenumiri, status Git necunoscut sau bază Git indisponibilă.
- O sursă fără teste identificate, chiar dacă alte fișiere modificate au teste.

Numai modificările exclusiv de documentație recunoscută pot omite testele: Markdown în rădăcină sau `docs/` și fișierul de licență. Absența modificărilor este raportată separat. Un fișier Markdown din sursele aplicației nu este clasificat automat drept documentație.

## GitHub și merge

| Situație | Job de calitate | Teste |
| --- | --- | --- |
| PR draft | `quality-affected` | Afectate, cu extindere la toate când politica o cere |
| PR pregătit pentru merge | `quality` | Toate |
| Commit nou pe PR pregătit | `quality` | Toate, pentru noul cod |
| Push pe `main` sau workflow manual | `quality` | Toate |

Workflow-urile ascultă explicit `ready_for_review` și `converted_to_draft`, pe lângă deschidere, redeschidere și commituri noi. Numele jobului selectiv diferă de cel complet; un rezultat draft nu satisface verificarea `quality` cerută pentru merge. Nu folosim un job complet omis cu succes aparent și nici filtre `paths` care ar suprima întregul workflow obligatoriu.

Se păstrează verificările existente de tipuri, lint/Pint, build Android/Vite, scripturi de panou, dependențe și secrete. Rulările depășite de un commit nou pe același PR se anulează. `main` și rulările manuale nu sunt anulate de un PR.

Protecția ramurii trebuie să ceară `quality` și celelalte gate-uri existente. Până la rezolvarea limitării planului GitHub pentru repository-urile private, verificarea rezultatului complet al codului curent este obligatorie înainte de merge și livrare, dar nu este declarată blocare automată. Schimbările bazei PR-ului cer revalidare; protecția trebuie configurată să necesite ramură actualizată când este disponibilă.

## Mentenanță și validare

Update-urile dependențelor se pregătesc separat, la cerere. În acea rundă se caută update-uri npm/Composer și se aplică regulile existente pentru patch/minor, versiuni majore și pachete cuplate; apoi se rulează toate verificările și build-urile relevante.

Testele selectorilor verifică modificări comise/staged/unstaged/untracked, nume cu caractere speciale, redenumiri/ștergeri, lipsa bazei, documentație, componente izolate, dependențe comune, teste noi, cod fără teste și propagarea eșecurilor. La prima rundă autorizată se compară selecția cu suita completă și se măsoară duratele pe același cod și aceeași mașină. Auditarea calității tuturor testelor rămâne separată de această optimizare.

La implementare au trecut 12 teste ale uneltelor frontend și 13 ale uneltelor backend. Listarea reală Jest pentru `HallBasicsFields.tsx` a selectat șase fișiere, iar listarea PHPUnit cu filtrul unei clase a returnat exclusiv testele acelei clase. Configurațiile YAML și expresiile de rutare au fost verificate local pentru draft, pregătit pentru merge, push și rulare manuală. Suitele aplicației, măsurarea timpului economisit și execuția efectivă a workflow-urilor pe GitHub rămân de validat în runda autorizată; nu sunt declarate executate prin aceste verificări ale selectorilor.

Mecanismul folosește opțiunile oficiale [Jest](https://jestjs.io/docs/cli), [PHPUnit](https://docs.phpunit.de/en/13.4/textui.html) și evenimentele [GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#pull_request).
