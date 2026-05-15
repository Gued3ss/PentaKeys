import * as Tone from 'tone';

export class AudioEngine {
    constructor() {
        this.sampler = null;
        this.isReady = false;
    }

    async init() {
        if (this.isReady) return;
        await Tone.start();
        return new Promise((resolve) => {
            const timeout = setTimeout(() => { this.isReady = true; resolve(); }, 4000);
            this.sampler = new Tone.Sampler({
                urls: { C3: "C3.mp3", C4: "C4.mp3", C5: "C5.mp3" },
                release: 1, baseUrl: "https://tonejs.github.io/audio/salamander/",
                onload: () => { clearTimeout(timeout); this.isReady = true; resolve(); },
                onerror: () => { clearTimeout(timeout); this.isReady = true; resolve(); }
            }).toDestination();
        });
    }

    playNote(note) {
        if (this.isReady && this.sampler) this.sampler.triggerAttackRelease(note, "2n");
    }

    playChord(notes) {
        if (this.isReady && this.sampler) this.sampler.triggerAttackRelease(notes, "2n");
    }
}
