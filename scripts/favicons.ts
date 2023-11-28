/* eslint-disable no-continue */
/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
const fs = require('fs-extra');
const favicons = require('favicons');
const package = require('../package.json');

const source = `${__dirname}/../public/images/icon.jpg`; // Source image(s). `string`, `buffer` or array of `string`
const configuration = {
  url: package.url,
  path: '/', // Path for overriding default icons path. `string`
  appName: package.name, // Your application's name. `string`
  appShortName: package.name, // Your application's short_name. `string`. Optional. If not set, appName will be used
  appDescription: package.description, // Your application's description. `string`
  developerName: package.author.name, // Your (or your developer's) name. `string`
  developerURL: package.author.url, // Your (or your developer's) URL. `string`
  dir: 'auto', // Primary text direction for name, short_name, and description
  lang: 'en-GB', // Primary language for name and short_name
  background: '#fff', // Background colour for flattened icons. `string`
  theme_color: '#fff', // Theme color user for example in Android's task switcher. `string`
  appleStatusBarStyle: 'black-translucent', // Style for Apple status bar: "black-translucent", "default", "black". `string`
  display: 'standalone', // Preferred display mode: "fullscreen", "standalone", "minimal-ui" or "browser". `string`
  orientation: 'any', // Default orientation: "any", "natural", "portrait" or "landscape". `string`
  // scope: "/", // set of URLs that the browser considers within your app
  // start_url: "/", // Start URL when launching the application from a device. `string`
  version: package.version, // Your application's version string. `string`
  logging: true, // Print logs to console? `boolean`
  pixel_art: false, // Keeps pixels "sharp" when scaling up, for pixel art.  Only supported in offline mode.
  loadManifestWithCredentials: false, // Browsers don't send cookies when fetching a manifest, enable this to fix that. `boolean`
  icons: {
    // Platform Options:
    // - offset - offset in percentage
    // - background:
    //   * false - use default
    //   * true - force use default, e.g. set background for Android icons
    //   * color - set background for the specified icons
    //   * mask - apply mask in order to create circle icon (applied by default for firefox). `boolean`
    //   * overlayGlow - apply glow effect after mask has been applied (applied by default for firefox). `boolean`
    //   * overlayShadow - apply drop shadow after mask has been applied .`boolean`
    //
    android: true, // Create Android homescreen icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    appleIcon: true, // Create Apple touch icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    appleStartup: true, // Create Apple startup images. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    coast: true, // Create Opera Coast icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    favicons: true, // Create regular favicons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    firefox: true, // Create Firefox OS icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    windows: true, // Create Windows 8 tile icons. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
    yandex: true, // Create Yandex browser icon. `boolean` or `{ offset, background, mask, overlayGlow, overlayShadow }`
  },
};

favicons(source, configuration, async (error, response) => {
  if (error) {
    console.error(error.message); // Error description e.g. "An unknown error has occurred"
    return;
  }

  /**
   * Save all images
   */
  for (const image of response.images) {
    await fs.writeFile(`${__dirname}/../public/icons/${image.name}`, image.contents);
  }

  /**
   * Save all files
   */
  for (const file of response.files) {
    /**
     * Prepend manifest icons with url
     */
    if (file.name === 'manifest.json') {
      const data = JSON.parse(file.contents);
      data.icons = data.icons.map((i) => {
        // eslint-disable-next-line no-param-reassign
        i.src = `/icons${i.src}`;
        return i;
      });
      await fs.writeFile(`${__dirname}/../public/${file.name}`, JSON.stringify(data, null, 2));
      continue;
    }

    await fs.writeFile(`${__dirname}/../public/${file.name}`, file.contents);
  }

  /**
   * Output html
   */
  console.log(response.html);
});
