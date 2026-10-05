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

## Held back: published figures that could not be confirmed

These corrections came only from Wikipedia or an aggregator, or the published ratings did not sum to 100%, so the previous values were kept. Worth checking against the resort directly.

- **WinSport** (id 10): lifts 7 → 8. Source: https://en.wikipedia.org/wiki/Canada_Olympic_Park
- **Cerro Catedral Alta Patagonia** (id 12): summit_ft 7152 → 6890; vertical_ft 3773 → 3510. Source: https://en.wikipedia.org/wiki/Cerro_Catedral
- **Cypress Mountain** (id 28): published ratings sum to 93.0%, kept old values. Source: https://en.wikipedia.org/wiki/Cypress_Mountain_Ski_Area
- **Sasquatch Mountain Resort** (id 43): summit_ft 4501 → 4321; vertical_ft 1302 → 1099; runs 35 → 34. Source: https://en.wikipedia.org/wiki/Sasquatch_Mountain_Resort
- **Boreal Mountain Resort** (id 50): runs 34 → 41; green_percent 26 → 30; blue_percent 29 → 55; black_percent 44 → 15; double_black_percent 0 → 0. Source: https://en.wikipedia.org/wiki/Boreal_Mountain_Resort
- **Dodge Ridge** (id 51): lifts 10 → 12; runs 71 → 62. Source: https://en.wikipedia.org/wiki/Dodge_Ridge_Ski_Area
- **La Parva** (id 73): runs 40 → 34; green_percent 20 → 15; blue_percent 20 → 18; black_percent 43 → 47; double_black_percent 18 → 21. Source: https://www.onthesnow.com/chile/la-parva/ski-resort
- **Nevados de Chillan** (id 74): lifts 13 → 17; runs 28 → 23; green_percent 30 → 17; blue_percent 20 → 44; black_percent 20 → 26; double_black_percent 30 → 13. Source: https://www.onthesnow.com/chile/nevados-de-chillan/ski-resort
- **Valle Nevado** (id 76): vertical_ft 2198 → 2657; lifts 17 → 16; runs 46 → 34; acres 2200 → 2224; green_percent 30 → 12; blue_percent 23 → 32; black_percent 35 → 41; double_black_percent 12 → 15. Source: https://en.wikipedia.org/wiki/Valle_Nevado
- **Echo Mountain** (id 85): runs 7 → 13. Source: https://en.wikipedia.org/wiki/Echo_Mountain_(ski_area)
- **Steamboat** (id 95): published ratings sum to 106.0%, kept old values. Source: https://www.steamboat.com/-/media/steamboat/pdfs/steamboatresortpresskit202425.pdf
- **Big Squaw Mountain Ski Resort** (id 127): vertical_ft 1450 → 660. Source: https://www.onthesnow.com/maine/big-squaw-mountain-ski-resort/ski-resort
- **Bradford Ski Area** (id 141): summit_ft 1548 → 272; lifts 10 → 9. Source: https://en.wikipedia.org/wiki/Ski_Bradford
- **Mount Bohemia** (id 161): summit_ft 1500 → 1465; vertical_ft 900 → 804; runs 105 → 95; acres 620 → 550. Source: https://en.wikipedia.org/wiki/Mount_Bohemia
- **Mt. Holiday Ski Area** (id 164): summit_ft 440 → 899; base_ft 240 → 689; lifts 4 → 5. Source: https://www.skiresort.com/en/ski-resort/mt-holiday/
- **The Highlands** (id 174): summit_ft 1290 → 1316; base_ft 745 → 787; runs 53 → 55; acres 435 → 385; green_percent 36 → 40; blue_percent 31 → 29; black_percent 31 → 29; double_black_percent 2 → 2. Source: https://en.wikipedia.org/wiki/Boyne_Highlands
- **Timber Ridge** (id 176): lifts 10 → 8; runs 20 → 15. Source: https://en.wikipedia.org/wiki/Timber_Ridge_Ski_Area
- **King Pine** (id 219): acres 48 → 45. Source: https://en.wikipedia.org/wiki/King_Pine_Ski_Area
- **Pats Peak** (id 222): acres 115 → 103. Source: https://en.wikipedia.org/wiki/Pats_Peak
- **Whaleback Mountain** (id 226): green_percent 23 → 28; blue_percent 41 → 39; black_percent 23 → 33; double_black_percent 13 → 0. Source: https://en.wikipedia.org/wiki/Whaleback_(ski_area)
- **Maple Ski Ridge** (id 254): lifts 3 → 4; runs 10 → 11. Source: https://www.onthesnow.com/new-york/maple-ski-ridge/ski-resort
- **Coronet Peak** (id 274): green_percent 17 → 13; blue_percent 50 → 34; black_percent 26 → 34; double_black_percent 21 → 18. Source: https://www.onthesnow.com/new-zealand/coronet-peak/ski-resort
- **Mt. Hutt Ski Area** (id 280): runs 40 → 24. Source: https://www.onthesnow.com/new-zealand/mt-hutt-ski-area/ski-resort
- **Brian Head Resort** (id 364): summit_ft 10970 → 10920; green_percent 30 → 35; blue_percent 35 → 35; black_percent 32 → 20; double_black_percent 3 → 10. Source: https://en.wikipedia.org/wiki/Brian_Head_Resort
- **Sunburst** (id 419): lifts 10 → 11. Source: https://www.onthesnow.com/wisconsin/sunburst/ski-resort
- **Sleeping Giant Ski Resort** (id 428): green_percent 15 → 16; blue_percent 38 → 37; black_percent 35 → 35; double_black_percent 13 → 12. Source: https://www.onthesnow.com/wyoming/sleeping-giant-ski-resort/ski-resort

## Unverifiable

- **Volcan Villarrica Ski Center** (id 77): Now branded 'Centro Pillán' (Pucón); official centropillan.cl has no stats. Sources disagree widely: skiresort.com 2,100/1,380 m, 720 m vertical, 5 lifts; onthesnow 8,005/4,528 ft, 3,150 ft vertical, 6 lifts, 15 runs, 53
- **Schuss Mountain at Shanty Creek** (id 170): Official site shows only resort-wide '7 lifts' and '0 of 42 trails' (Shanty Creek = Schuss + Summit mountains), so Schuss-specific lifts cannot be confirmed (CSV 8). No elevations, acres or percentages found; Wikipedia '
- **Snow Snake Mountain Ski Area** (id 172): Official site (snowsnake.net) publishes no stats; no Wikipedia article. Sources conflict: onthesnow says 1230/1020/210, 4 lifts, 9 trails, 40 acres, 33/22/44; tourism listings say 6 lifts (1 triple, 4 rope tows, magic ca
- **Eagle Rock** (id 328): eaglerockresort.com now redirects to ddresorts.com/eagle-rock/. Official snow-sports page has no numeric stats (only a PDF trail map and a lift diagram A-D); no Wikipedia article; OnTheSnow page empty. Stats could not be

## Manual resolutions

- Hidden Valley (MO): base set to 540 ft from the official 860 ft summit and 320 ft vertical; the old 2,316 ft base was above the summit.
- Buffalo Ski Center: old summit/base were Belleayre's figures and no official elevations exist; set to NULL, vertical 500 ft from OnTheSnow.
- Podbreziny: vertical 374 ft derived from the official slope span (628–742 m); the old 108 ft was metres mislabelled as feet.
- Seven Oaks and Caberfae Peaks: kept the internally consistent OnTheSnow elevations over conflicting Wikipedia figures.
- Coronet Peak: old ratings summed to 114%; replaced with OnTheSnow's 13/34/34/18 because the official site blocks fetching.
- Steamboat and Cypress: official pages publish ratings summing to 106% and 93%; old values kept.
