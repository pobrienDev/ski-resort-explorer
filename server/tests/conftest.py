"""Shared fixtures.

Unit tests (test_api.py) mock the database layer and need no MySQL.
Integration tests (test_data.py) load server/skiresorts.sql into a throwaway
database named by TEST_DB_NAME (default SkiResorts_test) using DB_HOST /
DB_USER / DB_PASSWORD, and are skipped when that server is unreachable.
"""
import os
import re
import sys
from pathlib import Path

import pytest

SERVER_DIR = Path(__file__).resolve().parents[1]
DUMP_PATH = SERVER_DIR / "skiresorts.sql"
TEST_DB_NAME = os.environ.get("TEST_DB_NAME", "SkiResorts_test")

# Point the app at the test database before main.py reads its config.
os.environ["DB_NAME"] = TEST_DB_NAME
os.environ.setdefault("OPENWEATHER_API_KEY", "")
sys.path.insert(0, str(SERVER_DIR))

import main  # noqa: E402


@pytest.fixture
def client():
    main.app.config["TESTING"] = True
    with main.app.test_client() as c:
        yield c


def _split_statements(sql_text):
    """Split a mysqldump file into statements. Statements end with ';' at end of line."""
    buf = []
    for line in sql_text.splitlines():
        if not buf and (not line.strip() or line.startswith("--")):
            continue
        buf.append(line)
        if line.rstrip().endswith(";"):
            yield "\n".join(buf)
            buf = []
    if buf:
        yield "\n".join(buf)


@pytest.fixture(scope="session")
def test_db():
    """Create TEST_DB_NAME from the dump and return a connection to it."""
    mysql = pytest.importorskip("mysql.connector")
    server_cfg = {k: v for k, v in main.DB_CONFIG.items() if k != "database"}
    try:
        admin = mysql.connect(**server_cfg)
    except mysql.Error as err:
        pytest.skip(f"MySQL not reachable for integration tests: {err}")
    cur = admin.cursor()
    cur.execute(f"DROP DATABASE IF EXISTS `{TEST_DB_NAME}`")
    cur.execute(f"CREATE DATABASE `{TEST_DB_NAME}`")
    admin.commit()
    cur.close()
    admin.close()

    conn = mysql.connect(**server_cfg, database=TEST_DB_NAME)
    cur = conn.cursor()
    for stmt in _split_statements(DUMP_PATH.read_text(encoding="utf-8")):
        cur.execute(stmt)
    conn.commit()
    cur.close()
    yield conn
    conn.close()


@pytest.fixture(scope="session")
def resorts(test_db):
    """All resort rows joined to their location and country, as dicts."""
    cur = test_db.cursor(dictionary=True)
    cur.execute(
        """
        SELECT sr.*, st.state_name, st.countryID, c.country_name
        FROM ski_resorts sr
        LEFT JOIN states_terr st ON st.stateID = sr.stateID
        LEFT JOIN countries c ON c.countryID = st.countryID
        """
    )
    rows = cur.fetchall()
    cur.close()
    return rows
