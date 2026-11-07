import os
from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select, text
from sqlalchemy.orm import Session

from database import Base, engine, get_db
from models import (
    Disruption,
    Inventory,
    Port,
    Product,
    Route,
    Shipment,
    Supplier,
    User,
    Warehouse,
)
from schemas import (
    AuthResponse,
    DashboardStatsResponse,
    InventoryCreate,
    InventoryResponse,
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ShipmentCreate,
    ShipmentResponse,
    ShipmentUpdate,
    SupplierCreate,
    SupplierResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
    WarehouseCreate,
    WarehouseResponse,
)
from auth import (
    create_access_token,
    get_current_user,
    get_supplier_for_user,
    hash_password,
    verify_password,
)

from disruptions.router import router as disruptions_router
from vector_memory.router import router as vector_memory_router
from agents.agent_router import router as agent_router
from live_intelligence.router import router as live_intelligence_router
from routing.router import router as routing_router


def run_db_migrations():
    if os.getenv("TESTING") == "1":
        return
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            conn.execute(
                text(
                    """
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        email VARCHAR(255) NOT NULL UNIQUE,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(150) NOT NULL,
                        role VARCHAR(20) NOT NULL DEFAULT 'supplier',
                        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
                    );
                    CREATE INDEX IF NOT EXISTS ix_users_email ON users(email);
                    ALTER TABLE suppliers ADD COLUMN IF NOT EXISTS user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE SET NULL;
                    
                    ALTER TABLE products ADD COLUMN IF NOT EXISTS packing_qty INTEGER DEFAULT 500;
                    ALTER TABLE products ADD COLUMN IF NOT EXISTS weight_per_carton FLOAT DEFAULT 10.0;
                    ALTER TABLE products ADD COLUMN IF NOT EXISTS default_origin_port VARCHAR(150);
                    ALTER TABLE products ADD COLUMN IF NOT EXISTS is_fragile BOOLEAN DEFAULT FALSE;
                    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_sku_key;
                    ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_key;

                    ALTER TABLE shipments ALTER COLUMN warehouse_id DROP NOT NULL;
                    ALTER TABLE shipments ADD COLUMN IF NOT EXISTS origin_port VARCHAR(150);
                    ALTER TABLE shipments ADD COLUMN IF NOT EXISTS destination_port VARCHAR(150);
                    ALTER TABLE shipments ADD COLUMN IF NOT EXISTS carrier VARCHAR(100);
                    ALTER TABLE shipments ADD COLUMN IF NOT EXISTS route_type VARCHAR(50);
                    ALTER TABLE shipments ADD COLUMN IF NOT EXISTS cost NUMERIC(12, 2);
                    ALTER TABLE shipments ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50);
                    """
                )
            )
            conn.commit()
    except Exception:
        # Gracefully handle DB offline or permissions during startup/collection
        pass


@asynccontextmanager
async def lifespan(app: FastAPI):
    run_db_migrations()
    yield


app = FastAPI(title="ChainSight-AI API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
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


# ============================================================
# PUBLIC HEALTH ENDPOINTS
# ============================================================

@app.get("/")
def home():
    return {"message": "ChainSight-AI API is running"}


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))
    return {"database": "connected"}


@app.get("/health/tables")
def database_tables():
    return {"tables": inspect(engine).get_table_names()}


# ============================================================
# AUTHENTICATION ENDPOINTS
# ============================================================

@app.post(
    "/auth/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
def register(data: UserRegisterRequest, db: Session = Depends(get_db)):
    # 1. Email format and length validated by Pydantic EmailStr and min_length
    email_clean = str(data.email).strip().lower()

    # 2. Check duplicate email
    existing_user = db.scalar(select(User).where(User.email == email_clean))
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    # 3. Hash password
    pw_hash = hash_password(data.password)

    # 4. Create User
    new_user = User(
        email=email_clean,
        password_hash=pw_hash,
        full_name=data.full_name.strip(),
        role="supplier",
    )
    db.add(new_user)
    db.flush()  # Populates new_user.id

    # 5. Create or associate Supplier using company_name
    comp_name = data.company_name.strip()
    existing_supplier = db.scalar(select(Supplier).where(Supplier.name == comp_name))

    if existing_supplier:
        if existing_supplier.user_id is None:
            existing_supplier.user_id = new_user.id
            existing_supplier.contact_email = email_clean
            supplier = existing_supplier
        else:
            # Supplier name already registered with another user; make a unique company handle
            supplier = Supplier(
                name=f"{comp_name} ({new_user.id})",
                contact_email=email_clean,
                user_id=new_user.id,
            )
            db.add(supplier)
    else:
        supplier = Supplier(
            name=comp_name,
            contact_email=email_clean,
            user_id=new_user.id,
        )
        db.add(supplier)

    db.commit()
    db.refresh(new_user)
    db.refresh(supplier)

    # 6. Issue access token
    token = create_access_token(
        {"sub": str(new_user.id), "email": new_user.email, "role": new_user.role}
    )

    user_resp = UserResponse(
        id=new_user.id,
        email=new_user.email,
        full_name=new_user.full_name,
        role=new_user.role,
        created_at=new_user.created_at,
        supplier_id=supplier.id,
        company_name=supplier.name,
    )

    return AuthResponse(access_token=token, token_type="bearer", user=user_resp)


@app.post("/auth/login", response_model=AuthResponse)
def login(data: UserLoginRequest, db: Session = Depends(get_db)):
    email_clean = str(data.email).strip().lower()
    user = db.scalar(select(User).where(User.email == email_clean))

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    supplier = get_supplier_for_user(user, db)

    token = create_access_token(
        {"sub": str(user.id), "email": user.email, "role": user.role}
    )

    user_resp = UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role,
        created_at=user.created_at,
        supplier_id=supplier.id if supplier else None,
        company_name=supplier.name if supplier else user.full_name,
    )

    return AuthResponse(access_token=token, token_type="bearer", user=user_resp)


@app.get("/auth/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    supplier = get_supplier_for_user(current_user, db)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        role=current_user.role,
        created_at=current_user.created_at,
        supplier_id=supplier.id if supplier else None,
        company_name=supplier.name if supplier else current_user.full_name,
    )


# ============================================================
# PROTECTED DASHBOARD ENDPOINT
# ============================================================

@app.get("/dashboard", response_model=DashboardStatsResponse)
def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        products = db.scalars(select(Product)).all()
        shipments = db.scalars(select(Shipment)).all()
        inventory = db.scalars(select(Inventory)).all()
        comp_name = "System Administration"
        sup_id = None
    else:
        supplier = get_supplier_for_user(current_user, db)
        if not supplier:
            return DashboardStatsResponse(
                company_name=current_user.full_name,
                supplier_id=None,
                role=current_user.role,
                products_count=0,
                active_shipments_count=0,
                pending_shipments_count=0,
                inventory_items_count=0,
                recent_shipments=[],
            )
        comp_name = supplier.name
        sup_id = supplier.id
        products = db.scalars(select(Product).where(Product.supplier_id == supplier.id)).all()
        shipments = db.scalars(select(Shipment).where(Shipment.supplier_id == supplier.id)).all()
        prod_ids = [p.id for p in products]
        inventory = (
            db.scalars(select(Inventory).where(Inventory.product_id.in_(prod_ids))).all()
            if prod_ids
            else []
        )

    active_shipments = [s for s in shipments if s.status.lower() in ("active", "at sea", "in transit")]
    pending_shipments = [s for s in shipments if s.status.lower() in ("pending", "customs", "booked")]

    recent = []
    for s in sorted(shipments, key=lambda x: x.id, reverse=True)[:5]:
        product = db.get(Product, s.product_id)
        recent.append({
            "id": s.tracking_number or f"CS-{s.id:04d}",
            "product": product.name if product else "Unknown Cargo",
            "quantity": f"{s.quantity} units",
            "status": s.status,
            "origin_port": s.origin_port or "Origin Hub",
            "destination_port": s.destination_port or "Destination Hub",
            "carrier": s.carrier or "Ocean Carrier",
            "route_type": s.route_type or "Standard Corridor",
            "cost": float(s.cost) if s.cost is not None else None,
            "expected_arrival": str(s.expected_arrival) if s.expected_arrival else "Pending Schedule",
        })

    return DashboardStatsResponse(
        company_name=comp_name,
        supplier_id=sup_id,
        role=current_user.role,
        products_count=len(products),
        active_shipments_count=len(active_shipments),
        pending_shipments_count=len(pending_shipments),
        inventory_items_count=len(inventory),
        recent_shipments=recent,
    )


# ============================================================
# PROTECTED SUPPLIERS ENDPOINTS
# ============================================================

@app.post(
    "/suppliers",
    response_model=SupplierResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_supplier(
    supplier_data: SupplierCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing_supplier = db.scalar(
        select(Supplier).where(Supplier.name == supplier_data.name)
    )

    if existing_supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A supplier with this name already exists.",
        )

    user_id = current_user.id if current_user.role == "supplier" else supplier_data.user_id
    supplier = Supplier(
        name=supplier_data.name,
        contact_email=supplier_data.contact_email or current_user.email,
        user_id=user_id,
    )
    db.add(supplier)
    db.commit()
    db.refresh(supplier)

    return supplier


@app.get("/suppliers", response_model=list[SupplierResponse])
def list_suppliers(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        return db.scalars(select(Supplier).order_by(Supplier.id)).all()
    supplier = get_supplier_for_user(current_user, db)
    return [supplier] if supplier else []


# ============================================================
# PROTECTED PRODUCTS ENDPOINTS
# ============================================================

@app.post(
    "/products",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    supplier_id = product_data.supplier_id
    if current_user.role == "supplier":
        user_supplier = get_supplier_for_user(current_user, db)
        if not user_supplier:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No supplier record associated with this account.",
            )
        supplier_id = user_supplier.id
    else:
        if not supplier_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="supplier_id required for admin product creation.",
            )

    supplier = db.get(Supplier, supplier_id)
    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Supplier not found.",
        )

    existing_product = db.scalar(
        select(Product).where(
            Product.supplier_id == supplier_id,
            Product.sku == product_data.sku.strip(),
        )
    )

    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A product with this SKU already exists in your catalog.",
        )

    product = Product(
        name=product_data.name.strip(),
        sku=product_data.sku.strip(),
        unit_cost=product_data.unit_cost,
        supplier_id=supplier_id,
        packing_qty=product_data.packing_qty if product_data.packing_qty is not None else 500,
        weight_per_carton=product_data.weight_per_carton if product_data.weight_per_carton is not None else 10.0,
        default_origin_port=product_data.default_origin_port,
        is_fragile=bool(product_data.is_fragile),
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return product


@app.get("/products", response_model=list[ProductResponse])
def list_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        return db.scalars(select(Product).order_by(Product.id.desc())).all()

    supplier = get_supplier_for_user(current_user, db)
    if not supplier:
        return []

    return db.scalars(
        select(Product).where(Product.supplier_id == supplier.id).order_by(Product.id.desc())
    ).all()


@app.get("/products/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if current_user.role != "admin":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or product.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

    return product


@app.put("/products/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if current_user.role != "admin":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or product.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

    if data.name is not None:
        product.name = data.name.strip()
    if data.sku is not None:
        clean_sku = data.sku.strip()
        # Verify unique SKU within this supplier
        existing = db.scalar(
            select(Product).where(
                Product.supplier_id == product.supplier_id,
                Product.sku == clean_sku,
                Product.id != product_id,
            )
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A product with this SKU already exists in your catalog.",
            )
        product.sku = clean_sku
    if data.unit_cost is not None:
        product.unit_cost = data.unit_cost
    if data.packing_qty is not None:
        product.packing_qty = data.packing_qty
    if data.weight_per_carton is not None:
        product.weight_per_carton = data.weight_per_carton
    if data.default_origin_port is not None:
        product.default_origin_port = data.default_origin_port
    if data.is_fragile is not None:
        product.is_fragile = data.is_fragile

    db.commit()
    db.refresh(product)
    return product


@app.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    product = db.get(Product, product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if current_user.role != "admin":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or product.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found.",
            )

    # Check if there are active shipments referencing this product
    active_shipments = db.scalar(
        select(func.count(Shipment.id)).where(Shipment.product_id == product_id)
    )
    if active_shipments and active_shipments > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product because it has associated shipments.",
        )

    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully", "id": product_id}


# ============================================================
# PROTECTED WAREHOUSES ENDPOINTS
# ============================================================

@app.post(
    "/warehouses",
    response_model=WarehouseResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_warehouse(
    warehouse_data: WarehouseCreate,
    current_user: User = Depends(get_current_user),
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

    warehouse = Warehouse(
        name=warehouse_data.name,
        location=warehouse_data.location,
    )
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)

    return warehouse


@app.get("/warehouses", response_model=list[WarehouseResponse])
def list_warehouses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.scalars(select(Warehouse).order_by(Warehouse.id)).all()


# ============================================================
# PROTECTED INVENTORY ENDPOINTS
# ============================================================

@app.post(
    "/inventory",
    response_model=InventoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_inventory(
    inventory_data: InventoryCreate,
    current_user: User = Depends(get_current_user),
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

    # Check ownership if supplier
    if current_user.role == "supplier":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or product.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You cannot create inventory for another supplier's product.",
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

    inventory = Inventory(
        product_id=inventory_data.product_id,
        warehouse_id=inventory_data.warehouse_id,
        quantity_on_hand=inventory_data.quantity_on_hand,
        reorder_level=inventory_data.reorder_level,
    )
    db.add(inventory)
    db.commit()
    db.refresh(inventory)

    return inventory


@app.get("/inventory", response_model=list[InventoryResponse])
def list_inventory(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        return db.scalars(select(Inventory).order_by(Inventory.id)).all()

    supplier = get_supplier_for_user(current_user, db)
    if not supplier:
        return []

    return db.scalars(
        select(Inventory)
        .join(Product, Inventory.product_id == Product.id)
        .where(Product.supplier_id == supplier.id)
        .order_by(Inventory.id)
    ).all()


# ============================================================
# PROTECTED SHIPMENTS ENDPOINTS
# ============================================================

def _serialize_shipment(s: Shipment, db: Session) -> ShipmentResponse:
    product = db.get(Product, s.product_id)
    return ShipmentResponse(
        id=s.id,
        product_id=s.product_id,
        product_name=product.name if product else "Unknown Cargo",
        supplier_id=s.supplier_id,
        warehouse_id=s.warehouse_id,
        quantity=s.quantity,
        status=s.status,
        origin_port=s.origin_port,
        destination_port=s.destination_port,
        carrier=s.carrier,
        route_type=s.route_type,
        cost=float(s.cost) if s.cost is not None else None,
        tracking_number=s.tracking_number or f"CS-{s.id:04d}",
        expected_arrival=str(s.expected_arrival) if s.expected_arrival else None,
        created_at=s.created_at,
    )


@app.post(
    "/shipments",
    response_model=ShipmentResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_shipment(
    shipment_data: ShipmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    supplier = get_supplier_for_user(current_user, db) if current_user.role == "supplier" else (
        db.get(Supplier, shipment_data.supplier_id) if shipment_data.supplier_id else None
    )

    if not supplier:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No supplier record associated with this account.",
        )

    product = db.get(Product, shipment_data.product_id)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    if product.supplier_id != supplier.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This product does not belong to your supplier catalog.",
        )

    if shipment_data.warehouse_id:
        warehouse = db.get(Warehouse, shipment_data.warehouse_id)
        if not warehouse:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Warehouse not found.",
            )

    # Parse date if string
    parsed_date = None
    if shipment_data.expected_arrival:
        try:
            parsed_date = datetime.strptime(str(shipment_data.expected_arrival)[:10], "%Y-%m-%d").date()
        except Exception:
            pass

    shipment = Shipment(
        product_id=shipment_data.product_id,
        supplier_id=supplier.id,
        warehouse_id=shipment_data.warehouse_id,
        quantity=shipment_data.quantity,
        status=shipment_data.status or "in_transit",
        origin_port=shipment_data.origin_port,
        destination_port=shipment_data.destination_port,
        carrier=shipment_data.carrier,
        route_type=shipment_data.route_type,
        cost=shipment_data.cost,
        tracking_number=shipment_data.tracking_number,
        expected_arrival=parsed_date,
    )
    db.add(shipment)
    db.flush()

    if not shipment.tracking_number:
        shipment.tracking_number = f"CS-{shipment.id:04d}"

    db.commit()
    db.refresh(shipment)

    return _serialize_shipment(shipment, db)


@app.get("/shipments", response_model=list[ShipmentResponse])
def list_shipments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "admin":
        shipments = db.scalars(select(Shipment).order_by(Shipment.id.desc())).all()
        return [_serialize_shipment(s, db) for s in shipments]

    supplier = get_supplier_for_user(current_user, db)
    if not supplier:
        return []

    shipments = db.scalars(
        select(Shipment).where(Shipment.supplier_id == supplier.id).order_by(Shipment.id.desc())
    ).all()
    return [_serialize_shipment(s, db) for s in shipments]


@app.get("/shipments/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found.",
        )

    if current_user.role != "admin":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or shipment.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found.",
            )

    return _serialize_shipment(shipment, db)


@app.put("/shipments/{shipment_id}", response_model=ShipmentResponse)
def update_shipment(
    shipment_id: int,
    data: ShipmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found.",
        )

    if current_user.role != "admin":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or shipment.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found.",
            )

    if data.quantity is not None:
        shipment.quantity = data.quantity
    if data.status is not None:
        shipment.status = data.status
    if data.origin_port is not None:
        shipment.origin_port = data.origin_port
    if data.destination_port is not None:
        shipment.destination_port = data.destination_port
    if data.carrier is not None:
        shipment.carrier = data.carrier
    if data.route_type is not None:
        shipment.route_type = data.route_type
    if data.cost is not None:
        shipment.cost = data.cost
    if data.expected_arrival is not None:
        try:
            shipment.expected_arrival = datetime.strptime(str(data.expected_arrival)[:10], "%Y-%m-%d").date()
        except Exception:
            pass

    db.commit()
    db.refresh(shipment)
    return _serialize_shipment(shipment, db)


@app.delete("/shipments/{shipment_id}")
def delete_shipment(
    shipment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    shipment = db.get(Shipment, shipment_id)
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipment not found.",
        )

    if current_user.role != "admin":
        supplier = get_supplier_for_user(current_user, db)
        if not supplier or shipment.supplier_id != supplier.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment not found.",
            )

    db.delete(shipment)
    db.commit()
    return {"message": "Shipment deleted successfully", "id": shipment_id}


# ============================================================
# USER-SCOPED ROUTE ALERTS
# ============================================================

@app.get("/alerts/me")
def get_user_route_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    supplier = get_supplier_for_user(current_user, db)
    if not supplier:
        return []

    # Get active shipments belonging to this user
    shipments = db.scalars(
        select(Shipment).where(Shipment.supplier_id == supplier.id)
    ).all()

    if not shipments:
        return []

    # Collect distinct port names/codes
    user_corridors = []
    for s in shipments:
        user_corridors.append({
            "tracking_number": s.tracking_number or f"CS-{s.id:04d}",
            "origin": (s.origin_port or "").lower(),
            "dest": (s.destination_port or "").lower(),
        })

    # Fetch active disruptions
    disruptions = db.scalars(
        select(Disruption).where(Disruption.status.in_(["active", "monitoring"])).limit(20)
    ).all()

    matched_alerts = []
    for d in disruptions:
        port = db.get(Port, d.port_id)
        if not port:
            continue
        p_name = port.name.lower()
        p_code = port.port_code.lower()

        # Check if this disruption affects any user shipment route
        matching_shipment = None
        for c in user_corridors:
            if (p_name in c["origin"] or p_code in c["origin"] or
                p_name in c["dest"] or p_code in c["dest"]):
                matching_shipment = c["tracking_number"]
                break

        if matching_shipment:
            matched_alerts.append({
                "id": f"ALT-{d.id}",
                "severity": d.severity,
                "category": d.disruption_type.replace("_", " ").title(),
                "title": d.description,
                "port": f"{port.name} ({port.country})",
                "shipment_ref": matching_shipment,
                "delay_hours": d.estimated_delay_hours,
                "cost_impact": float(d.estimated_cost_impact_usd),
                "status": d.status,
                "started_at": str(d.started_at) if d.started_at else None,
            })

    return matched_alerts
