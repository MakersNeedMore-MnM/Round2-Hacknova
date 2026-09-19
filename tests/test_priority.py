from backend.services.priority_engine import calculate_priority


def test_critical_case():
    result = calculate_priority(
        injury_severity=1.0,
        accessibility=0.9,
        resource_urgency=1.0,
        waiting_time=1.0
    )

    assert result["level"] == "CRITICAL"
    assert result["score"] >= 0.80


def test_low_case():
    result = calculate_priority(
        injury_severity=0.1,
        accessibility=0.1,
        resource_urgency=0.1,
        waiting_time=0.1
    )

    assert result["level"] == "LOW"