import React, { useEffect, useRef } from 'react';
import { useAudioAnalyzer } from '../hooks/useAudioAnalyzer';
import bgImage from '../assets/visualizer-bg.png';

const MusicVisualizer = () => {
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const [trackName, setTrackName] = React.useState('Generated Track');
    const { loadAudio, play, stop, isPlaying, getFrequencyData, getBassEnergy } = useAudioAnalyzer();

    useEffect(() => {
        // Load the demo track initially
        loadAudio('generated');
        setTrackName('Generated Track');
        return () => stop();
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file) {
            stop(); // Stop current playback
            setTrackName('Loading...');
            await loadAudio(file);
            setTrackName(file.name);
            play();
        }
    };

    const triggerFileUpload = () => {
        fileInputRef.current.click();
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const render = () => {
            const width = canvas.width;
            const height = canvas.height;
            const centerX = width / 2;
            const centerY = height / 2;

            // Get data
            const dataArray = getFrequencyData();
            const bass = getBassEnergy();

            // Base radius + bass kick (Increased sensitivity)
            const baseRadius = 120;
            const dynamicRadius = baseRadius + (bass * 1.5); // Increased multiplier from 0.8 to 1.5

            // Clear canvas
            ctx.clearRect(0, 0, width, height);

            // Draw Center Circle (NCS Style)
            ctx.beginPath();
            ctx.arc(centerX, centerY, dynamicRadius, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 5;
            ctx.stroke();

            // Draw Inner Pulse
            ctx.beginPath();
            ctx.arc(centerX, centerY, dynamicRadius * 0.8, 0, 2 * Math.PI);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw Bars
            if (dataArray.length > 0) {
                const bars = 100; // Number of bars
                // We want to use the lower frequency range mostly for the visualizer as it looks better
                // The FFT size is 256, so we have 128 bins.
                const step = Math.ceil(dataArray.length / bars);

                for (let i = 0; i < bars; i++) {
                    const value = dataArray[i]; // Use raw data directly for more detail
                    // Scale height based on value (Increased sensitivity)
                    const barHeight = Math.max(value * 1.5, 5);

                    const angle = (i / bars) * 2 * Math.PI - (Math.PI / 2); // Start from top

                    // Start point (on circle)
                    const x1 = centerX + Math.cos(angle) * (dynamicRadius + 10);
                    const y1 = centerY + Math.sin(angle) * (dynamicRadius + 10);

                    // End point (outwards)
                    const x2 = centerX + Math.cos(angle) * (dynamicRadius + 10 + barHeight);
                    const y2 = centerY + Math.sin(angle) * (dynamicRadius + 10 + barHeight);

                    ctx.beginPath();
                    ctx.moveTo(x1, y1);
                    ctx.lineTo(x2, y2);

                    // Color gradient based on angle or frequency
                    const hue = (i / bars) * 360;
                    ctx.strokeStyle = `hsl(${hue}, 80%, 60%)`;
                    ctx.lineWidth = 4;
                    ctx.lineCap = 'round';
                    ctx.stroke();
                }
            }

            animationId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationId);
    }, [getFrequencyData, getBassEnergy]);

    // Resize handler
    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current) {
                canvasRef.current.width = window.innerWidth;
                canvasRef.current.height = window.innerHeight;
            }
        };
        window.addEventListener('resize', handleResize);
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{
            position: 'fixed', // Changed from relative to fixed to cover full screen
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            overflow: 'hidden',
            zIndex: 100 // Ensure it covers other elements
        }}>
            {/* Overlay to darken background */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.4)',
                backdropFilter: 'blur(3px)'
            }} />

            <canvas ref={canvasRef} style={{ position: 'relative', display: 'block', zIndex: 1 }} />

            {/* Back Button */}
            <a href="/" style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                color: 'white',
                textDecoration: 'none',
                zIndex: 200,
                fontSize: '1.2rem',
                fontWeight: 'bold',
                textShadow: '0 0 5px black'
            }}>
                ← Back to Home
            </a>

            <div style={{
                position: 'absolute',
                bottom: '80px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                textAlign: 'center',
                width: '100%'
            }}>
                <h2 style={{ color: 'white', marginBottom: '0.5rem', textShadow: '0 0 10px cyan' }}>NCS Visualizer</h2>
                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                    Now Playing: <span style={{ color: '#00ffff' }}>{trackName}</span>
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={isPlaying ? stop : play}
                        className="btn"
                        style={{
                            padding: '1rem 3rem',
                            fontSize: '1.2rem',
                            backgroundColor: 'rgba(0, 0, 0, 0.6)',
                            color: '#00ffff',
                            border: '2px solid #00ffff',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            transition: 'all 0.3s ease',
                            boxShadow: '0 0 20px rgba(0, 255, 255, 0.3)'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#00ffff';
                            e.target.style.color = 'black';
                            e.target.style.boxShadow = '0 0 40px rgba(0, 255, 255, 0.6)';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                            e.target.style.color = '#00ffff';
                            e.target.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.3)';
                        }}
                    >
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>

                    <button
                        onClick={triggerFileUpload}
                        className="btn"
                        style={{
                            padding: '1rem 2rem',
                            fontSize: '1rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.5)',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            textTransform: 'uppercase',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease'
                        }}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                            e.target.style.borderColor = 'white';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                            e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                        }}
                    >
                        Upload Music
                    </button>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="audio/*"
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default MusicVisualizer;