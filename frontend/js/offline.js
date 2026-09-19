const OFFLINE_QUEUE_KEY =
    "resqlink_sos_queue";


function getOfflineSOSQueue() {

    const stored =
        localStorage.getItem(
            OFFLINE_QUEUE_KEY
        );

    if (!stored) {
        return [];
    }

    try {

        return JSON.parse(
            stored
        );

    } catch (error) {

        console.error(
            "Unable to read offline SOS queue:",
            error
        );

        return [];
    }
}


function saveOfflineSOSQueue(queue) {

    localStorage.setItem(
        OFFLINE_QUEUE_KEY,
        JSON.stringify(queue)
    );
}


function addSOSToOfflineQueue(
    sosData
) {

    const queue =
        getOfflineSOSQueue();

    const offlineSOS = {

        id:
            `OFFLINE-${Date.now()}-${Math.random()
                .toString(36)
                .substring(2, 8)}`,

        created_at:
            new Date().toISOString(),

        data:
            sosData
    };

    queue.push(
        offlineSOS
    );

    saveOfflineSOSQueue(
        queue
    );

    console.log(
        "SOS saved offline:",
        offlineSOS
    );

    updateOfflineStatus();

    return offlineSOS;
}


function removeSOSFromOfflineQueue(
    offlineId
) {

    const queue =
        getOfflineSOSQueue();

    const updatedQueue =
        queue.filter(
            item =>
                item.id !== offlineId
        );

    saveOfflineSOSQueue(
        updatedQueue
    );
}


async function syncOfflineSOS() {

    const queue =
        getOfflineSOSQueue();

    if (queue.length === 0) {

        updateOfflineStatus();

        return;
    }


    if (!navigator.onLine) {

        console.log(
            "Still offline. SOS synchronization postponed."
        );

        updateOfflineStatus();

        return;
    }


    console.log(
        `Attempting to synchronize ${queue.length} offline SOS request(s)...`
    );


    for (
        const item of queue
    ) {

        try {

            const result =
                await createSOS(
                    item.data
                );


            console.log(
                "Offline SOS synchronized successfully:",
                result
            );


            /*
             * Notify sos.js that the
             * offline SOS has been
             * successfully created.
             */

            window.dispatchEvent(
                new CustomEvent(
                    "resqlink:sos-synced",
                    {
                        detail:
                            result
                    }
                )
            );


            removeSOSFromOfflineQueue(
                item.id
            );


            updateOfflineStatus();


        } catch (error) {

            console.error(
                "Unable to synchronize offline SOS:",
                error
            );


            /*
             * Stop here so the request
             * remains safely stored.
             *
             * It will be retried later.
             */

            break;
        }
    }


    updateOfflineStatus();
}


function updateOfflineStatus() {

    const statusElement =
        document.getElementById(
            "offlineStatus"
        );

    if (!statusElement) {
        return;
    }


    const queue =
        getOfflineSOSQueue();


    /*
     * Device/browser is offline.
     */

    if (!navigator.onLine) {

        statusElement.textContent =
            "OFFLINE — SOS will be saved on this device";

        statusElement.className =
            "offline-status offline";

        return;
    }


    /*
     * Device is online but
     * unsynchronized SOS requests
     * are still waiting.
     */

    if (queue.length > 0) {

        statusElement.textContent =
            `ONLINE — ${queue.length} SOS request(s) waiting to sync`;

        statusElement.className =
            "offline-status waiting";

        return;
    }


    /*
     * Everything is synchronized.
     */

    statusElement.textContent =
        "ONLINE — Emergency connection available";

    statusElement.className =
        "offline-status online";
}


/*
 * Connection restored.
 */

window.addEventListener(
    "online",
    async () => {

        console.log(
            "Connection restored."
        );

        updateOfflineStatus();

        await syncOfflineSOS();
    }
);


/*
 * Connection lost.
 */

window.addEventListener(
    "offline",
    () => {

        console.log(
            "Connection lost. Offline SOS mode enabled."
        );

        updateOfflineStatus();
    }
);


/*
 * When the page loads:
 *
 * 1. Show current connection status.
 * 2. Attempt to synchronize any
 *    previously stored SOS requests.
 */

window.addEventListener(
    "load",
    async () => {

        updateOfflineStatus();

        if (navigator.onLine) {

            await syncOfflineSOS();
        }
    }
);


/*
 * Keep the status indicator updated.
 */

setInterval(
    updateOfflineStatus,
    5000
);