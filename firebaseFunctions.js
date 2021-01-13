const { join } = require("path");
const { https } = require("firebase-functions");
const { default: next } = require("next");

const isDev = process.env.NODE_ENV !== "production";
const nextjsDistDir = join("src", require("./src/next.config.js").distDir);

const nextjsServer = next({
  dev: isDev,
  conf: {
    distDir: nextjsDistDir,
  },
});
const nextjsHandle = nextjsServer.getRequestHandler();

exports.nextjsFunc = https.onRequest((req, res) => {
  const title = req.query.title;
  const text = req.query.text;
  try {
    res.set("Cache-Control", "public, max-age=600, s-maxage=600");
    const html = createHtml(title, text);
    res.status(200).end(html);
  } catch (error) {
    res.status(404).end("404 Not Found");
  }
});

exports.nextjsApi = https.onRequest((req, res) => {
  return nextjsServer.prepare().then(() => nextjsHandle(req, res));
});

const createHtml = (title, text) => {
  const SITEURL = "https://with-firebase-hosting-ap-f53e2.web.app/";
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1.0">
    <title>${title}</title>
    <meta property="og:title" content="${title}">
    <meta property="og:image" content="${SITEURL}">
    <meta property="og:description" content="${text}">
    <meta property="og:url" content="${SITEURL}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="${title}">
  </head>
  <body>
    title: ${title}<br>
    text: ${text}<br>
    <a href="/?title=てすと&text=ですよ">おためし</a>
  </body>
</html>
`;
};
