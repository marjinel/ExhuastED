const blockedWords = [
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'gago',
  'tanga',
  'putangina',
  'puta',
  'ulol',
  'bobo',
];

export function validateSupportiveContent(content: string): void {
  const normalized = content.toLowerCase();
  const blocked = blockedWords.find((word) => normalized.includes(word));

  if (blocked) {
    throw new Error('Please keep the community supportive. Offensive words are not allowed.');
  }
}
