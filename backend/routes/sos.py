from flask import Blueprint, request, jsonify
from services.priority_engine import calculate_priority
from services.storage import load_data, save_data
from datetime import datetime
import uuid


sos_bp = Blueprint("sos", __name__)


@sos_bp.route("", methods=["POST"])
def create_sos():
    data = request.get_json() or {}

    injury = float(data.get("injury_severity", 0.5))
    accessibility = float(data.get("accessibility", 0.5))
    resource_urgency = float(data.get("resource_urgency", 0.5))
    waiting_time = float(data.get("waiting_time", 0.0))

    priority = calculate_priority(
        injury,
        accessibility,
        resource_urgency,
        waiting_time
    )

    incidents = load_data("incidents.json")

    incident = {
        "id": str(uuid.uuid4()),
        "name": data.get("name", "Unknown Survivor"),
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "description": data.get("description", ""),
        "injury_severity": injury,
        "accessibility": accessibility,
        "resource_urgency": resource_urgency,
        "waiting_time": waiting_time,
        "priority_score": priority["score"],
        "priority_level": priority["level"],
        "status": "PENDING",
        "created_at": datetime.utcnow().isoformat()
    }

    incidents.append(incident)
    save_data("incidents.json", incidents)

    return jsonify({
        "success": True,
        "incident": incident
    }), 201