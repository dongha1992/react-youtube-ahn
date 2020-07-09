const express = require("express");
const router = express.Router();
const { User } = require("../models/User");

const multer = require("multer");
var ffmpeg = require("fluent-ffmpeg");

//=================================
//             Video
//=================================

let storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== ".mp4") {
      return cb(res.status(400).end("only jpg, png, mp4 is allowed"), false);
    }
    cb(null, true);
  },
});
var upload = multer({ storage: storage }).single("file");

router.post("/uploadfiles", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.json({ success: false, err });
    }
    return res.json({
      success: true,
      url: res.req.file.path,
      fileName: res.req.file.filename,
    });
  });
});

router.post("/thumbnail", (req, res) => {
  //video running time

  let filePath = "";
  let fileDuration = "";

  // get a information of video

  ffmpeg.ffprobe(req.body.url, function (err, metadata) {
    console.dir(metadata);
    console.log(metadata.format.duration);
    fileDuration = metadata.format.duration;
  });

  //creating thumbnail
  ffmpeg(req.body.url)
    .on("filenames", function (filenames) {
      console.log("Will generate" + filenames.join(", "));
      console.log(filenames);

      filePath = "uploads/thumbnails/" + filenames[0];
    })
    .on("end", function () {
      console.log("Screenshots taken");
      return res
        .json({
          success: true,
          url: filePath,
          fileDuration: fileDuration,
        })
        .on("Error", function (err) {
          console.log(err);
          return res.json({ success: false, err });
        })
        .screenshots({
          count: 3,
          folder: "uploads/thumbnails",
          size: "320x240",
          filename: "thumbnail-%b.png",
        });
    });
});

module.exports = router;
