export {
    Tests,
    main,
};


/* The tests */

type tests = Map<string, () => (string|Promise<string>)>;

const Tests: tests = {
    "test-run-time": () => {
        const day = new Date;
        return day.toLocaleString("sv", {timeZoneName: "shortOffset"});
    },
    "time-zone": () => {
        const offset = new Date().getTimezoneOffset();
        // The offset is positive in the Western hemisphere (i.e. UTC-something)
        return `UTC${offset >= 0 ? '+' : '-'}${offset / 60}`;
    },
    // Get the current user agent
    "user-agent": () => window.navigator.userAgent,
    "platform": () => {
        try {
            // This is technically deprecated, but still works
            return navigator.platform;
        } catch {
            return "null";
        }
    },
    "build-id": () => {
        // This is only for Firefox
        type navi = {
            buildID?: String
        };
        const nav = navigator as unknown as navi;
        return nav.buildID;
    },
    "do-not-track": () => boolToString(window.navigator.doNotTrack == "1"),
    // Check if global pricacy control is enabled
    // Can only be "True" or "False" - not supported is false
    "global-privacy-control": () => {
        // This only exists in supported browsers, e.g. Firefox, Brave
        type navi = {
            globalPrivacyControl?: Boolean,
        };
        const nav = window.navigator as unknown as navi;
        if (nav["globalPrivacyControl"] == null) {
            return "False";            
        }
        return boolToString(nav["globalPrivacyControl"]);
    },
    // Check for webgl
    "webgl-enabled": () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("webgl");
        return boolToString(ctx != null);
    },
    "webgl2-enabled": () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("webgl2");
        return boolToString(ctx != null);
    },
    // Get supported languages
    // The function embedding is necessary
    "language": () => {return navigator.languages.toString()},
    // Get clipboard contents. Should error on Firefox, since user interaction is required.
    "clipboard-contents": async () => {
        // Only works over https
        return navigator.clipboard.readText();
    },
    // Touchscreen
    "max-touchpoints": () => `${navigator.maxTouchPoints}`,
    // Check if the built-in PDF viewer is enabled
    "pdf-viewer-enabled": () => boolToString(navigator.pdfViewerEnabled),
    // Check if we can get the battery level
    "battery-level": async () => {
        type bat = {
            level: number,
        };
        type navi = {
            getBattery?: () => Promise<bat>,
        };
        const nav: navi = window.navigator as unknown as navi;
        if (nav["getBattery"] != null) {
            const battery = await nav["getBattery"]();
            return `${battery.level * 100}%`;
        } else {
            return "null";
        }
    },
    "hardware-concurrency": () => navigator.hardwareConcurrency.toString(),
    "geolocation": () => {
        return new Promise((resolve) => {
            try {
                window.navigator.geolocation.getCurrentPosition((pos) => {
                    resolve(JSON.stringify(pos.toJSON(), null, 4));
                }, (error) => {
                    resolve(error.message);
                });
            } catch { // Undefined
                resolve("null");
            }
        });
    },
    "cookie-enabled": () => boolToString(navigator.cookieEnabled),
    // Deprecated function
    "java-enabled": () => boolToString(navigator.javaEnabled()),
    // Check if the user is online
    "online": () => boolToString(navigator.onLine),
    "navigator": () => boolToString(navigator.webdriver),
    "user-active": () => {
        const val = navigator.userActivation;
        // JSON.stringify returns an empty object
        return `{"hasBeenActive": ${val.hasBeenActive}, "isActive": ${val.isActive}}`;
    },
    "taint-enabled": () => {
        // This is deprecated and should always return false, if it is present at all
        type navi = {
            taintEnabled?: () => boolean,
        };
        const nav = navigator as unknown as navi;
        if (nav.taintEnabled === undefined || nav.taintEnabled === null) return null;
        return boolToString(nav.taintEnabled());
    }
} as unknown as tests; // Hacky, but works

// The main function to run the tests and display results
async function main() {
    for (const [name, func] of Object.entries(Tests)) {
        try {
            const result = func();
            if (typeof result == "string") {
                createRow(name, result);
            } else if (typeof result === undefined || result == null) {
                createRow(name, "null");
            } else {
                handleAsyncReturn(name, result);
            }
        } catch (e) {
            createRow(name, `${e}`, true);
        }
    }
}

// Run the main function
document.addEventListener("DOMContentLoaded", () => {
    main();
    document.getElementById("run-tests")?.addEventListener("click", (e) => {
        e.preventDefault();
        const body = document.getElementById("results");
        // Clear existing content
        if (body != null) {
            body.innerHTML = "";
        }
        // Run tests again
        main();
    });
});


/* Helper Functions */

function boolToString(b: Boolean): string {
    return b ? "True" : "False";
}

function createTableTitle(name: string): Element {
    const element = document.createElement("th");
    element.setAttribute("class", "test-name");
    element.appendChild(document.createTextNode(name));
    return element;
}
function createTableValue(val: string): Element {
    const element = document.createElement("td");
    element.setAttribute("class", "test-result");
    element.appendChild(document.createTextNode(val));
    return element;
}

function createRow(name: string, val: string, error?: Boolean): Element {
    const table = document.getElementById("results");
    const row = document.createElement("tr");
    row.appendChild(createTableTitle(name));
    row.appendChild(createTableValue(val));
    table?.appendChild(row);
    if (error) {
        row.classList.add("error");
    }
    return row;
}

function handleAsyncReturn(name: string, val: Promise<string>) {
    const row: Element = createRow(name, "Running...");
    if (row.getElementsByTagName("td").length != 1) {
        throw new Error("Invalid number of table data rows!");
    }
    const dataCell = row.getElementsByTagName("td")[0];
    val.then((ret) => {
        dataCell.innerText = ret;
    }).catch((error) =>{
        dataCell.innerText = `${error}`;
        row.classList.add("error");
    })
}
