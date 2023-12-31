require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const dns = require("dns");
const fs = require("fs");

const bodyParser = require("body-parser");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.use(bodyParser.urlencoded({ extended: true }));

// Your first API endpoint
app.get("/api/hello", function (req, res) {
  res.json({ greeting: "hello API" });
});

const shortenedURLFile = "shortURLsFile.txt";
// API to covert the given URL to shorturl
app.post("/api/shorturl", (req, res) => {
  // Variable for the URL which needs to be shortened
  const urlToShorten = req.body.url;
  // Verfiying if the validity of the URL Given above.
  dns.lookup(urlToShorten, (err, address, family) => {
    // If the URL provided is Invalid
    if (err) return res.json({ error: "Invalid Hostname" });
    // If the URL provided is Valid
    // Checking the existence of the file which stores the values of the Shortened URLs
    fs.readFile(shortenedURLFile, "utf-8", (err, data) => {
      // If the file doesn't exists.
      if (err) {
        dataToInsertFirstTime = [
          {
            original_url: urlToShorten,
            short_url: 1,
          },
        ];
        fs.writeFile(
          shortenedURLFile,
          JSON.stringify(dataToInsertFirstTime),
          (err) => {
            if (err) return console.log(err);
          }
        );
        res.json(dataToInsertFirstTime[0]);
      }
      // If the file exists.
      else {
        let retrievedData = JSON.parse(data);
        let foundValue = retrievedData.find((item) => {
          return item.original_url == urlToShorten;
        });
        if (foundValue) {
          res.json(foundValue);
        } else {
          // Pushing a new Short URL to the Shortened URLs array
          const newShortenedURLValues = {
            original_url: urlToShorten,
            short_url: retrievedData.length + 1,
          };
          retrievedData.push(newShortenedURLValues);
          // Updating the new Values to the file.
          fs.writeFile(
            shortenedURLFile,
            JSON.stringify(retrievedData),
            (err) => {
              err
                ? console.log(err)
                : console.log("Updated the files with new data.");
            }
          );
          res.json(newShortenedURLValues);
          // console.log(retrievedData);
        }
      }
    });
  });
});

// API to redirect the short url
app.get("/api/shorturl/:shorturl", function (req, res) {
  const findShort_url = req.params.shorturl;
  fs.readFile(shortenedURLFile, "utf-8", (err, data) => {
    const shortValueArray = JSON.parse(data);
    let foundShortValue = shortValueArray.find((item) => {
      console.log(item.short_url, findShort_url);
      return item.short_url === parseInt(findShort_url);
    });
    console.log(foundShortValue);
    if (foundShortValue) {
      res.redirect(`${foundShortValue.original_url}`);
    } else {
      res.json({
        error: "No short URL found for the given input",
      });
    }
  });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
