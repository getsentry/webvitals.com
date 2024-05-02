import React from 'react';

interface VitalProps {
    score: string;
    name: string;
    thresholds: {
        good: number;
        needsImprovement: number;
    };
    formatter?: Function;
}

const Vital: React.FC<VitalProps> = ({ name, score, thresholds, formatter }) => {
    let colorClass = '';

    let scoreValue = Number(score);
    if (score === 'n/a') {
    }
    else if (scoreValue < thresholds.good) {
        colorClass = 'text-green-500';
    } else if (scoreValue < thresholds.needsImprovement) {
        colorClass = 'text-yellow-500';
    } else {
        colorClass = 'text-red-500';
    }

    const formattedScore = formatter ? formatter(score) : parseInt(score, 10);
    return (
        <div>
            <p className={colorClass}>
                <div className="mr-2 inline-block">
                    {scoreValue < thresholds.good && <span>●</span>}
                    {scoreValue >= thresholds.good && scoreValue < thresholds.needsImprovement && <span>■</span>}
                    {scoreValue >= thresholds.needsImprovement && <span>▲</span>}
                </div>
                {name}: {formattedScore}
            </p>
        </div>
    );
};

export default Vital;