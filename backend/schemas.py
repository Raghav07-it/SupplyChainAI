from pydantic import BaseModel, ConfigDict
from datetime import date

class SupplierCreate(BaseModel):
    name: str
    contact_email: str | None = None


class SupplierResponse(SupplierCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)




class ProductCreate(BaseModel):
    name: str
    sku: str
    unit_cost: float
    supplier_id: int


class ProductResponse(ProductCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)



class WarehouseCreate(BaseModel):
    name: str
    location: str


class WarehouseResponse(WarehouseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class InventoryCreate(BaseModel):
    product_id: int
    warehouse_id: int
    quantity_on_hand: int
    reorder_level: int = 10


class InventoryResponse(InventoryCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class ShipmentCreate(BaseModel):
    product_id: int
    supplier_id: int
    warehouse_id: int
    quantity: int
    status: str = "pending"
    expected_arrival: date | None = None


class ShipmentResponse(ShipmentCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)