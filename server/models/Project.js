const mongoose = require("mongoose");

const ProjectSchema =
  new mongoose.Schema(
    {
      name: String,
      roomId: String,
      language: String,
      code: String,
      input: String,
    },
    {
      timestamps: true,
    }
  );

module.exports = mongoose.model(
  "Project",
  ProjectSchema
);