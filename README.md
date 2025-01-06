# Browser Tests
This is a simple HTML/JavaScript page for running tests on the browser. The purpose is to see what metadata can be found just using JavaScript.
This **DOES NOT** send the results of the tests to any remote server.

## Compilation

Compilation requires TypeScript to be installed.

```shell
$ tsc
```

## Usage

Launch an HTTP server to serve the HTML page, e.g.

```shell
$ python -m http.server
```

Then navigate your browser to the page served by your HTTP server.

Unfortunately, browsers behave differently when visiting a file and visiting a server.

## Interpreting Results

| Test Name              | Description                                                                                                           |
|------------------------|-----------------------------------------------------------------------------------------------------------------------|
| user-agent             | The user agent, as returned by `window.navigator.userAgent`                                                           |
| platform               | The platform (OS). This uses a deprecated method that is still included in many browsers.                             |
| do-not-track           | Whether "Do Not Track" is turned on                                                                                   |
| global-privacy-control | Whether "Global Privacy Control" is turned on                                                                         |
| webgl-enabled          | Whether WebGL functionality is enabled                                                                                |
| webgl2-enabled         | Whether WebGL 2 is enabled                                                                                            |
| language               | Available user languages                                                                                              |
| clipboard-contents     | Check if the clipboard can be fetched [^1]                                                                                |
| max-touchpoints        | Get the maximum number of touchpoints from your touch screen                                                          |
| pdf-viewer-enabled     | Check if the inline PDF viewer is enabled                                                                             |
| battery-level          | Attempt to check the current battery level. This reflects what the browser reports, which may or may not be accurate. |
| geolocation            | Check if geolocation is turned on, and check the current location if it is [^1]                                            |

[^1]: Some tests require permissions from the browser, and may not run without user interaction. To test if this functionality is truly disabled, re-run the tests with the button on the top of the page.

