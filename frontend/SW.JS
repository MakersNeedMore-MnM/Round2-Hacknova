const CACHE_NAME = "resqlink-v1";

const APP_SHELL = [
    "/",
    "/dashboard",
    "/css/style.css",
    "/js/api.js",
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
            caches.open(
                CACHE_NAME
            ).then(
                cache => {

                    return cache.addAll(
                        APP_SHELL
                    );
                }
            )
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

            caches.keys().then(
                cacheNames => {

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
                }
            )
        );

        self.clients.claim();
    }
);


self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        /*
         * Only handle GET requests.
         *
         * POST requests such as SOS
         * continue going to the backend.
         */

        if (
            request.method !== "GET"
        ) {
            return;
        }


        event.respondWith(

            fetch(request)
                .then(
                    response => {

                        /*
                         * Save successful responses
                         * in the cache.
                         */

                        const responseClone =
                            response.clone();

                        caches.open(
                            CACHE_NAME
                        ).then(
                            cache => {

                                cache.put(
                                    request,
                                    responseClone
                                );
                            }
                        );

                        return response;
                    }
                )
                .catch(
                    async () => {

                        /*
                         * Network unavailable.
                         *
                         * Return the cached version.
                         */

                        const cachedResponse =
                            await caches.match(
                                request
                            );

                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;
                        }


                        /*
                         * If nothing is cached,
                         * return a simple offline
                         * response.
                         */

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