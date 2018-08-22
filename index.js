/**
 * @description JW Player media sources scraper
 * @author Furkan Inanc
 * @version 1.0.0
 */

let puppeteer = require("puppeteer");

/**
 * A class to scrape JW Player media sources
 * @class
 */
class jwplayerScraper {
  /**
   * Constructor for the class
   */
  constructor() {
    this.DEFAULT_JWPLAYER_FILENAME = "jwplayer.js";
  }

  /**
   * Scrapes the media source
   * @param {String} pageUrl URL of the page that needs to be scraped
   * @param {Object} options Additional options
   * @returns {Promise<Array>}
   */
  getMediaSources(pageUrl, options = {}) {
    return new Promise(async resolve => {
      let browser = await puppeteer.launch();
      let page = await browser.newPage();
      let sources = [];

      /**
       * This line is obligatory. We will need to intercept the 'jwplayer.js' file's request to
       * get the sources.
       */
      await page.setRequestInterception(true);

      /**
       * We will need to communicate with the page to get the media sources.
       * We will do it using console.log() on the page and checking the data
       * that is logged to see if it's what we need.
       */
      page.on("console", message => {
        try {
          sources = JSON.parse(message.text()).scrapeList;
        } catch (error) {}
      });

      /**
       * We will intercept the 'jwplayer.js' file's request, so that we can manipulate the code
       * into giving us the media sources.
       */
      page.on("request", async request => {
        if (
          ["script"].indexOf(request.resourceType()) !== -1 &&
          request._url.indexOf(
            options.jwplayerFilename
              ? options.jwplayerFilename
              : this.DEFAULT_JWPLAYER_FILENAME
          ) !== -1
        ) {
          /**
           * This part stops the 'jwplayer.js' from loading, and responds with the code we've created to
           * capture the media sources list instead.
           */
          request.respond({
            contentType: "application/javascript",
            body:
              "function jwplayer(){return{setup:function(i){i.file?console.log(JSON.stringify({scrapeList:[{file:i.file}]})):i.sources?console.log(JSON.stringify({scrapeList:i.sources})):i.playlist&&$.get(i.playlist,function(i){var s=[];i.playlist.forEach(function(i){i.sources.forEach(function(i){s.push(i)})}),console.log(JSON.stringify({scrapeList:s}))})}}}"
          });
        } else {
          /**
           * If it's not the 'jwplayer.js' file, it should continue with the request.
           */
          request.continue();
        }
      });

      /**
       * Script will run until the page is fully loaded. Otherwise we may not be able to get
       * the media sources.
       */
      await page.goto(pageUrl, {
        waitUntil: "networkidle2"
      });

      /**
       * No need to keep the browser open when the job is done. ;)
       */
      await browser.close();
      resolve(sources);
    });
  }
}

module.exports = jwplayerScraper;
