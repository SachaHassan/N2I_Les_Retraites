import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const KonamiHandler = () => {
    const [sequence, setSequence] = useState([]);
    const [activated, setActivated] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    const KONAMI_CODE = [
        'ArrowUp', 'ArrowUp',
        'ArrowDown', 'ArrowDown',
        'ArrowLeft', 'ArrowRight',
        'ArrowLeft', 'ArrowRight',
        'b', 'a'
    ];

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Add new key to sequence
            const newSequence = [...sequence, e.key];

            // Keep sequence length equal to Konami code length
            if (newSequence.length > KONAMI_CODE.length) {
                newSequence.shift();
            }

            setSequence(newSequence);

            // Check if sequence matches
            if (JSON.stringify(newSequence) === JSON.stringify(KONAMI_CODE)) {
                activateEasterEgg();
                setSequence([]); // Reset
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [sequence]);

    const activateEasterEgg = () => {
        if (location.pathname === '/quests/ugly') {
            setActivated(true);
            // alert('KONAMI CODE ACTIVATED! 🎮 Unlimited Lives Granted (Not really)'); // Removed alert for smoother transition

            // Add a class to body for global effects
            document.body.classList.add('konami-mode');

            setTimeout(() => {
                setActivated(false);
                document.body.classList.remove('konami-mode');
                navigate('/quests/snake');
            }, 1500); // Wait a bit for the effect before redirecting
        }
    };

    if (!activated) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.5)'
        }}>
            <h1 style={{
                color: '#fff',
                fontSize: '4rem',
                textShadow: '0 0 20px #ff00de',
                animation: 'bounce 0.5s infinite alternate'
            }}>
                CHEAT CODE ACTIVATED!
            </h1>
            <style>{`
        @keyframes bounce {
          from { transform: scale(1); }
          to { transform: scale(1.2); }
        }
        .konami-mode {
          filter: hue-rotate(90deg);
        }
      `}</style>
        </div>
    );
};

export default KonamiHandler;
