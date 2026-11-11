import pytest
from fastapi.testclient import TestClient
import uuid

from main import app

client = TestClient(app)


def test_shipment_validation_and_route_alerts():
    # 1. Register a test supplier
    unique_suffix = uuid.uuid4().hex[:6]
    email = f"ceramics_{unique_suffix}@acme.com"
    password = "StrongPassword123!"

    reg_resp = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": password,
            "full_name": "Elena Rostova",
            "company_name": f"Acme Ceramics {unique_suffix} Ltd",
        },
    )
    assert reg_resp.status_code == 201
    token = reg_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Add product (Image 1 match)
    prod_resp = client.post(
        "/products",
        headers=headers,
        json={
            "name": "Porcelain Espresso Cups",
            "sku": f"AC-CUP-{unique_suffix[:4]}",
            "unit_cost": 6.80,
            "packing_qty": 480,
            "weight_per_carton": 11.2,
            "default_origin_port": "Port of Ningbo-Zhoushan (China)",
            "is_fragile": True,
        },
    )
    assert prod_resp.status_code == 201
    product = prod_resp.json()
    assert product["name"] == "Porcelain Espresso Cups"
    product_id = product["id"]

    # 3. Test shipment quantity validation (quantity <= 0 must fail)
    invalid_qty_resp = client.post(
        "/shipments",
        headers=headers,
        json={
            "product_id": product_id,
            "quantity": 0,
            "origin_port": "Port of Valencia (Spain)",
            "destination_port": "Port of New York / New Jersey",
        },
    )
    assert invalid_qty_resp.status_code in (400, 422)

    # 4. Test identical origin & destination validation (must fail)
    same_port_resp = client.post(
        "/shipments",
        headers=headers,
        json={
            "product_id": product_id,
            "quantity": 800,
            "origin_port": "Port of Valencia (Spain)",
            "destination_port": "Port of Valencia (Spain)",
        },
    )
    assert same_port_resp.status_code == 400
    assert "cannot be identical" in same_port_resp.json()["detail"].lower()

    # 5. Create valid shipment (Image 2 match: 800 crates, Valencia to NY/NJ)
    shipment_resp = client.post(
        "/shipments",
        headers=headers,
        json={
            "product_id": product_id,
            "quantity": 800,
            "origin_port": "Port of Valencia (Spain)",
            "destination_port": "Port of New York / New Jersey",
            "carrier": "Maersk Line",
            "route_type": "Safest Route",
            "cost": 3980.0,
            "status": "in_transit",
            "expected_arrival": "2025-11-28",
        },
    )
    assert shipment_resp.status_code in (200, 201)
    created_shipment = shipment_resp.json()
    assert created_shipment["quantity"] == 800
    assert created_shipment["carrier"] == "Maersk Line"

    # 6. Verify dashboard stats reflect the newly created shipment and product
    dash_resp = client.get("/dashboard", headers=headers)
    assert dash_resp.status_code == 200
    stats = dash_resp.json()
    assert stats["products_count"] == 1
    assert stats["active_shipments_count"] == 1

    # 7. Test route alerts endpoint and acknowledgement
    alerts_resp = client.get("/alerts/me", headers=headers)
    assert alerts_resp.status_code == 200
    alerts = alerts_resp.json()
    assert len(alerts) > 0

    first_alert = alerts[0]
    alert_id = first_alert["id"]

    # Acknowledge the alert
    ack_resp = client.post(f"/alerts/{alert_id}/acknowledge", headers=headers)
    assert ack_resp.status_code == 200
    assert ack_resp.json()["is_acknowledged"] is True

    # 8. Test live supply chain news intelligence fallback
    news_resp = client.get("/live/news?max_results=5", headers=headers)
    assert news_resp.status_code == 200
    news_data = news_resp.json()
    assert len(news_data["articles"]) > 0
    first_article = news_data["articles"][0]
    assert "operational_impact" in first_article
    assert first_article["operational_impact"] is not None
