import { STORY_TRIGGERS } from '../js/data/storyData.js';

// AC8: gathering_enter + stageId '9-1' trigger exists
const t91 = STORY_TRIGGERS.find(t =>
  t.triggerPoint === 'gathering_enter' && t.dialogueId === 'chapter9_intro'
);
console.log('AC8 9-1 gathering_enter trigger:', Boolean(t91));
if (t91) {
  console.log('  condition(9-1):', t91.condition({ stageId: '9-1' }));
  console.log('  condition(9-2):', t91.condition({ stageId: '9-2' }));
}

// AC9: gathering_enter + stageId '9-6' trigger exists
const t96boss = STORY_TRIGGERS.find(t =>
  t.triggerPoint === 'gathering_enter' && t.dialogueId === 'chapter9_boss'
);
console.log('AC9 9-6 gathering_enter trigger:', Boolean(t96boss));
if (t96boss) {
  console.log('  condition(9-6):', t96boss.condition({ stageId: '9-6' }));
  console.log('  condition(9-5):', t96boss.condition({ stageId: '9-5' }));
}

// AC10: result_clear + stageId '9-6' trigger with onComplete
const t96clear = STORY_TRIGGERS.find(t =>
  t.triggerPoint === 'result_clear' && t.dialogueId === 'chapter9_clear'
);
console.log('AC10 9-6 result_clear trigger:', Boolean(t96clear));
if (t96clear) {
  console.log('  condition(9-6,firstClear):', t96clear.condition({ stageId: '9-6', isFirstClear: true, stars: 3 }));
  console.log('  condition(9-6,notFirstClear):', t96clear.condition({ stageId: '9-6', isFirstClear: false, stars: 3 }));
  console.log('  has onComplete:', typeof t96clear.onComplete === 'function');
}

// AC11+12: stage_first_clear excludes 9-1 and 9-6
const firstClear = STORY_TRIGGERS.find(t =>
  t.triggerPoint === 'result_clear' && t.dialogueId === 'stage_first_clear' && t.once === false
);
console.log('AC11+12 stage_first_clear generic trigger:');
if (firstClear) {
  const ctx91 = { stageId: '9-1', isFirstClear: true, stars: 3 };
  const ctx96 = { stageId: '9-6', isFirstClear: true, stars: 3 };
  const ctx92 = { stageId: '9-2', isFirstClear: true, stars: 3 };
  console.log('  9-1 excluded (should be false):', firstClear.condition(ctx91));
  console.log('  9-6 excluded (should be false):', firstClear.condition(ctx96));
  console.log('  9-2 included (should be true):', firstClear.condition(ctx92));
}
