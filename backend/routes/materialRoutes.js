const express = require("express");
const router = express.Router();
const {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} = require("../controllers/materialController");
const { protect, teacherOnly } = require("../middleware/authMiddleware");

router.route("/")
  .get(getMaterials)
  .post(protect, teacherOnly, createMaterial);

router.route("/:id")
  .get(getMaterialById)
  .put(protect, teacherOnly, updateMaterial)
  .delete(protect, teacherOnly, deleteMaterial);

module.exports = router;
