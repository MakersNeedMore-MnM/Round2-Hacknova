from flask import Blueprint, jsonify
from services.storage import load_data


teams_bp = Blueprint("teams", __name__)


@teams_bp.route("", methods=["GET"])
def get_teams():
    return jsonify(load_data("teams.json"))