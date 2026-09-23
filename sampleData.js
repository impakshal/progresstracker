/* ==========================================
   DAILY PROGRESS TRACKER - SAMPLE DATASET
   30-Day Realistic History Generator
   ========================================== */

window.getLocalDateString = function (d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

window.SampleDataGenerator = {
  generate30Days: function () {
    const logs = {};
    const today = new Date();

    const sampleTargetsPool = [
      { text: 'Solve 25 PYQs on Electromagnetism & Magnetic Effects', priority: 'high' },
      { text: 'Read Chapter 4 of NCERT Physics and annotate key formulas', priority: 'medium' },
      { text: 'Complete 15 Integration by Parts problems in Mathematics', priority: 'high' },
      { text: 'Watch online lecture on Organic Chemistry reaction mechanisms', priority: 'medium' },
      { text: 'Revise Class Notes on Organic Chemistry from last week', priority: 'low' },
      { text: 'Read daily newspaper & highlight important international events', priority: 'low' },
      { text: 'Practice Mock Test Series Section 2 (60 mins timed)', priority: 'high' },
      { text: 'Make 1-page summary sheet for Modern Physics key concepts', priority: 'medium' },
      { text: 'Revise Short Notes on Differential Equations', priority: 'low' },
      { text: "Review incorrect questions from yesterday's practice test", priority: 'high' }
    ];

    const subjectsList = [
      'Physics: Electromagnetism & Modern Physics',
      'Mathematics: Calculus & Differential Equations',
      'Chemistry: Organic Reactions & Thermodynamics',
      'General Studies & Current Affairs Digest',
      'Biology & Genetics Revision'
    ];

    const affirmations = [
      'I am focused, disciplined, and capable of achieving my daily goals.',
      'Consistency today creates freedom tomorrow.',
      'Every small step I take today builds my future success.',
      'Challenges are opportunities to learn and grow stronger.',
      'I command my attention and focus on what truly matters.'
    ];

    const challengesList = [
      { c: 'Felt sluggish after lunch; lost 45 minutes of focus.', s: 'Take a 15-min light walk post-lunch and stay hydrated.' },
      { c: 'Struggled with complex calculus integration proofs.', s: 'Bookmark difficult proofs and schedule 1-on-1 review.' },
      { c: 'Distracted by smartphone notifications during study session.', s: 'Put phone on Do Not Disturb mode in another room.' },
      { c: 'Spent too much time on a single Physics problem.', s: 'Use a 25-minute Pomodoro timer per problem block.' },
      { c: 'Felt mentally exhausted by evening.', s: 'Prioritize 8 hours of sleep and night time relaxation.' }
    ];

    const learnedList = [
      'Mastered the shortcut for Integration by Parts and solved 15 practice questions.',
      "Understood Faraday's Law applications and lens induced EMF calculations.",
      'Memorized 10 key reaction mechanisms in Organic Chemistry.',
      'Learned key government schemes highlighted in PIB monthly digest.',
      'Improved problem solving speed in Physics mock test by 15%.'
    ];

    const reflectionsList = [
      'Great focus during the morning block. Need to maintain evening energy.',
      'Consistent progress. Tomorrow I will target completing high priority tasks first.',
      'Satisfactory effort today. Pushed through challenges calmly.',
      'Target completion was solid. Keep up the high standards!',
      'Plan better for tomorrow morning to avoid early morning friction.'
    ];

    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = window.getLocalDateString(d);

      const completedCount = Math.floor(Math.random() * 4) + 7;
      const dayTargets = [];
      const completedIndices = [];

      for (let t = 1; t <= 10; t++) {
        const poolItem = sampleTargetsPool[(t - 1 + i) % sampleTargetsPool.length];
        dayTargets.push({ id: t, text: poolItem.text, priority: poolItem.priority });
      }

      for (let c = 1; c <= completedCount; c++) {
        completedIndices.push(c);
      }

      const plannedHours = Math.floor(Math.random() * 3) + 6;
      const completedHours = +(plannedHours + (Math.random() * 1.5 - 0.75)).toFixed(1);
      const challengeObj = challengesList[i % challengesList.length];

      logs[dateStr] = {
        id: dateStr,
        date: dateStr,
        morning: {
          targets: dayTargets,
          plannedHours,
          subjects: subjectsList[i % subjectsList.length],
          resources: ['NCERT / Standard Books', 'PYQs Practice', 'Online Lecture'],
          revision: ['Class notes', 'Short notes', 'PYQs revision'],
          currentAffairs: ['Newspaper', 'Monthly magazine'],
          affirmation: affirmations[i % affirmations.length]
        },
        night: {
          completedTargets: completedIndices,
          completedHours: Math.max(1, completedHours),
          completedResources: ['NCERT / Standard Books', 'PYQs Practice'],
          completedRevision: ['Class notes', 'PYQs revision'],
          completedCurrentAffairs: ['Newspaper'],
          challenges: challengeObj.c,
          solutions: challengeObj.s,
          learned: learnedList[i % learnedList.length],
          reflections: reflectionsList[i % reflectionsList.length]
        },
        updatedAt: new Date().toISOString()
      };
    }

    return logs;
  }
};
