const express = require("express");
const router = express.Router();

const Project =
  require("../models/Project");

router.post(
  "/save-project",
  async (req, res) => {

    const {
      name,
      roomId,
      language,
      code,
      input,
    } = req.body;

    const project =
      await Project.create({
        name,
        roomId,
        language,
        code,
        input,
      });

    res.json(project);
  }
);
router.delete("/project/:id", async (req, res) => {

  try {

    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Project Deleted",
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });

  }

});

module.exports = router;
router.get(
  "/projects",
  async (req, res) => {

    const projects =
      await Project.find().sort({
        createdAt: -1,
      });

    res.json(projects);
  }
);