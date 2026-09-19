from flask import Blueprint, request, jsonify
from services.storage import load_data, save_data
from datetime import datetime
import uuid


messages_bp = Blueprint("messages", __name__)


@messages_bp.route("", methods=["POST"])
def send_message():
    data = request.get_json() or {}

    messages = load_data("messages.json")

    message = {
        "id": str(uuid.uuid4()),
        "incident_id": data.get("incident_id"),
        "sender": data.get("sender", "RESCUER"),
        "message": data.get("message", ""),
        "timestamp": datetime.utcnow().isoformat()
    }

    messages.append(message)

    save_data("messages.json", messages)

    return jsonify({
        "success": True,
        "message": message
    }), 201


@messages_bp.route("/<incident_id>", methods=["GET"])
def get_messages(incident_id):
    messages = load_data("messages.json")

    result = [
        message
        for message in messages
        if message.get("incident_id") == incident_id
    ]

    return jsonify(result)