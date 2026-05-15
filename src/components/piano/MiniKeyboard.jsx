export function MiniKeyboard({ highlightedNotes = [], className = "" }) {
    const activeKeys = highlightedNotes.map(hn => {
        const isToneFormat = hn.match(/[A-Z]/i);
        if (isToneFormat) return hn.toUpperCase();
        let [note, oct] = hn.split('/');
        note = note.charAt(0).toUpperCase() + note.slice(1).toLowerCase();
        const flatMap = { 'Bb': 'A#', 'Eb': 'D#', 'Ab': 'G#', 'Db': 'C#', 'Gb': 'F#' };
        note = flatMap[note] || note;
        return `${note}${oct}`;
    });

    const octaves = activeKeys.map(k => parseInt(k.slice(-1))).filter(n => !isNaN(n));
    const minOct = octaves.length > 0 ? Math.min(...octaves) : 4;

    let startOctave = 4;
    let numOctaves = 1;

    if (activeKeys.length === 1) {
        startOctave = minOct;
        numOctaves = 1;
    } else if (activeKeys.length > 1) {
        numOctaves = 3;
        startOctave = Math.max(2, minOct - 1);
        if (startOctave > 4) startOctave = 4;
    }

    const whiteKeys = [];
    const blackKeys = [];
    const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const bNotes = [{ n: 'C#', p: 1 }, { n: 'D#', p: 2 }, { n: 'F#', p: 4 }, { n: 'G#', p: 5 }, { n: 'A#', p: 6 }];

    for (let oct = startOctave; oct < startOctave + numOctaves; oct++) {
        notes.forEach(n => whiteKeys.push({ note: `${n}${oct}`, isC: n === 'C' }));
        bNotes.forEach(bn => blackKeys.push({ note: `${bn.n}${oct}`, pos: bn.p + (oct - startOctave) * 7 }));
    }

    const svgWidth = numOctaves * 7 * 19 + 8;

    return (
        <svg viewBox={`0 0 ${svgWidth} 80`} className={`w-full h-full drop-shadow-sm ${className}`}>
            <rect x="0" y="0" width={svgWidth} height="80" rx="6" fill="#1e293b" />
            {whiteKeys.map((keyObj, i) => {
                const isHighlighted = activeKeys.includes(keyObj.note);
                return (
                    <g key={keyObj.note}>
                        <rect x={4 + (i * 19)} y="4" width="17" height="72" rx="3"
                            fill={isHighlighted ? '#be123c' : '#cbd5e1'}
                            stroke={isHighlighted ? '#9f1239' : '#94a3b8'} strokeWidth="1.5" />
                        {keyObj.isC && (
                            <text x={4 + (i * 19) + 8.5} y="68" fontSize="10" fill={isHighlighted ? '#fecdd3' : '#64748b'} textAnchor="middle" fontWeight="bold" style={{ pointerEvents: 'none' }}>
                                {keyObj.note}
                            </text>
                        )}
                    </g>
                );
            })}
            {blackKeys.map((bk) => {
                const isHighlighted = activeKeys.includes(bk.note);
                return <rect key={bk.note} x={4 + (bk.pos * 19) - 6} y="4" width="11" height="45" rx="2"
                    fill={isHighlighted ? '#be123c' : '#0f172a'}
                    stroke={isHighlighted ? '#9f1239' : '#000000'} strokeWidth="1" />;
            })}
        </svg>
    );
}
