import { PIANO_KEYS } from '@/constants/pianoKeys';

export function VirtualPiano({ onKeyPress, selectedKeys = [], correctKeys = [], wrongKeys = [], hintKey = null, disabled = false }) {
    const whiteKeys = PIANO_KEYS.filter(k => k.type === 'white');
    return (
        <div className="w-full bg-themeBg p-2 border-t-2 border-stone-800 overflow-x-auto hide-scrollbar touch-pan-x">
            <div className="flex h-40 sm:h-48 md:h-56 min-w-[800px] md:min-w-0 relative">
                {whiteKeys.map((key) => {
                    const originalIndex = PIANO_KEYS.findIndex(k => k.note === key.note);
                    const nextKey = PIANO_KEYS[originalIndex + 1];
                    const hasBlackKey = nextKey && nextKey.type === 'black';

                    const getBgClass = (note, isBlack) => {
                        if (correctKeys.includes(note)) return isBlack ? "bg-cyan-700" : "bg-themeSuccess";
                        if (wrongKeys.includes(note)) return isBlack ? "bg-red-900" : "bg-themeError";
                        if (selectedKeys.includes(note)) return isBlack ? "bg-rose-900" : "bg-rose-300";
                        if (hintKey === note) return isBlack ? "bg-fuchsia-900" : "bg-themeHint";
                        return isBlack ? "bg-stone-800" : "bg-stone-100";
                    };

                    return (
                        <div key={key.note} className="relative flex-1 flex justify-center mx-[1px]">
                            <button onPointerDown={(e) => { e.preventDefault(); if (!disabled) onKeyPress(key.note); }}
                                className={`w-full h-full border-2 border-stone-400 rounded-b-xl flex items-end justify-center pb-2 md:pb-4 transition-colors duration-100 shadow-[0_4px_0_#78716c] active:translate-y-1 active:shadow-none active:border-b-0 ${getBgClass(key.note, false)}`}>
                                {key.isC && <span className="text-stone-400 text-xs font-bold mb-1">{key.note}</span>}
                            </button>
                            {hasBlackKey && (
                                <button onPointerDown={(e) => { e.preventDefault(); if (!disabled) onKeyPress(nextKey.note); }}
                                    className={`absolute top-0 -right-[50%] w-[75%] h-[60%] rounded-b-lg z-10 transition-colors duration-100 shadow-[0_4px_0_#000000] active:translate-y-1 active:shadow-none ${getBgClass(nextKey.note, true)}`}
                                    style={{ transform: 'translateX(-10%)' }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
