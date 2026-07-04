const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { randomUUID } = require("crypto");

const router = express.Router();

router.get("/check", (req, res) => {
  exec("g++ --version", (err, stdout, stderr) => {
    res.send(stdout || stderr || err?.message);
  });
});

router.post("/run", (req, res) => {

   // pura run wala code

});

router.post("/run", (req, res) => {
  const { code, language, input } = req.body;

  console.log("POST /api/run");
  console.log("Language:", language);

  const id = randomUUID();

  try {
    // ================= C++ =================
    if (language === "cpp") {
      const cppFile = path.join(__dirname, `${id}.cpp`);
      const exeFile = path.join(__dirname, id);
      const inputFile = path.join(__dirname, `${id}.txt`);

      fs.writeFileSync(cppFile, code);
      fs.writeFileSync(inputFile, input || "");

      exec(
        `g++ -std=c++17 "${cppFile}" -o "${exeFile}" && "${exeFile}" < "${inputFile}"`,
        (error, stdout, stderr) => {

          [cppFile, exeFile, inputFile].forEach((file) => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          });

          if (error) {
            return res.json({
              output: stderr || error.message,
            });
          }

          return res.json({
            output: stdout || "Program executed successfully",
          });
        }
      );
    }

    // ================= Python =================
    else if (language === "python") {
      const pyFile = path.join(__dirname, `${id}.py`);
      const inputFile = path.join(__dirname, `${id}.txt`);

      fs.writeFileSync(pyFile, code);
      fs.writeFileSync(inputFile, input || "");

      exec(
        `python3 "${pyFile}" < "${inputFile}"`,
        (error, stdout, stderr) => {

          [pyFile, inputFile].forEach((file) => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          });

          if (error) {
            return res.json({
              output: stderr || error.message,
            });
          }

          return res.json({
            output: stdout,
          });
        }
      );
    }

    // ================= JavaScript =================
    else if (language === "javascript") {
      const jsFile = path.join(__dirname, `${id}.js`);
      const inputFile = path.join(__dirname, `${id}.txt`);

      fs.writeFileSync(jsFile, code);
      fs.writeFileSync(inputFile, input || "");

      exec(
        `node "${jsFile}" < "${inputFile}"`,
        (error, stdout, stderr) => {

          [jsFile, inputFile].forEach((file) => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
            }
          });

          if (error) {
            return res.json({
              output: stderr || error.message,
            });
          }

          return res.json({
            output: stdout,
          });
        }
      );
    }

    else {
      return res.json({
        output: "Language not supported",
      });
    }

  } catch (err) {
    console.log("SERVER ERROR:", err);

    return res.status(500).json({
      output: err.message,
    });
  }
});

module.exports = router;