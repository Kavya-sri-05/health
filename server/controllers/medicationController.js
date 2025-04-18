const Medication = require('../models/medicationModel');

// @desc    Get all medications for a user
// @route   GET /api/medications
// @access  Private
const getMedications = async (req, res) => {
  try {
    const medications = await Medication.find({ userId: req.user._id })
      .sort({ active: -1, name: 1 });
    
    res.json(medications);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get medications',
      error: error.message
    });
  }
};

// @desc    Get a single medication
// @route   GET /api/medications/:id
// @access  Private
const getMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check if medication belongs to requesting user
    if (medication.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to access this medication' });
    }
    
    res.json(medication);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get medication',
      error: error.message
    });
  }
};

// @desc    Create a new medication
// @route   POST /api/medications
// @access  Private
const createMedication = async (req, res) => {
  try {
    const medication = new Medication({
      ...req.body,
      userId: req.user._id
    });
    
    const createdMedication = await medication.save();
    
    res.status(201).json(createdMedication);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to create medication',
      error: error.message
    });
  }
};

// @desc    Update a medication
// @route   PUT /api/medications/:id
// @access  Private
const updateMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check if medication belongs to requesting user
    if (medication.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this medication' });
    }
    
    // Update fields
    Object.keys(req.body).forEach(key => {
      medication[key] = req.body[key];
    });
    
    const updatedMedication = await medication.save();
    
    res.json(updatedMedication);
  } catch (error) {
    res.status(400).json({
      message: 'Failed to update medication',
      error: error.message
    });
  }
};

// @desc    Delete a medication
// @route   DELETE /api/medications/:id
// @access  Private
const deleteMedication = async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check if medication belongs to requesting user
    if (medication.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this medication' });
    }
    
    await medication.deleteOne();
    
    res.json({ message: 'Medication removed' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete medication',
      error: error.message
    });
  }
};

module.exports = {
  getMedications,
  getMedication,
  createMedication,
  updateMedication,
  deleteMedication
};