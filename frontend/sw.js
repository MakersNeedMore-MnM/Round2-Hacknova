const CACHE_NAME = "resqlink-v2";

const APP_SHELL = [
    "/",
    "/dashboard",
    "/css/style.css",
    "/js/api.js",
    "/js/app.js",
    "/js/gps.js",
    "/js/offline.js",
    "/js/sos.js",
    "/js/dashboard.js"
];

self.addEventListener(
    "install",
    event => {
        console.log(
            "ResQLink Service Worker installing..."
        );

        event.waitUntil(
            caches
                .open(CACHE_NAME)
                .then(cache => {
                    return Promise.all(
                        APP_SHELL.map(
                            url => {
                                return cache
                                    .add(url)
                                    .catch(
                                        error => {
                                            console.warn(
                                                "Could not cache:",
                                                url,
                                                error
                                            );
                                        }
                                    );
                            }
                        )
                    );
                })
        );

        self.skipWaiting();
    }
);

self.addEventListener(
    "activate",
    event => {
        console.log(
            "ResQLink Service Worker activated."
        );

        event.waitUntil(
            caches
                .keys()
                .then(cacheNames => {
                    return Promise.all(
                        cacheNames
                            .filter(
                                cacheName =>
                                    cacheName !==
                                    CACHE_NAME
                            )
                            .map(
                                cacheName =>
                                    caches.delete(
                                        cacheName
                                    )
                            )
                    );
                })
        );

        self.clients.claim();
    }
);

self.addEventListener(
    "fetch",
    event => {
        const request =
            event.request;

        if (
            request.method !== "GET"
        ) {
            return;
        }

        event.respondWith(
            fetch(request)
                .then(response => {
                    if (
                        response &&
                        response.status === 200
                    ) {
                        const responseClone =
                            response.clone();

                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache => {
                                    cache.put(
                                        request,
                                        responseClone
                                    );
                                }
                            );
                    }

                    return response;
                })
                .catch(
                    async () => {
                        const cachedResponse =
                            await caches.match(
                                request
                            );

                        if (
                            cachedResponse
                        ) {
                            return cachedResponse;
                        }

                        return new Response(
                            "ResQLink is currently offline.",
                            {
                                status: 503,
                                headers: {
                                    "Content-Type":
                                        "text/plain"
                                }
                            }
                        );
                    }
                )
        );
    }
);