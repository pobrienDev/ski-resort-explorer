"""Route behaviour with the database layer mocked. No MySQL needed."""
import main


class FakeResponse:
    def __init__(self, status_code=200, payload=None, content=b""):
        self.status_code = status_code
        self._payload = payload or {}
        self.content = content

    def json(self):
        return self._payload


def capture_fetch(monkeypatch, result):
    """Replace fetch_resorts, recording the SQL and params it was called with."""
    calls = []

    def fake(query, params=None):
        calls.append((query, params))
        return result

    monkeypatch.setattr(main, "fetch_resorts", fake)
    return calls


# --- /api/resorts -----------------------------------------------------------

def test_list_resorts_returns_rows(client, monkeypatch):
    rows = [{"resortID": 1, "resort_name": "Vail"}]
    calls = capture_fetch(monkeypatch, {"resorts": rows})
    res = client.get("/api/resorts")
    assert res.status_code == 200
    assert res.get_json() == {"resorts": rows}
    query, params = calls[0]
    assert "WHERE" not in query
    assert params == ()


def test_list_resorts_q_filter_matches_name_or_location(client, monkeypatch):
    calls = capture_fetch(monkeypatch, {"resorts": []})
    client.get("/api/resorts?q=Vail")
    query, params = calls[0]
    assert "sr.resort_name LIKE %s" in query and "st.state_name LIKE %s" in query
    assert params == ("%Vail%", "%Vail%")


def test_list_resorts_q_filter_escapes_like_wildcards(client, monkeypatch):
    calls = capture_fetch(monkeypatch, {"resorts": []})
    client.get("/api/resorts?q=100%25_a!b")  # raw value: 100%_a!b
    _, params = calls[0]
    assert params[0] == "%100!%!_a!!b%"


def test_list_resorts_state_filter_is_exact_and_combines_with_q(client, monkeypatch):
    calls = capture_fetch(monkeypatch, {"resorts": []})
    client.get("/api/resorts?q=vail&state=Colorado")
    query, params = calls[0]
    assert "st.state_name = %s" in query
    assert " AND " in query
    assert params == ("%vail%", "%vail%", "Colorado")


def test_list_resorts_blank_filters_are_ignored(client, monkeypatch):
    calls = capture_fetch(monkeypatch, {"resorts": []})
    client.get("/api/resorts?q=%20&state=")
    query, params = calls[0]
    assert "WHERE" not in query
    assert params == ()


def test_list_resorts_db_error_is_500_without_details(client, monkeypatch):
    capture_fetch(monkeypatch, {"error": "Database query failed"})
    res = client.get("/api/resorts")
    assert res.status_code == 500
    assert res.get_json() == {"error": "Database query failed"}


# --- /api/resorts/<id> ------------------------------------------------------

def test_get_resort_found(client, monkeypatch):
    calls = capture_fetch(monkeypatch, {"resorts": [{"resortID": 7, "resort_name": "Alta"}]})
    res = client.get("/api/resorts/7")
    assert res.status_code == 200
    assert res.get_json() == {"resort": {"resortID": 7, "resort_name": "Alta"}}
    assert calls[0][1] == (7,)


def test_get_resort_unknown_id_is_404(client, monkeypatch):
    capture_fetch(monkeypatch, {"resorts": []})
    res = client.get("/api/resorts/999999")
    assert res.status_code == 404
    assert res.get_json() == {"error": "Resort not found"}


def test_get_resort_malformed_id_is_404_before_db(client, monkeypatch):
    calls = capture_fetch(monkeypatch, {"resorts": []})
    assert client.get("/api/resorts/abc").status_code == 404
    assert client.get("/api/resorts/-1").status_code == 404
    assert calls == []


# --- escape_like -------------------------------------------------------------

def test_escape_like():
    assert main.escape_like("plain") == "plain"
    assert main.escape_like("50%") == "50!%"
    assert main.escape_like("a_b") == "a!_b"
    assert main.escape_like("bang!") == "bang!!"
    assert main.escape_like("!%_") == "!!!%!_"


# --- /api/weather --------------------------------------------------------------

def test_weather_503_when_key_missing(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "")
    res = client.get("/api/weather?lat=39.6&lon=-106.4")
    assert res.status_code == 503


def test_weather_400_on_missing_or_non_numeric_coords(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "k")
    assert client.get("/api/weather").status_code == 400
    assert client.get("/api/weather?lat=abc&lon=1").status_code == 400
    assert client.get("/api/weather?lat=1").status_code == 400


def test_weather_400_on_out_of_range_coords(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "k")
    assert client.get("/api/weather?lat=91&lon=0").status_code == 400
    assert client.get("/api/weather?lat=0&lon=-181").status_code == 400


def test_weather_proxies_upstream_with_server_side_key(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "secret-key")
    seen = {}

    def fake_get(url, params=None, timeout=None):
        seen.update(url=url, params=params, timeout=timeout)
        return FakeResponse(200, {"main": {"temp": 21.5}, "weather": [{"description": "clear"}]})

    monkeypatch.setattr(main.requests, "get", fake_get)
    res = client.get("/api/weather?lat=39.6&lon=-106.4")
    assert res.status_code == 200
    assert res.get_json()["main"]["temp"] == 21.5
    assert seen["url"] == main.OPENWEATHER_WEATHER_URL
    assert seen["params"] == {"lat": 39.6, "lon": -106.4, "units": "imperial", "appid": "secret-key"}
    assert seen["timeout"] == main.OPENWEATHER_TIMEOUT_SECONDS


def test_weather_502_hides_upstream_status(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "k")
    monkeypatch.setattr(main.requests, "get", lambda *a, **kw: FakeResponse(401))
    res = client.get("/api/weather?lat=1&lon=1")
    assert res.status_code == 502
    assert "401" not in res.get_data(as_text=True)


def test_weather_502_on_network_error(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "k")

    def boom(*a, **kw):
        raise main.requests.RequestException("timeout")

    monkeypatch.setattr(main.requests, "get", boom)
    assert client.get("/api/weather?lat=1&lon=1").status_code == 502


# --- /api/weather/tiles -------------------------------------------------------

def test_tile_400_on_invalid_coordinates(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "k")
    assert client.get("/api/weather/tiles/20/0/0.png").status_code == 400  # z > 19
    assert client.get("/api/weather/tiles/2/4/0.png").status_code == 400  # x >= 2**z
    assert client.get("/api/weather/tiles/2/0/4.png").status_code == 400  # y >= 2**z


def test_tile_proxies_png_with_cache_header(client, monkeypatch):
    monkeypatch.setattr(main, "OPENWEATHER_API_KEY", "k")
    seen = {}

    def fake_get(url, params=None, timeout=None):
        seen["url"] = url
        seen["params"] = params
        return FakeResponse(200, content=b"\x89PNG")

    monkeypatch.setattr(main.requests, "get", fake_get)
    res = client.get("/api/weather/tiles/7/10/36.png")
    assert res.status_code == 200
    assert res.content_type == "image/png"
    assert res.data == b"\x89PNG"
    assert res.headers["Cache-Control"] == "public, max-age=600"
    assert seen["url"] == "https://tile.openweathermap.org/map/precipitation_new/7/10/36.png"
    assert seen["params"] == {"appid": "k"}
