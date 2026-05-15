export const PIANO_KEYS = (() => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    const keys = [];
    for (let oct = 2; oct <= 5; oct++) keys.push(...notes.map(n => ({ note: `${n}${oct}`, type: n.includes('#') ? 'black' : 'white', isC: n === 'C' })));
    keys.push({ note: 'C6', type: 'white', isC: true });
    return keys;
})();
