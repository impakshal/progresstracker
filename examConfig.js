/* ============================================================
   EXAM TRACK CONFIGURATION ENGINE
   Presets and metadata for UPSC, JEE, NEET, and Board Exams.
   ============================================================ */

window.EXAM_CONFIGS = {
  boards: {
    id: 'boards',
    name: 'Board Exams',
    shortName: 'Board Exams',
    badge: '📚 Class 10',
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
        subject: 'Mathematics I',
        units: ['Linear Equations in Two Variables', 'Quadratic Equations', 'Arithmetic Progression', 'Financial Planning', 'Probability', 'Statistics']
      },
      {
        subject: 'Mathematics II',
        units: ['Similarity', 'Pythogoras Theorem', 'Circle', 'Geometric Construction', 'Coordinate Geometry', 'Trigonometry', 'Mensuration']
      },
      {
        subject: 'Science I',
        units: ['Gravitation', 'Periodic Classification of Elements', 'Chemical Reactions and Equations', 'Effects of Electric Current', 'Heat', 'Refraction of Light', 'Lenses', 'Metallurgy', 'Carbon Compounds', 'Space Mission']
      },
      {
        subject: 'Science II',
        units: ['Heridity and Evolution', 'Living Processes in Living Organism Part-1', 'Life Processes in Living Organism Part-2', 'Environmental Management', 'Towards Green Energy', 'Animal Classification', 'Introduction to Microbiology', 'Cell Biology and Biotechnology', 'Social Health', 'Disaster Management']
      },
      {
        subject: 'History',
        units: ['Historiography- Development in the West', 'Historiography- Indian Tradition', 'Applied History', 'History of Indian Arts', 'Mass Media and History', 'Entertainment and History', 'Sports and History', 'Tourism and History', 'Heritage Management']
      },
      {
        subject: 'Geography',
        units: ['Field Visit', 'Location and Extent', 'Physiography and Drainage', 'Climate', 'Natural Vegetation and Wild Life', 'Population', 'Humman Settlements', 'Economic Activity and Occupations', 'Tourism, Transport and Communication']
      },
      {
        subject: 'Civics',
        units: ['Working of the Constitution', 'The Electoral Process', 'Political Parties', 'Social and Political Movement', 'Challenges Faced by Indian Democracy']
      },
      {
        subject: 'Language',
        units: ['Comprehension', 'Poetry and Appreciation', 'Grammar', 'Writing Skill', 'Novels']
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
        subject: 'Physics (Class-11)',
        class: 11,
        units: [
          'Units and Measurements',
          'Motion in a Straight Line',
          'Motion in a Plane',
          'Laws of Motion',
          'Work, Energy and Power',
          'System of Particles and Rotational Motion',
          'Gravitation',
          'Properties of Bulk Matter',
          'Thermodynamics',
          'Kinetic Theory of Gases',
          'Oscillations',
          'Waves'
        ]
      },
      {
        subject: 'Chemistry (Class-11)',
        class: 11,
        units: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'States of Matter',
          'Thermodynamics',
          'Equilibrium',
          'Redox Reactions',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure',
          'Hydrogen',
          's-Block Elements',
          'Some p-Block Elements',
          'Organic Chemistry – Some Basic Principles and Techniques',
          'Hydrocarbons'
        ]
    },
      {
        subject: 'Mathematics (Class-11)',
        class: 11,
        units: [
          'Sets, Relations and Functions',
          'Trigonometric Functions',
          'Complex Numbers',
          'Quadratic Equations',
          'Sequences and Series',
          'Permutations and Combinations',
          'Binomial Theorem',
          'Straight Lines',
          'Conic Sections',
          'Introduction to Three Dimensional Geometry',
          'Limits and Derivatives',
          'Statistics',
          'Probability'
        ]
      },
      {
        subject: 'Physics (Class-12)',
        class: 12,
        units: [
          'Electric Charges and Fields',
          'Electrostatic Potential and Capacitance',
          'Current Electricity',
          'Moving Charges and Magnetism',
          'Magnetism and Matter',
          'Electromagnetic Induction',
          'Alternating Current',
          'Electromagnetic Waves',
          'Ray Optics and Optical Instruments',
          'Wave Optics',
          'Dual Nature of Radiation and Matter',
          'Atoms',
          'Nuclei',
          'Semiconductor Electronics'
        ]
      },
      {
        subject: 'Chemistry (Class-12)',
        class: 12,
        units: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'States of Matter',
          'Thermodynamics',
          'Equilibrium',
          'Redox Reactions',
          'Organic Chemistry – Some Basic Principles and Techniques',
          'Hydrocarbons',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure',
          'Hydrogen',
          's-Block Elements',
          'Some p-Block Elements'
        ]
      },
      {
        subject: 'Mathematics (Class-12)',
        class: 12,
        units: [
          'Relations and Functions',
          'Inverse Trigonometric Functions',
          'Matrices',
          'Determinants',
          'Continuity and Differentiability',
          'Applications of Derivatives',
          'Integrals',
          'Applications of Integrals',
          'Differential Equations',
          'Vector Algebra',
          'Three Dimensional Geometry',
          'Linear Programming',
          'Probability'
        ]
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
        subject: 'Physics (Class-11)',
        class: 11,
        units: [
          'Units and Measurements',
          'Motion in a Straight Line',
          'Motion in a Plane',
          'Laws of Motion',
          'Work, Energy and Power',
          'System of Particles and Rotational Motion',
          'Gravitation',
          'Properties of Bulk Matter',
          'Thermodynamics',
          'Kinetic Theory of Gases',
          'Oscillations',
          'Waves'
        ]
      },
      {
        subject: 'Chemistry (Class-11)',
        class: 11,
        units: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'States of Matter',
          'Thermodynamics',
          'Equilibrium',
          'Redox Reactions',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure',
          'Hydrogen',
          's-Block Elements',
          'Some p-Block Elements',
          'Organic Chemistry – Some Basic Principles and Techniques',
          'Hydrocarbons'
        ]
    },
      {
        subject: 'Biology (Class-11)',
        class: 11,
        units: [
            'The Living World',
            'Biological Classification',
            'Plant Kingdom',
            'Morphology of Flowering Plants',
            'Anatomy of Flowering Plants',
            'Cell: The Unit of Life',
            'Biomolecules',
            'Cell Cycle and Cell Division',
            'Transport in Plants',
            'Mineral Nutrition',
            'Photosynthesis in Plants',
            'Respiration in Plants',
            'Plant Growth and Development',
            'Animal Kingdom',
            'Structural Organisation in Animals',
            'Digestion and Absorption',
            'Breathing and Exchange of Gases',
            'Body Fluids and Circulation',
            'Excretory Products and their Elimination',
            'Locomotion and Movement',
            'Neural Control and Coordination',
            'Chemical Coordination and Integration'
        ]
      },
      {
        subject: 'Physics (Class-12)',
        class: 12,
        units: [
          'Electric Charges and Fields',
          'Electrostatic Potential and Capacitance',
          'Current Electricity',
          'Moving Charges and Magnetism',
          'Magnetism and Matter',
          'Electromagnetic Induction',
          'Alternating Current',
          'Electromagnetic Waves',
          'Ray Optics and Optical Instruments',
          'Wave Optics',
          'Dual Nature of Radiation and Matter',
          'Atoms',
          'Nuclei',
          'Semiconductor Electronics'
        ]
      },
      {
        subject: 'Chemistry (Class-12)',
        class: 12,
        units: [
          'Some Basic Concepts of Chemistry',
          'Structure of Atom',
          'States of Matter',
          'Thermodynamics',
          'Equilibrium',
          'Redox Reactions',
          'Organic Chemistry – Some Basic Principles and Techniques',
          'Hydrocarbons',
          'Classification of Elements and Periodicity in Properties',
          'Chemical Bonding and Molecular Structure',
          'Hydrogen',
          's-Block Elements',
          'Some p-Block Elements'
        ]
      },
      {
        subject: 'Biology (Class-12)',
        class: 12,
        units: [
          'Sexual Reproduction in Flowering Plants',
          'Principles of Inheritance and Variation',
          'Molecular Basis of Inheritance',
          'Biotechnology: Principles and Processes',
          'Biotechnology and its Applications',
          'Ecology and Environment',
          'Human Reproduction',
          'Reproductive Health',
          'Evolution',
          'Human Health and Disease'
        ]
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
