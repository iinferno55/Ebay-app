// Adjacent keys on QWERTY keyboard
const ADJACENT_KEYS: Record<string, string[]> = {
  q: ['w', 'a', 's'],
  w: ['q', 'e', 'a', 's', 'd'],
  e: ['w', 'r', 's', 'd', 'f'],
  r: ['e', 't', 'd', 'f', 'g'],
  t: ['r', 'y', 'f', 'g', 'h'],
  y: ['t', 'u', 'g', 'h', 'j'],
  u: ['y', 'i', 'h', 'j', 'k'],
  i: ['u', 'o', 'j', 'k', 'l'],
  o: ['i', 'p', 'k', 'l'],
  p: ['o', 'l'],
  a: ['q', 'w', 's', 'z'],
  s: ['w', 'e', 'a', 'd', 'z', 'x'],
  d: ['e', 'r', 's', 'f', 'x', 'c'],
  f: ['r', 't', 'd', 'g', 'c', 'v'],
  g: ['t', 'y', 'f', 'h', 'v', 'b'],
  h: ['y', 'u', 'g', 'j', 'b', 'n'],
  j: ['u', 'i', 'h', 'k', 'n', 'm'],
  k: ['i', 'o', 'j', 'l', 'm'],
  l: ['o', 'p', 'k'],
  z: ['a', 's', 'x'],
  x: ['s', 'd', 'z', 'c'],
  c: ['d', 'f', 'x', 'v'],
  v: ['f', 'g', 'c', 'b'],
  b: ['g', 'h', 'v', 'n'],
  n: ['h', 'j', 'b', 'm'],
  m: ['j', 'k', 'n'],
};

// Common single-word misspellings (hardcoded known ones)
const KNOWN_MISSPELLINGS: Record<string, string[]> = {
  iphone: ['iphoen', 'iphon', 'iphone', 'ipohne', 'ihpone', 'iphne', 'iohpne'],
  macbook: ['macbok', 'macbbok', 'macboo', 'maccbook', 'macbok', 'mcabook'],
  ipad: ['iapad', 'ippad', 'ipd', 'ipda'],
  airpods: ['airpds', 'airpod', 'airpuds', 'airpods', 'airdpods'],
  playstation: ['playstaiton', 'playstaion', 'playsation', 'playstaton', 'playstaition'],
  nintendo: ['nentendo', 'nintedo', 'nindento', 'nintendoo', 'nitnendo', 'nintnedo'],
  rolex: ['rollex', 'roelx', 'roelex', 'rolx'],
  omega: ['omgea', 'omea', 'omeag'],
  pokemon: ['pokmon', 'pokeman', 'pokémon', 'pokmeon', 'pokmon'],
  guitar: ['guittar', 'giutar', 'guiter', 'gutar'],
  fender: ['fendar', 'fendor', 'fneder', 'fendr'],
  gibson: ['gibosn', 'gibsson', 'gison', 'gbison'],
  vintage: ['vintge', 'vintag', 'vntage', 'vintege'],
  camera: ['camrea', 'camara', 'camra', 'camear'],
  sneakers: ['sneaekrs', 'sneakrs', 'sneakers', 'snakers', 'sneakres'],
  diamond: ['dimond', 'diamodn', 'dimaond', 'diamnd'],
  bracelet: ['bracelot', 'bracleet', 'braclet', 'bracelat'],
  samsung: ['samsng', 'samsugn', 'sasmung', 'samsnug'],
  keyboard: ['keyboad', 'keybaord', 'keybord', 'keyborad'],
};

function transposeChars(word: string): string[] {
  const results: string[] = [];
  for (let i = 0; i < word.length - 1; i++) {
    const chars = word.split('');
    [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
    const variant = chars.join('');
    if (variant !== word) results.push(variant);
  }
  return results;
}

function deleteChar(word: string): string[] {
  const results: string[] = [];
  // Focus on middle characters (sellers rarely drop first/last char)
  for (let i = 1; i < word.length - 1; i++) {
    const variant = word.slice(0, i) + word.slice(i + 1);
    if (variant.length >= 3) results.push(variant);
  }
  return results;
}

function adjacentKeyReplace(word: string): string[] {
  const results: string[] = [];
  for (let i = 0; i < word.length; i++) {
    const adjacent = ADJACENT_KEYS[word[i]] || [];
    // Only replace vowels and common consonants (more realistic typos)
    if ('aeioustnrlhd'.includes(word[i])) {
      for (const key of adjacent.slice(0, 2)) {
        results.push(word.slice(0, i) + key + word.slice(i + 1));
      }
    }
  }
  return results;
}

function doubleLetterError(word: string): string[] {
  const results: string[] = [];
  // Remove one of a doubled letter
  for (let i = 0; i < word.length - 1; i++) {
    if (word[i] === word[i + 1]) {
      results.push(word.slice(0, i) + word.slice(i + 1));
    }
  }
  // Add a double letter (less common, skip for brevity)
  return results;
}

export function generateMisspellings(baseWord: string): string[] {
  const word = baseWord.toLowerCase().trim();
  const misspellings = new Set<string>();

  // 1. Use known misspellings if available
  const known = KNOWN_MISSPELLINGS[word];
  if (known) {
    known.forEach((m) => misspellings.add(m));
  }

  // 2. Transpose adjacent characters
  transposeChars(word).forEach((m) => misspellings.add(m));

  // 3. Delete a middle character
  deleteChar(word).slice(0, 4).forEach((m) => misspellings.add(m));

  // 4. Adjacent key replacements (most realistic)
  adjacentKeyReplace(word).slice(0, 4).forEach((m) => misspellings.add(m));

  // 5. Double letter errors
  doubleLetterError(word).forEach((m) => misspellings.add(m));

  // Filter: remove the original word, too-short variants, duplicates
  const filtered = [...misspellings].filter(
    (m) => m !== word && m !== baseWord.toLowerCase() && m.length >= 3
  );

  // Cap at 12 misspellings per word to stay within API limits
  return filtered.slice(0, 12);
}

/**
 * For a multi-word keyword like "nintendo switch",
 * generates misspellings of each individual word and combines.
 */
export function generateKeywordMisspellings(keyword: string): string[] {
  const words = keyword.toLowerCase().split(' ');
  const results: string[] = [];

  if (words.length === 1) {
    return generateMisspellings(words[0]);
  }

  // For each significant word (length > 3), generate misspellings and keep others intact
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (word.length <= 3) continue; // Skip short words like "a", "the", "pro"

    const wordMisspellings = generateMisspellings(word);
    for (const m of wordMisspellings.slice(0, 6)) {
      const newKeyword = [...words.slice(0, i), m, ...words.slice(i + 1)].join(' ');
      results.push(newKeyword);
    }
  }

  // Deduplicate and cap
  return [...new Set(results)].slice(0, 15);
}
