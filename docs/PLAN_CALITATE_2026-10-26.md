Your Business Planner — plan pentru minimum 9 în fiecare domeniu
26 octombrie 2026
Obiectiv și bază
Obiectivul este minimum 9/10 în fiecare domeniu, cu țintă 9,2 sau mai mare, prin schimbări și validări verificabile. Nota generală urmărită este aproximativ 9,3/10, dacă toate criteriile de mai jos sunt demonstrate.

Baza este auditul actual, nota 8,6/10, pe frontend 258b22d și API 9ea543b. HEAD-urile au fost verificate la pregătirea planului și sunt neschimbate. Cele șase defecte V01–V06 sunt remediate; suita de referință are 594 teste frontend și 208 teste MySQL trecute.

Protecția ramurilor a fost recitită: frontend main este protejat, cu quality/secrets/android/dependencies; API main este încă neprotejat. Nu s-a executat implementarea acestui plan și nu s-au modificat repository-urile.

Scorurile țintă sunt condiționate de dovezi, nu rezultate deja obținute. Un domeniu primește peste 9 după ce criteriile lui sunt trecute pe revizia livrată. O medie bună nu compensează un domeniu rămas sub 9.
Prioritatea investiției
Mai întâi se închid cele mai mici note: operare 7,0; UX/accesibilitate 7,5; performanță 7,5. Testele native și observabilitatea sunt și instrumentele care permit măsurarea și corectarea acestor domenii.
Domeniu	Acum	Țintă	Pachete	Dovada necesară
Operare, recuperare și lansare	7,0	9,2	PR01–PR03, PR10	Merge protejat, alerte verificate, restaurare și upgrade demonstrate
UX, responsive și accesibilitate	7,5	9,2	PR04–PR05	Matrice Android trecută; operațiile critice pot fi făcute cu TalkBack și font mare
Performanță și scalare	7,5	9,2	PR06–PR07	Praguri de latență și stabilitate trecute pe încărcare reprezentativă
Securitate API și infrastructură	8,5	9,2	PR02–PR03, PR09	MFA operator, origine protejată, izolare și redactare verificate
Arhitectură, mentenanță și documentație	8,5	9,2	PR01, PR08–PR09	Contract actual coerent, responsabilități clare, fără cod legacy eliminat fără verificare
Calendar, rezervări și agendă	9,0	9,3	PR04–PR05, PR08	Fluxuri native, expirări și recuperări trecute fără regresii
Consistența datelor și concurență	9,0	9,4	PR06–PR09	Invariante păstrate sub concurență, restart și retry; zero pierderi sau dublări
Calcule financiare și validare	9,0	9,3	PR08–PR09	Teste generative și de integrare; exactitate până la ban
Testare automată și CI	9,0	9,4	PR01, PR04, PR09–PR10	CI impus, E2E stabil și dovezi pe versiunea exactă livrată


Ordinea de implementare
1. Fundație de livrare: PR01, apoi staging/backup/securitate și monitorizare — PR02–PR03.
2. Telefonul real și utilizarea: PR04–PR05. În paralel cu ele se pot pregăti măsurătorile PR06.
3. Scalare măsurată: PR06, apoi numai optimizările necesare în PR07.
4. Ciclul de viață și contractul: PR08–PR09; compatibilitatea trebuie livrată înaintea următoarei schimbări incompatibile de API.
5. Dovada finală: PR10, cu pilot și reevaluare separată a fiecărui domeniu.
Pachet	Conținut	Responsabilitate	Dependențe	Efort orientativ, zile de lucru
PR01	Controlul livrării + contract actual	Owner + backend	Primul	0,5–1
PR02	Staging, migrare, backup/restaurare și securitate de mediu	Backend/DevOps	PR01	3–5
PR03	Monitorizare, request_id și sănătatea joburilor	Backend + mobile	PR01; validare pe PR02	2–3
PR04	Maestro și fluxuri Android E2E	Mobile + QA	PR02, baza PR03	3–4
PR05	Remedieri UX și accesibilitate pe dispozitiv	Mobile + QA	Primii pași PR04	2–4
PR06	Date realiste, k6 și măsurători	Backend	PR02–PR03	2–3
PR07	Optimizări justificate de măsurători	Backend + mobile	PR06	1–3, după rezultat
PR08	Compatibilitate mobil/API și recuperare durabilă	Backend + mobile	PR02; testat prin PR04	2–4
PR09	Invariante, contract și mentenanță	Backend + mobile	PR01; integrează PR03–PR08	1–2
PR10	Release, pilot și reevaluare	Owner + QA	Toate criteriile anterioare	1–2 + 7 zile pilot


Estimările sunt de planificare, pentru lucru concentrat cu acces la infrastructură și dispozitive, nu termene garantate. Totalul orientativ este 18–31 zile de efort, plus fereastra pilotului; măsurătorile inițiale și defectele native pot schimba estimarea. Pachetele sunt unități de livrare, nu cerința de a înghesui ambele repository-uri într-un singur PR.
PR01 — impunerea livrării și curățarea contractului
Ce schimbăm
1. Ownerul rezolvă limitarea planului GitHub pentru protecția repository-ului API privat, identificată în audit prin răspunsul 403.
2. Protejează main în API: PR obligatoriu, quality și secrets obligatorii, fără force-push sau ștergerea ramurii, cu impunerea regulilor și pentru administratori. Păstrează protecțiile frontend.
3. Folosește nume unice pentru joburile obligatorii. Păstrează suita completă pe PR pregătit de merge și pe main; selecția pentru draft rămâne un ajutor de dezvoltare.
4. Creează un PR de verificare cu un test intenționat eșuat și demonstrează că merge-ul este blocat. Corectează testul înainte de integrare.
5. Rescrie secțiunile contradictorii din PROJECT_SCHEMA: intervale [start,end), viitor ends_at > now, trecut ends_at <= now; păstrează referințele istorice într-un changelog.
6. Adaugă o verificare simplă de sincronizare a copiilor de documentație care trebuie să rămână identice.
Unde
Workflow frontend · Workflow API · Contract actual · Reguli temporale
Acceptare
- Merge-ul este blocat când orice verificare obligatorie eșuează.
- Un commit nou după rezultatul verde declanșează din nou verificările necesare.
- Documentația și testele descriu aceleași limite temporale.
- Dovezi: captură/config exportat al protecției și linkul PR-ului de verificare, fără secrete.
PR02 — staging, restaurare și securitatea mediului
Ce schimbăm
1. Pregătește staging separat de producție: DB, fișiere, chei, email și conturi distincte. Datele de test sunt sintetice sau anonimizate înainte de utilizare.
2. Repetă migrațiile noi pe o copie reprezentativă a schemei vechi, inclusiv volume și valori istorice. Verifică versiunile, cheile de deduplicare, relațiile și fișierele înainte/după. Testele migrate:fresh nu înlocuiesc acest exercițiu.
3. Folosește acces SQL separat pentru aplicație și migrări; aplicația nu primește privilegii administrative sau acces SQL public.
4. Verifică HTTPS, APP_DEBUG=false, document root exclusiv public, fișiere private inaccesibile direct și configurarea proxy-ului.
5. Impune MFA operatorilor printr-un gateway de acces sau o implementare echivalentă. Pentru ruta de administrare, verifică și accesul direct la origine, nu numai accesul prin numele public.
6. Extinde backupul local cu o copie externă și criptată, care include SQL, fișierele private necesare și metadatele de restaurare. Păstrează materialul de decriptare într-un loc separat și recuperabil.
7. Definește o restaurare coerentă SQL–fișiere: manifest, moment de referință și verificarea existenței/checksumului fișierelor referite. Păstrează și tabelele operațiilor idempotente.
8. Propunere de ținte inițiale: RPO ≤15 minute — pierdere maximă de date după incident; RTO ≤60 minute — timp până la serviciu recuperat. Pentru a atinge RPO-ul, adaugă captură incrementală/PITR și protecție/versionare a fișierelor; un dump zilnic singur nu este suficient.
9. Execută un exercițiu de restaurare într-un mediu separat, cu trimiterea de emailuri și notificări reale dezactivată. Verifică financiarul, rezervările, fișierele, izolarea companiilor și retry-ul operațiilor.
10. Scrie procedura de deploy și revenire. La schema nouă cu uploaduri pendinte, respectă condițiile de cleanup înainte de down.
Unde
Backup actual · Scheduler · Middleware · Antete · Administrare
Acceptare
- Există raport de migrare a unei scheme vechi, nu doar test pe o bază goală.
- Backupul extern este restaurat și verificat, în țintele aprobate. Țintele de mai sus sunt propuneri de proiectare, nu un SLA deja oferit.
- Un operator fără MFA și accesul nepermis direct la administrare sunt refuzate.
- Un link direct către un fișier privat nu funcționează; linkul semnat este reverificat după revocare.
- Procedura indică responsabilul, comenzile, verificările, timpul observat și punctul de revenire.
- Inventarul de secrete și procedura de rotație sunt documentate; APP_KEY și conținutul criptat sunt tratate împreună, fără rotație care face datele existente ilizibile.
PR03 — monitorizare și alerte care pot fi demonstrate
Ce schimbăm
1. Extinde intrarea reportError existentă pentru trimiterea erorilor neprevăzute către un colector central, configurat prin mediu.
2. Adaugă request_id generat/validat în middleware API, întors în antet și păstrat în contextul ApiError din aplicație. Un identificator primit de la client trebuie limitat și validat.
3. Înregistrează versiunea aplicației/API, tipul operației, statusul și contextul tehnic necesar, cu acces restricționat la identificatori.
4. Redactează Authorization, parole, tokenuri, URL-uri semnate complete, telefon, note, corpuri brute de request/response și interogări cu date private.
5. Separă erorile neprevăzute de 409/422 așteptate. Rețeaua/timeouturile pot alimenta contoare agregate; nu transforma orice lipsă de internet într-o alertă critică.
6. Adaugă heartbeat și rezultate de execuție pentru expire-bookings, deliver-mail, purge-documents și purge-hall-images. Măsoară vechimea mesajelor/uploadurilor pendinte, durata execuției și eșecurile.
7. Creează o verificare de sănătate pentru uz operațional. Expune public doar starea minimă necesară; detaliile DB, disc, cotă și joburi rămân protejate.
8. Praguri inițiale propuse: heartbeat lipsă >3 minute; email pending >5 minute; cleanup eșuat persistent >15 minute. Calibrează-le după duratele și retry-urile reale.
9. Provoacă un 500 de test, oprește schedulerul în staging și simulează storage indisponibil. Verifică alerta, identificarea incidentului și închiderea lui după remediere.
10. Adaugă la fiecare alertă o procedură scurtă: ce înseamnă, ce se verifică și cum se confirmă recuperarea.
Unde
Raportare actuală · Client HTTP · Înregistrare middleware · Email · Cleanup galerie

Fișiere propuse: middleware RequestCorrelation, serviciu de stare a joburilor și teste pentru redactare. Numele finale se aliniază convențiilor proiectului.
Acceptare
- O eroare de test poate fi urmărită din aplicație până în logul API prin request_id.
- Un 409 normal nu alertează ca incident de server.
- Testele cu valori-santinelă demonstrează că datele sensibile nu ajung în colector.
- Alertele ajung la responsabil în cel mult 5 minute după depășirea pragului configurat.
- Dashboardul arată ultima execuție reușită, backlogul și eșecurile fiecărui job.
PR04 — teste Android complete cu Maestro
Ce schimbăm
1. Adaugă Maestro CLI, cu versiune fixată, în uneltele de test și CI. Recomandarea se bazează pe suportul oficial pentru React Native și pe folosirea arborelui nativ de accesibilitate.
2. Adaugă testID stabile pe componentele interactive critice, păstrând etichetele accesibile utile utilizatorilor. Folosește identificatori stabili de înregistrare pentru rânduri.
3. Pregătește un seeder/comandă pentru E2E care poate rula numai în mediul de test și într-o bază dedicată cu sufixul _test. Generează date relative la momentul testului și un run_id unic.
4. Rulează împotriva API-ului de test real. Folosește un proxy/transport de test controlat pentru întârziere și pierderea răspunsului după commit; mecanismul nu este disponibil în producție.
5. Păstrează testele Jest și MySQL existente; E2E le completează.
6. Adaugă job obligatoriu android-e2e pentru cele trei scenarii smoke pe PR pregătit de merge și main. Rulează pachetul extins periodic și înaintea release-ului.
7. Atașează rapoarte, capturi/video de test și loguri redactate. Nu ascunde testele instabile prin retry automat care schimbă verdictul inițial.
8. Demonstrează cinci rulări consecutive ale smoke-ului fără eșec neexplicat sau retry de mascare.
Pachetul minim
ID	Scenariu	Rezultat cerut
E01 — smoke	Login → rezervare → plată	Date și sold corecte în listă, detaliu și calendar
E02 — smoke	Doi administratori ocupă aceeași sală	Un singur succes; celălalt poate corecta formularul fără pierderea ciornei
E03 — smoke	Anulare → calendar lunar/anual/zi	Rezervarea nu mai ocupă sala; refresh-ul actualizează secțiunile relevante
E04	Commit plată, răspuns pierdut, restart, retry	O singură plată, aceeași operație logică
E05	Provizorie la expirare, fără cron	Serverul și UI aplică regula corect; pe conexiune normală, UI se actualizează în fereastra documentată
E06	Ianuarie/decembrie, an bisect și zile vecine	Navigare, comparații și marcaje corecte
E07	Client/sală arhivate și nume foarte lungi	Referințe istorice păstrate și acțiuni accesibile
E08	Rol angajat și modul dezactivat	Datele/operațiile nepermise sunt refuzate și nu sunt expuse în UI
E09	Schimbare cont cu request întârziat	Nicio dată/callback din sesiunea veche nu afectează sesiunea nouă
E10	Client vechi și politica de versiune	Actualizare ghidată, fără logout fals sau pierderea unei plăți incerte


DST și capetele exacte sunt păstrate și în testele unitare/API cu timp controlat; nu depinde întreaga suită de data calendaristică a telefonului.
Unde
CI frontend · Acțiuni · Inputuri · Regresii existente · Fixtures API

Fișiere propuse: e2e/flows/*.yaml, e2e/README.md și unelte de pregătire a fixture-urilor. Nu se trimit credentiale de producție în teste.
PR05 — UX, fonturi mari, tastatură și TalkBack
Ce schimbăm concret
1. Extinde FormModalFrame pentru spațiu vertical foarte mic: măsoară header/footer și permite ca acțiunile să intre în scroll când nu încape un footer separat. Păstrează plafonul de înălțime calculat din spațiul real.
2. Verifică focusul și scrollul către primul câmp invalid la fiecare pas. Ref-urile existente se păstrează; completează comportamentul unde lipsește, inclusiv selectoare și mesaje de eroare.
3. În calendarul lunar, oferă o alternativă accesibilă în listă pentru font mare/ecran îngust. Șapte coloane cu ținte mari nu încap pe orice telefon; păstrează selecția și disponibilitatea în ambele moduri.
4. Adaugă salt direct la lună/an, păstrând sala și filtrul. Un eveniment peste doi ani nu trebuie să ceară zeci de apăsări.
5. Elimină trunchierea informației esențiale: numele sălii/clientului, acțiunile și erorile trebuie să poată fi citite integral. Folosește wrap/scroll și tokenurile existente.
6. Verifică gruparea elementelor pentru TalkBack: o dată/stare nu este anunțată repetat, iar acțiunile interne nu sunt înghițite de un părinte accesibil.
7. Anunță erorile și rezultatul salvării; după dialog, focusul revine într-un loc util. Stările selected/disabled/busy sunt anunțate corect.
8. Uniformizează stările loading/empty/error/date vechi/offline. „Date indisponibile” rămâne distinct de „Liber”; retry-ul nu șterge ciorna.
9. Verifică toate perechile de text mic la pragul proiectului 4,5:1 și ocuparea exprimată și fără culoare.
10. Testează butoane și zone de atingere; pentru grile dense folosește alternativa accesibilă, nu suprapunerea invizibilă a țintelor.
Matrice obligatorie
- Lățimi logice: 320, 360 și 412 dp; portret și landscape.
- FontScale: 1,0, 1,4 și 2,0; tastatură închisă/deschisă.
- TalkBack activ pe calendar, rezervare, plată, conflict și document.
- Dispozitiv Android modest și unul mediu; include cel puțin un telefon fizic.
- Conexiune normală, lentă, offline și revenire; restart în timpul unui flux.
Acceptare
- Toate acțiunile critice sunt accesibile prin scroll și TalkBack.
- Nicio suprapunere care împiedică introducerea sau salvarea datelor.
- Utilizatorul poate termina rezervarea și plata cu fontScale 2,0 și tastatură.
- Data și starea zilei, sala, eroarea și acțiunea următoare sunt inteligibile fără culoare.
- Raport pe fiecare combinație testată: dispozitiv, build, rezultat și defecte rezolvate.
- Trei utilizatori reprezentativi pot găsi o zi liberă și crea o rezervare standard după un instructaj scurt, fără intervenție tehnică; se notează timpul, erorile și blocajele, iar blocajele critice sunt remediate.
Unde
Modal · Input · Selector · Calendar lunar · Navigare perioadă · Layout adaptiv
PR06 — benchmark realist pentru ținta de 100 de companii
Ce schimbăm
1. Extinde fixture-urile de performanță cu companii, săli, clienți, stări, programe, plăți și documente reprezentative. Respectă regulile de disponibilitate și istoricul; nu copia toate rezervările pe aceeași sală și dată.
2. Profile propuse:
   - A: 100 companii × 1.000 rezervări, aproximativ 100.000 total.
   - B: 100 companii × 10.000 rezervări, aproximativ 1 milion total.
   - C: o companie cu 100.000 de rezervări istorice, ca scenariu separat de stres.
3. Rulează k6 pe mediu de test cu resurse documentate: CPU, RAM, disc, versiune MySQL, conexiuni, indecși și procese.
4. Simulează 50 utilizatori concurenți timp de 30 minute, apoi vârf de 100 timp de 5 minute. Acestea sunt profiluri propuse de validare, nu o estimare a numărului real de utilizatori. Configurează timpi de interacțiune și un ritm țintă documentat: inițial 20–30 cereri/s în profilul normal și până la 60 cereri/s la vârf, inclusiv polling. Folosește utilizatori/tokenuri distincte și limitele de trafic ale configurației de livrare; testează separat 429 intenționat.
5. Mixul include calendar lunar/anual/zilnic, liste paginate, detaliu, creare/editare și financiar, plus pollingul existent. Folosește companii diferite și un scenariu separat cu mulți utilizatori în aceeași companie.
6. Separă conflictele intenționate de erorile neprevăzute. Un 409 este acceptat numai în scenariul care îl provoacă explicit.
7. Măsoară p50/p95/p99, throughput, timeouturi, memorie, număr/timp query-uri și timpul de așteptare pe lockul companiei. Etichetează metricile pe operație, astfel încât un p95 global bun să nu ascundă un calendar anual sau o salvare lentă.
8. Păstrează rezultate pentru cache rece/cald și pentru cel puțin trei rulări comparabile.
Bugete de acceptare propuse
Acestea sunt ținte inițiale pentru un mediu reprezentativ; nu sunt rezultate măsurate și nici timpi promiși indiferent de hardware.
Operație	Țintă
Listă paginată / calendar zilnic	p95 ≤500 ms
Calendar lunar	p95 ≤700 ms
Calendar anual / overview	p95 ≤1.200 ms
Salvare rezervare / plată	p95 ≤800 ms
Așteptare pe lock în profil normal	p95 ≤150 ms; investigație pentru blocări >1 s
Erori neprevăzute	<0,1%; niciun 500 neexplicat în rularea acceptată
Invariante	Zero plăți duplicate, suprascrieri vechi sau acces între companii
Stabilitate	Fără creștere susținută a memoriei/conexiunilor în cele 30 minute


Timpii API se măsoară dintr-un client din rețeaua de test și se raportează separat de rețeaua mobilă. Pentru Android, se adaugă timpul până la ecran utilizabil pe un profil de rețea documentat. Ținte inițiale pentru un build de tip release pe telefonul Android mediu ales: ecran cu date utilizabile în cel mult 1,5 s la navigare cu sesiune activă și pornire la rece în cel mult 3 s, pe profil de rețea documentat. Păstrează măsurătorile pentru 20 de deschideri și verifică memoria după cicluri repetate; raportează separat costul serverului, rețelei și randării.
Unde
Harness existent · Revizie/lock · Sumare · Agregarea ocupării

Fișiere propuse: tests/Performance/scenarios sau director dedicat pentru scripturi k6 și rapoarte. Uneltele refuză ținte de producție și folosesc numai baze de test.
PR07 — optimizare pe baza rezultatului
Ordine concretă
1. Identifică query-urile lente și planurile lor. Adaugă indecși compuși numai dacă planul și datele justifică schimbarea; măsoară și costul suplimentar la scriere.
2. Dacă agregarea anuală este problema, redu operațiile SQL repetate sau reconstruirea inutilă a intervalelor; păstrează ocuparea distinctă sală–zi și fusul companiei.
3. Dacă lockul comun ține scrierile prea mult, optimizează mai întâi operațiile din tranzacție. Nu elimina protecția de consistență ca scurtătură.
4. Adaugă cache de sumare doar dacă mai este necesar. Cheia trebuie să țină cont de companie, revizie, filtre și tranziții temporale relevante; o TTL fixă nu poate ignora expirarea provizoriilor.
5. În frontend, oprește pollingul interogărilor calendarului când ecranul este ascuns și revalidează la revenire. Păstrează semnalizarea datelor vechi și starea conectivității.
6. Profilează agenda/listele pe Android și virtualizarea lor. Corectează rerenderările sau layouturile numai acolo unde măsurarea arată cost.
7. Rulează din nou aceleași scenarii și toate regresiile de consistență după fiecare modificare relevantă.
Acceptare
- Bugetele PR06 trec pe profilele A/B; profilul C are limite și rezultate explicit documentate.
- Pollingul nu generează trafic pentru ecranul ascuns; revenirea arată date actualizate.
- Optimizarea păstrează toate regulile de disponibilitate, autorizare, bani și snapshot.
- Raport înainte/după pentru query-uri, latență, lock wait și resurse.
Unde
Calendar API · Overview · Interogări și polling · Prospețime afișată
PR08 — actualizări compatibile și recuperare după restart
Politica mobil/API
1. Adaugă un endpoint de politică mobilă, de exemplu GET /api/mobile-policy, cu informație minimă: min_build, recommended_build, contract_version și store_url configurat prin mediu.
2. Trimite buildul/platforma în requestHeaders. Aceste antete ajută compatibilitatea; autorizarea rămâne pe token, rol, companie și funcții.
3. Adaugă un ecran de actualizare înaintea formularelor incompatibile și tratarea globală a codului CLIENT_UPDATE_REQUIRED. Propunere de contract: 403 cu acest cod distinct; nu trebuie interpretat ca abonament inactiv sau sesiune expirată.
4. Serverul aplică politica înainte de mutațiile incompatibile. Păstrează auth/me/logout și recuperarea accesibile conform contractului.
5. Activează progresiv: politică doar observată → recomandare → blocare, după ce buildul compatibil este disponibil utilizatorilor.
6. Testează client vechi/API nou, client nou/API vechi, politică indisponibilă offline și actualizare în timpul unei operații incerte.
Ciorne și operații incerte
7. Extinde modelul criptat al jurnalului plăților pentru ciorna/operația de creare a rezervării selectată ca critică. Scrie cheia și payloadul înainte de POST.
8. Izolează pe companie și cont, serializează scrierile și verifică generația sesiunii. Validează schema și aplică o retenție documentată.
9. Un payload incert nu este editat sau retrimis cu cheie nouă până la reconciliere. O ciornă obișnuită și o operație care putea fi comisă au stări distincte.
10. Logout/schimbarea contului nu readuce date private în altă sesiune. Un jurnal corupt sau inaccesibil nu inventează automat o operație nouă.
11. Pentru fotografii, definește explicit persistența URI-urilor/fișierelor: nu promite recuperarea unei galerii dacă accesul la fișier s-a pierdut.
Notificări
12. Afișează starea permisiunilor, câte notificări locale sunt programate și limita aplicată.
13. Testează 41+, reboot, aplicație închisă și anulare de pe alt dispozitiv. Menține limitele promisiunii de produs vizibile.
14. Dacă se promite sincronizare a anulărilor cu aplicația închisă, este necesar un pachet separat server–push–reconciliere, cu identitate idempotentă și reverificare la deschiderea notificării. Livrarea la secundă nu este garantată doar de existența unui mecanism push.
Unde
Antete · Tratare globală · Bootstrap · Memorie actuală · Jurnal criptat existent · Notificări
Acceptare
- Utilizatorul află că are nevoie de update înainte să completeze un flux incompatibil.
- Buildul nou recuperează plata/rezervarea incertă după restart fără dublare.
- Nicio schimbare de cont nu expune ciorna precedentă.
- Politica nu produce logout fals și nu anulează protecția de idempotency.
- Contractul notificărilor și comportamentul testat sunt concordante.
PR09 — invariante, teste financiare și mentenanță
Ce schimbăm
1. Adaugă teste generative reproductibile pentru bani/durate: propunere ≥1.000 combinații unitare și 50 secvențe de integrare cu creare/editare/anulare/restituire. Folosește seed fix și afișează seedul cazului eșuat.
2. Verifică după fiecare pas: sold = contract − încasări completed + restituiri completed; retry identic nu schimbă numărul operațiilor; suma rămâne exactă până la ban; versiunea veche nu scrie.
3. Extinde secvențele pentru DST, capăt exact, provizorie expirată și schimbarea unui modul/rol în timpul operației.
4. Aplică matricea de autorizare fiecărui endpoint nou din plan: anonim, token expirat/revocat, cont blocat, companie străină, rol și modul insuficient.
5. Consolidă contractul actual pentru statusuri, limite, erori și date. Folosește fixtures verificabile și teste de contract pentru discrepanțe UI/API, fără a duplica inutil aceeași logică în trei locuri.
6. Inventariază rutele/ecranele/hookurile legacy. Elimină doar componentele fără consumatori confirmați; fiecare eliminare trece prin testele de navigare și build.
7. Păstrează separarea Domain/Request/Resource și componentele comune. Refactorizarea se leagă de o problemă identificabilă, nu de mărirea numărului de abstracții.
8. Actualizează PROJECT_SCHEMA și procedurile în aceeași schimbare cu contractul. Adaugă un checklist de PR cu domeniul schimbat și probele de regresie.
Unde
Bani · Teste unitare · Limite financiare · Concurență · Autorizare · Contract UI
Acceptare
- Seedurile generative sunt reproductibile, cu zero diferențe de bani sau operații.
- Toate rutele noi sunt incluse în matricea de securitate.
- Nu există contradicții cunoscute în contractul curent.
- Refactorizările nu elimină regresii și nu introduc acces direct la API în afara structurii existente.
PR10 — release, pilot și acordarea notelor
1. Rulează gate-ul complet pe commiturile exacte livrate, inclusiv E2E smoke; verificările selective din draft nu sunt dovada finală.
2. Construiește release-ul Android semnat în mediul autorizat și verifică instalarea nouă plus upgrade-ul din versiunea precedentă. Nu stoca chei de semnare în Git sau în artefactele testelor.
3. Execută checklistul de migrare, sănătate, permisiuni, versiune mobilă și scheduler.
4. Repetă testul de restaurare și măsoară timpul observat.
5. Rulează un pilot controlat de 7 zile cu utilizatori reprezentativi și volum suficient pentru fluxurile urmărite. Fereastra pilotului nu demonstrează singură un SLA pe termen lung.
6. Colectează incidentele, blocajele UX, latențele și feedbackul pe sarcini concrete. Închide defectele care afectează operațiile critice.
7. Publică intern o fișă pe fiecare domeniu: commit/build, mediu, probe, rezultat și limitări rămase.
8. Reevaluează cu aceleași ponderi ca auditul. Domeniul fără dovada obligatorie rămâne nevalidat pentru pragul de 9.
Criteriul final „peste 9 în toate domeniile”
- [ ] Niciun P0/P1 și niciun P2 care compromite operațiile critice rămas deschis.
- [ ] Main protejat în ambele proiecte, cu verificările impuse demonstrate.
- [ ] CI complet verde pe revizia livrată; cinci rulări E2E smoke consecutive stabile.
- [ ] Matrice Android, TalkBack, fonturi mari și tastatură trecută.
- [ ] Bugetele de performanță trecute pe date și încărcare reprezentative.
- [ ] Nicio pierdere/dublare financiară, suprascriere veche sau expunere între companii în testele relevante.
- [ ] Erorile și joburile defecte generează alerte verificate; logurile sunt redactate.
- [ ] Backup extern restaurat coerent în țintele aprobate.
- [ ] MFA operator și configurația de securitate a mediului verificate.
- [ ] Upgrade-ul și operațiile incerte supraviețuiesc scenariilor definite.
- [ ] Contractul/documentația descriu aceeași regulă ca serverul și UI.
- [ ] Fiecare dintre cele nouă domenii are propria probă de acceptare și minimum 9; ținta de lucru este minimum 9,2.
Ce amânăm până după această țintă
Importul Excel, dashboarduri comerciale noi și extinderea la alte categorii pot avea valoare, dar nu înlocuiesc validarea de mai sus. Saltul lună/an rămâne în PR05 pentru utilitatea imediată. Funcțiile noi mai ample intră după stabilizarea fundației și măsurarea utilizării.
Surse și statut
Planul este bazat pe auditul curent și pe codul reviziilor menționate. Documentația oficială consultată pentru opțiunile de implementare:
- GitHub — protected branches: condiții de plan, verificări obligatorii și aplicarea regulilor.
- Maestro — React Native: suport React Native și identificarea elementelor.
- React Native — accessibility: etichete, grupare și anunțarea schimbărilor.
- k6 — thresholds: praguri automate de succes/eșec pentru metrici.
Pragurile, eforturile și țintele de punctaj sunt propuneri pentru proiect. Acest document reprezintă un plan pregătit pentru implementare, nu o modificare de cod, activare de servicii sau verificare deja executată.