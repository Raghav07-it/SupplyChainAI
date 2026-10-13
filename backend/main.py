from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session
from disruptions.router import router as disruptions_router
from vector_memory.router import router as vector_memory_router
from agents.agent_router import router as agent_router



from live_intelligence.router import (
    router as live_intelligence_router,
)

from database import Base, engine, get_db
from models import (
    Disruption,
    Inventory,
    Port,
    Product,
    Route,
    Shipment,
    Supplier,
    Warehouse,
)
from schemas import (
    InventoryCreate,
    InventoryResponse,
    ProductCreate,
    ProductResponse,
    ShipmentCreate,
    ShipmentResponse,
    SupplierCreate,
    SupplierResponse,
    WarehouseCreate,
    WarehouseResponse,
)
from routing.router import router as routing_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="SupplyChainAI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(routing_router)

app.include_router(disruptions_router)

app.include_router(vector_memory_router)

app.include_router(live_intelligence_router)

app.include_router(agent_router)

@app.get("/")
def home():
    return {"message": "SupplyChainAI API is running"}


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"database": "connected"}


@app.get("/health/tables")
def database_tables():
    return {"tables": inspect(engine).get_table_names()}


@app.post(
    "/suppliers",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_supplier(supplier_data: SupplierCreate, db: Session = Depends(get_db)):
    existing_supplier = db.scalar(
        select(Supplier).where(Supplier.name == supplier_data.name)
    )

    if existing_supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A supplier with this name already exists.",
        )

    supplier = Supplier(**supplier_data.model_dump())
    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@app.get("/suppliers", response_model=list[SupplierResponse])
def list_suppliers(db: Session = Depends(get_db)):
    return db.scalars(select(Supplier).order_by(Supplier.id)).all()


@app.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(product_data: ProductCreate, db: Session = Depends(get_db)):
    supplier = db.get(Supplier, product_data.supplier_id)

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    existing_product = db.scalar(
        select(Product).where(
            (Product.name == product_data.name) | (Product.sku == product_data.sku)
        )
    )

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A product with this name or SKU already exists.",
        )

    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@app.get("/products", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.scalars(select(Product).order_by(Product.id)).all()



@app.post(
    "/warehouses",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_warehouse(
    warehouse_data: WarehouseCreate,
    db: Session = Depends(get_db),
):
    existing_warehouse = db.scalar(
        select(Warehouse).where(Warehouse.name == warehouse_data.name)
    )

    if existing_warehouse:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A warehouse with this name already exists.",
        )

    warehouse = Warehouse(**warehouse_data.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return warehouse


@app.get("/warehouses", response_model=list[WarehouseResponse])
def list_warehouses(db: Session = Depends(get_db)):
    return db.scalars(select(Warehouse).order_by(Warehouse.id)).all()



@app.post(
    "/inventory",
    response_model=InventoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory(
    inventory_data: InventoryCreate,
    db: Session = Depends(get_db),
):
    product = db.get(Product, inventory_data.product_id)
    warehouse = db.get(Warehouse, inventory_data.warehouse_id)

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Warehouse not found.",
        )

    existing_inventory = db.scalar(
        select(Inventory).where(
            Inventory.product_id == inventory_data.product_id,
            Inventory.warehouse_id == inventory_data.warehouse_id,
        )
    )

    if existing_inventory:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inventory already exists for this product and warehouse.",
        )

    inventory = Inventory(**inventory_data.model_dump())
    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


@app.get("/inventory", response_model=list[InventoryResponse])
def list_inventory(db: Session = Depends(get_db)):
    return db.scalars(select(Inventory).order_by(Inventory.id)).all()

@app.post(
    "/shipments",
    response_model=ShipmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shipment(
    shipment_data: ShipmentCreate,
    db: Session = Depends(get_db),
):
    product = db.get(Product, shipment_data.product_id)
    supplier = db.get(Supplier, shipment_data.supplier_id)
    warehouse = db.get(Warehouse, shipment_data.warehouse_id)

    if not product or not supplier or not warehouse:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product, supplier, or warehouse not found.",
        )

    if product.supplier_id != supplier.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This product does not belong to the selected supplier.",
        )

    shipment = Shipment(**shipment_data.model_dump())
    db.add(shipment)
    db.commit()
    db.refresh(shipment)

    return shipment


@app.get("/shipments", response_model=list[ShipmentResponse])
def list_shipments(db: Session = Depends(get_db)):
    return db.scalars(select(Shipment).order_by(Shipment.id)).all()