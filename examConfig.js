/* ============================================================
   EXAM TRACK CONFIGURATION ENGINE
   Presets and metadata for UPSC, JEE, NEET, and Board Exams.
   ============================================================ */

window.EXAM_CONFIGS = {
  boards: {
    id: 'boards',
    name: 'Board Exams (Class 10 / 12)',
    shortName: 'Board Exams',
    badge: '📚 Class 10 / 12',
    icon: '📚',
    subtitle: 'CBSE · ICSE · State Boards · Science / Commerce / Arts',
    motto: 'Strong Fundamentals Today, Top Board Results Tomorrow!',
    subjectPlaceholder: 'e.g. Physics/Science: Light & Electricity\nMath: Quadratic Equations & Trigonometry\nEnglish: Literature Summary & Grammar',
    resourcesLabel: 'STUDY RESOURCES & PRACTICE',
    resourcesSubtitle: 'Track your daily board preparation tools',
    resourcesOptions: [
      'NCERT Textbook Reading',
      'In-Text & Exemplar Exercises',
      'School / Tuition Notes',
      'Sample Question Papers (SQP)',
      'Board Past 5 Years Questions',
      'Mind Maps / Concept Flowcharts'
    ],
    revisionLabel: 'REVISION & PRACTICE',
    revisionSubtitle: 'Retain formulas, theorems & answer keys',
    revisionOptions: [
      'NCERT Back Exercises Review',
      'Important Definitions & Laws',
      'Diagrams & Labeled Sketches',
      'Formulae & Theorem Proofs',
      'Answer Presentation & Speed Drill'
    ],
    focusCardTitle: 'SAMPLE PAPERS & WRITING PRACTICE',
    focusCardSubtitle: 'Daily board exam writing discipline',
    focusOptions: [
      'Solved 1 Full Sample Paper',
      'NCERT Exemplar Questions',
      'Diagrams & Map Work Practice',
      '3-Mark / 5-Mark Long Answers',
      'Grammar & Writing Skills'
    ],
    syllabus: [
      {
        subject: 'Mathematics / Applied Math',
        units: ['Algebra & Quadratic Equations', 'Calculus & Derivatives', 'Coordinate Geometry', 'Trigonometry & Heights', 'Probability & Statistics']
      },
      {
        subject: 'Physics / Science',
        units: ['Light - Reflection & Refraction', 'Electricity & Magnetism', 'Mechanics & Motion', 'Optics & Wave Motion', 'Modern Physics']
      },
      {
        subject: 'Chemistry',
        units: ['Chemical Reactions & Equations', 'Acids, Bases & Salts', 'Carbon & Its Compounds', 'Organic Reactions & Mechanisms', 'Electrochemistry & Solutions']
      },
      {
        subject: 'Biology',
        units: ['Life Processes', 'Control & Coordination', 'How Organisms Reproduce', 'Heredity & Evolution', 'Our Environment & Ecology']
      },
      {
        subject: 'Languages & Humanities',
        units: ['English Reading & Comprehension', 'Grammar & Creative Writing', 'Literature Prose & Poetry', 'Social Science / History & Geography', 'Economics & Civics']
      }
    ]
  },

  jee: {
    id: 'jee',
    name: 'JEE (Main & Advanced)',
    shortName: 'JEE Main & Adv',
    badge: '⚛️ JEE Engineering',
    icon: '⚛️',
    subtitle: 'Physics · Chemistry · Mathematics',
    motto: 'Solve Problem by Problem, Master Concept by Concept!',
    subjectPlaceholder: 'e.g. Physics: Electromagnetism & Mechanics\nChemistry: Organic Mechanisms & Thermodynamics\nMath: Integral Calculus & Matrices',
    resourcesLabel: 'STUDY RESOURCES & PRACTICE',
    resourcesSubtitle: 'Track your daily JEE preparation material',
    resourcesOptions: [
      'NCERT / Core Textbooks',
      'Video Lectures / Coaching Notes',
      'JEE Main PYQs (Past 10 Yrs)',
      'JEE Advanced Problem Sets',
      'Mock Test / Chapter Speed Test',
      'Formula Book / Short Notes'
    ],
    revisionLabel: 'REVISION & ERROR ANALYSIS',
    revisionSubtitle: 'Consolidate concepts & shortcuts',
    revisionOptions: [
      'Physics Formulas & Derivations',
      'Organic Reactions & Named Mechanisms',
      'Inorganic NCERT Line-by-Line',
      'Math Shortcut Tricks & Theorems',
      'Mistake Notebook / Error Log Review'
    ],
    focusCardTitle: 'PROBLEM SOLVING & MOCK TESTS',
    focusCardSubtitle: 'Daily numerical & speed discipline',
    focusOptions: [
      'Physics Numericals (20+ Qs)',
      'Chemistry Reactions & NCERT Drills',
      'Math Problem Bank (20+ Qs)',
      'Timed Chapter Mock Test',
      'Analyzed Test Error Log'
    ],
    syllabus: [
      {
        subject: 'Physics',
        units: ['Kinematics & Laws of Motion', 'Work, Energy & Power', 'Rotational Dynamics', 'Electrostatics & Magnetism', 'Optics & Modern Physics']
      },
      {
        subject: 'Chemistry',
        units: ['Physical Chemistry & Thermodynamics', 'Organic Mechanisms & Hydrocarbons', 'Inorganic & Coordination Compounds', 'Chemical Kinetics & Equilibrium', 'Polymers & Biomolecules']
      },
      {
        subject: 'Mathematics',
        units: ['Calculus & Differential Equations', 'Algebra & Complex Numbers', 'Coordinate Geometry & Conic Sections', 'Vector Algebra & 3D Geometry', 'Trigonometry & Matrices']
      }
    ]
  },

  neet: {
    id: 'neet',
    name: 'NEET (UG Medical)',
    shortName: 'NEET UG',
    badge: '🧬 NEET Medical',
    icon: '🧬',
    subtitle: 'Biology (Botany & Zoology) · Chemistry · Physics',
    motto: 'Line by Line NCERT Mastery Leads to Medical Seats!',
    subjectPlaceholder: 'e.g. Biology: Human Physiology & Genetics\nChemistry: Coordination Compounds & Equilibrium\nPhysics: Ray Optics & Semiconductors',
    resourcesLabel: 'STUDY RESOURCES & PRACTICE',
    resourcesSubtitle: 'Track your daily NEET resources & MCQs',
    resourcesOptions: [
      'NCERT Biology (Line by Line)',
      'NCERT Chemistry & Reactions',
      'Physics Standard Numericals',
      'NEET PYQs (Past 15 Yrs)',
      'Full Syllabus / Chapter Mock Test',
      'Biology Diagram & Example Drills'
    ],
    revisionLabel: 'REVISION & NCERT DRILLS',
    revisionSubtitle: 'Retain facts, tables & formulas',
    revisionOptions: [
      'Biology NCERT Bold Terms & Tables',
      'Botany & Zoology Scientific Names',
      'Chemistry Formulas & Exceptions',
      'Physics Formula Flashcards',
      'High Yield Topics Quick Recap'
    ],
    focusCardTitle: 'BIOLOGY & MCQ SPEED DRILLS',
    focusCardSubtitle: 'Daily high-yield question targets',
    focusOptions: [
      '100+ Biology NCERT MCQs',
      '50+ Chemistry MCQs',
      '30+ Physics Numericals',
      'Full OMR Speed Test',
      'Biomarkers & Diagrams Review'
    ],
    syllabus: [
      {
        subject: 'Biology (Botany)',
        units: ['Diversity in Living World', 'Plant Anatomy & Physiology', 'Cell Biology & Division', 'Genetics & Molecular Basis', 'Ecology & Environment']
      },
      {
        subject: 'Biology (Zoology)',
        units: ['Human Physiology & Health', 'Animal Kingdom & Tissue Structure', 'Reproduction & Development', 'Biotechnology & Applications', 'Evolution & Human Welfare']
      },
      {
        subject: 'Chemistry',
        units: ['Organic Chemistry NCERT', 'Inorganic Chemistry & Periodic Table', 'Physical Chemistry & Solutions', 'Chemical Bonding & Structure', 'Biomolecules & Polymers']
      },
      {
        subject: 'Physics',
        units: ['Mechanics & Properties of Matter', 'Heat & Thermodynamics', 'Electrostatics & Current', 'Magnetism & EMI', 'Optics & Semiconductors']
      }
    ]
  },

  upsc: {
    id: 'upsc',
    name: 'UPSC & Govt Exams',
    shortName: 'UPSC & Govt',
    badge: '🏛️ UPSC / Govt',
    icon: '🏛️',
    subtitle: 'IAS · IPS · State PSC · Govt Entrance',
    motto: 'Consistency & Answer Writing Build Civil Servants!',
    subjectPlaceholder: 'e.g. GS1: Ancient History & Art/Culture\nGS2: Polity & Governance\nOptional: Geography Paper 1',
    resourcesLabel: 'STUDY RESOURCES & PRACTICE',
    resourcesSubtitle: 'Track what you used today',
    resourcesOptions: [
      'NCERT / Standard Books',
      'Online Lecture',
      'PYQs Practice',
      'Test Series / Practice Questions',
      'Current Affairs (Newspaper / Magazine)',
      'Value Addition (Notes making / Summary)'
    ],
    revisionLabel: 'REVISION',
    revisionSubtitle: 'Retain & consolidate',
    revisionOptions: [
      'Class notes',
      'Short notes',
      'PYQs revision',
      'Current affairs revision',
      'Important concepts review'
    ],
    focusCardTitle: 'CURRENT AFFAIRS',
    focusCardSubtitle: 'Daily awareness',
    focusOptions: [
      'Newspaper (The Hindu / Express)',
      'Monthly magazine',
      'PIB / Govt. schemes',
      'Important topics noted',
      'One-pager summary made'
    ],
    syllabus: [
      {
        subject: 'General Studies 1 (GS1)',
        units: ['Indian Heritage & Culture', 'Modern Indian History', 'World History', 'Indian Society & Diversity', 'Physical & Human Geography']
      },
      {
        subject: 'General Studies 2 (GS2)',
        units: ['Indian Constitution & Polity', 'Governance & Public Policy', 'Social Justice & Welfare', 'International Relations & Bilateral Accords']
      },
      {
        subject: 'General Studies 3 (GS3)',
        units: ['Indian Economy & Growth', 'Science & Technology', 'Environment, Ecology & Biodiversity', 'Disaster Management & Internal Security']
      },
      {
        subject: 'General Studies 4 (GS4)',
        units: ['Ethics, Integrity & Aptitude', 'Emotional Intelligence & Values', 'Moral Thinkers & Philosophers', 'Case Studies on Ethical Dilemmas']
      },
      {
        subject: 'Optional & CSAT',
        units: ['Optional Subject Paper 1', 'Optional Subject Paper 2', 'CSAT Comprehension', 'Quantitative Aptitude & Logical Reasoning', 'Essay Writing Practice']
      }
    ]
  }
};

window.DEFAULT_EXAM_ID = 'boards';

window.getExamConfig = function (examId) {
  return window.EXAM_CONFIGS[examId] || window.EXAM_CONFIGS['boards'];
};
