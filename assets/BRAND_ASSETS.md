# Identitate vizuala

Sigla este fisierul `gatify-animated.svg` furnizat de utilizator, copiat exact in `assets/brand/` si `business-api/public/brand/`. SHA256: `479f748cfaccfe490165ee8a17d1ecc412f806bb0572d8cdda73b83d97ec042b`.

Ciclul GT -> GATIFY dureaza opt secunde. Redarea nativa pastreaza caile, keyTimes si curba Bezier ale SVG-ului prin react-native-svg/Reanimated. Preferinta de miscare redusa si fundalul aplicatiei opresc animatia pe cuvantul complet. Administrarea foloseste SVG-ul original, inclusiv regula prefers-reduced-motion.

Pictogramele Android/iOS si faviconul folosesc monograma GT din primul cadru. Ecranul nativ de pornire iOS si emailul folosesc cuvantul complet static, derivat din aceleasi cai. Aceste suprafete nu redau ciclul SVG. Identificatorii aplicatiei, tokenurilor si jurnalelor raman compatibili cu instalatiile existente.

Regenerare: `python tools/branding/import-logo.py <fisier-svg> --resvg-module <cale-modul-resvg>`. Rendererul folosit este @resvg/resvg-js 2.6.2, instalat numai in uneltele locale, nu ca dependenta a aplicatiei. PNG-urile de AppIcon iOS sunt RGB fara canal alfa. Buildul iOS si lansarea pe dispozitiv necesita macOS.

Fonturile Inter 4.1 provin din repository-ul oficial Inter si sunt distribuite sub SIL Open Font License 1.1; licenta este pastrata in `assets/licenses/Inter-OFL-1.1.txt`.
