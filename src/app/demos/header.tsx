
import React from 'react';

export const Header: React.FC<{ children: React.ReactNode }> = (props) => { // Add the 'props' parameter
    const { children } = props; // Destructure the 'title' prop
    return (
        <h2 className="text-2xl font-semibold leading-none tracking-tight mb-4 border-b border-black pb-2">
            {children}
        </h2>
    );
};
