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

    let formattedScore = formatter ? formatter(score) : ((scoreStr: string) => {
        if (scoreStr === 'n/a') {
            return scoreStr;
        }

        let score = parseInt(scoreStr, 10);
        if (score > 1000) {
            return `${score / 1000}s`;
        } else {
            return `${score.toFixed(0)} ms`;
        }
    })(score);

    return (
        <div className="inline-block">
            <div className={`grid grid-cols-[2rem_auto]`}>
                <div className={`text-xl mr-2inline-block ${colorClass} `}>
                    {scoreValue < thresholds.good && <span>●</span>}
                    {scoreValue >= thresholds.good && scoreValue < thresholds.needsImprovement && <span>■</span>}
                    {scoreValue >= thresholds.needsImprovement && <span>▲</span>}
                </div>
                <div>
                    <div>{name}</div>
                    <div className={`text-2xl ${colorClass} `}>{formattedScore}</div>
                </div>
            </div>
        </div>
    );
};

export default Vital;