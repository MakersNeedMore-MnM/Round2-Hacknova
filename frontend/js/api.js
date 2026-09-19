async function createSOS(data) {
    const response = await fetch("/api/sos", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        throw new Error("Failed to create SOS");
    }

    return response.json();
}


async function getMessages(incidentId) {
    const response = await fetch(
        `/api/messages/${encodeURIComponent(incidentId)}`
    );

    if (!response.ok) {
        throw new Error("Failed to load messages");
    }

    return response.json();
}


async function sendMessage(
    incidentId,
    message,
    sender
) {
    const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            incident_id: incidentId,
            sender: sender,
            message: message
        })
    });

    if (!response.ok) {
        throw new Error("Failed to send message");
    }

    return response.json();
}