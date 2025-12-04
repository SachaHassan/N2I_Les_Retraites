import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NirdTools = () => {
    // --- 1. Advanced Eco-Calculator State ---
    const [calcState, setCalcState] = useState({
        computers: 50,
        years: 5, // Durée de vie visée
        powerW: 150, // Watts per PC
        hoursDay: 8,
        daysYear: 200,
        elecPrice: 0.25 // €/kWh
    });

    const calculateImpact = () => {
        const { computers, years, powerW, hoursDay, daysYear, elecPrice } = calcState;

        // Scenario A: Obsolescence (Change every 3 years)
        const hardwareCostA = (computers * 500) * Math.ceil(years / 3);
        const energyKwhA = (computers * powerW * hoursDay * daysYear * years) / 1000;
        const energyCostA = energyKwhA * elecPrice;
        const totalCostA = hardwareCostA + energyCostA;
        const co2ProdA = (computers * 300) * Math.ceil(years / 3); // 300kg per PC production

        // Scenario B: NIRD (Change every 6 years thanks to Linux)
        const hardwareCostB = (computers * 500) * Math.ceil(years / 6);
        const energyKwhB = (computers * (powerW * 0.9) * hoursDay * daysYear * years) / 1000; // Linux is 10% more efficient
        const energyCostB = energyKwhB * elecPrice;
        const totalCostB = hardwareCostB + energyCostB;
        const co2ProdB = (computers * 300) * Math.ceil(years / 6);

        return {
            savingsEuro: totalCostA - totalCostB,
            savingsCo2: co2ProdA - co2ProdB,
            tcoA: totalCostA,
            tcoB: totalCostB
        };
    };

    const impact = calculateImpact();

    // --- 2. Migration Guide 2.0 Data ---
    const tools = [
        { id: 'os', name: 'Windows 10/11', alt: 'Linux Mint', desc: 'Système stable, léger et sans mouchards.', privacy: 5, freedom: 5 },
        { id: 'office', name: 'MS Office', alt: 'LibreOffice', desc: 'Suite bureautique complète et standard.', privacy: 5, freedom: 5 },
        { id: 'browser', name: 'Chrome', alt: 'Firefox', desc: 'Navigation rapide respectant vos données.', privacy: 4, freedom: 5 },
        { id: 'cloud', name: 'Google Drive', alt: 'Nextcloud', desc: 'Vos fichiers chez vous, pas en Californie.', privacy: 5, freedom: 5 },
        { id: 'visio', name: 'Zoom', alt: 'Jitsi Meet', desc: 'Visioconférence chiffrée et souveraine.', privacy: 5, freedom: 5 },
        { id: 'search', name: 'Google Search', alt: 'Qwant / DuckDuckGo', desc: 'Moteur de recherche qui ne vous trace pas.', privacy: 5, freedom: 4 }
    ];

    // --- 3. Maturity Audit Data ---
    const [auditAnswers, setAuditAnswers] = useState({});
    const auditQuestions = [
        { id: 1, cat: 'Infra', text: "Vos postes ont-ils plus de 5 ans ?", weight: 2 },
        { id: 2, cat: 'Infra', text: "Utilisez-vous un OS libre (Linux) ?", weight: 3 },
        { id: 3, cat: 'Infra', text: "Réparez-vous le matériel en interne ?", weight: 2 },
        { id: 4, cat: 'Gouv', text: "Avez-vous un budget pour le Libre ?", weight: 1 },
        { id: 5, cat: 'Gouv', text: "Vos données sont-elles hébergées en UE ?", weight: 3 },
        { id: 6, cat: 'Gouv', text: "Refusez-vous les offres 'gratuites' des GAFAM ?", weight: 2 },
        { id: 7, cat: 'Péda', text: "Formez-vous les élèves au code ?", weight: 1 },
        { id: 8, cat: 'Péda', text: "Sensibilisez-vous à l'impact carbone ?", weight: 2 },
        { id: 9, cat: 'Péda', text: "Utilisez-vous des ressources éducatives libres ?", weight: 2 },
        { id: 10, cat: 'Péda', text: "Les élèves savent-ils installer un OS ?", weight: 2 }
    ];

    const toggleAudit = (id) => setAuditAnswers(prev => ({ ...prev, [id]: !prev[id] }));

    const getAuditResult = () => {
        const maxScore = auditQuestions.reduce((acc, q) => acc + q.weight, 0);
        const currentScore = auditQuestions.reduce((acc, q) => acc + (auditAnswers[q.id] ? q.weight : 0), 0);
        const percentage = Math.round((currentScore / maxScore) * 100);

        let title, color, advice;
        if (percentage < 30) {
            title = "Colonie Numérique";
            color = "#ef4444";
            advice = "Urgence absolue ! Vous êtes totalement dépendants. Commencez par installer Firefox et LibreOffice.";
        } else if (percentage < 60) {
            title = "Résistance Naissante";
            color = "#f59e0b";
            advice = "Des efforts notables. Il faut maintenant s'attaquer au dur : le système d'exploitation et l'hébergement.";
        } else if (percentage < 90) {
            title = "Bastion Libre";
            color = "#3b82f6";
            advice = "Bravo ! Vous êtes un exemple. Pensez à essaimer et former d'autres établissements.";
        } else {
            title = "Village Irréductible";
            color = "#10b981";
            advice = "Le niveau ultime. Votre souveraineté est totale. Avez-vous pensé à devenir hébergeur pour les autres ?";
        }

        return { percentage, title, color, advice };
    };

    const auditResult = getAuditResult();

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0a0a0a', color: '#e5e5e5', fontFamily: "'Inter', sans-serif", padding: '40px 20px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <Link to="/" style={{ color: '#ef4444', textDecoration: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                    <span style={{ fontSize: '1.2rem', marginRight: '5px' }}>&larr;</span> RETOUR AU QG
                </Link>

                <h1 style={{ fontSize: '2.5rem', color: '#ef4444', textTransform: 'uppercase', borderBottom: '2px solid #ef4444', paddingBottom: '20px', marginBottom: '50px', letterSpacing: '2px' }}>
                    Armurerie Numérique v2.0
                </h1>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>

                    {/* 1. Eco-Calculator */}
                    <div className="tool-card" style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ color: '#10b981', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                            1. Simulateur TCO & Carbone
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Parc (PC)</label>
                                <input type="number" value={calcState.computers} onChange={e => setCalcState({ ...calcState, computers: +e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Projection (Années)</label>
                                <input type="number" value={calcState.years} onChange={e => setCalcState({ ...calcState, years: +e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Conso (Watts)</label>
                                <input type="number" value={calcState.powerW} onChange={e => setCalcState({ ...calcState, powerW: +e.target.value })} style={inputStyle} />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>Prix élec (€/kWh)</label>
                                <input type="number" step="0.01" value={calcState.elecPrice} onChange={e => setCalcState({ ...calcState, elecPrice: +e.target.value })} style={inputStyle} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', height: '200px', alignItems: 'flex-end', gap: '20px', padding: '20px', backgroundColor: '#000', borderRadius: '8px', marginBottom: '20px' }}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{ width: '100%', height: `${(impact.tcoA / Math.max(impact.tcoA, impact.tcoB)) * 100}%`, backgroundColor: '#ef4444', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }}></div>
                                <span style={{ marginTop: '10px', fontSize: '0.8rem', color: '#ef4444' }}>Business as Usual</span>
                                <span style={{ fontWeight: 'bold' }}>{Math.round(impact.tcoA).toLocaleString()} €</span>
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}>
                                <div style={{ width: '100%', height: `${(impact.tcoB / Math.max(impact.tcoA, impact.tcoB)) * 100}%`, backgroundColor: '#10b981', borderRadius: '4px 4px 0 0', transition: 'height 0.5s' }}></div>
                                <span style={{ marginTop: '10px', fontSize: '0.8rem', color: '#10b981' }}>Modèle N.I.R.D.</span>
                                <span style={{ fontWeight: 'bold' }}>{Math.round(impact.tcoB).toLocaleString()} €</span>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                                {Math.round(impact.savingsEuro).toLocaleString()} € économisés
                            </div>
                            <div style={{ color: '#888', fontSize: '0.9rem' }}>
                                + {Math.round(impact.savingsCo2).toLocaleString()} kg de CO2 évités
                            </div>
                        </div>
                    </div>

                    {/* 2. Migration Guide */}
                    <div className="tool-card" style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>
                        <h2 style={{ color: '#f59e0b', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                            2. Guide de Migration
                        </h2>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '500px', overflowY: 'auto', paddingRight: '5px' }}>
                            {tools.map(tool => (
                                <div key={tool.id} style={{ backgroundColor: '#1a1a1a', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                        <span style={{ color: '#888', textDecoration: 'line-through' }}>{tool.name}</span>
                                        <span style={{ color: '#fff', fontWeight: 'bold' }}>&rarr; {tool.alt}</span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#aaa', margin: '5px 0 10px 0' }}>{tool.desc}</p>

                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>Vie Privée</div>
                                            <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px' }}>
                                                <div style={{ width: `${tool.privacy * 20}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }}></div>
                                            </div>
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.7rem', color: '#666', marginBottom: '2px' }}>Liberté</div>
                                            <div style={{ height: '4px', backgroundColor: '#333', borderRadius: '2px' }}>
                                                <div style={{ width: `${tool.freedom * 20}%`, height: '100%', backgroundColor: '#3b82f6', borderRadius: '2px' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 3. Maturity Audit */}
                    <div className="tool-card" style={{ backgroundColor: '#111', padding: '30px', borderRadius: '12px', border: '1px solid #333', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', gridColumn: '1 / -1' }}>
                        <h2 style={{ color: '#ef4444', marginTop: 0, borderBottom: '1px solid #333', paddingBottom: '15px', marginBottom: '20px' }}>
                            3. Audit Stratégique de Résistance
                        </h2>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                            <div>
                                {auditQuestions.map(q => (
                                    <div key={q.id} style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '6px' }}>
                                        <input
                                            type="checkbox"
                                            checked={!!auditAnswers[q.id]}
                                            onChange={() => toggleAudit(q.id)}
                                            style={{ marginRight: '15px', width: '20px', height: '20px', accentColor: '#ef4444', cursor: 'pointer' }}
                                        />
                                        <div>
                                            <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#666', display: 'block' }}>{q.cat}</span>
                                            <span style={{ color: auditAnswers[q.id] ? '#fff' : '#aaa' }}>{q.text}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{ textAlign: 'center', padding: '30px', backgroundColor: '#000', borderRadius: '12px', border: `2px solid ${auditResult.color}` }}>
                                    <div style={{ fontSize: '4rem', fontWeight: 'bold', color: auditResult.color, lineHeight: 1 }}>
                                        {auditResult.percentage}%
                                    </div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff', margin: '10px 0', textTransform: 'uppercase' }}>
                                        {auditResult.title}
                                    </div>
                                    <p style={{ color: '#ccc', fontStyle: 'italic' }}>
                                        "{auditResult.advice}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

const inputStyle = {
    width: '100%',
    padding: '8px',
    backgroundColor: '#222',
    border: '1px solid #444',
    borderRadius: '4px',
    color: '#fff',
    fontFamily: 'monospace'
};

export default NirdTools;
