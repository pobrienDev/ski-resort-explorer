"""Integrity checks on the shipped dump, plus API calls against it.

These load server/skiresorts.sql into TEST_DB_NAME and are skipped when no
MySQL server is reachable (see conftest.py).
"""
import pytest

pytestmark = pytest.mark.integration

COUNTRY_BOUNDS = {
    "United States": ((24, 72), (-170, -66)),
    "Canada": ((42, 70), (-141, -52)),
    "Australia": ((-44, -10), (113, 154)),
    "Argentina": ((-55, -22), (-74, -53)),
    "Chile": ((-56, -17), (-76, -66)),
    "New Zealand": ((-48, -34), (166, 179)),
    "Poland": ((49, 55), (14, 25)),
    "Slovakia": ((47, 50), (16, 23)),
}


def test_dump_has_the_expected_tables_and_rows(resorts, test_db):
    cur = test_db.cursor()
    cur.execute("SHOW TABLES")
    tables = {row[0] for row in cur.fetchall()}
    cur.close()
    assert {"ski_resorts", "states_terr", "countries"} <= tables
    assert len(resorts) > 400


def test_every_resort_has_a_valid_location_and_country(resorts):
    orphans = [r["resort_name"] for r in resorts if r["state_name"] is None or r["country_name"] is None]
    assert orphans == []


def test_resort_names_are_unique_and_present(resorts):
    names = [r["resort_name"] for r in resorts]
    assert all(names)
    dupes = {n for n in names if names.count(n) > 1}
    assert dupes == set()


def test_every_resort_is_sourced(resorts):
    unsourced = [r["resort_name"] for r in resorts if not r["source_url"] or not r["verified_on"]]
    assert unsourced == []


def test_summit_is_above_base(resorts):
    bad = [r["resort_name"] for r in resorts if r["summit"] is not None and r["base"] is not None and r["summit"] <= r["base"]]
    assert bad == []


def test_vertical_is_positive_and_plausible(resorts):
    bad = [
        r["resort_name"]
        for r in resorts
        if r["vertical"] is None or r["vertical"] <= 0 or r["vertical"] > 2000  # no resort exceeds ~1,800 m lift-served
    ]
    assert bad == []


def test_elevations_are_in_metres_not_feet(resorts):
    # Highest lift-served summit in the dataset is ~3,800 m; anything above 5,000 would be feet.
    bad = [r["resort_name"] for r in resorts if r["summit"] is not None and r["summit"] > 5000]
    assert bad == []


def test_difficulty_percentages_sum_to_roughly_100(resorts):
    bad = []
    for r in resorts:
        parts = [r["green_percent"], r["blue_percent"], r["black_percent"], r["double_black_percent"]]
        if all(p is None for p in parts):
            continue
        total = sum(p or 0 for p in parts)
        # Steamboat publishes 13/44/49 (106%); allow a little slack for rounding and overlap.
        if not 95 <= total <= 106:
            bad.append((r["resort_name"], total))
    assert bad == []


def test_counts_are_positive(resorts):
    bad = [r["resort_name"] for r in resorts if (r["lifts"] or 0) <= 0 or (r["runs"] or 0) <= 0]
    assert bad == []
    bad_acres = [r["resort_name"] for r in resorts if r["acres"] is not None and r["acres"] <= 0]
    assert bad_acres == []


def test_coordinates_fall_inside_their_country(resorts):
    bad = []
    for r in resorts:
        (lat_lo, lat_hi), (lon_lo, lon_hi) = COUNTRY_BOUNDS[r["country_name"]]
        if not (lat_lo <= float(r["lat"]) <= lat_hi and lon_lo <= float(r["lon"]) <= lon_hi):
            bad.append((r["resort_name"], float(r["lat"]), float(r["lon"])))
    assert bad == []


def test_urls_are_absolute_http(resorts):
    bad = [r["resort_name"] for r in resorts if r["url"] is not None and not r["url"].startswith(("http://", "https://"))]
    assert bad == []
    bad_src = [r["resort_name"] for r in resorts if not r["source_url"].startswith(("http://", "https://"))]
    assert bad_src == []


# --- API against the real test database --------------------------------------

def test_api_lists_every_resort(client, resorts):
    res = client.get("/api/resorts")
    assert res.status_code == 200
    rows = res.get_json()["resorts"]
    assert len(rows) == len(resorts)
    assert {"resortID", "resort_name", "state_name", "summit", "base", "vertical", "lifts", "runs",
            "acres", "lat", "lon", "url", "source_url", "verified_on"} <= set(rows[0])


def test_api_filters_by_q_and_state(client):
    vail = client.get("/api/resorts?q=vail").get_json()["resorts"]
    assert any(r["resort_name"] == "Vail" for r in vail)
    assert all("vail" in r["resort_name"].lower() or "vail" in r["state_name"].lower() for r in vail)

    utah = client.get("/api/resorts?state=Utah").get_json()["resorts"]
    assert utah and all(r["state_name"] == "Utah" for r in utah)

    assert client.get("/api/resorts?q=zzzz-no-such-resort").get_json() == {"resorts": []}


def test_api_single_resort_and_404(client, resorts):
    first = min(r["resortID"] for r in resorts)
    res = client.get(f"/api/resorts/{first}")
    assert res.status_code == 200
    assert res.get_json()["resort"]["resortID"] == first
    missing = max(r["resortID"] for r in resorts) + 1000
    assert client.get(f"/api/resorts/{missing}").status_code == 404
