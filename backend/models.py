from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
    func,
    CheckConstraint,
    Float,
    Index,
    Text,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(20), default="supplier", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    # Optional 1-1 relationship to supplier
    supplier: Mapped["Supplier"] = relationship("Supplier", back_populates="user", uselist=False)


class Supplier(Base):
    __tablename__ = "suppliers"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id"), unique=True, nullable=True
    )
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    contact_email: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    user: Mapped["User"] = relationship("User", back_populates="supplier")


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        UniqueConstraint("supplier_id", "sku", name="unique_supplier_sku"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    sku: Mapped[str] = mapped_column(String(50), nullable=False)
    unit_cost: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    supplier_id: Mapped[int] = mapped_column(
        ForeignKey("suppliers.id"), nullable=False
    )
    packing_qty: Mapped[int | None] = mapped_column(Integer, default=500, nullable=True)
    weight_per_carton: Mapped[float | None] = mapped_column(Float, default=10.0, nullable=True)
    default_origin_port: Mapped[str | None] = mapped_column(String(150), nullable=True)
    is_fragile: Mapped[bool] = mapped_column(Boolean, default=False, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    supplier: Mapped["Supplier"] = relationship("Supplier")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)


class Inventory(Base):
    __tablename__ = "inventory"
    __table_args__ = (
        UniqueConstraint("product_id", "warehouse_id", name="unique_product_warehouse"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    warehouse_id: Mapped[int] = mapped_column(
        ForeignKey("warehouses.id"), nullable=False
    )
    quantity_on_hand: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reorder_level: Mapped[int] = mapped_column(Integer, default=10, nullable=False)


class Shipment(Base):
    __tablename__ = "shipments"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"), nullable=False)
    supplier_id: Mapped[int] = mapped_column(ForeignKey("suppliers.id"), nullable=False)
    warehouse_id: Mapped[int | None] = mapped_column(
        ForeignKey("warehouses.id"), nullable=True
    )
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending", nullable=False)
    origin_port: Mapped[str | None] = mapped_column(String(150), nullable=True)
    destination_port: Mapped[str | None] = mapped_column(String(150), nullable=True)
    carrier: Mapped[str | None] = mapped_column(String(100), nullable=True)
    route_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    cost: Mapped[float | None] = mapped_column(Numeric(12, 2), nullable=True)
    tracking_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    expected_arrival: Mapped[date | None] = mapped_column(Date)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now(), nullable=False
    )

    product: Mapped["Product"] = relationship("Product")
    supplier: Mapped["Supplier"] = relationship("Supplier")


class Port(Base):
    __tablename__ = "ports"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    country: Mapped[str] = mapped_column(String(100), nullable=False)
    port_code: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)


class Route(Base):
    __tablename__ = "routes"
    __table_args__ = (
        UniqueConstraint(
            "origin_port_id",
            "destination_port_id",
            name="unique_directed_route",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    origin_port_id: Mapped[int] = mapped_column(
        ForeignKey("ports.id"), nullable=False
    )
    destination_port_id: Mapped[int] = mapped_column(
        ForeignKey("ports.id"), nullable=False
    )
    distance_km: Mapped[int] = mapped_column(Integer, nullable=False)
    travel_time_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    cost: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)


class Disruption(Base):
    __tablename__ = "disruptions"
    __table_args__ = (
        CheckConstraint(
            "severity IN ('low', 'medium', 'high', 'critical')",
            name="valid_disruption_severity",
        ),
        CheckConstraint(
            "status IN ('resolved', 'active', 'monitoring')",
            name="valid_disruption_status",
        ),
        CheckConstraint(
            "estimated_delay_hours >= 0",
            name="non_negative_delay_hours",
        ),
        CheckConstraint(
            "estimated_cost_impact_usd >= 0",
            name="non_negative_cost_impact",
        ),
        CheckConstraint(
            "capacity_impact_percent >= 0 AND capacity_impact_percent <= 100",
            name="valid_capacity_impact_percent",
        ),
        Index("ix_disruptions_port_started_at", "port_id", "started_at"),
        Index("ix_disruptions_type_severity", "disruption_type", "severity"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)

    # Stable identifier from the generated CSV. This makes import idempotent.
    event_code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )

    port_id: Mapped[int] = mapped_column(
        ForeignKey("ports.id"),
        nullable=False,
    )

    disruption_type: Mapped[str] = mapped_column(String(50), nullable=False)
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False)

    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime)

    estimated_delay_hours: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )
    estimated_cost_impact_usd: Mapped[float] = mapped_column(
        Numeric(14, 2),
        nullable=False,
        default=0,
    )
    capacity_impact_percent: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        default=0.0,
    )

    description: Mapped[str] = mapped_column(Text, nullable=False)

    # Mandatory transparency marker.
    source: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="synthetic_phase4",
    )
    is_synthetic: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        server_default=func.now(),
        nullable=False,
    )
