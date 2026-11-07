import os
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models import Product, Shipment, Supplier, User, Port, Disruption

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


def test_new_user_has_clean_isolated_workspace(client):
    """
    Test 1: When a new user registers, they start with a completely empty workspace:
    0 products, 0 shipments, 0 recent shipments on dashboard, 0 personal alerts.
    """
    reg = client.post(
        "/auth/register",
        json={
            "email": "fresh_user@clean.io",
            "password": "Password123!",
            "full_name": "Fresh User",
            "company_name": "Fresh Goods Co",
        },
    ).json()
    token = reg["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Products must be empty
    prods = client.get("/products", headers=headers).json()
    assert prods == []

    # 2. Shipments must be empty
    ships = client.get("/shipments", headers=headers).json()
    assert ships == []

    # 3. Dashboard counts must be zero and recent_shipments must be empty
    dash = client.get("/dashboard", headers=headers).json()
    assert dash["company_name"] == "Fresh Goods Co"
    assert dash["products_count"] == 0
    assert dash["active_shipments_count"] == 0
    assert dash["pending_shipments_count"] == 0
    assert dash["recent_shipments"] == []

    # 4. Route alerts must be empty
    alerts = client.get("/alerts/me", headers=headers).json()
    assert alerts == []


def test_complete_data_isolation_between_suppliers(client):
    """
    Test 2: Two suppliers only see their own products, shipments, and dashboard stats.
    """
    # Register Supplier A
    reg_a = client.post(
        "/auth/register",
        json={
            "email": "alice@alpha.com",
            "password": "Password123!",
            "full_name": "Alice Alpha",
            "company_name": "Alpha Corp",
        },
    ).json()
    token_a = reg_a["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    # Register Supplier B
    reg_b = client.post(
        "/auth/register",
        json={
            "email": "bob@beta.com",
            "password": "Password123!",
            "full_name": "Bob Beta",
            "company_name": "Beta LLC",
        },
    ).json()
    token_b = reg_b["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # Alice creates Product A
    prod_a = client.post(
        "/products",
        headers=headers_a,
        json={
            "name": "Alpha Drone Part",
            "sku": "ALP-001",
            "unit_cost": 150.0,
            "packing_qty": 200,
            "weight_per_carton": 5.5,
            "default_origin_port": "Port of Valencia",
            "is_fragile": True,
        },
    ).json()

    # Alice creates Shipment A
    ship_a = client.post(
        "/shipments",
        headers=headers_a,
        json={
            "product_id": prod_a["id"],
            "quantity": 100,
            "origin_port": "Valencia",
            "destination_port": "New York",
            "carrier": "Hapag-Lloyd",
            "cost": 3400.0,
            "status": "in_transit",
        },
    ).json()

    # Bob creates Product B (using same SKU - should succeed because it's per-supplier!)
    prod_b = client.post(
        "/products",
        headers=headers_b,
        json={
            "name": "Beta Solar Inverter",
            "sku": "ALP-001",
            "unit_cost": 320.0,
        },
    ).json()

    # Bob creates Shipment B
    ship_b = client.post(
        "/shipments",
        headers=headers_b,
        json={
            "product_id": prod_b["id"],
            "quantity": 50,
            "origin_port": "Ningbo",
            "destination_port": "Rotterdam",
            "carrier": "Maersk",
            "cost": 4200.0,
            "status": "in_transit",
        },
    ).json()

    # Verification: Alice only sees Product A and Shipment A
    prods_alice = client.get("/products", headers=headers_a).json()
    assert len(prods_alice) == 1
    assert prods_alice[0]["name"] == "Alpha Drone Part"

    ships_alice = client.get("/shipments", headers=headers_a).json()
    assert len(ships_alice) == 1
    assert ships_alice[0]["id"] == ship_a["id"]
    assert ships_alice[0]["product_name"] == "Alpha Drone Part"

    # Verification: Bob only sees Product B and Shipment B
    prods_bob = client.get("/products", headers=headers_b).json()
    assert len(prods_bob) == 1
    assert prods_bob[0]["name"] == "Beta Solar Inverter"

    ships_bob = client.get("/shipments", headers=headers_b).json()
    assert len(ships_bob) == 1
    assert ships_bob[0]["id"] == ship_b["id"]
    assert ships_bob[0]["product_name"] == "Beta Solar Inverter"


def test_idor_protection_product_access_denied(client):
    """
    Test 3: IDOR prevention on products. Supplier B cannot read, update, or delete Supplier A's product.
    """
    reg_a = client.post(
        "/auth/register",
        json={
            "email": "owner@a.com",
            "password": "Password123!",
            "full_name": "Owner A",
            "company_name": "Company A",
        },
    ).json()
    token_a = reg_a["access_token"]
    headers_a = {"Authorization": f"Bearer {token_a}"}

    reg_b = client.post(
        "/auth/register",
        json={
            "email": "attacker@b.com",
            "password": "Password123!",
            "full_name": "Attacker B",
            "company_name": "Company B",
        },
    ).json()
    token_b = reg_b["access_token"]
    headers_b = {"Authorization": f"Bearer {token_b}"}

    # A creates a product
    prod_a = client.post(
        "/products",
        headers=headers_a,
        json={"name": "Proprietary Part", "sku": "SEC-01", "unit_cost": 99.0},
    ).json()
    prod_a_id = prod_a["id"]

    # Attacker B attempts to GET product A
    res_get = client.get(f"/products/{prod_a_id}", headers=headers_b)
    assert res_get.status_code == 404

    # Attacker B attempts to PUT product A
    res_put = client.put(
        f"/products/{prod_a_id}",
        headers=headers_b,
        json={"name": "Hacked Part Name"},
    )
    assert res_put.status_code == 404

    # Attacker B attempts to DELETE product A
    res_del = client.delete(f"/products/{prod_a_id}", headers=headers_b)
    assert res_del.status_code == 404

    # Verify product A was not modified or deleted
    res_verify = client.get(f"/products/{prod_a_id}", headers=headers_a)
    assert res_verify.status_code == 200
    assert res_verify.json()["name"] == "Proprietary Part"


def test_idor_protection_shipment_access_denied(client):
    """
    Test 4: IDOR prevention on shipments. Supplier B cannot read, update, delete, or hijack Supplier A's shipment.
    """
    reg_a = client.post(
        "/auth/register",
        json={
            "email": "owner_ship@a.com",
            "password": "Password123!",
            "full_name": "Ship Owner",
            "company_name": "Maritime A",
        },
    ).json()
    headers_a = {"Authorization": f"Bearer {reg_a['access_token']}"}

    reg_b = client.post(
        "/auth/register",
        json={
            "email": "intruder_ship@b.com",
            "password": "Password123!",
            "full_name": "Intruder",
            "company_name": "Maritime B",
        },
    ).json()
    headers_b = {"Authorization": f"Bearer {reg_b['access_token']}"}

    # A creates product & shipment
    prod_a = client.post(
        "/products",
        headers=headers_a,
        json={"name": "Cargo Box", "sku": "CAR-01", "unit_cost": 25.0},
    ).json()

    ship_a = client.post(
        "/shipments",
        headers=headers_a,
        json={
            "product_id": prod_a["id"],
            "quantity": 500,
            "origin_port": "Valencia",
            "destination_port": "New York",
        },
    ).json()
    ship_a_id = ship_a["id"]

    # Intruder B attempts to GET shipment A
    assert client.get(f"/shipments/{ship_a_id}", headers=headers_b).status_code == 404

    # Intruder B attempts to PUT shipment A
    assert (
        client.put(
            f"/shipments/{ship_a_id}",
            headers=headers_b,
            json={"status": "cancelled"},
        ).status_code
        == 404
    )

    # Intruder B attempts to DELETE shipment A
    assert client.delete(f"/shipments/{ship_a_id}", headers=headers_b).status_code == 404

    # Intruder B attempts to create a shipment with A's product_id
    res_hijack = client.post(
        "/shipments",
        headers=headers_b,
        json={"product_id": prod_a["id"], "quantity": 10},
    )
    assert res_hijack.status_code == 403


def test_unauthenticated_endpoints_rejected(client):
    """
    Test 5: Private endpoints reject unauthenticated access with 401.
    """
    assert client.get("/products").status_code == 401
    assert client.post("/products", json={"name": "A", "sku": "B", "unit_cost": 1}).status_code == 401
    assert client.get("/shipments").status_code == 401
    assert client.post("/shipments", json={"product_id": 1, "quantity": 1}).status_code == 401
    assert client.get("/dashboard").status_code == 401
    assert client.get("/alerts/me").status_code == 401

