def calculate_priority(
    injury_severity,
    accessibility,
    resource_urgency,
    waiting_time
):
    injury_severity = max(0, min(1, injury_severity))
    accessibility = max(0, min(1, accessibility))
    resource_urgency = max(0, min(1, resource_urgency))
    waiting_time = max(0, min(1, waiting_time))

    score = (
        injury_severity * 0.45
        + accessibility * 0.20
        + resource_urgency * 0.20
        + waiting_time * 0.15
    )

    score = round(score, 3)

    if score >= 0.80:
        level = "CRITICAL"
    elif score >= 0.60:
        level = "HIGH"
    elif score >= 0.40:
        level = "MEDIUM"
    else:
        level = "LOW"

    return {
        "score": score,
        "level": level
    }