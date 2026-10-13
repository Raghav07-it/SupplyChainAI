from disruptions.synthetic_data import generate_synthetic_disruptions


def test_generator_creates_480_synthetic_records():
    records = generate_synthetic_disruptions()

    assert len(records) == 480
    assert all(record["is_synthetic"] == "true" for record in records)
    assert all(record["source"] == "synthetic_phase4" for record in records)


def test_generator_covers_all_four_ports():
    records = generate_synthetic_disruptions()
    port_counts = {}

    for record in records:
        port_counts[record["port_code"]] = (
            port_counts.get(record["port_code"], 0) + 1
        )

    assert port_counts == {
        "INMUM": 120,
        "AEDXB": 120,
        "SGSIN": 120,
        "NLRTM": 120,
    }