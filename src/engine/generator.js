import { getAbsPos, isLineNote, getPianoKey, sortNotes, getClefForNote, getUniqueItems, getNotesWithinOctave, shuffleArray } from './musicMath';

export const generateSession = (config) => {
    const { clef, keySig, numExercises, range, types } = config;
    const exercises = [];
    const history = [];

    let pool = [];
    const trebleFull = ['g/3', 'a/3', 'b/3', 'c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5'];
    const bassFull = ['e/2', 'f/2', 'g/2', 'a/2', 'b/2', 'c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4'];

    if (clef === 'treble') {
        if (range === 'small') pool = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4'];
        else if (range === 'medium') pool = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4', 'c/5'];
        else pool = trebleFull;
    } else if (clef === 'bass') {
        if (range === 'small') pool = ['c/3', 'd/3', 'e/3', 'f/3', 'g/3'];
        else if (range === 'medium') pool = ['c/3', 'd/3', 'e/3', 'f/3', 'g/3', 'a/3', 'b/3', 'c/4'];
        else pool = bassFull;
    } else {
        // Remove duplicatas e ordena perfeitamente para evitar bugs de intervalo
        const rawPool = [...bassFull, ...trebleFull];
        pool = [...new Set(rawPool)].sort((a, b) => {
            const octA = parseInt(a.split('/')[1]);
            const octB = parseInt(b.split('/')[1]);
            if (octA !== octB) return octA - octB;
            const order = { 'c': 1, 'd': 2, 'e': 3, 'f': 4, 'g': 5, 'a': 6, 'b': 7 };
            return order[a.charAt(0).toLowerCase()] - order[b.charAt(0).toLowerCase()];
        });
    }

    const activeTypes = types.length > 0 ? types : ['single_note'];

    for (let i = 0; i < numExercises; i++) {
        let newExercise;
        let signature;
        let attempts = 0;

        do {
            const type = activeTypes[Math.floor(Math.random() * activeTypes.length)];

            if (type === 'single_note') {
                const note = getUniqueItems(pool, 1)[0];
                signature = `single_${note}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    visualNotes: [[{ keys: [note], clef: getClefForNote(note, clef) }]],
                    expectedKeys: [getPianoKey(note, keySig)],
                    instruction: 'inst_single'
                };
            }
            else if (type === 'guided_interval') {
                const targetPool = clef === 'grand' ? (Math.random() > 0.5 ? trebleFull : bassFull) : pool;
                const [n1, n2] = getNotesWithinOctave(targetPool, 2);
                const sorted = sortNotes([n1, n2]);
                const hintIndex = sorted.indexOf(n1);

                signature = `guided_${sorted.join('-')}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    visualNotes: [[{ keys: sorted, clef: getClefForNote(sorted[0], clef), hintIndices: [hintIndex] }]],
                    hintKey: getPianoKey(n1, keySig),
                    expectedKeys: [getPianoKey(n2, keySig)],
                    instruction: 'inst_guided'
                };
            }
            else if (type === 'sequence') {
                const [n1, n2] = getNotesWithinOctave(pool, 2);
                signature = `seq_${n1}-${n2}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    visualNotes: [[{ keys: [n1], clef: getClefForNote(n1, clef) }], [{ keys: [n2], clef: getClefForNote(n2, clef) }]],
                    expectedKeys: [getPianoKey(n1, keySig), getPianoKey(n2, keySig)],
                    instruction: 'inst_seq'
                };
            }
            else if (type === 'chord') {
                const chordNotes = sortNotes(getNotesWithinOctave(pool, 3));
                signature = `chord_${chordNotes.join('-')}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    visualNotes: [[{ keys: chordNotes, clef: clef === 'grand' ? 'treble' : clef }]],
                    expectedKeys: chordNotes.map(n => getPianoKey(n, keySig)),
                    instruction: 'inst_chord'
                };
            }
            else if (type === 'mc_staff_to_keys') {
                const note = getUniqueItems(pool, 1)[0];
                const correctKey = getPianoKey(note, keySig);
                const distractors = getUniqueItems(pool.filter(n => n !== note), 3).map(n => getPianoKey(n, keySig));
                const options = shuffleArray([correctKey, ...distractors]);

                signature = `mc_staff_${note}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    visualNotes: [[{ keys: [note], clef: getClefForNote(note, clef) }]],
                    expectedAnswer: correctKey,
                    options,
                    instruction: 'inst_mc_staff'
                };
            }
            else if (type === 'mc_keys_to_staff') {
                const note = getUniqueItems(pool, 1)[0];
                const questionKey = getPianoKey(note, keySig);
                const distractors = getUniqueItems(pool.filter(n => n !== note), 3);
                const options = shuffleArray([note, ...distractors]);

                signature = `mc_keys_${note}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    questionKey,
                    expectedAnswer: note,
                    options,
                    instruction: 'inst_mc_keys'
                };
            }
            else if (type.startsWith('match_pairs')) {
                const pairsData = [];
                const usedPairs = new Set();
                for (let p = 0; p < 3; p++) {
                    let n1, n2, pairStr;
                    let attemptsPair = 0;
                    let isStacked = false;
                    do {
                        if (type === 'match_pairs_single') {
                            n1 = getUniqueItems(pool, 1)[0];
                            pairStr = n1;
                        } else if (type === 'match_pairs_abstract') {
                            [n1, n2] = sortNotes(getNotesWithinOctave(pool, 2));
                            // Para abstrato, a exclusividade é baseada no GRAU do intervalo
                            const degree = Math.abs(getAbsPos(n1) - getAbsPos(n2)) + 1;
                            pairStr = `degree_${degree}`;
                            isStacked = degree !== 2 ? Math.random() > 0.5 : false; // 2ª nunca empilha
                        } else {
                            [n1, n2] = sortNotes(getNotesWithinOctave(pool, 2));
                            pairStr = `${n1}-${n2}`;
                        }
                        attemptsPair++;
                    } while (usedPairs.has(pairStr) && attemptsPair < 150);
                    usedPairs.add(pairStr);

                    pairsData.push({
                        id: `pair_${p}`,
                        notes: type === 'match_pairs_single' ? [n1] : [n1, n2],
                        keys: type === 'match_pairs_single' ? [getPianoKey(n1, keySig)] : [getPianoKey(n1, keySig), getPianoKey(n2, keySig)],
                        isStacked // Passa a prop para a partitura abstrata
                    });
                }
                signature = `match_${Array.from(usedPairs).join('|')}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    pairs: pairsData,
                    instruction: type === 'match_pairs_single' ? 'inst_match_sgl' : type === 'match_pairs_abstract' ? 'inst_match_abs' : 'inst_match_int'
                };
            }
            else if (type === 'pressure_line_space') {
                const rounds = [];
                let lastNote = '';
                for (let r = 0; r < 10; r++) {
                    let note;
                    do { note = getUniqueItems(pool, 1)[0]; } while (note === lastNote && pool.length > 1);
                    lastNote = note;
                    rounds.push({
                        note,
                        visualNotes: [[{ keys: [note], clef: getClefForNote(note, clef) }]],
                        expectedAnswer: isLineNote(note) ? 'line' : 'space',
                        soundKey: getPianoKey(note, keySig)
                    });
                }
                signature = `press_ls_${rounds.map(r => r.note).join('-')}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    rounds,
                    instruction: 'inst_press_ls'
                };
            }
            else if (type === 'pressure_odd_even') {
                const rounds = [];
                let lastPair = '';
                for (let r = 0; r < 10; r++) {
                    let n1, n2, pairStr;
                    do {
                        [n1, n2] = sortNotes(getNotesWithinOctave(pool, 2));
                        pairStr = `${n1}-${n2}`;
                    } while (pairStr === lastPair && pool.length > 2);
                    lastPair = pairStr;

                    const isOdd = isLineNote(n1) === isLineNote(n2);

                    // Verifica se é uma segunda (step) para forçar lado a lado
                    const isSecond = Math.abs(pool.indexOf(n1) - pool.indexOf(n2)) === 1;
                    // Sorteia se vai ser empilhado (harmônico) ou lado a lado (melódico)
                    const isStacked = !isSecond && Math.random() > 0.5;

                    const visualNotes = isStacked
                        ? [[{ keys: [n1, n2], clef: getClefForNote(n1, clef) }]]
                        : [[{ keys: [n1], clef: getClefForNote(n1, clef) }], [{ keys: [n2], clef: getClefForNote(n2, clef) }]];

                    rounds.push({
                        notes: [n1, n2],
                        visualNotes: visualNotes,
                        expectedAnswer: isOdd ? 'odd' : 'even',
                        soundKeys: [getPianoKey(n1, keySig), getPianoKey(n2, keySig)]
                    });
                }
                signature = `press_oe_${rounds.map(r => r.notes.join('')).join('-')}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    rounds,
                    instruction: 'inst_press_oe'
                };
            }
            else if (type === 'pressure_step_skip') {
                const rounds = [];
                let lastPair = '';
                for (let r = 0; r < 10; r++) {
                    let n1, n2, pairStr, sorted;
                    do {
                        n1 = getUniqueItems(pool, 1)[0];
                        const n1Idx = pool.indexOf(n1);
                        const validPool = pool.filter((n, idx) => Math.abs(idx - n1Idx) === 1 || Math.abs(idx - n1Idx) === 2);
                        n2 = validPool.length > 0 ? getUniqueItems(validPool, 1)[0] : getUniqueItems(pool, 1)[0];
                        sorted = sortNotes([n1, n2]);
                        pairStr = `${sorted[0]}-${sorted[1]}`;
                    } while (pairStr === lastPair && pool.length > 2);
                    lastPair = pairStr;

                    const isStep = Math.abs(pool.indexOf(n1) - pool.indexOf(n2)) === 1;

                    // Se for Step (2ª), obriga a ser lado a lado. Se for Skip (3ª), sorteia.
                    const isStacked = !isStep && Math.random() > 0.5;

                    const visualNotes = isStacked
                        ? [[{ keys: sorted, clef: getClefForNote(sorted[0], clef) }]]
                        : [[{ keys: [sorted[0]], clef: getClefForNote(sorted[0], clef) }], [{ keys: [sorted[1]], clef: getClefForNote(sorted[1], clef) }]];

                    rounds.push({
                        notes: sorted,
                        visualNotes: visualNotes,
                        expectedAnswer: isStep ? 'step' : 'skip',
                        soundKeys: [getPianoKey(sorted[0], keySig), getPianoKey(sorted[1], keySig)]
                    });
                }
                signature = `press_ss_${rounds.map(r => r.notes.join('')).join('-')}`;
                newExercise = {
                    id: `ex_${Date.now()}_${i}_${attempts}`, type, clef, keySig, retryCount: 0,
                    rounds,
                    instruction: 'inst_press_ss'
                };
            }

            attempts++;
        } while (history.includes(signature) && attempts < 15);

        history.push(signature);
        if (history.length > 5) history.shift();

        exercises.push(newExercise);
    }
    return exercises;
};
