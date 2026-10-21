# Convenții pentru text și erori

Aceste reguli se aplică oricărei schimbări făcute în `business-api` și `business-front`.

## 1. Diacritice românești în tot textul afișat

Tot textul care apare utilizatorului se scrie în română **cu diacritice** (ă, â, î, ș, ț).
Se aplică la:

- etichete, titluri, butoane, placeholdere, mesaje goale/încărcare;
- mesaje de eroare, de confirmare și notificări afișate prin `shared/feedback`
  (`showError`, `showMessage`, `confirmAction`);
- orice alt text vizibil în interfață.

Consecvența cu restul aplicației este obligatorie: nu se amestecă text cu și fără diacritice.

## 2. Textul erorilor vine din frontend, nu din backend

Sursa textului de eroare afișat utilizatorului este **frontend-ul**, nu backend-ul.

### Backend (`business-api`)

- La o eroare, backend-ul întoarce un **cod de eroare stabil** (identificator mașină), nu un
  text destinat utilizatorului final.
- Codul este un șir constant, documentat, care nu se schimbă fără analiza impactului
  (contract API).
- Backend-ul poate întoarce, opțional, un mesaj tehnic doar pentru logare/diagnostic; acel
  mesaj **nu** se afișează utilizatorului.

Exemplu de răspuns de eroare:

```json
{
  "error": {
    "code": "EVENT_NOT_FOUND"
  }
}
```

### Frontend (`business-front`)

- Frontend-ul deține maparea `cod de eroare -> text în română cu diacritice`.
- Maparea stă într-un singur loc, reutilizabil (nu se împrăștie prin ecrane).
- Textul se afișează utilizatorului doar prin `showError` din `shared/feedback`.
- Pentru un cod necunoscut se afișează un mesaj generic (fallback), tot cu diacritice.

Motiv: textul rămâne controlat, consecvent și localizat într-un singur loc, iar backend-ul
nu trebuie modificat pentru schimbări de formulare.

## Precizare față de `AGENTS.md`

Regula „Reguli de calitate și livrare” nr. 7 din `AGENTS.md` cere text pentru utilizator
**cu** diacritice, în acord cu aceste convenții.

Docblock-urile și descrierile din cod (`business-api` PHPDoc, descrierile din reguli) rămân,
conform `AGENTS.md`, în română fără diacritice — acestea nu sunt text afișat utilizatorului.
