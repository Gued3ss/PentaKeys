import { useRef, useEffect } from 'react';
import Vex from 'vexflow';
import { sortNotes } from '@/engine/musicMath';

export function ScoreRenderer({ clef, keySig, visualNotes, isMini = false, hideClef = false, onCrash }) {
    const containerRef = useRef(null);
    const visualNotesKey = JSON.stringify(visualNotes);

    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';

        try {
            const VF = Vex.Flow;
            const width = isMini ? 140 : (visualNotes.length > 1 ? 250 : 180);
            const height = isMini ? 110 : 140;

            const renderer = new VF.Renderer(containerRef.current, VF.Renderer.Backends.SVG);
            renderer.resize(width, height);
            const context = renderer.getContext();

            const COLOR_NORMAL = '#d6d3d1';
            const COLOR_HINT = '#d946ef';

            context.setStrokeStyle(COLOR_NORMAL);
            context.setFillStyle(COLOR_NORMAL);

            const staveY = isMini ? 25 : 20;
            const staveX = isMini ? 5 : 10;
            const staveWidth = width - (isMini ? 10 : 20);

            let renderClef = clef === 'grand' ? 'treble' : clef;
            if (visualNotes[0] && visualNotes[0][0] && visualNotes[0][0].clef) {
                renderClef = visualNotes[0][0].clef;
            }

            const stave = new VF.Stave(staveX, staveY, staveWidth);

            if (!hideClef) {
                stave.addClef(renderClef);
                if (!isMini || keySig !== 'C') stave.addKeySignature(keySig);
            }
            stave.setContext(context).draw();

            const trebleNotes = [];
            const bassNotes = [];

            visualNotes.forEach(beat => {
                let keys = [];
                let hintIndices = [];
                let currentClef = renderClef;

                beat.forEach(noteDef => {
                    const startIndex = keys.length;
                    keys.push(...noteDef.keys);
                    if (noteDef.hintIndices) {
                        noteDef.hintIndices.forEach(idx => hintIndices.push(startIndex + idx));
                    }
                    if (noteDef.clef) currentClef = noteDef.clef;
                });

                const uniqueKeys = [...new Set(keys)];

                if (uniqueKeys.length > 0) {
                    const originalKeys = [...uniqueKeys];
                    const sortedKeys = sortNotes(uniqueKeys);
                    let sn = new VF.StaveNote({ keys: sortedKeys, duration: 'q', clef: currentClef });

                    if (!hideClef) {
                        sortedKeys.forEach((k, idx) => {
                            const noteName = k.split('/')[0];
                            if (noteName.includes('#')) sn.addModifier(new VF.Accidental('#'), idx);
                            if (noteName.length > 1 && noteName.endsWith('b')) sn.addModifier(new VF.Accidental('b'), idx);
                        });
                    }

                    sn.setStyle({ fillStyle: COLOR_NORMAL, strokeStyle: COLOR_NORMAL });

                    hintIndices.forEach(oldIdx => {
                        const note = originalKeys[oldIdx];
                        const newIdx = sortedKeys.indexOf(note);
                        if (newIdx !== -1) {
                            sn.setKeyStyle(newIdx, { fillStyle: COLOR_HINT, strokeStyle: COLOR_HINT });
                        }
                    });

                    if (currentClef === 'bass') bassNotes.push(sn);
                    else trebleNotes.push(sn);
                }
            });

            let trebleVoice = null;
            let bassVoice = null;

            if (trebleNotes.length > 0) trebleVoice = new VF.Voice({ num_beats: visualNotes.length, beat_value: 4 }).addTickables(trebleNotes);
            if (bassNotes.length > 0) bassVoice = new VF.Voice({ num_beats: visualNotes.length, beat_value: 4 }).addTickables(bassNotes);

            const voicesToFormat = [];
            if (trebleVoice) voicesToFormat.push(trebleVoice);
            if (bassVoice) voicesToFormat.push(bassVoice);

            if (voicesToFormat.length > 0) {
                const formatWidth = hideClef ? width - 80 : width - 40;
                new VF.Formatter().joinVoices(voicesToFormat).format(voicesToFormat, formatWidth);
                if (trebleVoice) trebleVoice.draw(context, stave);
                if (bassVoice) bassVoice.draw(context, stave);
            }

            const svg = containerRef.current.querySelector('svg');
            if (svg) {
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.width = '100%';
                svg.style.height = '100%';

                if (isMini) {
                    svg.setAttribute('viewBox', '11 25 119 123');
                } else if (clef === 'grand') {
                    svg.setAttribute('viewBox', `0 20 ${width} 240`);
                } else {
                    svg.setAttribute('viewBox', `0 10 ${width} 120`);
                }
            }
        } catch (e) {
            console.error("Erro ao renderizar VexFlow:", e);
            if (onCrash) onCrash();
        }
    }, [clef, keySig, visualNotesKey, isMini, hideClef]);

    return <div ref={containerRef} className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full" />;
}
