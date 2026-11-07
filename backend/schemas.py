from pydantic import BaseModel, ConfigDict, Field, field_validator
from datetime import datetime
from typing import Any
import re

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


# ============================================================
# AUTH SCHEMAS
# ============================================================

class UserRegisterRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)
    full_name: str = Field(min_length=1)
    company_name: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email format")
        return clean


class UserLoginRequest(BaseModel):
    email: str
    password: str = Field(min_length=1)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        clean = v.strip().lower()
        if not EMAIL_REGEX.match(clean):
            raise ValueError("Invalid email format")
        return clean


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: str
    created_at: datetime
    supplier_id: int | None = None
    company_name: str | None = None


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class DashboardStatsResponse(BaseModel):
    company_name: str
    supplier_id: int | None = None
    role: str
    products_count: int
    active_shipments_count: int
    pending_shipments_count: int
    inventory_items_count: int
    recent_shipments: list[dict[str, Any]] = []


# ============================================================
# SUPPLIER SCHEMAS
# ============================================================

class SupplierCreate(BaseModel):
    name: str = Field(min_length=1)
    contact_email: str | None = None
    phone: str | None = None
    country: str | None = None
    user_id: int | None = None


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    contact_email: str | None = None
    phone: str | None = None
    country: str | None = None
    user_id: int | None = None


# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    sku: str = Field(min_length=1)
    supplier_id: int | None = None
    unit_cost: float = Field(ge=0)
    packing_qty: int | None = 500
    weight_per_carton: float | None = 10.0
    default_origin_port: str | None = None
    is_fragile: bool | None = False


class ProductUpdate(BaseModel):
    name: str | None = None
    sku: str | None = None
    unit_cost: float | None = Field(default=None, ge=0)
    packing_qty: int | None = None
    weight_per_carton: float | None = None
    default_origin_port: str | None = None
    is_fragile: bool | None = None


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    supplier_id: int
    unit_cost: float
    packing_qty: int | None = 500
    weight_per_carton: float | None = 10.0
    default_origin_port: str | None = None
    is_fragile: bool | None = False
    created_at: datetime | None = None


# ============================================================
# WAREHOUSE SCHEMAS
# ============================================================

class WarehouseCreate(BaseModel):
    name: str = Field(min_length=1)
    location: str = Field(min_length=1)
    capacity: float | None = None


class WarehouseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    location: str


# ============================================================
# INVENTORY SCHEMAS
# ============================================================

class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity_on_hand: int = Field(ge=0, default=0)
    reorder_level: int = Field(ge=0, default=10)


class InventoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    warehouse_id: int
    quantity_on_hand: int
    reorder_level: int


# ============================================================
# SHIPMENT SCHEMAS
# ============================================================

class ShipmentCreate(BaseModel):
    product_id: int
    supplier_id: int | None = None
    warehouse_id: int | None = None
    quantity: int = Field(gt=0, default=1)
    status: str = "in_transit"
    origin_port: str | None = None
    destination_port: str | None = None
    carrier: str | None = None
    route_type: str | None = None
    cost: float | None = None
    tracking_number: str | None = None
    expected_arrival: str | None = None


class ShipmentUpdate(BaseModel):
    quantity: int | None = Field(default=None, gt=0)
    status: str | None = None
    origin_port: str | None = None
    destination_port: str | None = None
    carrier: str | None = None
    route_type: str | None = None
    cost: float | None = None
    expected_arrival: str | None = None


class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    product_name: str | None = None
    supplier_id: int
    warehouse_id: int | None = None
    quantity: int
    status: str
    origin_port: str | None = None
    destination_port: str | None = None
    carrier: str | None = None
    route_type: str | None = None
    cost: float | None = None
    tracking_number: str | None = None
    expected_arrival: Any | None = None
    created_at: datetime


# ============================================================
# ROUTING SCHEMAS
# ============================================================

class RouteQuery(BaseModel):
    origin: str = Field(min_length=1)
    destination: str = Field(min_length=1)


class RouteResponse(BaseModel):
    route: list[str]
    total_cost: float
    total_distance_km: float
    total_time_hours: float
    total_risk_score: float = 0.0


class WeightedRouteQuery(BaseModel):
    origin: str = Field(min_length=1)
    destination: str = Field(min_length=1)

    cost_weight: float = Field(default=0.4, ge=0)
    time_weight: float = Field(default=0.3, ge=0)
    distance_weight: float = Field(default=0.3, ge=0)
    risk_weight: float = Field(default=0.0, ge=0)


class DisruptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    event_code: str
    port_id: int
    disruption_type: str
    severity: str
    status: str
    started_at: datetime
    ended_at: datetime | None
    estimated_delay_hours: float
    estimated_cost_impact_usd: float
    capacity_impact_percent: float
    description: str
    source: str
    is_synthetic: bool


class DisruptionListResponse(BaseModel):
    total: int
    items: list[DisruptionResponse]


class BaselineRiskResponse(BaseModel):
    port_code: str
    risk_score: float = Field(ge=0, le=100)
    risk_level: str
    explanation: list[str]
    disruption_count: int


# ============================================================
# ML PREDICTION SCHEMAS (PHASE 5)
# ============================================================

class MLPredictionRequest(BaseModel):
    port_code: str = Field(..., min_length=1, examples=["INMUM"])
    disruption_type: str = Field(..., min_length=1, examples=["severe_weather"])
    capacity_impact_percent: float = Field(..., ge=0, le=100, examples=[45.0])
    estimated_delay_hours: float = Field(..., ge=0, examples=[24.0])
    estimated_cost_impact_usd: float = Field(..., ge=0, examples=[50000.0])


class MLPredictionResponse(BaseModel):
    predicted_severity: str
    confidence_scores: dict[str, float]
    is_synthetic_demo: bool = True
    inputs: dict[str, Any]
    baseline_comparison: dict[str, Any]
    disclaimer: str


class MLModelInfoResponse(BaseModel):
    dataset: dict[str, Any]
    model: dict[str, Any]
    evaluation: dict[str, Any]
    baseline_comparison: dict[str, Any]
    disclaimer: str
