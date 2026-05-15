export const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export const getPianoKey = (visualNote, keySig) => {
    const [base, oct] = visualNote.split('/');
    let acc = '';
    if (keySig === 'F' && base === 'b') acc = 'b';
    if (keySig === 'G' && base === 'f') acc = '#';
    if (keySig === 'Eb' && ['e', 'a', 'b'].includes(base)) acc = 'b';
    const map = { 'c': 'C', 'c#': 'C#', 'db': 'C#', 'd': 'D', 'd#': 'D#', 'eb': 'D#', 'e': 'E', 'f': 'F', 'f#': 'F#', 'gb': 'F#', 'g': 'G', 'g#': 'G#', 'ab': 'G#', 'a': 'A', 'a#': 'A#', 'bb': 'A#', 'b': 'B' };
    return `${map[base + acc]}${oct}`;
};

export const getClefForNote = (note, globalClef) => {
    if (globalClef !== 'grand') return globalClef;
    const oct = parseInt(note.split('/')[1]);
    const isTrebleException = ['g/3', 'a/3', 'b/3'].includes(note.toLowerCase());
    return (oct < 4 && !isTrebleException) ? 'bass' : 'treble';
};

// Calcula a posição absoluta da nota (C0 = 0, D0 = 1...)
export const getAbsPos = (note) => {
    const [pitch, oct] = note.toLowerCase().split('/');
    const basePitch = pitch.charAt(0); // PEGA SÓ A PRIMEIRA LETRA (Ignora # ou b)
    const noteArr = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    return parseInt(oct) * 7 + noteArr.indexOf(basePitch);
};

export const getUniqueItems = (arr, count) => shuffleArray(arr).slice(0, count);

export const sortNotes = (notes) => {
    const order = { 'c': 1, 'd': 2, 'e': 3, 'f': 4, 'g': 5, 'a': 6, 'b': 7 };
    return [...notes].sort((a, b) => {
        const octA = parseInt(a.split('/')[1]);
        const octB = parseInt(b.split('/')[1]);
        if (octA !== octB) return octA - octB;
        return order[a.charAt(0).toLowerCase()] - order[b.charAt(0).toLowerCase()];
    });
};

export const getNotesWithinOctave = (pool, count) => {
    if (count === 1) return [getUniqueItems(pool, 1)[0]];
    let n1, validPool, attempts = 0;
    do {
        n1 = getUniqueItems(pool, 1)[0];
        const p1 = getAbsPos(n1);
        // Filtra usando a distância absoluta (máximo 7 passos = 1 oitava exata)
        validPool = pool.filter(n => {
            const p2 = getAbsPos(n);
            const dist = Math.abs(p1 - p2);
            return dist > 0 && dist <= 7;
        });
        attempts++;
    } while (validPool.length < count - 1 && attempts < 50);

    if (validPool.length < count - 1) return [pool[0], pool[1] || pool[0]];
    const others = getUniqueItems(validPool, count - 1);
    return [n1, ...others];
};

export const isLineNote = (note) => {
    const [pitch, oct] = note.toLowerCase().split('/');
    const basePitch = pitch.charAt(0); // PEGA SÓ A PRIMEIRA LETRA
    const notes = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];
    const absPos = parseInt(oct) * 7 + notes.indexOf(basePitch);
    return absPos % 2 === 0;
};
