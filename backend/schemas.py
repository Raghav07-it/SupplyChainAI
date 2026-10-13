from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Any

from pydantic import field_validator


# ============================================================
# SUPPLIER SCHEMAS
# ============================================================

class SupplierCreate(BaseModel):
    name: str = Field(min_length=1)
    contact_email: str | None = None
    phone: str | None = None
    country: str | None = None


class SupplierResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    contact_email: str | None = None
    phone: str | None = None
    country: str | None = None


# ============================================================
# PRODUCT SCHEMAS
# ============================================================

class ProductCreate(BaseModel):
    name: str = Field(min_length=1)
    sku: str = Field(min_length=1)
    supplier_id: int
    unit_price: float = Field(ge=0)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    sku: str
    supplier_id: int
    unit_cost: float


# ============================================================
# WAREHOUSE SCHEMAS
# ============================================================

class WarehouseCreate(BaseModel):
    name: str = Field(min_length=1)
    location: str = Field(min_length=1)
    capacity: float = Field(ge=0)


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
    quantity: int = Field(ge=0)


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
    supplier_id: int
    warehouse_id: int
    quantity: int = Field(gt=0)


class ShipmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    supplier_id: int
    warehouse_id: int
    quantity: int


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