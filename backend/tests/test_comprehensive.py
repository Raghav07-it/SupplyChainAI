import os
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models import Product, Shipment, Supplier, User, Port, Disruption, UserSettings, UserAlertInteraction

TEST_DATABASE_URL = "sqlite:///:memory:"

test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine
)


@pytest.fixture(name="db_session", autouse=True)
def db_session_fixture():
    Base.metadata.create_all(bind=test_engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=test_engine)


@pytest.fixture(name="client")
def client_fixture(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    app.dependency_overrides.clear()


def register_user(client, email, company, full_name="Test Operator"):
    res = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "Password123!",
            "full_name": full_name,
            "company_name": company,
        },
    )
    assert res.status_code == 201, res.text
    data = res.json()
    token = data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return data["user"], headers


def test_user_settings_lifecycle(client):
    """Test getting and updating user settings preferences."""
    _, headers = register_user(client, "pref_user@test.io", "Pref Inc")

    # Initial settings auto-created
    res = client.get("/settings", headers=headers)
    assert res.status_code == 200
    settings = res.json()
    assert settings["email_notifications"] is True
    assert settings["sms_alerts"] is False
    assert settings["digest_frequency"] == "daily"

    # Update settings
    up_res = client.put(
        "/settings",
        headers=headers,
        json={
            "sms_alerts": True,
            "digest_frequency": "realtime",
            "compact_view": True,
        },
    )
    assert up_res.status_code == 200
    updated = up_res.json()
    assert updated["sms_alerts"] is True
    assert updated["digest_frequency"] == "realtime"
    assert updated["compact_view"] is True


def test_user_profile_update(client):
    """Test updating user profile and associated supplier company name."""
    _, headers = register_user(client, "profile_user@test.io", "Old Corp", "Old Name")

    res = client.put(
        "/auth/profile",
        headers=headers,
        json={
            "full_name": "New Name",
            "company_name": "New Global Logistics",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["full_name"] == "New Name"
    assert data["company_name"] == "New Global Logistics"

    # Check /auth/me reflects the update
    me_res = client.get("/auth/me", headers=headers)
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["full_name"] == "New Name"
    assert me_data["company_name"] == "New Global Logistics"


def test_password_change_flow(client):
    """Test changing password with current password verification."""
    _, headers = register_user(client, "security_user@test.io", "Sec Corp")

    # Bad current password
    bad_res = client.put(
        "/auth/change-password",
        headers=headers,
        json={
            "current_password": "WrongPassword999!",
            "new_password": "BrandNewPassword123!",
        },
    )
    assert bad_res.status_code == 400
    assert "incorrect" in bad_res.json()["detail"].lower()

    # Successful password change
    ok_res = client.put(
        "/auth/change-password",
        headers=headers,
        json={
            "current_password": "Password123!",
            "new_password": "BrandNewPassword123!",
        },
    )
    assert ok_res.status_code == 200

    # Old password fails login
    fail_login = client.post(
        "/auth/login",
        json={"email": "security_user@test.io", "password": "Password123!"},
    )
    assert fail_login.status_code == 401

    # New password succeeds login
    success_login = client.post(
        "/auth/login",
        json={"email": "security_user@test.io", "password": "BrandNewPassword123!"},
    )
    assert success_login.status_code == 200


def test_global_search_tenant_scoping(client, db_session):
    """Test global search correctly scopes shipments and products to current user."""
    u1, h1 = register_user(client, "search1@test.io", "Alpha Logistics")
    u2, h2 = register_user(client, "search2@test.io", "Beta Trans")

    # Add product for user 1
    prod1 = client.post(
        "/products",
        headers=h1,
        json={
            "sku": "CERAMIC-ALPHA-99",
            "name": "Glazed Tile Floor",
            "category": "Ceramics",
            "unit_price": 45.0,
            "packing_qty": 200,
            "default_origin_port": "INMUM",
        },
    ).json()

    # Add shipment for user 1
    client.post(
        "/shipments",
        headers=h1,
        json={
            "product_id": prod1["id"],
            "quantity": 100,
            "origin_port": "INMUM",
            "destination_port": "NLRTM",
            "carrier": "Maersk Line",
            "route_type": "Express",
            "cost": 4200.0,
            "status": "in_transit",
        },
    )

    # Add product for user 2
    client.post(
        "/products",
        headers=h2,
        json={
            "sku": "CERAMIC-BETA-77",
            "name": "Beta Mosaic Slabs",
            "category": "Ceramics",
            "unit_price": 50.0,
            "packing_qty": 150,
            "default_origin_port": "AEDXB",
        },
    )

    # Search for "CERAMIC" as User 1 -> should only find User 1's product
    s1 = client.get("/search?q=CERAMIC", headers=h1)
    assert s1.status_code == 200
    res1 = s1.json()
    product_titles = [r["title"] for r in res1["results"] if r["category"] == "product"]
    assert "Glazed Tile Floor" in product_titles
    assert "Beta Mosaic Slabs" not in product_titles

    # Search for "CERAMIC" as User 2 -> should only find User 2's product
    s2 = client.get("/search?q=CERAMIC", headers=h2)
    assert s2.status_code == 200
    res2 = s2.json()
    product_titles_2 = [r["title"] for r in res2["results"] if r["category"] == "product"]
    assert "Beta Mosaic Slabs" in product_titles_2
    assert "Glazed Tile Floor" not in product_titles_2


def test_alert_interactions_persistence(client, db_session):
    """Test acknowledging and toggling read status on route alerts."""
    _, headers = register_user(client, "alerts_user@test.io", "Alert Corp")

    # Acknowledge all alerts
    ack_all = client.post("/alerts/acknowledge-all", headers=headers)
    assert ack_all.status_code == 200

    # Single alert read toggle
    read_toggle = client.post("/alerts/ALT-TEST-1/read", headers=headers)
    assert read_toggle.status_code == 200
    assert read_toggle.json()["is_read"] is True

    # Toggle again
    unread_toggle = client.post("/alerts/ALT-TEST-1/read", headers=headers)
    assert unread_toggle.status_code == 200
    assert unread_toggle.json()["is_read"] is False


def test_agent_run_workflow_endpoint(client):
    """Test AI multi-agent workflow endpoint execution."""
    _, headers = register_user(client, "agent_user@test.io", "Agent Corp")

    res = client.post(
        "/agents/run-workflow",
        headers=headers,
        json={
            "event_text": "Port of Mumbai is facing heavy swells and crane delays of 48 hours.",
            "origin_port_code": "INMUM",
            "destination_port_code": "NLRTM",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "COMPLETED"
    assert "signal" in data
    assert data["signal"]["port_code"] == "INMUM"
    assert "risk" in data
    assert "disruption_probability" in data["risk"]
    assert "historical_matches" in data
    assert "recommendation" in data
    assert "trade_offs" in data["recommendation"]
    assert data["recommendation"]["human_in_the_loop"] is True

