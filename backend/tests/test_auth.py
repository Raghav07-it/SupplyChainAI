import os
os.environ["TESTING"] = "1"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models import Product, Supplier, User

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


def test_register_success(client):
    payload = {
        "email": "elena@acmeceramics.com",
        "password": "StrongPassword123",
        "full_name": "Elena Rostova",
        "company_name": "Acme Ceramics Ltd",
    }
    response = client.post("/auth/register", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "elena@acmeceramics.com"
    assert data["user"]["company_name"] == "Acme Ceramics Ltd"
    assert data["user"]["role"] == "supplier"
    assert "password_hash" not in data["user"]


def test_register_duplicate_email(client):
    payload = {
        "email": "duplicate@test.com",
        "password": "Password123",
        "full_name": "Test User",
        "company_name": "Company One",
    }
    res1 = client.post("/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()


def test_login_success(client):
    reg_payload = {
        "email": "login_user@test.com",
        "password": "MySecretPass888",
        "full_name": "Login User",
        "company_name": "Login Logistics",
    }
    client.post("/auth/register", json=reg_payload)

    login_payload = {
        "email": "login_user@test.com",
        "password": "MySecretPass888",
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login_user@test.com"
    assert data["user"]["company_name"] == "Login Logistics"
    assert "password_hash" not in data["user"]


def test_login_wrong_password(client):
    reg_payload = {
        "email": "wrong_pw@test.com",
        "password": "CorrectPassword123",
        "full_name": "Test Person",
        "company_name": "Test Org",
    }
    client.post("/auth/register", json=reg_payload)

    login_payload = {
        "email": "wrong_pw@test.com",
        "password": "WrongPassword999",
    }
    response = client.post("/auth/login", json=login_payload)
    assert response.status_code == 401
    assert "invalid" in response.json()["detail"].lower()


def test_auth_me_without_token_returns_401(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert "authenticated" in response.json()["detail"].lower()


def test_supplier_a_cannot_read_supplier_b_products(client):
    # 1. Register Supplier A
    reg_a = client.post(
        "/auth/register",
        json={
            "email": "supplier_a@test.com",
            "password": "PasswordAAA123",
            "full_name": "Alice A",
            "company_name": "Company A Inc",
        },
    ).json()
    token_a = reg_a["access_token"]
    sup_a_id = reg_a["user"]["supplier_id"]

    # 2. Register Supplier B
    reg_b = client.post(
        "/auth/register",
        json={
            "email": "supplier_b@test.com",
            "password": "PasswordBBB123",
            "full_name": "Bob B",
            "company_name": "Company B Corp",
        },
    ).json()
    token_b = reg_b["access_token"]
    sup_b_id = reg_b["user"]["supplier_id"]

    # 3. Create Product for Supplier A
    prod_a_res = client.post(
        "/products",
        headers={"Authorization": f"Bearer {token_a}"},
        json={
            "name": "Supplier A Product",
            "sku": "SKU-AAA-01",
            "unit_cost": 45.0,
            "supplier_id": sup_a_id,
        },
    )
    assert prod_a_res.status_code == 201

    # 4. Create Product for Supplier B
    prod_b_res = client.post(
        "/products",
        headers={"Authorization": f"Bearer {token_b}"},
        json={
            "name": "Supplier B Product",
            "sku": "SKU-BBB-02",
            "unit_cost": 99.0,
            "supplier_id": sup_b_id,
        },
    )
    assert prod_b_res.status_code == 201

    # 5. Supplier A lists products -> should only see Product A
    list_a = client.get(
        "/products",
        headers={"Authorization": f"Bearer {token_a}"},
    )
    assert list_a.status_code == 200
    products_a = list_a.json()
    skus_a = [p["sku"] for p in products_a]
    assert "SKU-AAA-01" in skus_a
    assert "SKU-BBB-02" not in skus_a

    # 6. Supplier B lists products -> should only see Product B
    list_b = client.get(
        "/products",
        headers={"Authorization": f"Bearer {token_b}"},
    )
    assert list_b.status_code == 200
    products_b = list_b.json()
    skus_b = [p["sku"] for p in products_b]
    assert "SKU-BBB-02" in skus_b
    assert "SKU-AAA-01" not in skus_b


def test_dashboard_scoped_to_supplier(client):
    # Register Supplier 1
    reg_1 = client.post(
        "/auth/register",
        json={
            "email": "org1@test.com",
            "password": "Password123!",
            "full_name": "Org 1 Admin",
            "company_name": "First Supplier Co",
        },
    ).json()
    token_1 = reg_1["access_token"]
    sup_1_id = reg_1["user"]["supplier_id"]

    # Register Supplier 2
    reg_2 = client.post(
        "/auth/register",
        json={
            "email": "org2@test.com",
            "password": "Password123!",
            "full_name": "Org 2 Admin",
            "company_name": "Second Supplier Co",
        },
    ).json()
    token_2 = reg_2["access_token"]

    # Add a product to Supplier 1 only
    client.post(
        "/products",
        headers={"Authorization": f"Bearer {token_1}"},
        json={
            "name": "Org 1 Ceramic Mug",
            "sku": "MUG-001",
            "unit_cost": 5.0,
            "supplier_id": sup_1_id,
        },
    )

    # Dashboard for Supplier 1
    dash_1 = client.get("/dashboard", headers={"Authorization": f"Bearer {token_1}"}).json()
    assert dash_1["company_name"] == "First Supplier Co"
    assert dash_1["products_count"] == 1

    # Dashboard for Supplier 2
    dash_2 = client.get("/dashboard", headers={"Authorization": f"Bearer {token_2}"}).json()
    assert dash_2["company_name"] == "Second Supplier Co"
    assert dash_2["products_count"] == 0

