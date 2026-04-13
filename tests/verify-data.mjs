import { DIALOGUES, CHARACTERS } from '../js/data/dialogueData.js';

// AC4: chapter9_intro lines >= 4
console.log('AC4 chapter9_intro lines:', DIALOGUES.chapter9_intro?.lines?.length);

// AC5: chapter9_boss exists + miryoksa content
const bossLines = DIALOGUES.chapter9_boss?.lines || [];
console.log('AC5 chapter9_boss lines:', bossLines.length);
const hasMiryoksa = bossLines.some(l => l.text.includes('미력사'));
console.log('AC5 miryoksa content:', hasMiryoksa);

// AC6: chapter9_clear exists + ends with narrator
const clearLines = DIALOGUES.chapter9_clear?.lines || [];
console.log('AC6 chapter9_clear lines:', clearLines.length);
const lastLine = clearLines[clearLines.length - 1];
console.log('AC6 last line speaker:', lastLine?.speaker);
console.log('AC6 last line includes eclipse arc:', lastLine?.text?.includes('일식 아크 완결'));

// AC7: CHARACTERS.sake_oni
const sakeOni = CHARACTERS.sake_oni;
console.log('AC7 sake_oni exists:', Boolean(sakeOni));
console.log('AC7 portrait:', sakeOni?.portrait);
console.log('AC7 role:', sakeOni?.role);
console.log('AC7 has portraitKey:', 'portraitKey' in (sakeOni || {}));

// Speaker name consistency check
const bossNameKo = CHARACTERS.sake_oni?.nameKo;
console.log('AC7 nameKo:', bossNameKo);
const bossAsSpeaker = bossLines.filter(l => l.speaker === bossNameKo);
console.log('Speaker name matches in chapter9_boss:', bossAsSpeaker.length, 'lines');

// Check all sake_oni lines use correct portrait emoji
const sakeOniLines = bossLines.filter(l => l.speaker === bossNameKo);
const allUseCorrectPortrait = sakeOniLines.every(l => l.portrait === sakeOni.portrait);
console.log('All sake_oni lines use correct portrait emoji:', allUseCorrectPortrait);
