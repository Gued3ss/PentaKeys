import { getAbsPos } from '@/engine/musicMath';

export const AbstractPiano = ({ notes, className = "" }) => {
    const p1 = getAbsPos(notes[0]);
    const p2 = getAbsPos(notes[1]);
    const degree = Math.max(p1, p2) - Math.min(p1, p2) + 1;

    const keys = Array.from({ length: degree });
    const svgWidth = degree * 20 + 4;

    return (
        <svg viewBox={`0 0 ${svgWidth} 80`} className={`w-full h-full drop-shadow-sm ${className}`}>
            {keys.map((_, i) => {
                const isEdge = i === 0 || i === degree - 1;
                const x = 2 + i * 20;
                const w = 18; const h = 76; const r = 4;
                const d = `M ${x} 2 L ${x + w} 2 L ${x + w} ${2 + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${2 + h} L ${x + r} ${2 + h} A ${r} ${r} 0 0 1 ${x} ${2 + h - r} Z`;
                return (
                    <path key={i} d={d}
                        fill={isEdge ? '#64748b' : '#f8fafc'}
                        stroke="#334155" strokeWidth="2"
                    />
                )
            })}
        </svg>
    )
}
