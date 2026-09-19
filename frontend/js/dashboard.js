let map;
let mapMarkers = [];

const DEFAULT_LATITUDE = 13.0827;
const DEFAULT_LONGITUDE = 80.2707;

async function loadIncidents() {
    const response = await fetch("/api/incidents");

    if (!response.ok) {
        throw new Error("Unable to load incidents");
    }

    return await response.json();
}

async function loadTeams() {
    const response = await fetch("/api/teams");

    if (!response.ok) {
        throw new Error("Unable to load rescue teams");
    }

    return await response.json();
}

async function loadMessages(incidentId) {
    const response = await fetch(
        `/api/messages/${encodeURIComponent(incidentId)}`
    );

    if (!response.ok) {
        throw new Error("Unable to load messages");
    }

    return await response.json();
}

async function sendMessage(incidentId) {
    const input = document.getElementById(
        `message-${incidentId}`
    );

    const message = input.value.trim();

    if (!message) {
        return;
    }

    const button = document.getElementById(
        `send-${incidentId}`
    );

    try {
        button.disabled = true;
        button.textContent = "Sending...";

        const response = await fetch("/api/messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                incident_id: incidentId,
                sender: "RESCUE_TEAM",
                message: message
            })
        });

        if (!response.ok) {
            throw new Error("Unable to send message");
        }

        input.value = "";

        await displayMessages(incidentId);

    } catch (error) {
        console.error(error);
        alert("Unable to send message.");

    } finally {
        button.disabled = false;
        button.textContent = "Send";
    }
}

async function displayMessages(incidentId) {
    const container = document.getElementById(
        `messages-${incidentId}`
    );

    if (!container) {
        return;
    }

    try {
        const messages = await loadMessages(incidentId);

        if (messages.length === 0) {
            container.innerHTML = `
                <div class="no-messages">
                    No messages yet.
                </div>
            `;
            return;
        }

        container.innerHTML = messages.map(message => {

            const senderClass =
                message.sender === "RESCUE_TEAM"
                    ? "rescuer-message"
                    : "survivor-message";

            const senderName =
                message.sender === "RESCUE_TEAM"
                    ? "Rescue Team"
                    : "Survivor";

            const time = formatMessageTime(
                message.timestamp
            );

            return `
                <div class="message ${senderClass}">

                    <div class="message-header">
                        <strong>
                            ${escapeHtml(senderName)}
                        </strong>

                        <span>
                            ${escapeHtml(time)}
                        </span>
                    </div>

                    <div class="message-text">
                        ${escapeHtml(message.message)}
                    </div>

                </div>
            `;
        }).join("");

        container.scrollTop = container.scrollHeight;

    } catch (error) {
        console.error(error);

        container.innerHTML = `
            <div class="no-messages">
                Unable to load messages.
            </div>
        `;
    }
}

function formatMessageTime(timestamp) {
    if (!timestamp) {
        return "";
    }

    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
        return timestamp;
    }

    return date.toLocaleString();
}

function priorityClass(level) {
    return String(level || "LOW").toLowerCase();
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}

function initializeMap() {
    if (map) {
        return;
    }

    map = L.map("map").setView(
        [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],
        12
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);
}

function clearMapMarkers() {
    mapMarkers.forEach(marker => {
        map.removeLayer(marker);
    });

    mapMarkers = [];
}

function addIncidentMarker(incident) {
    const latitude = Number(incident.latitude);
    const longitude = Number(incident.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return null;
    }

    const marker = L.circleMarker(
        [latitude, longitude],
        {
            radius: 10,
            color: "#b91c1c",
            fillColor: "#ef4444",
            fillOpacity: 0.9,
            weight: 3
        }
    ).addTo(map);

    marker.bindPopup(`
        <div class="map-popup">

            <h3>SOS Emergency</h3>

            <p>
                <strong>Survivor:</strong>
                ${escapeHtml(incident.name)}
            </p>

            <p>
                <strong>Priority:</strong>
                ${escapeHtml(incident.priority_level)}
            </p>

            <p>
                <strong>Score:</strong>
                ${escapeHtml(incident.priority_score)}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHtml(incident.status)}
            </p>

            <p>
                <strong>Location:</strong>
                ${latitude.toFixed(6)},
                ${longitude.toFixed(6)}
            </p>

        </div>
    `);

    mapMarkers.push(marker);

    return [latitude, longitude];
}

function addTeamMarker(team) {
    const latitude = Number(team.latitude);
    const longitude = Number(team.longitude);

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return null;
    }

    const marker = L.circleMarker(
        [latitude, longitude],
        {
            radius: 8,
            color: "#1d4ed8",
            fillColor: "#3b82f6",
            fillOpacity: 0.9,
            weight: 3
        }
    ).addTo(map);

    marker.bindPopup(`
        <div class="map-popup">

            <h3>Rescue Team</h3>

            <p>
                <strong>Name:</strong>
                ${escapeHtml(team.name)}
            </p>

            <p>
                <strong>Team ID:</strong>
                ${escapeHtml(team.id)}
            </p>

            <p>
                <strong>Status:</strong>
                ${escapeHtml(team.status)}
            </p>

            <p>
                <strong>Location:</strong>
                ${latitude.toFixed(6)},
                ${longitude.toFixed(6)}
            </p>

        </div>
    `);

    mapMarkers.push(marker);

    return [latitude, longitude];
}

function updateMap(incidents, teams) {
    initializeMap();

    clearMapMarkers();

    const locations = [];

    incidents.forEach(incident => {
        const location = addIncidentMarker(incident);

        if (location) {
            locations.push(location);
        }
    });

    teams.forEach(team => {
        const location = addTeamMarker(team);

        if (location) {
            locations.push(location);
        }
    });

    if (locations.length === 0) {
        map.setView(
            [DEFAULT_LATITUDE, DEFAULT_LONGITUDE],
            12
        );

        return;
    }

    if (locations.length === 1) {
        map.setView(
            locations[0],
            13
        );

        return;
    }

    const bounds = L.latLngBounds(locations);

    map.fitBounds(
        bounds,
        {
            padding: [50, 50],
            maxZoom: 14
        }
    );
}

function displayIncidents(incidents) {
    const container =
        document.getElementById("incidentList");

    if (incidents.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No active emergency cases.
            </div>
        `;

        return;
    }

    container.innerHTML = incidents.map(incident => {

        const latitude = Number(incident.latitude);
        const longitude = Number(incident.longitude);

        const hasLocation =
            Number.isFinite(latitude) &&
            Number.isFinite(longitude);

        return `
            <div class="incident-card">

                <div class="incident-top">

                    <div>
                        <h3>
                            ${escapeHtml(incident.name)}
                        </h3>

                        <p>
                            ID:
                            ${escapeHtml(incident.id)}
                        </p>
                    </div>

                    <span class="priority ${priorityClass(
                        incident.priority_level
                    )}">
                        ${escapeHtml(
                            incident.priority_level
                        )}
                    </span>

                </div>

                <div class="incident-details">

                    <p>
                        <strong>Priority Score:</strong>
                        ${escapeHtml(
                            incident.priority_score
                        )}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${
                            incident.latitude ??
                            "Unknown"
                        },
                        ${
                            incident.longitude ??
                            "Unknown"
                        }
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${escapeHtml(
                            incident.status
                        )}
                    </p>

                    <p>
                        <strong>Description:</strong>
                        ${escapeHtml(
                            incident.description ||
                            "No description"
                        )}
                    </p>

                    ${
                        hasLocation
                            ? `
                                <button
                                    class="location-button"
                                    onclick="focusIncident(
                                        ${latitude},
                                        ${longitude}
                                    )"
                                >
                                    View Location
                                </button>
                              `
                            : ""
                    }

                </div>

                <div class="message-panel">

                    <div class="message-panel-header">
                        <div>
                            <h3>Emergency Messages</h3>
                            <p>
                                Communicate with this survivor.
                            </p>
                        </div>
                    </div>

                    <div
                        id="messages-${escapeHtml(
                            incident.id
                        )}"
                        class="messages-container"
                    >
                        Loading messages...
                    </div>

                    <div class="message-input-area">

                        <textarea
                            id="message-${escapeHtml(
                                incident.id
                            )}"
                            class="message-input"
                            placeholder="Type a message to the survivor..."
                            rows="3"
                        ></textarea>

                        <button
                            id="send-${escapeHtml(
                                incident.id
                            )}"
                            class="send-message-button"
                            onclick="sendMessage(
                                '${escapeJs(incident.id)}'
                            )"
                        >
                            Send
                        </button>

                    </div>

                </div>

            </div>
        `;
    }).join("");

    incidents.forEach(incident => {
        displayMessages(incident.id);
    });
}

function displayTeams(teams) {
    const container =
        document.getElementById("teamList");

    if (teams.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                No rescue teams available.
            </div>
        `;

        return;
    }

    container.innerHTML = teams.map(team => `
        <div class="team-card">

            <div>

                <h3>
                    ${escapeHtml(team.name)}
                </h3>

                <p>
                    ${escapeHtml(team.id)}
                </p>

                <p>
                    Location:
                    ${team.latitude ?? "Unknown"},
                    ${team.longitude ?? "Unknown"}
                </p>

            </div>

            <span class="team-status">
                ${escapeHtml(team.status)}
            </span>

        </div>
    `).join("");
}

function updateStats(incidents, teams) {
    const critical = incidents.filter(
        incident =>
            incident.priority_level === "CRITICAL"
    ).length;

    const high = incidents.filter(
        incident =>
            incident.priority_level === "HIGH"
    ).length;

    const available = teams.filter(
        team =>
            team.status === "AVAILABLE"
    ).length;

    document.getElementById(
        "totalIncidents"
    ).textContent = incidents.length;

    document.getElementById(
        "criticalIncidents"
    ).textContent = critical;

    document.getElementById(
        "highIncidents"
    ).textContent = high;

    document.getElementById(
        "availableTeams"
    ).textContent = available;
}

function focusIncident(latitude, longitude) {
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {
        return;
    }

    initializeMap();

    map.setView(
        [latitude, longitude],
        16,
        {
            animate: true
        }
    );
}

function escapeJs(value) {
    return String(value ?? "")
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}

async function loadDashboard() {
    const refreshButton =
        document.getElementById("refreshButton");

    try {
        refreshButton.textContent = "Loading...";
        refreshButton.disabled = true;

        const [incidents, teams] =
            await Promise.all([
                loadIncidents(),
                loadTeams()
            ]);

        displayIncidents(incidents);
        displayTeams(teams);
        updateStats(incidents, teams);
        updateMap(incidents, teams);

    } catch (error) {

        console.error(error);

        document.getElementById(
            "incidentList"
        ).innerHTML = `
            <div class="empty-state">
                Unable to load dashboard data.
            </div>
        `;

    } finally {

        refreshButton.textContent = "Refresh";
        refreshButton.disabled = false;
    }
}

initializeMap();

loadDashboard();

setInterval(loadDashboard, 10000);