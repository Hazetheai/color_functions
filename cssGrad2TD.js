const { cssGradientToTD } = require("./color-converter");
const fs = require("fs");
const args = process.argv.slice(2);

try {
  const cssFileName = args[0];

  if (!cssFileName) {
    throw Error("No file specified");
  }
  if (fs.existsSync(__dirname + "/input/" + cssFileName)) {
    cssGradientToTD(fs.readFileSync(__dirname + "/input/" + cssFileName));
  }
} catch (err) {
  console.error(err);
}
