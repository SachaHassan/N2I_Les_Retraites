import { useState, useEffect, useRef } from 'react';

export const useAudioAnalyzer = () => {
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);
    const sourceRef = useRef(null);
    const bufferRef = useRef(null); // Store the decoded buffer
    const [isPlaying, setIsPlaying] = useState(false);

    // Procedural Techno Generator
    const generateDemoTrack = (ctx) => {
        const sampleRate = ctx.sampleRate;
        const duration = 60; // 60 seconds loop
        const bpm = 128;
        const beatLen = sampleRate * (60 / bpm);
        const buffer = ctx.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            const beat = i % beatLen;
            const bar = i % (beatLen * 4);

            let sample = 0;

            // Kick (Every beat)
            if (beat < 10000) {
                const freq = 150 * Math.exp(-beat / 1000);
                sample += Math.sin(2 * Math.PI * freq * t) * 0.8;
            }

            // Hi-hat (Every off-beat)
            if (beat > beatLen / 2 && beat < beatLen / 2 + 2000) {
                sample += (Math.random() * 2 - 1) * 0.3;
            }

            // Bass (Sawtooth, pulsing)
            const bassFreq = 55; // A1
            const bassEnv = Math.sin(Math.PI * (beat / beatLen)); // Pulse volume
            sample += ((t * bassFreq % 1) * 2 - 1) * 0.3 * bassEnv;

            // Melody (Simple Arpeggio)
            if (bar < beatLen * 4) {
                const note = Math.floor(t * 4) % 4; // Change note every 1/4 sec
                const melodyFreq = 440 * Math.pow(2, (note * 3) / 12); // Minor pentatonic-ish
                sample += Math.sin(2 * Math.PI * melodyFreq * t) * 0.1;
            }

            data[i] = sample * 0.5; // Master volume
        }
        return buffer;
    };

    const loadAudio = async (source) => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }

        // Clear existing buffer to prevent playing old audio
        bufferRef.current = null;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        let arrayBuffer;
        if (source === 'generated') {
            bufferRef.current = generateDemoTrack(audioContextRef.current);
            return;
        } else if (typeof source === 'string') {
            const response = await fetch(source);
            arrayBuffer = await response.arrayBuffer();
        } else {
            arrayBuffer = await source.arrayBuffer();
        }

        const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
        bufferRef.current = audioBuffer; // Save buffer for replay
    };

    const play = () => {
        if (!audioContextRef.current || !bufferRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }

        // Always create a new source node for playback
        if (sourceRef.current) {
            try { sourceRef.current.stop(); } catch (e) { }
            sourceRef.current.disconnect();
        }

        sourceRef.current = audioContextRef.current.createBufferSource();
        sourceRef.current.buffer = bufferRef.current;
        sourceRef.current.connect(analyserRef.current);
        analyserRef.current.connect(audioContextRef.current.destination);

        sourceRef.current.onended = () => setIsPlaying(false);
        sourceRef.current.start(0);

        setIsPlaying(true);
    };

    const stop = () => {
        if (sourceRef.current) {
            try {
                sourceRef.current.stop();
            } catch (e) {
                // Already stopped
            }
        }
        setIsPlaying(false);
    };

    const getFrequencyData = () => {
        if (analyserRef.current) {
            const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
            analyserRef.current.getByteFrequencyData(dataArray);
            return dataArray;
        }
        return new Uint8Array(0);
    };

    const getBassEnergy = () => {
        const data = getFrequencyData();
        if (data.length === 0) return 0;
        const bassSlice = data.slice(0, 10);
        const sum = bassSlice.reduce((a, b) => a + b, 0);
        return sum / bassSlice.length;
    }

    return { loadAudio, play, stop, isPlaying, getBassEnergy, getFrequencyData };
};