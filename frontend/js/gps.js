const LAST_LOCATION_KEY =
    "resqlink_last_location";

let selectedLocation = null;


function saveLastLocation(location) {

    const locationData = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        saved_at: new Date().toISOString()
    };

    localStorage.setItem(
        LAST_LOCATION_KEY,
        JSON.stringify(locationData)
    );

    selectedLocation = locationData;

    updateLocationInfo(
        "Last GPS location saved."
    );

    return locationData;
}


function getLastLocation() {

    const stored =
        localStorage.getItem(
            LAST_LOCATION_KEY
        );

    if (!stored) {
        return null;
    }

    try {

        return JSON.parse(stored);

    } catch (error) {

        console.error(
            "Unable to read saved location:",
            error
        );

        return null;
    }
}


function setSelectedLocation(location) {

    selectedLocation = {
        latitude: Number(location.latitude),
        longitude: Number(location.longitude)
    };

    updateLocationInfo(
        `Location selected: ${selectedLocation.latitude}, ${selectedLocation.longitude}`
    );
}


function getSelectedLocation() {

    return selectedLocation;
}


function updateLocationInfo(message) {

    const element =
        document.getElementById(
            "locationInfo"
        );

    if (element) {
        element.textContent = message;
    }
}


/*
 * Get fresh GPS location.
 */

function getLocation() {

    return new Promise(
        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "GPS is not supported"
                    )
                );

                return;
            }

            navigator.geolocation.getCurrentPosition(

                position => {

                    const location = {
                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude
                    };

                    saveLastLocation(
                        location
                    );

                    resolve(location);
                },

                error => {

                    console.warn(
                        "Fresh GPS unavailable:",
                        error.message
                    );

                    const lastLocation =
                        getLastLocation();

                    if (lastLocation) {

                        setSelectedLocation(
                            lastLocation
                        );

                        resolve(
                            lastLocation
                        );

                        return;
                    }

                    reject(
                        new Error(
                            "No GPS location available"
                        )
                    );
                },

                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        }
    );
}


/*
 * Use previously saved location.
 */

function useLastSavedLocation() {

    const lastLocation =
        getLastLocation();

    if (!lastLocation) {

        updateLocationInfo(
            "No saved location is available yet."
        );

        return null;
    }

    setSelectedLocation(
        lastLocation
    );

    return lastLocation;
}


/*
 * Save manually entered location.
 */

function saveManualLocation() {

    const latitude =
        Number(
            document.getElementById(
                "manualLatitude"
            ).value
        );

    const longitude =
        Number(
            document.getElementById(
                "manualLongitude"
            ).value
        );


    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        updateLocationInfo(
            "Please enter valid latitude and longitude."
        );

        return null;
    }


    if (
        latitude < -90 ||
        latitude > 90
    ) {

        updateLocationInfo(
            "Latitude must be between -90 and 90."
        );

        return null;
    }


    if (
        longitude < -180 ||
        longitude > 180
    ) {

        updateLocationInfo(
            "Longitude must be between -180 and 180."
        );

        return null;
    }


    const location = {
        latitude: latitude,
        longitude: longitude
    };


    saveLastLocation(
        location
    );


    setSelectedLocation(
        location
    );


    document.getElementById(
        "manualLocationForm"
    ).style.display = "none";


    return location;
}


/*
 * Location button events.
 */

window.addEventListener(
    "load",
    () => {

        const lastLocation =
            getLastLocation();


        if (lastLocation) {

            updateLocationInfo(
                `Saved location available: ${lastLocation.latitude}, ${lastLocation.longitude}`
            );
        }


        const useLastButton =
            document.getElementById(
                "useLastLocationButton"
            );


        if (useLastButton) {

            useLastButton.addEventListener(
                "click",
                () => {

                    useLastSavedLocation();
                }
            );
        }


        const manualButton =
            document.getElementById(
                "manualLocationButton"
            );


        if (manualButton) {

            manualButton.addEventListener(
                "click",
                () => {

                    const form =
                        document.getElementById(
                            "manualLocationForm"
                        );

                    form.style.display =
                        form.style.display === "none"
                            ? "block"
                            : "none";
                }
            );
        }


        const saveManualButton =
            document.getElementById(
                "saveManualLocationButton"
            );


        if (saveManualButton) {

            saveManualButton.addEventListener(
                "click",
                () => {

                    saveManualLocation();
                }
            );
        }
    }
);