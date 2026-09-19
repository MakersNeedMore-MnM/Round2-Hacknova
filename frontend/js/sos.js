const sosButton =
    document.getElementById("sosButton");


const statusText =
    document.getElementById("status");


const communicationCard =
    document.getElementById(
        "communicationCard"
    );


const incidentInfo =
    document.getElementById(
        "incidentInfo"
    );


const survivorMessages =
    document.getElementById(
        "survivorMessages"
    );


const survivorMessage =
    document.getElementById(
        "survivorMessage"
    );


const sendReplyButton =
    document.getElementById(
        "sendReplyButton"
    );


const messageStatus =
    document.getElementById(
        "messageStatus"
    );


let currentIncidentId =
    null;


let messageTimer =
    null;


/*
 * Build SOS data.
 */

function buildSOSData(location) {

    const name =
        document.getElementById(
            "name"
        ).value ||
        "Unknown Survivor";


    const injury =
        Number(
            document.getElementById(
                "injury"
            ).value
        );


    const description =
        document.getElementById(
            "description"
        ).value;


    return {

        name:
            name,

        latitude:
            Number(
                location.latitude
            ),

        longitude:
            Number(
                location.longitude
            ),

        injury_severity:
            injury,

        accessibility:
            0.5,

        resource_urgency:
            0.7,

        waiting_time:
            0.2,

        description:
            description
    };
}


/*
 * Handle a successfully created SOS.
 */

function handleSOSCreated(result) {

    if (
        !result ||
        !result.incident
    ) {
        return;
    }


    currentIncidentId =
        result.incident.id;


    statusText.textContent =
        `SOS sent successfully. Priority: ${result.incident.priority_level}`;


    communicationCard.style.display =
        "block";


    incidentInfo.textContent =
        `Incident ID: ${currentIncidentId}`;


    loadMessages();


    if (messageTimer) {

        clearInterval(
            messageTimer
        );
    }


    messageTimer =
        setInterval(
            loadMessages,
            5000
        );
}


/*
 * Listen for an offline SOS that
 * has been synchronized.
 *
 * This will work when offline.js
 * dispatches the synchronization event.
 */

window.addEventListener(
    "resqlink:sos-synced",
    event => {

        const result =
            event.detail;


        if (
            !result ||
            !result.incident
        ) {
            return;
        }


        handleSOSCreated(
            result
        );


        statusText.textContent =
            `Offline SOS synchronized successfully. Priority: ${result.incident.priority_level}`;
    }
);


/*
 * SEND SOS
 */

sosButton.addEventListener(
    "click",
    async () => {

        statusText.textContent =
            "Getting your location...";


        sosButton.disabled =
            true;


        try {

            /*
             * First use a location that the
             * user has explicitly selected.
             */

            let location =
                getSelectedLocation();


            /*
             * If no location was manually
             * selected, try GPS.
             *
             * gps.js automatically falls back
             * to the last saved GPS location.
             */

            if (!location) {

                location =
                    await getLocation();
            }


            /*
             * Make sure we actually have
             * coordinates.
             */

            if (
                !location ||
                !Number.isFinite(
                    Number(
                        location.latitude
                    )
                ) ||
                !Number.isFinite(
                    Number(
                        location.longitude
                    )
                )
            ) {

                throw new Error(
                    "No valid location available"
                );
            }


            const sosData =
                buildSOSData(
                    location
                );


            /*
             * OFFLINE MODE
             */

            if (
                !navigator.onLine
            ) {

                addSOSToOfflineQueue(
                    sosData
                );


                statusText.textContent =
                    "SOS saved on this device. It will be sent automatically when the connection returns.";


                return;
            }


            /*
             * ONLINE MODE
             *
             * Try sending to Flask.
             */

            try {

                const result =
                    await createSOS(
                        sosData
                    );


                handleSOSCreated(
                    result
                );


            } catch (error) {

                console.error(
                    "Online SOS failed:",
                    error
                );


                /*
                 * Browser may report ONLINE
                 * even if the backend cannot
                 * be reached.
                 *
                 * Save locally instead.
                 */

                addSOSToOfflineQueue(
                    sosData
                );


                statusText.textContent =
                    "Connection unavailable. SOS saved on this device and will be sent automatically when the connection returns.";
            }


        } catch (error) {

            console.error(
                "SOS location error:",
                error
            );


            statusText.textContent =
                "No location available. Use a saved location or enter your location manually.";


        } finally {

            sosButton.disabled =
                false;
        }
    }
);


/*
 * Load survivor messages.
 */

async function loadMessages() {

    if (
        !currentIncidentId
    ) {
        return;
    }


    try {

        const messages =
            await getMessages(
                currentIncidentId
            );


        if (
            messages.length === 0
        ) {

            survivorMessages.innerHTML = `
                <div class="no-survivor-messages">
                    Waiting for rescue team communication...
                </div>
            `;

            return;
        }


        survivorMessages.innerHTML =
            messages
                .map(
                    message => {

                        const isRescueTeam =
                            message.sender ===
                            "RESCUE_TEAM";


                        const senderName =
                            isRescueTeam
                                ? "Rescue Team"
                                : "You";


                        const messageClass =
                            isRescueTeam
                                ? "received-message"
                                : "sent-message";


                        const time =
                            formatTime(
                                message.timestamp
                            );


                        return `
                            <div class="survivor-message ${messageClass}">

                                <div class="survivor-message-header">

                                    <strong>
                                        ${escapeHtml(
                                            senderName
                                        )}
                                    </strong>

                                    <span>
                                        ${escapeHtml(
                                            time
                                        )}
                                    </span>

                                </div>

                                <div class="survivor-message-text">

                                    ${escapeHtml(
                                        message.message
                                    )}

                                </div>

                            </div>
                        `;
                    }
                )
                .join("");


        survivorMessages.scrollTop =
            survivorMessages.scrollHeight;


    } catch (error) {

        console.error(
            "Message loading error:",
            error
        );
    }
}


/*
 * Survivor sends a reply.
 */

sendReplyButton.addEventListener(
    "click",
    async () => {

        if (
            !currentIncidentId
        ) {

            messageStatus.textContent =
                "Please send an SOS first.";

            return;
        }


        const message =
            survivorMessage.value.trim();


        if (!message) {

            messageStatus.textContent =
                "Please enter a message.";

            return;
        }


        sendReplyButton.disabled =
            true;


        messageStatus.textContent =
            "Sending...";


        try {

            await sendMessage(
                currentIncidentId,
                message,
                "SURVIVOR"
            );


            survivorMessage.value =
                "";


            messageStatus.textContent =
                "Message sent.";


            await loadMessages();


        } catch (error) {

            console.error(
                error
            );


            messageStatus.textContent =
                "Unable to send message.";


        } finally {

            sendReplyButton.disabled =
                false;
        }
    }
);


/*
 * Format timestamp.
 */

function formatTime(timestamp) {

    if (!timestamp) {
        return "";
    }


    const date =
        new Date(
            timestamp
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return timestamp;
    }


    return date.toLocaleString();
}


/*
 * Escape HTML.
 */

function escapeHtml(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;
}