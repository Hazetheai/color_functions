const { HSLAToRGBA } = require("./color-converter");
const { HSLARe } = require("./color-regexes");
const fs = require("fs");
const converter = require("json-2-csv");

const pastedText = `background: hsla(356, 68%, 91%, 1);

background: radial-gradient(circle, hsla(356, 68%, 91%, 1) 0%, hsla(140, 60%, 82%, 1) 50%, hsla(316, 66%, 80%, 1) 100%);

background: -moz-radial-gradient(circle, hsla(356, 68%, 91%, 1) 0%, hsla(140, 60%, 82%, 1) 50%, hsla(316, 66%, 80%, 1) 100%);

background: -webkit-radial-gradient(circle, hsla(356, 68%, 91%, 1) 0%, hsla(140, 60%, 82%, 1) 50%, hsla(316, 66%, 80%, 1) 100%);

filter: progid: DXImageTransform.Microsoft.gradient( startColorstr="#F8DADC", endColorstr="#B6EDC8", GradientType=1 );`;

const applicableTextRe = /background:\s\w[gradient].+;/;

const gradientString =
  "background: radial-gradient(circle, hsla(356, 68%, 91%, 1) 0%, hsla(140, 60%, 82%, 1) 50%, hsla(316, 66%, 80%, 1) 100%)";

function extractGradientString(formattedstring) {
  return applicableTextRe.exec(formattedstring)[0].replace(";", "");
}

function extractHSLAVals(str) {
  return str
    .replace(/[^hs]+/, "")
    .replace(/\)$/, "")
    .split(", hsla")
    .map((el, idx) => (idx > 0 ? `hsla${el}` : el))
    .map((el) => ({
      color: /.+\)/.exec(el)[0],
      stop: /\d(\d)?(\d)?%$/.exec(el) ? /\d(\d)?(\d)?%$/.exec(el)[0] : "0%",
    }));
}

function convertToRgbVals(hslaVals) {
  return hslaVals.map((el) => {
    return {
      color: HSLAToRGBA(el.color),
      stop: parseFloat(el.stop.replace(/\D/, ""), 10) / 100,
    };
  });
}

function rgbToDecimal(num) {
  return parseFloat(num / 255, 10).toFixed(7);
}

function convertToTDVals(rgbaVals) {
  return rgbaVals.map((val) => {
    console.log(`val`, val);
    const rgbaArr = /\(.+\)/
      .exec(val.color)[0]
      .split(",")
      .map((el) => el.replace(/\D/, ""));
    return {
      pos: val.stop,
      r: rgbToDecimal(rgbaArr[0]),
      g: rgbToDecimal(rgbaArr[1]),
      b: rgbToDecimal(rgbaArr[2]),
      a: rgbToDecimal(rgbaArr[3]),
    };
  });
}

(async function run() {
  try {
    const applicableString = extractGradientString(pastedText);

    const hslaVals = extractHSLAVals(applicableString);

    const rgbaVals = convertToRgbVals(hslaVals);

    const TDVals = convertToTDVals(rgbaVals);

    // fs.writeFileSync(
    //   __dirname + "/output/tdRampData.json",
    //   JSON.stringify(TDVals)
    // );

    let json2csvCallback = function (err, csv) {
      if (err) throw err;

      fs.writeFileSync(__dirname + "/output/tdRampData.csv", csv);
    };

    converter.json2csv(TDVals, json2csvCallback);
  } catch (err) {
    console.log(err);
  }
})();
