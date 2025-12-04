import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const RubeGoldberg = () => {
    const [step, setStep] = useState(0); // 0: Initial, 1-6: Steps, 7: Success
    const [modalOpen, setModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [log, setLog] = useState([]);
    const [progress, setProgress] = useState(0);
    const [progressText, setProgressText] = useState('Connexion...');

    // Step 1: Simple Math
    const [step1Input, setStep1Input] = useState('');

    // Step 2: Complex Math
    const [step2Input, setStep2Input] = useState('');

    // Step 4: Riddle
    const [step4Input, setStep4Input] = useState('');

    const startVerification = () => {
        if (verified) return;
        setLoading(true);
        setTimeout(() => {
            setModalOpen(true);
            setStep(1);
        }, 1500);
    };

    const handleStep1 = () => {
        if (step1Input == 2) {
            nextStep(2);
        } else {
            alert("Erreur critique. Êtes-vous un robot ?");
        }
    };

    const handleStep2 = () => {
        // sqrt(4761) + (3 * 7) - 10 = 69 + 21 - 10 = 80
        if (step2Input == 80) {
            nextStep(3);
        } else {
            alert("Calcul incorrect. Recalibrage des neurones...");
        }
    };

    const handleStep3Click = () => {
        nextStep(4);
    };

    const handleStep3Hover = (e) => {
        const btn = e.target;
        // Simple random move logic
        // In React we might want to use state for position, but direct DOM manipulation for high freq events is sometimes smoother or easier to port quickly
        const x = Math.random() * 200 - 100;
        const y = Math.random() * 60 - 30;
        btn.style.transform = `translate(${x}px, ${y}px)`;
    };

    const handleStep4 = () => {
        if (step4Input.toLowerCase().trim() === 'e') {
            nextStep(5);
        } else {
            alert("Incorrect. Indice : C'est une lettre.");
        }
    };

    // Step 5: Progress Bar Effect
    useEffect(() => {
        if (step === 5) {
            let width = 0;
            const interval = setInterval(() => {
                if (width >= 100) {
                    clearInterval(interval);
                    setProgressText("Terminé !");
                    setTimeout(() => nextStep(6), 500);
                } else {
                    // Logic for ~30s duration (avg increment ~0.33 per 100ms)
                    if (Math.random() > 0.9 && width > 5) {
                        width -= 2;
                        setProgressText("Erreur paquet... Retentative...");
                    } else {
                        width += 0.6;
                        setProgressText(`Chargement... ${Math.floor(width)}%`);
                    }
                    setProgress(width);
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, [step]);

    // Step 6: Goldberg Log
    useEffect(() => {
        if (step === 6) {
            const steps = [
                "Lâcher de la bille en acier...",
                "La bille roule sur la rampe A...",
                "La bille frappe le domino #1...",
                "Cascade de 500 dominos en cours...",
                "Le dernier domino active le ventilateur...",
                "Le ventilateur pousse le bateau en papier...",
                "Le bateau active le levier hydraulique...",
                "Le levier presse le bouton 'Valider'...",
                "Vérification biométrique du bouton...",
                "Succès !"
            ];
            let i = 0;
            const interval = setInterval(() => {
                if (i >= steps.length) {
                    clearInterval(interval);
                    setTimeout(() => {
                        setModalOpen(false);
                        setVerified(true);
                        setLoading(false);
                        alert("Félicitations ! Vous êtes humain (probablement).");
                    }, 1000);
                } else {
                    setLog(prev => [...prev, steps[i]]);
                    i++;
                }
            }, 800);
            return () => clearInterval(interval);
        }
    }, [step]);

    const nextStep = (next) => {
        // Transition state could be added here
        setStep(next);
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f2f5',
            color: '#333',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div className="container" style={{ textAlign: 'center' }}>
                <div
                    className={`captcha-box ${verified ? 'checked' : ''}`}
                    onClick={startVerification}
                    style={{
                        background: '#fff',
                        border: '1px solid #d3d3d3',
                        borderRadius: '3px',
                        width: '300px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        boxShadow: '0 0 4px rgba(0,0,0,0.08)',
                        cursor: verified ? 'default' : 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div
                            className="captcha-checkbox"
                            style={{
                                width: '24px',
                                height: '24px',
                                border: '2px solid #c1c1c1',
                                borderRadius: '2px',
                                marginRight: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative'
                            }}
                        >
                            {loading && !verified && <div className="spinner" style={{
                                width: '16px', height: '16px', border: '2px solid #4a90e2', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'
                            }}></div>}
                            {verified && <span style={{ color: '#0f9d58', fontSize: '20px', fontWeight: 'bold' }}>✓</span>}
                        </div>
                        <div className="captcha-label" style={{ fontSize: '14px', fontFamily: 'Roboto, sans-serif' }}>Je ne suis pas un robot</div>
                    </div>
                    <div className="captcha-logo" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <img src="https://www.gstatic.com/recaptcha/api2/logo_48.png" alt="reCAPTCHA logo" style={{ width: '32px', height: '32px' }} />
                        <span style={{ fontSize: '10px', color: '#555' }}>reCAPTCHA</span>
                        <small style={{ fontSize: '8px', color: '#999' }}>Confidentialité - Conditions</small>
                    </div>
                </div>

                {modalOpen && (
                    <div className="modal" style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" style={{
                            backgroundColor: '#fff', padding: '20px', borderRadius: '8px', width: '90%', maxWidth: '400px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            <div className="modal-header" style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>
                                <h3 style={{ margin: 0 }}>Vérification de sécurité</h3>
                            </div>
                            <div className="modal-body">
                                {step === 1 && (
                                    <div>
                                        <p>Prouvez que vous êtes humain. Combien font 1 + 1 ?</p>
                                        <input
                                            type="number"
                                            value={step1Input}
                                            onChange={(e) => setStep1Input(e.target.value)}
                                            placeholder="Votre réponse"
                                            style={{ width: '100%', padding: '8px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <button className="btn" onClick={handleStep1} style={{ marginTop: '10px', padding: '8px 16px', background: '#4a90e2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Valider</button>
                                    </div>
                                )}
                                {step === 2 && (
                                    <div>
                                        <p>Bien. Maintenant, résolvez ceci :</p>
                                        <p style={{ fontFamily: 'monospace', background: '#334155', color: '#fff', padding: '5px', borderRadius: '4px' }}>sqrt(4761) + (3 * 7) - 10</p>
                                        <input
                                            type="number"
                                            value={step2Input}
                                            onChange={(e) => setStep2Input(e.target.value)}
                                            placeholder="Réponse"
                                            style={{ width: '100%', padding: '8px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <button className="btn" onClick={handleStep2} style={{ marginTop: '10px', padding: '8px 16px', background: '#4a90e2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Valider</button>
                                    </div>
                                )}
                                {step === 3 && (
                                    <div>
                                        <p>Cliquez sur le bouton pour continuer.</p>
                                        <div style={{ height: '100px', position: 'relative', width: '100%' }}>
                                            <button
                                                className="btn moving-btn"
                                                onClick={handleStep3Click}
                                                onMouseOver={handleStep3Hover}
                                                style={{
                                                    position: 'absolute', top: '30px', left: '40%',
                                                    padding: '8px 16px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', transition: 'transform 0.1s'
                                                }}
                                            >
                                                Cliquez-moi
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {step === 4 && (
                                    <div>
                                        <p>Je suis le commencement de tout, la fin de tout. Je suis le début de l'éternité, la fin de l'espace et du temps. Que suis-je ?</p>
                                        <input
                                            type="text"
                                            value={step4Input}
                                            onChange={(e) => setStep4Input(e.target.value)}
                                            placeholder="La réponse est une lettre"
                                            style={{ width: '100%', padding: '8px', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        />
                                        <button className="btn" onClick={handleStep4} style={{ marginTop: '10px', padding: '8px 16px', background: '#4a90e2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Valider</button>
                                    </div>
                                )}
                                {step === 5 && (
                                    <div>
                                        <p>Veuillez patienter pendant que nous vérifions votre humanité auprès de la base de données galactique.</p>
                                        <div className="progress-bar-container" style={{ width: '100%', height: '20px', background: '#eee', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' }}>
                                            <div className="progress-bar" style={{ width: `${progress}%`, height: '100%', background: '#4a90e2', transition: 'width 0.1s' }}></div>
                                        </div>
                                        <p style={{ fontSize: '12px', marginTop: '5px', color: '#666' }}>{progressText}</p>
                                    </div>
                                )}
                                {step === 6 && (
                                    <div>
                                        <h3>Machine de Goldberg</h3>
                                        <div style={{ textAlign: 'left', fontFamily: 'monospace', fontSize: '12px', height: '150px', overflowY: 'auto', background: '#0f172a', color: '#0f0', padding: '10px', borderRadius: '4px' }}>
                                            <div>&gt; Initialisation du système...</div>
                                            {log.map((l, i) => <div key={i}>&gt; {l}</div>)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>

            <Link to="/" style={{ position: 'absolute', top: '20px', left: '20px', textDecoration: 'none', color: '#333', fontWeight: 'bold' }}>← Retour</Link>
        </div>
    );
};

export default RubeGoldberg;
