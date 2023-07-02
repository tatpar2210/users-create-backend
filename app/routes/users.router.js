const express = require("express")
const router = express.Router()
const userController = require("../controllers/users.controller")
const { verifyAuth } = require("../middlewares/auth")
var multer  = require('multer')

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
      var fileObj = {
        "image/png": ".png",
        "image/jpeg": ".jpeg",
        "image/jpg": ".jpg"
      };
      if (fileObj[file.mimetype] == undefined) {
        cb(new Error("file format not valid"));
      } else {
        cb(null, req.username + fileObj[file.mimetype])
      }
  }
})

var upload = multer({ storage: storage })

// register user
router.post("/register", userController.registerUser)
router.post("/login", userController.loginUser)
router.get("/find-business-profile", userController.findUserProfile)
router.post("/reset-password", userController.resetPassword)
router.get("/all-users", userController.listAllUsers)
router.get("/users-csv", userController.userCSV)
router.post("/change-password", verifyAuth, userController.changePassword)
router.post("/profile-update", verifyAuth, userController.updateUserProfile)
router.get("/profile-get", verifyAuth, userController.getuserDetails)
router.post("/profile-image-upload", verifyAuth, upload.single("profile-image"), userController.uploadProfileImage)
router.get("/profile-image-delete", verifyAuth, userController.deleteProfileImage)
module.exports = router