from flask import Flask, send_from_directory
from routes.sos import sos_bp
from routes.incidents import incidents_bp
from routes.teams import teams_bp
from routes.messages import messages_bp
import os


BASE_DIR = os.path.dirname(
    os.path.dirname(
        os.path.abspath(__file__)
    )
)

FRONTEND_DIR = os.path.join(
    BASE_DIR,
    "frontend"
)


app = Flask(__name__)


app.register_blueprint(
    sos_bp,
    url_prefix="/api/sos"
)

app.register_blueprint(
    incidents_bp,
    url_prefix="/api/incidents"
)

app.register_blueprint(
    teams_bp,
    url_prefix="/api/teams"
)

app.register_blueprint(
    messages_bp,
    url_prefix="/api/messages"
)


@app.route("/")
def home():
    return send_from_directory(
        FRONTEND_DIR,
        "index.html"
    )


@app.route("/dashboard")
def dashboard():
    return send_from_directory(
        FRONTEND_DIR,
        "dashboard.html"
    )


@app.route("/css/<path:filename>")
def css(filename):
    return send_from_directory(
        os.path.join(
            FRONTEND_DIR,
            "css"
        ),
        filename
    )


@app.route("/js/<path:filename>")
def javascript(filename):
    return send_from_directory(
        os.path.join(
            FRONTEND_DIR,
            "js"
        ),
        filename
    )


@app.route("/sw.js")
def service_worker():
    return send_from_directory(
        FRONTEND_DIR,
        "sw.js",
        mimetype="application/javascript"
    )


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )