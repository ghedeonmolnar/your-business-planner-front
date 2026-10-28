# Dependențe: verificarea din 28 octombrie 2026

`npm audit --audit-level=high` trece în ambele repository-uri, iar `composer audit` nu raportează advisories. Frontendul raportează totuși 8 vulnerabilități de severitate mică, generate de același advisory tranzitiv: [GHSA-gcqx-w48m-w2h4 / CVE-2026-93753](https://github.com/advisories/GHSA-gcqx-w48m-w2h4).

Advisory-ul afectează `deepmerge` 4.2.0–4.3.1 și descrie alterarea prototipului obiectului rezultat când sunt procesate proprietăți controlate de un atacator. La verificare nu este publicată o versiune corectată. Lockfile-ul frontend folosește 4.3.1 în React Native CLI și Jest; React Native Paper folosește separat 3.3.0, în afara intervalului raportat. Auditul cu `--omit=dev` păstrează patru raportări în lanțul CLI; acesta nu dovedește singur că vulnerabilitatea este exploatabilă în APK.

Nu s-au schimbat dependențele, pragurile CI sau excluderile auditului. Sugestia npm de a forța revenirea la CLI 11.4.1 nu este o remediere compatibilă demonstrată pentru React Native 0.88 și nu a fost aplicată.

Conform AGENTS.md, advisory-ul rămâne un blocaj explicit pentru lansarea publică. Următoarea rundă de mentenanță autorizată trebuie să reevalueze remedierea upstream și lanțurile CLI/Jest, să aplice o soluție compatibilă și să repete auditul, testele complete și build-ul Android. Integrarea codului în `main` nu reprezintă autorizarea lansării publice și nu închide controalele de infrastructură și livrare din `docs/ROADMAP_LANSARE.md`.
