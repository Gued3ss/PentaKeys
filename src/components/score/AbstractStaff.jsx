import { getAbsPos } from '@/engine/musicMath';

export const AbstractStaff = ({ notes, isStacked = false, className = "" }) => {
    const p1 = getAbsPos(notes[0]);
    const p2 = getAbsPos(notes[1]);

    const getLines = (p) => p % 2 === 0 ? [p] : [p - 1, p + 1];
    const lines1 = getLines(p1);
    const lines2 = getLines(p2);

    const minLine = Math.min(...lines1, ...lines2);
    const maxLine = Math.max(...lines1, ...lines2);

    const linesToDraw = [];
    for (let l = minLine; l <= maxLine; l += 2) {
        linesToDraw.push(l);
    }

    const lineSpacing = 12;
    const stepSpacing = lineSpacing / 2;
    const height = (maxLine - minLine) * stepSpacing + 40;
    const width = 100;

    // Define a posição X (cx) baseada no isStacked
    const cx1 = isStacked ? 50 : 40;
    const cx2 = isStacked ? 50 : 60;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`max-w-full max-h-full drop-shadow-sm ${className}`}>
            {linesToDraw.map(l => {
                const y = (maxLine - l) * stepSpacing + 20;
                return <line key={l} x1="10" y1={y} x2="90" y2={y} stroke="#d6d3d1" strokeWidth="2" />
            })}
            <ellipse cx={cx1} cy={(maxLine - p1) * stepSpacing + 20} rx="7" ry="5" fill="#d6d3d1" transform={`rotate(-15 ${cx1} ${(maxLine - p1) * stepSpacing + 20})`} />
            <ellipse cx={cx2} cy={(maxLine - p2) * stepSpacing + 20} rx="7" ry="5" fill="#d6d3d1" transform={`rotate(-15 ${cx2} ${(maxLine - p2) * stepSpacing + 20})`} />
        </svg>
    )
}
