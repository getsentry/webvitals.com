import React from 'react';

interface VitalProps {
    score: string;
    name: string;
    thresholds: {
        good: number;
        needsImprovement: number;
    };
}

const Vital: React.FC<VitalProps> = ({ name, score, thresholds }) => {
    let color = '';

    let scoreValue = parseInt(score, 10);
    if (score === 'n/a') {
    }
    else if (scoreValue < thresholds.good) {
        color = 'green';
    } else if (scoreValue < thresholds.needsImprovement) {
        color = 'yellow';
    } else {
        color = 'red';
    }

    return (
        <div>
            <p style={{ color }}>
                <div className="mr-2 inline-block">
                    {scoreValue < thresholds.good && <span style={{ color }}>●</span>}
                    {scoreValue >= thresholds.good && scoreValue < thresholds.needsImprovement && <span style={{ color }}>■</span>}
                    {scoreValue >= thresholds.needsImprovement && <span style={{ color }}>▲</span>}
                </div>
                {name}: {scoreValue}
            </p>
        </div>
    );
};

export default Vital;