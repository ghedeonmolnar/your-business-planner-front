# Inventar pentru o curatare ulterioara

Inventar bazat pe rutele/importurile actuale, nu autorizatie de stergere. Nu au fost eliminate tabele, coloane istorice, controllere, ecrane sau fisiere CSS in aceasta interventie. Inaintea eliminarii trebuie verificati consumatorii dinamici, istoricul instalatiilor mobile, fisierele restaurate si testele de contract.

| Zona | Consumatori actuali / observatie | Actiune ulterioara |
| --- | --- | --- |
| API `BookingController`, `BookingPaymentController`, `CalendarController` | Rutele active `/api/events`, plati si calendar folosesc contractul VENUE actual | Se pastreaza; numele URL-ului `events` nu inseamna contractul vechi |
| API `EventController`, requesturi `Events/*`, resurse si harti vechi | Nu este legat de rutele mobile actuale din `routes/api.php` | Confirmati toti consumatorii si clientii instalati inainte de eliminare; nu redirectionati contracte incompatibile implicit |
| `app/Domain/Events/EventService` | Este folosit activ de BookingController si de documente; numele istoric nu face intregul fisier nefolosit | Separati numai metodele demonstrate fara consumatori; pastrati scopingul, tranzactiile si idempotenta |
| Frontend `features/events/screens/EventsScreen`, `EventDetailsScreen`, `EventMapPickerScreen` | Nu sunt ecranele legate acum de RootNavigator/HomeTabs; au teste si componente proprii | Audit de importuri si eventuale deep-linkuri inaintea curatarii |
| `features/events/notifications/EventRemindersSync`, navigarea din notificari si cleanup | Sunt active in navigarea noua; cleanup importa inclusiv prefixurile vechi | Se pastreaza. Prefixurile istorice pot fi necesare pentru anularea alarmelor dupa upgrade |
| `scheduleEventReminders`, planificatoarele vechi start/payment | Modulul vechi isi pastreaza teste; noua sincronizare se face numai din EventRemindersSync | Demonstrati perioada de tranzitie si lipsa alarmelor vechi inainte de stergere |
| `event_staff_assignments` fata de pivoturi/coloane istorice | Noul contract VENUE foloseste alocari cu intervale si tarife capturate | Nu stergeti date vechi fara proba pe migrare populata si restaurare; verificati rapoarte, costuri si referinte |
| Blade `platform/*`, resursele operatorului si CSS/JS Vite | `routes/web.php` le foloseste pentru administrarea platformei | Sunt consumatori activi. Buildul lor ramane in CI, chiar daca mediul local de utilizare este Android |
| Blade `reviews/*` si resurse istorice ramase | Nu sunt demonstrate ca parte a fluxului VENUE curent | Identificati rutele/linkurile emise anterior, apoi decideti explicit arhivare/migrare/stergere |
| Documentatia veche | Contractul curent este in PROJECT_SCHEMA; versiunea anterioara este arhivata separat | Nu reutilizati reguli temporale contradictorii din arhiva ca specificatie curenta |

Comenzi de analiza folosite: `rg --files`, cautare dupa nume de ecran/controller/metoda in `src/app`, `src/shared/navigation`, `routes` si `app/Http/Controllers`. Aceste cautari statice nu demonstreaza singure ca un fisier poate fi sters. Un viitor PR de curatare trebuie sa enumere consumatorii verificati, dovada de migrare si regresiile rulate.
