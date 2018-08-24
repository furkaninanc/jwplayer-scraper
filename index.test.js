var scraper = require("./index.js");
var demoUrl =
  "https://developer.jwplayer.com/jw-player/demos/customization/custom-icons/";

(async function() {
  try {
    console.log("Starting test...");

    let sources = await scraper.getMediaSources(demoUrl, {
      jwplayerFilename: "developer.min.js"
    });

    if (sources.length > 0) {
      console.log("Success!");
    } else {
      throw new Error("Could not get the sources from the demo URL.");
    }
  } catch (error) {
    throw new Error("Oops, an error occurred!", error);
  }
})();
