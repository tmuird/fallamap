# Falla coordinate corrections — 2026 official source

Updated: 2026-10-01

## Sources and matching method

The coordinate source is the Ajuntament de València open-data dataset **Falles / Fallas**:

- Dataset: <https://opendata.vlci.valencia.es/dataset/falles-fallas>
- Layer metadata: <https://geoportal.valencia.es/server/rest/services/OPENDATA/Turismo/MapServer/215?f=pjson>
- Feature query: <https://geoportal.valencia.es/server/rest/services/OPENDATA/Turismo/MapServer/215/query?where=1%3D1&outFields=id_falla%2Cnombre%2Cboceto&returnGeometry=true&outSR=4326&f=geojson>

Queried the official layer directly on 2026-10-01; it returned 351 point features. Each corrected feature's `boceto` URL contains a `2026_` Fallas image. The app's monument numbers are not stable across the layer, so records were matched by the actual street/intersection names (accent-insensitive; Spanish/Valencian equivalents checked), **not** by `id_falla`. Coordinates in the app use GeoJSON order converted to `{lng, lat}`.

As an independent cross-check, the corrected points were reverse-geocoded through OpenStreetMap Nominatim (1.15s between requests, within its usage policy). Resulting streets/neighbourhoods correspond to the named monuments; for El Palmar and El Saler the reverse results identify the exact named place/street.

## Corrected high-confidence outliers

| App number | App name | Official layer ID / name | Previous distance to official point |
|---|---|---|---:|
| 4 | LINTERNA - NA ROVELLA - AV. BARÓN DE CÁRCER | 6 — Llanterna-Na Rovella-Avinguda de l’Oest | 2.42 km |
| 6 | BORRULL - TURIA | 7 — Borrull-Túria | 4.79 km |
| 7 | MURILLO - PALOMAR | 8 — Murillo-Palomar | 2.32 km |
| 34 | J. DE AGUILÓ - GASPAR AGUILAR | 35 — Joan d'Aguiló-Gaspar Aguilar | 2.10 km |
| 44 | GRAN VÍA FDO. EL CATOLICO - A.GUIMERÁ | 79 — Ferran el Catòlic-Àngel Guimerà | 1.41 km |
| 145 | PLAZA VIRGEN DEL LEPANTO (CASTELLAR) | 147 — Plaça Mare de Déu de Lepant | 5.49 km |
| 156 | SAN IGNACIO DE LOYOLA - JESÚS Y MARIA | 160 — Sant Ignasi de Loiola-Jesús i Maria | 2.12 km |
| 160 | EN PLOM - GUILLÉM DE CASTRO | 167 — En Plom-Guillem de Castro | 3.91 km |
| 168 | AV. REGNE VALENCIA - S. VALERO | 170 — Avinguda Regne de València-Sant Valer | 7.45 km |
| 219 | BENICADELL - SAN ROQUE | 223 — Benicadell-Sant Roc | 3.06 km |
| 223 | PLAÇA LA SEQUIOTA - EL PALMAR | 224 — Plaça Sequiota-El Palmar | 20.60 km |
| 240 | RIBERA - CVTO.SANTA CLARA | 242 — Ribera-Convent de Santa Clara | 4.59 km |
| 329 | EMBARCADERO - HISTORIADOR BETI (SALER) | 338 — Embarcador-Historiador Betí | 13.56 km |

The resulting coordinates in `src/components/fallas.json` match the official feature geometry exactly. Those records are now 0 m from their selected source point (previous errors ranged from 1.41 km to 20.60 km).

## Deliberately not changed

- `#212 PLAZA DEL AYUNTAMIENTO`: its existing point is already at the city-hall plaza. The layer's text-only nearest-name candidates were not a high-confidence match, so it was not moved.
- Other candidates with unclear names, or where the official point differs by less than 1 km, were left untouched. In particular, no ambiguous fuzzy-name result was used as a coordinate override.

## Reproduction

The source geometry can be retrieved from the feature-query URL above. Verify each app point against the corresponding official `id_falla` by comparing `coordinates.lng` with GeoJSON coordinate `[0]`, `coordinates.lat` with `[1]`. For future event editions, re-match by street/intersection name and confirm the year's `boceto` URL; do not blindly carry 2026 positions or numeric IDs forward.
