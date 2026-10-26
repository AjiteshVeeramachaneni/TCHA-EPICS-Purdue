/* ─── COLORS ─── */
export const C = {
  navy: '#1F2E3D', navyL: '#2A3F54', navyD: '#141E28',
  parch: '#F3ECDD', parchD: '#E5D8C0',
  ink: '#2B2A28', surface: '#FFFFFF',
  brick: '#8B3A2B', brickL: '#A84535',
  forest: '#2F4B3C', forestL: '#3D6150',
  gold: '#85540F', goldL: '#9E681A',
  steel: '#4A6FA5', steelL: '#5A82BA',
  charcoal: '#2B2A28',
}

/* ─── METADATA ─── */
export interface EventMeta {
  id: number; title: string; year: string; icon: string; accent: string; stages: string[]
}
export const EVENTS: EventMeta[] = [
  { id: 1,  title: 'The Eclipse Prophecy',           year: '1806',               icon: '🌑', accent: C.steel,  stages: ['Introduction', 'The Prediction', 'What Happened Next?', 'Key People & Facts'] },
  { id: 2,  title: 'The Vincennes Showdown',          year: 'August 1810',        icon: '⚔️',  accent: C.brick,  stages: ['Introduction', 'Know the Players', 'The Demands', 'How Did It End?'] },
  { id: 3,  title: 'March to the Ridge',              year: 'Oct – Nov 1811',     icon: '🗺️',  accent: C.forest, stages: ['Introduction', 'Follow the Route', 'Pack the Army', 'The Countdown'] },
  { id: 4,  title: 'The Attack Begins',               year: 'Nov 7, 1811 · 4 AM', icon: '💥',  accent: C.brick,  stages: ['Introduction', 'Fill In the Story', 'Companies Under Fire', 'Put It in Order'] },
  { id: 5,  title: "Shabonee's Raid",                 year: 'November 7, 1811',   icon: '🐎',  accent: C.steel,  stages: ['Introduction', 'Two Different Stories', 'Spot the Differences', 'Why Does It Matter?'] },
  { id: 6,  title: "Major Daviess's Charge",          year: 'November 7, 1811',   icon: '🏇',  accent: C.brick,  stages: ['Introduction', 'Your Decision', 'The True Outcome', 'His Legacy'] },
  { id: 7,  title: 'Burying the Dead',                year: 'November 8, 1811',   icon: '🕯️',  accent: C.forest, stages: ['Introduction', 'How Many Fell?', 'Uncover the Secrets', 'Different Views'] },
  { id: 8,  title: 'Tecumseh Confronts His Brother',  year: 'January 1812',       icon: '🗣️',  accent: C.brick,  stages: ['Introduction', 'While He Was Away', 'Who Said It?', 'After the Battle'] },
  { id: 9,  title: 'The Great Whig Rally',            year: 'May 29–30, 1840',    icon: '🎉',  accent: C.gold,   stages: ['Introduction', 'How Big Was It?', 'Match the Symbols', 'The Famous Slogan'] },
  { id: 10, title: 'The Flag Presentation',           year: 'May 30, 1840',       icon: '🏳️',  accent: C.steel,  stages: ['Introduction', 'Examine the Artifact', 'Connect Across Time', 'History Complete!'] },
]

/* ─── CHAPTER INTRO ─── */
interface IntroData {
  summary: string
  figures: { name: string; role: string; emoji: string }[]
}

export const EVENT_INTROS: IntroData[] = [
  {
    summary: "In 1806, Harrison challenged Tenskwatawa to make the sun go dark. Then a real eclipse amazed everyone.",
    figures: [
      { name: 'Tenskwatawa', role: '"The Prophet" — Shawnee spiritual leader', emoji: '🔮' },
      { name: 'William Henry Harrison', role: 'Governor of Indiana Territory', emoji: '🎖️' },
    ],
  },
  {
    summary: "Tecumseh opposed the 1809 sale of Native land. In 1810, he brought 300 warriors to Vincennes to meet Harrison.",
    figures: [
      { name: 'Tecumseh', role: 'Shawnee military leader', emoji: '🦅' },
      { name: 'William Henry Harrison', role: 'Governor of Indiana Territory', emoji: '🎖️' },
      { name: 'Tenskwatawa', role: "The Prophet — Tecumseh's brother", emoji: '🔮' },
    ],
  },
  {
    summary: "In 1811, Harrison led over 1,000 soldiers on a 150-mile march. Their route, camp, and supplies all mattered.",
    figures: [
      { name: 'William Henry Harrison', role: 'General & Governor of Indiana Territory', emoji: '🎖️' },
      { name: 'The U.S. Army', role: 'About 1,000 soldiers from multiple states', emoji: '⚔️' },
    ],
  },
  {
    summary: "Harrison's army camped near Prophet's Town. At 4:15 a.m., one shot began the Battle of Tippecanoe.",
    figures: [
      { name: 'The Unknown Sentinel', role: 'The soldier who fired the first shot', emoji: '🔫' },
      { name: 'William Henry Harrison', role: 'Rallied his troops from horseback', emoji: '🎖️' },
      { name: 'Tenskwatawa', role: 'Launched the attack, believing warriors were protected', emoji: '🔮' },
    ],
  },
  {
    summary: "Warriors tried to find Harrison before the battle. They knew his horse and tent, but their plan failed.",
    figures: [
      { name: 'Shabonee', role: 'Potawatomi warrior — present at the battle', emoji: '⚡' },
      { name: 'William Henry Harrison', role: 'The target who survived by a twist of fate', emoji: '🎖️' },
    ],
  },
  {
    summary: "Major Joseph Daviess made a quick choice during battle. It made him famous and cost him his life.",
    figures: [
      { name: 'Major Joseph Daviess', role: 'Kentucky lawyer & dragoon cavalry officer', emoji: '🏇' },
      { name: 'William Henry Harrison', role: 'Sent Daviess with a force smaller than he asked for', emoji: '🎖️' },
    ],
  },
  {
    summary: "After the battle, Harrison tried to hide how many soldiers had died. His plan did not last.",
    figures: [
      { name: 'William Henry Harrison', role: 'Ordered the graves to be disguised', emoji: '🎖️' },
      { name: 'The American Soldiers', role: '62 killed or mortally wounded', emoji: '⚔️' },
      { name: 'Native Warriors', role: 'Returned to undo the deception', emoji: '🪶' },
    ],
  },
  {
    summary: "Tecumseh was away building a Native alliance. News of the battle brought him home to confront his brother.",
    figures: [
      { name: 'Tecumseh', role: 'Shawnee military leader — furious at the loss', emoji: '🦅' },
      { name: 'Tenskwatawa', role: 'The Prophet — whose actions caused the defeat', emoji: '🔮' },
    ],
  },
  {
    summary: "In 1840, the Whig Party brought a huge crowd to the battlefield to support Harrison for president.",
    figures: [
      { name: 'William Henry Harrison', role: 'Presidential candidate — "Old Tippecanoe"', emoji: '🎖️' },
      { name: 'John Tyler', role: 'Vice presidential running mate — "Tyler Too"', emoji: '🎵' },
      { name: 'The Whig Party', role: 'Organizers of the massive campaign rally', emoji: '🎉' },
    ],
  },
  {
    summary: "At the 1840 rally, an 1811 battle flag returned to the site. Its bullet holes connected both events.",
    figures: [
      { name: 'Judge William Polke', role: "Presented Spencer's battle flag at the rally", emoji: '⚖️' },
      { name: 'James Brooks', role: 'New York delegate who received the flag', emoji: '📜' },
      { name: "Spencer's Flag", role: 'The actual 1811 artifact with bullet holes', emoji: '🏳️' },
    ],
  },
]
