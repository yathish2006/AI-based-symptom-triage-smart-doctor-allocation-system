const jwt = require('jsonwebtoken');

exports.generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Symptom to disease mapping and AI analysis
const symptomDatabase = {
  fever: { diseases: ['Flu', 'COVID-19', 'Malaria', 'Dengue'], severity: 'medium' },
  cough: { diseases: ['Cold', 'Flu', 'Pneumonia', 'COVID-19', 'Asthma'], severity: 'medium' },
  headache: { diseases: ['Migraine', 'Tension Headache', 'Flu', 'Meningitis'], severity: 'low' },
  'body ache': { diseases: ['Flu', 'COVID-19', 'Dengue', 'Muscle Strain'], severity: 'medium' },
  'sore throat': { diseases: ['Strep Throat', 'Cold', 'Pharyngitis', 'COVID-19'], severity: 'low' },
  'difficulty breathing': { diseases: ['Asthma', 'Pneumonia', 'COVID-19', 'Heart Disease'], severity: 'high' },
  'chest pain': { diseases: ['Heart Attack', 'Angina', 'Pneumonia', 'Anxiety'], severity: 'high' },
  diarrhea: { diseases: ['Gastroenteritis', 'Food Poisoning', 'IBS', 'Cholera'], severity: 'medium' },
  nausea: { diseases: ['Gastroenteritis', 'Migraine', 'Pregnancy', 'Food Poisoning'], severity: 'low' },
  fatigue: { diseases: ['Anemia', 'Depression', 'Thyroid Disorder', 'Chronic Fatigue'], severity: 'low' }
};

exports.analyzeSymptomsAI = (symptoms) => {
  const symptoms_lower = symptoms.map(s => s.toLowerCase());
  
  // Aggregate diseases from all symptoms
  const diseaseMap = {};
  symptoms_lower.forEach(symptom => {
    const symptomData = symptomDatabase[symptom];
    if (symptomData) {
      symptomData.diseases.forEach(disease => {
        diseaseMap[disease] = (diseaseMap[disease] || 0) + 1;
      });
    }
  });

  // Calculate probabilities
  const potentialDiseases = Object.entries(diseaseMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([disease, count]) => ({
      disease,
      probability: Math.min(100, (count / symptoms_lower.length) * 100)
    }));

  // Determine risk level and emergency status
  const emergencySymptoms = ['difficulty breathing', 'chest pain'];
  const hasEmergencySymptom = symptoms_lower.some(s => emergencySymptoms.includes(s));
  
  let riskLevel = 'LOW';
  let isEmergency = false;
  
  if (hasEmergencySymptom) {
    riskLevel = 'CRITICAL';
    isEmergency = true;
  } else if (symptoms_lower.length >= 5) {
    riskLevel = 'HIGH';
  } else if (symptoms_lower.length >= 3) {
    riskLevel = 'MEDIUM';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(symptoms_lower, potentialDiseases);

  return {
    potentialDiseases,
    riskLevel,
    isEmergency,
    recommendations
  };
};

const generateRecommendations = (symptoms, diseases) => {
  const recommendations = [];

  if (symptoms.includes('fever') || symptoms.includes('cough')) {
    recommendations.push('Stay hydrated and get adequate rest');
    recommendations.push('Monitor your temperature regularly');
  }

  if (symptoms.includes('difficulty breathing')) {
    recommendations.push('SEEK IMMEDIATE MEDICAL ATTENTION');
    recommendations.push('Use an inhaler if available');
  }

  if (symptoms.includes('chest pain')) {
    recommendations.push('SEEK IMMEDIATE MEDICAL ATTENTION');
    recommendations.push('Sit down and stay calm');
  }

  if (symptoms.includes('diarrhea')) {
    recommendations.push('Avoid solid foods until symptoms improve');
    recommendations.push('Drink electrolyte solutions (ORS)');
  }

  if (!recommendations.length) {
    recommendations.push('Get adequate rest and sleep');
    recommendations.push('Maintain proper hygiene');
    recommendations.push('Consult a doctor if symptoms persist for more than a week');
  }

  return recommendations;
};

// Get appropriate doctor specialization based on disease
exports.getRequiredSpecialization = (diseases) => {
  const specializations = {
    'heart attack': 'Cardiology',
    'angina': 'Cardiology',
    'heart disease': 'Cardiology',
    'pneumonia': 'General',
    'asthma': 'General',
    'meningitis': 'Neurology',
    'migraine': 'Neurology',
    'strep throat': 'General',
    'gastroenteritis': 'General',
    'food poisoning': 'General',
    'covid-19': 'General',
    'flu': 'General'
  };

  if (diseases.length > 0) {
    const topDisease = diseases[0].disease.toLowerCase();
    return specializations[topDisease] || 'General';
  }
  return 'General';
};

// Smart doctor allocation based on symptoms and availability
exports.allocateBestDoctor = async (Doctor, requiredSpecialization, riskLevel) => {
  try {
    // For emergency cases, prioritize by rating and experience
    const query = { specialization: requiredSpecialization };
    
    let doctors = await Doctor.find(query)
      .populate('userId')
      .sort({ rating: -1, experience: -1 });

    if (!doctors || doctors.length === 0) {
      // Fallback to General practitioners if no specialist available
      doctors = await Doctor.find({ specialization: 'General' })
        .populate('userId')
        .sort({ rating: -1, experience: -1 });
    }

    if (doctors.length === 0) {
      return null;
    }

    // For critical cases, prioritize highest rated doctor
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      return doctors[0];
    }

    // For other cases, balance load among doctors (choose one with fewer patients)
    const doctorWithLeastLoad = doctors.reduce((prev, current) =>
      (prev.assignedPatients?.length || 0) < (current.assignedPatients?.length || 0) ? prev : current
    );

    return doctorWithLeastLoad;
  } catch (error) {
    console.error('Error allocating doctor:', error);
    return null;
  }
};
