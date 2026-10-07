# Resort data verification

On 2026-10-05 every resort in `server/skiresorts.sql` was checked against its official mountain-stats page, falling back to Wikipedia or OnTheSnow when the official site publishes no numbers or blocks fetching. Each row's `source_url` and `verified_on` record what it was checked against.

**Field definitions.** `summit`/`base` are the resort's published top and base elevations (metres). `vertical` is the resort's published lift-served vertical drop, which can differ from summit minus base when the summit is hike-to or the drop is measured to a lower base. Difficulty percentages map beginner/intermediate/advanced/expert to green/blue/black/double black; resorts that publish three categories have double black = 0.

## Removed (closed, merged, or not an alpine ski area)

- **Mt. Potts Backcountry** (id 71): The snowcat/heli ski field ceased operating around 2011; mtpotts.co.nz now redirects to Mt Potts Lodge (accommodation/cafe) which refers to 'the old ski field'.
- **Woodbury Ski Area** (id 105): Permanently closed: Wikipedia states the area closed in 2016 after a drought and has not reopened.
- **Ski Blandford** (id 145): PERMANENTLY CLOSED: last operated 8 Mar 2020; closure announced 26 Mar 2020 (Ski Butternut ownership).
- **Apple Mountain** (id 150): Ski slopes have not operated since the 2016-17 season; October 2018 official statement says slopes 'will remain closed for the foreseeable future' and snowsports cannot be sustained.
- **Moonlight Basin** (id 202): No longer an independent ski resort: acquired by Boyne/Yellowstone Club on 1 Oct 2013 and merged into Big Sky Resort (resortID 194); its terrain is now part of Big Sky and the website is bigskyresort.com.
- **Enchanted Forest Ski Area** (id 231): This is a cross-country (Nordic) ski area near Red River, NM, with no lifts.
- **Toggenburg Mountain** (id 266): PERMANENTLY CLOSED: sold to Intermountain (Song/Labrador owner) in July 2021 with a covenant barring ski operation; NY AG antitrust case followed; infrastructure largely sold off; no website.
- **Spout Springs** (id 320): Closed since the 2017-18 season (no official site).
- **Deer Mountain Ski Resort** (id 359): Public ski resort (a.k.a.
- **Sleeping Giant Ski Resort** (id 428): closed for three consecutive winters and sold to become a summer adventure park.

## Second pass on previously unconfirmed resorts

The 30 resorts the first pass could not confirm were re-checked with a larger budget: official trail map PDFs, press kits, snow reports, archived official pages, and state or national ski association directories. A figure was accepted when the official site states it or two independent sources agree.

- **WinSport** (id 10, confirmed, medium confidence): lifts 7 → 6, runs 6 → 3. Source: https://www.winsport.ca/assets/PDFs/Maps/2025/WinSport-Winter-Trail-Map_2025-26_full_web_v1.4.pdf
- **Cerro Catedral Alta Patagonia** (id 12, confirmed, medium confidence): lifts 29 → 25, runs 55 → 67, acres 1480 → 2965, green_percent 4 → 26, blue_percent 51 → 43, black_percent 33 → 21, double_black_percent 13 → 10. Source: https://catedralaltapatagonia.com/la-montana
- **Cypress Mountain** (id 28, confirmed, high confidence): current values confirmed. Source: https://www.cypressmountain.com/trail-maps-and-stats
- **Sasquatch Mountain Resort** (id 43, confirmed, high confidence): runs 35 → 36, green_percent 20 → 17, blue_percent 34 → 33, black_percent 46 → 50, double_black_percent 0 → 0. Source: https://sasquatchmountain.ca/newsite/wp-content/uploads/2025/05/Trail-Map.pdf
- **Boreal Mountain Resort** (id 50, confirmed, medium confidence): lifts 8 → 7. Source: https://www.skicalifornia.org/resorts/boreal-mountain-resort/
- **Dodge Ridge** (id 51, confirmed, high confidence): current values confirmed. Source: https://dodgeridge.b-cdn.net/wp-content/uploads/2025/12/DodgeRidge_TrailMap_freestyle-update-12-4-LRG-min-scaled.jpg
- **La Parva** (id 73, confirmed, medium confidence): acres 800 → 1977, green_percent 20 → 14, blue_percent 20 → 22, black_percent 43 → 45, double_black_percent 18 → 19. Source: https://laparva.cl/en/mountain-report/slopes-and-ski-lifts/
- **Nevados de Chillan** (id 74, confirmed, medium confidence): base_ft 5899 → 4921, vertical_ft 2300 → 3281, lifts 13 → 16, runs 28 → 23, acres 1223 → 1236, green_percent 30 → 26, blue_percent 20 → 39, black_percent 20 → 22, double_black_percent 30 → 13, lat -36.6 → -36.9073, lon -72.11 → -71.4194. Source: https://www.nevadosdechillan.com/andariveles-y-pistas
- **Valle Nevado** (id 76, confirmed, medium confidence): base_ft 9843 → 9924, vertical_ft 2198 → 2117, lifts 17 → 13, runs 46 → 45, green_percent 30 → 15, blue_percent 23 → 29, black_percent 35 → 38, double_black_percent 12 → 18, lat -33.2016 → -33.3543, lon -70.3404 → -70.2492. Source: https://www.vallenevado.com/wp-content/uploads/2026/05/3MAPA_compressed.pdf
- **Centro Pillán (Volcán Villarrica)** (id 77, best_available, low confidence): base_ft 5085 → 3937, vertical_ft 2920 → 4068, lifts 7 → 6, lat -39.27 → -39.3821, lon -71.97 → -71.9699. Source: https://www.centropillan.cl/media/2026/08/Mapa-Pillan-2026.jpg
- **Echo Mountain** (id 85, confirmed, medium confidence): green_percent 100 → 23, blue_percent 0 → 46, black_percent 0 → 31, double_black_percent 0 → 0, lat 39.7414 → 39.685, lon -105.5122 → -105.5194, url https://echomntn.com/ → https://echomtn.com/. Source: https://echomtn.com/mountain-conditions
- **Steamboat** (id 95, confirmed, high confidence): green_percent 12 → 13, blue_percent 43 → 44, black_percent 40 → 49, double_black_percent 5 → 0. Source: https://www.steamboat.com/-/media/steamboat/media-center-folders/dynamictabs/press-kit-2526.pdf
- **Big Moose Mountain Ski Area** (id 127, best_available, low confidence): summit_ft 3200 → 2950, vertical_ft 1450 → 660, green_percent 33 → 18, blue_percent 34 → 56, black_percent 33 → 26, double_black_percent 0 → 0. Source: https://skibigmoose.com/cat-skiing-in-maine
- **Bradford Ski Area** (id 141, confirmed, medium confidence): summit_ft 1548 → 272, base_ft 1300 → 24, green_percent 10 → 20, blue_percent 80 → 27, black_percent 10 → 53, double_black_percent 0 → 0. Source: https://skibradford.com/trail-map/
- **Mount Bohemia** (id 161, confirmed, medium confidence): acres 620 → 585. Source: https://www.mtbohemia.com/about/
- **Mt. Holiday Ski Area** (id 164, confirmed, high confidence): runs 12 → 14. Source: https://mt-holiday.com/wp-content/uploads/2024/10/24-25-Mt-Holiday-Trail-Map.pdf
- **Schuss Mountain at Shanty Creek** (id 170, confirmed, medium confidence): lifts 8 → 7, green_percent 36 → 30, blue_percent 29 → 28, black_percent 36 → 42, double_black_percent 0 → 0. Source: https://www.shantycreek.com/ski/conditions-cams/
- **Snow Snake Mountain Ski Area** (id 172, confirmed, medium confidence): lifts 6 → 4, runs 12 → 9, green_percent 30 → 33, blue_percent 50 → 22, black_percent 20 → 44, double_black_percent 0 → 0. Source: https://snowsnake.net/snow-report/
- **The Highlands** (id 174, confirmed, high confidence): summit_ft 1290 → 1325, base_ft 745 → 773, lifts 10 → 8, runs 53 → 55, green_percent 36 → 37, blue_percent 31 → 29, black_percent 31 → 34, double_black_percent 2 → 0. Source: https://www.highlandsharborsprings.com/media-room/resort-stats
- **Timber Ridge** (id 176, confirmed, high confidence): green_percent 53 → 55, blue_percent 26 → 25, black_percent 16 → 15, double_black_percent 5 → 5. Source: https://www.timberridgeski.com/snow-report/
- **King Pine** (id 219, confirmed, medium confidence): lifts 5 → 6, acres 48 → 50, green_percent 44 → 41, blue_percent 31 → 35, black_percent 10 → 12, double_black_percent 15 → 12. Source: https://www.kingpine.com/wp-content/uploads/2025/12/King-Pine-Ski-Area-and-PSR-XC-Map_2025.jpg
- **Pats Peak** (id 222, confirmed, medium confidence): current values confirmed. Source: https://www.skinh.com/resorts/pats-peak
- **Whaleback Mountain** (id 226, confirmed, medium confidence): green_percent 23 → 26, blue_percent 41 → 39, black_percent 23 → 16, double_black_percent 13 → 19. Source: https://www.whaleback.com/trail-map
- **Maple Ski Ridge** (id 254, confirmed, medium confidence): summit_ft 1200 → 870, base_ft 750 → 600, vertical_ft 450 → 270, lifts 3 → 4, runs 10 → 8, acres 25 → 60, green_percent 11 → 25, blue_percent 44 → 38, black_percent 44 → 37, double_black_percent 0 → 0. Source: https://www.mapleskiridge.com/hours-info
- **Coronet Peak** (id 274, confirmed, medium confidence): summit_ft 5410 → 5344, base_ft 3894 → 3829, runs 38 → 41. Source: https://www.coronetpeak.co.nz/mountain-info
- **Mt. Hutt Ski Area** (id 280, confirmed, medium confidence): current values confirmed. Source: https://www.mthutt.co.nz/mountain-info
- **Eagle Rock** (id 328, confirmed, medium confidence): runs 14 → 8, green_percent 50 → 25, blue_percent 7 → 38, black_percent 43 → 37, double_black_percent 0 → 0. Source: https://ddresorts.com/eagle-rock/wp-content/uploads/sites/4/Eagle-Rock-Ski-Map-2024-3-1.pdf
- **Brian Head Resort** (id 364, confirmed, medium confidence): summit_ft 10970 → 10920, base_ft 9600 → 9780, vertical_ft 1370 → 1140, green_percent 30 → 35, blue_percent 35 → 35, black_percent 32 → 30, double_black_percent 3 → 0. Source: https://www.brianhead.com/wp-content/uploads/sites/7/2024/10/UpdatedPressKitWebRes.pdf
- **Sunburst** (id 419, best_available, low confidence): green_percent 18 → 38, blue_percent 55 → 25, black_percent 18 → 25, double_black_percent 9 → 12. Source: http://skisunburst.com/our-hills
- **Sleeping Giant Ski Resort** (id 428): removed. Not operating as a ski area.

Still a judgement call: Boreal's difficulty mix (no two sources agree), Big Moose Mountain's base elevation, Centro Pillán's summit (sources span 2,100–2,440 m), and Steamboat's official ratings, which the resort publishes as 13/44/49 and sum to 106%.

## Manual resolutions

- Hidden Valley (MO): base set to 540 ft from the official 860 ft summit and 320 ft vertical; the old 2,316 ft base was above the summit.
- Buffalo Ski Center: old summit/base were Belleayre's figures and no official elevations exist; set to NULL, vertical 500 ft from OnTheSnow.
- Podbreziny: vertical 374 ft derived from the official slope span (628–742 m); the old 108 ft was metres mislabelled as feet.
- Seven Oaks and Caberfae Peaks: kept the internally consistent OnTheSnow elevations over conflicting Wikipedia figures.
