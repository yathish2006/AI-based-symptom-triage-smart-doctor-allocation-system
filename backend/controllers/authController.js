const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Staff = require('../models/Staff');
const { generateToken } = require('../utils/helpers');

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    // Validate required fields
    if (!name || !email || !password || !phone || !role) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide all required fields' 
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Create user
    user = await User.create({
      name,
      email,
      password,
      phone,
      role
    });

    // Create role-specific profile
    if (role === 'patient') {
      await Patient.create({ 
        userId: user._id,
        name: user.name
      });
    } else if (role === 'doctor') {
      const { license, specialization, experience, qualifications, hospitalAffiliation } = req.body;
      
      // Validate doctor-specific required fields
      if (!license || !specialization) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          success: false, 
          message: 'Medical license and specialization are required for doctor registration' 
        });
      }

      await Doctor.create({ 
        userId: user._id,
        name: user.name,
        license,
        specialization,
        experience: experience || 0,
        qualifications: qualifications || [],
        hospitalAffiliation: hospitalAffiliation || ''
      });
    } else if (role === 'staff') {
      const { department, position, shift, hospitalAffiliation } = req.body;
      
      // Validate staff-specific required fields
      if (!department) {
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({ 
          success: false, 
          message: 'Department is required for staff registration' 
        });
      }

      await Staff.create({ 
        userId: user._id,
        name: user.name,
        department,
        position: position || '',
        shift: shift || '',
        hospitalAffiliation: hospitalAffiliation || ''
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({ 
        success: false, 
        message: 'Your account has been deactivated' 
      });
    }

    // Match password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user._id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
