# Detalii rezervare — implementare handoff

Referința este pachetul YBP_Detalii_Rezervare_Handoff. Ecranul pentru categoria VENUE folosește componente MD3 și tokenurile existente. Nu sunt introduse dependențe, migrări sau endpointuri noi.

## Decizii

- Acțiunile de administrare sunt în meniul ⋮, închis inițial. WhatsApp cere previzualizarea destinatarului și a mesajului; notele interne sunt excluse. Anularea cere confirmare și păstrează mecanismele existente de version și invalidare.
- Telefonul clientului este obligatoriu la o rezervare nouă sau la schimbarea clientului, inclusiv pe server, sub lock. Rezervările vechi cu același client fără telefon rămân editabile. Formularul de completare folosește PUT /clients/{id}, fără să rescrie notele clientului.
- minimum_guests și final_guests sunt afișate separat. null nu devine zero; zero păstrează semantica existentă. Nu se inventează un deadline de confirmare.
- Sumele vin din BookingPricing. Avansul convenit nu este încasare. Soldul ține cont de încasările și restituirile completed, iar costul personalului este separat.
- Personalul este opțional. Secțiunile secundare sunt închise implicit și respectă rolurile/modulele. Listele de plăți și documente se cer numai la extindere și rămân paginate.
- Două agregate SQL aditive, incoming_payments_count și outgoing_payments_count, numără tranzacțiile neanulate. Sunt ascunse server-side fără finance sau pentru angajați. Clientul acceptă și un API anterior care nu le trimite.
- Nu sunt implementate module BEO, inventar, termene sau meniuri speciale care nu există în modelul actual. Textul poate ocupa mai multe rânduri; câmpurile și KPI-urile trec la aranjare verticală în funcție de lățime și fontScale.

## Fișiere de frontend

Ecran și componente noi:

```text
src/features/bookings/screens/BookingDetailsScreen.tsx
src/features/bookings/components/BookingDetailsHeader.tsx
src/features/bookings/components/BookingDetailsLoading.tsx
src/features/bookings/components/BookingDetailsSection.tsx
src/features/bookings/components/BookingDetailField.tsx
src/features/bookings/components/BookingSummaryCard.tsx
src/features/bookings/components/BookingEventSection.tsx
src/features/bookings/components/BookingFinancialSection.tsx
src/features/bookings/components/BookingStaffSection.tsx
src/features/bookings/components/BookingPhoneForm.tsx
src/features/bookings/components/bookingDetailsStyles.ts
```

Formulare, date și funcții existente adaptate:

```text
src/features/bookings/components/BookingClientFields.tsx
src/features/bookings/components/BookingCommercialFields.tsx
src/features/bookings/components/BookingReviewFields.tsx
src/features/bookings/components/BookingForm.tsx
src/features/bookings/components/BookingPayments.tsx
src/features/bookings/components/BookingDocuments.tsx
src/features/bookings/types.ts
src/features/bookings/schemas/bookingApiSchemas.ts
src/features/bookings/utils/bookingMessage.ts
src/features/bookings/utils/bookingFormErrors.ts
src/features/company/schemas/directorySchema.ts
src/shared/schemas/phoneSchema.ts
src/shared/utils/contactLinks.ts
src/shared/api/apiError.ts
```

BookingCommercialSummary.tsx a fost eliminat; conținutul său este în secțiunile separate pentru eveniment, financiar și note.

Teste noi sau adaptate:

```text
src/features/bookings/screens/BookingDetailsScreen.test.tsx
src/features/bookings/screens/BookingDetailsScreen.capabilities.test.tsx
src/features/bookings/screens/BookingDetailsScreen.redesign.test.tsx
src/features/bookings/screens/bookingDetails.testUtils.tsx
src/features/bookings/screens/BookingsScreen.test.tsx
src/features/bookings/components/BookingDetailsHeader.test.tsx
src/features/bookings/components/BookingPhoneForm.test.tsx
src/features/bookings/components/BookingFinancialSection.responsive.test.tsx
src/features/bookings/utils/bookingMessage.test.ts
src/features/bookings/utils/bookingFormErrors.test.tsx
src/shared/schemas/phoneSchema.test.ts
src/shared/utils/contactLinks.test.ts
```

## Fișiere de backend

```text
app/Domain/Events/EventService.php
app/Http/Resources/BookingResource.php
app/Support/ContactIdentity.php
tests/Concerns/CreatesPlannerFixtures.php
tests/Feature/BookingApiTest.php
tests/Feature/EventApiTest.php
tests/Feature/ClientApiTest.php
database/seeders/PlannerDemoSeeder.php
```

Cele trei copii PROJECT_SCHEMA.md sunt sincronizate. Copiile AGENTS.md sunt identice și nu au fost modificate. Modificările anterioare existente în workspace sunt păstrate.

Seederul local păstrează exemplul istoric fără telefon: inițializează în tranzacția sa o rezervare legacy minimală și îi aplică detaliile prin serviciul de editare. Nu inventează contacte și nu adaugă un parametru de ocolire a regulii în serviciul de producție. Datele de test care creează rezervări noi folosesc telefoane fictive exclusiv în baza de teste.

## Validare

Prettier și Pint au formatat fișierele atinse. Suitele automate tsc, eslint, jest, Pint --test și PHPUnit nu au fost executate, conform ritmului AGENTS.md. Testele de responsivitate verifică păstrarea valorilor și accesibilitatea în arborele randat; nu demonstrează singure absența oricărei probleme vizuale.

În emulatorul Android au fost observate datele reale ale rezervării demonstrative, telefonul lipsă cu contact dezactivat, programul peste miezul nopții, meniurile neconfirmate, KPI-urile serverului, sumarul de personal și de plăți, meniul cu cele trei acțiuni și dialogul de anulare închis prin Păstrează rezervarea. A fost observată și starea de eroare cu datele păstrate, urmată de reîncărcarea reușită după repornirea serviciilor locale. Nu s-au trimis mesaje sau anulat rezervări.

Rămân de executat suitele automate la runda prevăzută, matricea vizuală completă la 320/390/430 dp și fontScale 1.3/1.6, TalkBack, trimiterea WhatsApp pe un contact de test autorizat și validarea cap-coadă a scrierilor cu permisiunile corespunzătoare. Nu s-a făcut un build Android nou, fiind o schimbare fără cod nativ.
