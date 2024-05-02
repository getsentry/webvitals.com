"use client";

function Vital({ score }: { score: number }) {
    return (
        <div className="inline-block">
            <div className="text-xl text-center p-4 font-bold">
                {score}s
            </div>
            <div className="text-black text-center justify-center text-sm">
                <div className="p-2 w-48 inline-block bg-green-500 relative">
                    {/*
                    <div className="absolute -bottom-4 right-0 h-4 border"></div>
                    <div className="absolute -bottom-8 -right-2 h-4">1.5s</div>
    */}
                </div>
                <div className="p-2 w-24 inline-block bg-yellow-400">
                </div>
                <div className="p-2 w-12 inline-block bg-red-500">
                </div>
            </div>
        </div>
    );
}

export default function ComponentsIndex() {


    return (
        <Vital score={2.7} />
    );
}
