import networkx as nx

from database import SessionLocal
from models import Port, Route


def create_logistics_graph():
    """
    Build a directed NetworkX graph from active routes stored in PostgreSQL.

    Each port is represented as a graph node.
    Each active route is represented as a directed edge.
    """

    graph = nx.DiGraph()

    db = SessionLocal()

    try:
        routes = (
            db.query(Route)
            .filter(Route.is_active.is_(True))
            .all()
        )

        for route in routes:
            origin_port = db.get(Port, route.origin_port_id)
            destination_port = db.get(Port, route.destination_port_id)

            if origin_port is None or destination_port is None:
                continue

            graph.add_edge(
                origin_port.name,
                destination_port.name,
                distance_km=float(route.distance_km),
                travel_time_hours=float(route.travel_time_hours),
                cost=float(route.cost),

                # Phase 3 foundation.
                # Phase 5 will replace this with ML-predicted risk.
                risk_score=0.0,
            )

        return graph

    finally:
        db.close()