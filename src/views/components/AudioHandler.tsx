import axios from 'axios';

type Styles = {
    fftSize: number;
    fillStyle: string | CanvasGradient | CanvasPattern;
    strokeStyle: string | CanvasGradient | CanvasPattern;
    lineWidth: number;
    level: number;
};

type Displays = {
    frequencyC?: HTMLCanvasElement | null;
    sinewaveC?: HTMLCanvasElement | null;
};

type AudioHandlerStatus = 'INIT' | 'READY' | 'PLAY' | 'PAUSE' | 'STOP' | 'ADD';

export class AudioHandler {
    private status: AudioHandlerStatus = 'INIT';
    private currentTime: number | null = null;
    private time: number | null = null;
    private pointer = 0;
    private volume = 0.1;
    private releaseTime = 0.1;

    private sinewaveC: HTMLCanvasElement | null | undefined = null;
    private frequencyC: HTMLCanvasElement | null | undefined = null;
    private styles: Styles | null = null;

    private source: AudioBufferSourceNode | null = null;
    private context: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private frequencyDataArray: Uint8Array | null = null;
    private sinewaveDataArray: Uint8Array | null = null;
    private sinewaveСanvasCtx: CanvasRenderingContext2D | null = null;
    private frequencyСanvasCtx: CanvasRenderingContext2D | null = null;

    private gainNode: GainNode | null = null;
    private buffer: AudioBuffer | null = null;
    private buffers: (AudioBuffer | undefined)[] = [];

    grabAudioContext = (): void => {
        this.context = new window.AudioContext();
        this.analyser = this.context.createAnalyser();
    };

    addFiles = async (urls: string[]) => {
        const cartridge = await Promise.all(
            urls.map(url => axios.get(url, { responseType: 'arraybuffer' }))
        );

        const buffers = await Promise.all(
            cartridge.map(res => this.context?.decodeAudioData(res.data))
        );

        this.buffers = this.buffers.concat(buffers);

        if (this.status !== 'PLAY') {
            this.status = 'READY';
        }
    };

    loadFiles = async (
        urls: string[],
        { frequencyC, sinewaveC }: Displays,
        styles: Styles
    ): Promise<void> => {
        const cartridge = await Promise.all(
            urls.map(url => axios.get(url, { responseType: 'arraybuffer' }))
        );

        this.grabAudioContext();

        if (!this.context || !this.analyser) {
            return;
        }

        this.styles = styles;
        this.sinewaveC = sinewaveC;
        this.frequencyC = frequencyC;
        this.gainNode = this.context.createGain();

        this.buffers = await Promise.all(
            cartridge.map(res => this.context?.decodeAudioData(res.data))
        );

        this.analyser.fftSize = styles.fftSize;

        this.frequencyDataArray = new Uint8Array(
            this.analyser.frequencyBinCount
        );

        this.sinewaveDataArray = new Uint8Array(this.analyser.fftSize);

        this.createFrequencyCanvasContext(frequencyC);
        this.createSinewaveCavasContext(sinewaveC);

        if (this.status !== 'PLAY') {
            this.status = 'READY';
        }
    };

    createSinewaveCavasContext = (
        sinewaveC: HTMLCanvasElement | null | undefined
    ) => {
        if (!sinewaveC) return;

        this.sinewaveСanvasCtx = sinewaveC.getContext('2d');
        this.sinewaveСanvasCtx?.clearRect(
            0,
            0,
            sinewaveC.width,
            sinewaveC.height
        );
    };

    createFrequencyCanvasContext = (
        frequencyC: HTMLCanvasElement | null | undefined
    ) => {
        if (!frequencyC) return;

        this.frequencyСanvasCtx = frequencyC.getContext('2d');
        this.frequencyСanvasCtx?.clearRect(
            0,
            0,
            frequencyC.width,
            frequencyC.height
        );
    };

    getBuffers = () => {
        return this.buffers;
    };

    getStatus = () => {
        return this.status;
    };

    getCurrentTime = () => {
        return this.context?.currentTime;
    };

    setCurrentTime = (time: number) => {
        this.currentTime = time;
    };

    getDuration = () => {
        return this.buffer?.duration;
    };

    play = (resumeTime = this.currentTime ? this.currentTime || 0 : 0) => {
        if (
            this.status === 'PLAY' ||
            this.status === 'INIT' ||
            !this.context ||
            !this.gainNode ||
            !this.analyser
        ) {
            return;
        }

        this.source = this.context.createBufferSource();
        if (!this.source) {
            return;
        }
        if (this.buffers[this.pointer]) {
            this.source.buffer = this.buffers[this.pointer] || null;
        }

        // source -> gain
        this.source.connect(this.gainNode);
        // gain -> distination
        this.gainNode.connect(this.context.destination);

        this.gainNode.gain.value = this.volume;

        // source -> analyser
        this.source.connect(this.analyser);

        this.time = Date.now();
        this.source.start(0, resumeTime);
        this.status = 'PLAY';

        this.drawFrequency();
        this.drawSinewave();
    };

    stop = () => {
        this.status = 'STOP';
        this.currentTime = 0;

        this.gainNode?.gain.linearRampToValueAtTime(0, this.releaseTime);
        setTimeout(() => {
            this.source && this.source.stop(0);
        }, this.releaseTime);
    };

    pause = async () => {
        this.status = 'PAUSE';

        if (this.currentTime) {
            this.currentTime += (Date.now() - (this.time || 0)) / 1000;
        } else {
            this.currentTime = (Date.now() - (this.time || 0)) / 1000;
        }

        this.gainNode?.gain.linearRampToValueAtTime(0, this.releaseTime);
        setTimeout(() => {
            this.source && this.source.stop(0);
        }, this.releaseTime);
    };

    private changeSourceAndBuffer = async () => {
        const playing = this.status === 'PLAY';
        this.buffer = this.buffers[this.pointer] || null;

        this.stop();

        setTimeout(() => {
            if (!this.context) return;
            playing && this.play(0);
        }, 2);
    };

    nextsong = async () => {
        if (this.pointer < this.buffers.length - 1) {
            this.pointer += 1;
        } else {
            return;
        }

        await this.changeSourceAndBuffer();
    };

    lastsong = async () => {
        if (this.pointer > 0) {
            this.pointer -= 1;
        } else {
            return;
        }

        await this.changeSourceAndBuffer();
    };

    getVolume = () => {
        return this.gainNode?.gain.value || 0;
    };

    setVolume = (level: number) => {
        this.volume = level;

        if (!this.context || !this.gainNode) {
            return;
        }

        this.gainNode.gain.value = this.volume;
    };

    private drawSinewave = () => {
        if (
            !this.sinewaveC ||
            !this.analyser ||
            !this.sinewaveDataArray ||
            !this.sinewaveСanvasCtx ||
            !this.styles
        ) {
            return;
        }

        this.analyser.getByteTimeDomainData(this.sinewaveDataArray);
        requestAnimationFrame(this.drawSinewave);

        this.sinewaveСanvasCtx.fillStyle = this.styles.fillStyle;
        this.sinewaveСanvasCtx.globalAlpha = 0.3;
        this.sinewaveСanvasCtx.fillRect(
            0,
            0,
            this.sinewaveC.width,
            this.sinewaveC.height
        );
        this.sinewaveСanvasCtx.lineWidth = this.styles.lineWidth;

        this.sinewaveСanvasCtx.strokeStyle = this.styles.strokeStyle;
        this.sinewaveСanvasCtx.beginPath();

        const sliceWidth = (this.sinewaveC.width * 1.0) / this.analyser.fftSize;
        let x = 0;

        for (let i = 0; i < this.analyser.fftSize; i++) {
            const v = this.sinewaveDataArray[i] / 128.0; // byte / 2 || 256 / 2
            const y = (v * this.sinewaveC.height) / 2;

            if (i === 0) {
                this.sinewaveСanvasCtx.moveTo(x, y);
            } else {
                this.sinewaveСanvasCtx.lineTo(x, y);
            }
            x += sliceWidth;
        }

        this.sinewaveСanvasCtx.lineTo(
            this.sinewaveC.width,
            this.sinewaveC.height / 2
        );
        this.sinewaveСanvasCtx.stroke();
    };

    private drawFrequency = () => {
        if (
            !this.frequencyC ||
            !this.analyser ||
            !this.frequencyDataArray ||
            !this.frequencyСanvasCtx ||
            !this.styles
        ) {
            return;
        }

        this.analyser.getByteFrequencyData(this.frequencyDataArray);

        requestAnimationFrame(this.drawFrequency);

        this.frequencyСanvasCtx.fillStyle = this.styles.fillStyle;
        this.frequencyСanvasCtx?.fillRect(
            0,
            0,
            this.frequencyC.width,
            this.frequencyC.height
        );
        this.frequencyСanvasCtx?.beginPath();

        const barWidth =
            (this.frequencyC.width / this.analyser.frequencyBinCount) * 2.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < this.analyser.frequencyBinCount; i++) {
            barHeight = this.frequencyDataArray[i];

            this.frequencyСanvasCtx.fillStyle = this.styles.strokeStyle;
            this.frequencyСanvasCtx.fillRect(
                x,
                this.frequencyC.height - barHeight / 2,
                barWidth,
                barHeight / 2
            );

            x += barWidth + 1;
        }
    };
}
