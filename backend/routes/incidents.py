from flask import Blueprint, jsonify
from services.storage import load_data


incidents_bp = Blueprint("incidents", __name__)


@incidents_bp.route("", methods=["GET"])
def get_incidents():
    incidents = load_data("incidents.json")

    incidents.sort(
        key=lambda item: item.get("priority_score", 0),
        reverse=True
    )

    return jsonify(incidents)


@incidents_bp.route("/<incident_id>", methods=["GET"])
def get_incident(incident_id):
    incidents = load_data("incidents.json")

    for incident in incidents:
        if incident["id"] == incident_id:
            return jsonify(incident)

    return jsonify({
        "error": "Incident not found"
    }), 404