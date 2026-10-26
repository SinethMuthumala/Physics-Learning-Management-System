const mongoose = require("mongoose");
const StudyMaterial = require("../models/StudyMaterial");

const initialMaterialsSeed = [
  {
    _id: "660000000000000000000201",
    title: "Mechanics Comprehensive Formula & Summary Sheet",
    topic: "Mechanics",
    resourceType: "Formula Sheet",
    resourceUrl: "https://www.feynmanlectures.caltech.edu/I_toc.html",
    description: "Complete summary sheet covering Newtonian dynamics, projectile motion, circular motion formulas, and dimensional analysis.",
    fileSize: "2.1 MB",
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000202",
    title: "Kirchhoff's Laws & DC Circuit Analysis Reference",
    topic: "Electricity & Magnetism",
    resourceType: "Lecture Notes",
    resourceUrl: "https://openstax.org/books/university-physics-volume-2/pages/10-3-kirchhoffs-rules",
    description: "Step-by-step problem-solving guide for multi-loop DC resistor and capacitor networks with sample worked solutions.",
    fileSize: "3.4 MB",
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000203",
    title: "Wave Superposition and Doppler Effect Reference Notes",
    topic: "Waves & Optics",
    resourceType: "PDF Document",
    resourceUrl: "https://openstax.org/books/university-physics-volume-1/pages/17-7-the-doppler-effect",
    description: "Mathematical derivations for sound wave interference, beats, standing waves in strings/pipes, and Doppler frequency shifts.",
    fileSize: "1.8 MB",
    createdAt: new Date(),
  },
  {
    _id: "660000000000000000000204",
    title: "Photoelectric Effect and Wave-Particle Duality",
    topic: "Modern Physics",
    resourceType: "Slides",
    resourceUrl: "https://openstax.org/books/university-physics-volume-3/pages/6-2-photoelectric-effect",
    description: "Einstein's photoelectric equation, stopping potential, work function, and photon energy calculations.",
    fileSize: "4.0 MB",
    createdAt: new Date(),
  },
];

let memoryMaterials = JSON.parse(JSON.stringify(initialMaterialsSeed));
const isDbConnected = () => mongoose.connection.readyState === 1;

// @desc    Get all study materials
// @route   GET /api/materials
// @access  Public
const getMaterials = async (req, res) => {
  try {
    const { topic, search } = req.query;

    if (isDbConnected()) {
      let query = {};
      if (topic && topic !== "All") query.topic = topic;
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ];
      }

      let materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
      if (materials.length === 0 && !topic && !search) {
        const count = await StudyMaterial.countDocuments();
        if (count === 0) {
          materials = await StudyMaterial.insertMany(initialMaterialsSeed.map(({ _id, ...r }) => r));
          console.log("🌱 Auto-seeded initial Study Materials into MongoDB");
        }
      }
      return res.json(materials);
    }

    // Memory fallback
    let filtered = [...memoryMaterials];
    if (topic && topic !== "All") {
      filtered = filtered.filter((m) => m.topic === topic);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (m) => m.title.toLowerCase().includes(q) || (m.description && m.description.toLowerCase().includes(q))
      );
    }
    res.json(filtered);
  } catch (error) {
    console.error("Error fetching materials:", error);
    res.status(500).json({ message: "Server error fetching study materials" });
  }
};

// @desc    Get single material by ID
// @route   GET /api/materials/:id
// @access  Public
const getMaterialById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      const material = await StudyMaterial.findById(id);
      if (material) return res.json(material);
    }

    const found = memoryMaterials.find((m) => String(m._id) === String(id));
    if (!found) {
      return res.status(404).json({ message: "Study material not found" });
    }
    res.json(found);
  } catch (error) {
    res.status(500).json({ message: "Server error fetching material" });
  }
};

// @desc    Create study material
// @route   POST /api/materials
// @access  Teacher
const createMaterial = async (req, res) => {
  try {
    const { title, topic, resourceType, resourceUrl, description, fileSize } = req.body;

    if (!title || !resourceUrl) {
      return res.status(400).json({ message: "Title and Resource URL are required" });
    }

    const materialData = {
      title: title.trim(),
      topic: topic || "General Physics",
      resourceType: resourceType || "PDF Document",
      resourceUrl: resourceUrl.trim(),
      description: description ? description.trim() : "",
      fileSize: fileSize || "1.5 MB",
    };

    if (isDbConnected()) {
      const material = await StudyMaterial.create(materialData);
      memoryMaterials.unshift(material.toObject());
      return res.status(201).json(material);
    }

    const memoryItem = {
      _id: new mongoose.Types.ObjectId().toString(),
      ...materialData,
      createdAt: new Date(),
    };
    memoryMaterials.unshift(memoryItem);
    res.status(201).json(memoryItem);
  } catch (error) {
    console.error("Error creating material:", error);
    res.status(500).json({ message: error.message || "Server error creating material" });
  }
};

// @desc    Update study material
// @route   PUT /api/materials/:id
// @access  Teacher
const updateMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, topic, resourceType, resourceUrl, description, fileSize } = req.body;

    if (isDbConnected()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid material ID" });
      }

      const updated = await StudyMaterial.findByIdAndUpdate(
        id,
        {
          ...(title && { title: title.trim() }),
          ...(topic && { topic }),
          ...(resourceType && { resourceType }),
          ...(resourceUrl && { resourceUrl: resourceUrl.trim() }),
          ...(description !== undefined && { description: description.trim() }),
          ...(fileSize && { fileSize }),
        },
        { new: true, runValidators: true }
      );

      if (!updated) {
        return res.status(404).json({ message: "Study material not found" });
      }
      return res.json(updated);
    }

    const idx = memoryMaterials.findIndex((m) => String(m._id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ message: "Study material not found" });
    }

    if (title) memoryMaterials[idx].title = title.trim();
    if (topic) memoryMaterials[idx].topic = topic;
    if (resourceType) memoryMaterials[idx].resourceType = resourceType;
    if (resourceUrl) memoryMaterials[idx].resourceUrl = resourceUrl.trim();
    if (description !== undefined) memoryMaterials[idx].description = description.trim();
    if (fileSize) memoryMaterials[idx].fileSize = fileSize;

    res.json(memoryMaterials[idx]);
  } catch (error) {
    res.status(500).json({ message: error.message || "Server error updating material" });
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Teacher
const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;

    if (isDbConnected() && mongoose.Types.ObjectId.isValid(id)) {
      await StudyMaterial.findByIdAndDelete(id);
    }

    memoryMaterials = memoryMaterials.filter((m) => String(m._id) !== String(id));
    res.json({ message: "Study material deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error deleting material" });
  }
};

module.exports = {
  getMaterials,
  getMaterialById,
  createMaterial,
  updateMaterial,
  deleteMaterial,
};
