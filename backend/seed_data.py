from database import SessionLocal
from models import Port, Route


def seed_database():
    db = SessionLocal()

    try:
        # Check whether data already exists
        existing_ports = db.query(Port).count()

        if existing_ports > 0:
            print("Database already contains port data.")
            return

        # -------------------------
        # Create Ports
        # -------------------------

        mumbai = Port(
            name="Mumbai",
            city="Mumbai",
            country="India",
            port_code="INMUM",
        )

        dubai = Port(
            name="Dubai",
            city="Dubai",
            country="UAE",
            port_code="AEDXB",
        )

        singapore = Port(
            name="Singapore",
            city="Singapore",
            country="Singapore",
            port_code="SGSIN",
        )

        rotterdam = Port(
            name="Rotterdam",
            city="Rotterdam",
            country="Netherlands",
            port_code="NLRTM",
        )

        db.add_all([
            mumbai,
            dubai,
            singapore,
            rotterdam,
        ])

        # Generate database IDs
        db.flush()

        # -------------------------
        # Create Routes
        # -------------------------

        routes = [
            Route(
                origin_port_id=mumbai.id,
                destination_port_id=dubai.id,
                distance_km=3000,
                travel_time_hours=72,
                cost=5000,
                is_active=True,
            ),

            Route(
                origin_port_id=mumbai.id,
                destination_port_id=singapore.id,
                distance_km=3900,
                travel_time_hours=96,
                cost=6000,
                is_active=True,
            ),

            Route(
                origin_port_id=dubai.id,
                destination_port_id=rotterdam.id,
                distance_km=7000,
                travel_time_hours=168,
                cost=12000,
                is_active=True,
            ),

            Route(
                origin_port_id=singapore.id,
                destination_port_id=rotterdam.id,
                distance_km=10500,
                travel_time_hours=240,
                cost=18000,
                is_active=True,
            ),
        ]

        db.add_all(routes)

        db.commit()

        print("Database seeded successfully!")
        print("Created 4 ports.")
        print("Created 4 routes.")

    except Exception as error:
        db.rollback()
        print("Error while seeding database:")
        print(error)

    finally:
        db.close()


if __name__ == "__main__":
    seed_database()