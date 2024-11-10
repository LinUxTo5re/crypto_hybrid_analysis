import React, { createContext, useContext, useState } from 'react';

// Create context
const HandleDataContext = createContext();

// Create provider component
export const HandleDataProvider = ({ children }) => {
    const [isFabEnabled, setIsFabEnabled] = useState(false);
    const [changeInISCollection, setChangeInISCollection] = useState(null);

    // Toggle isFabEnabled
    const handleFabEnabled = (val) => setIsFabEnabled(val);

    // Update changeInISCollection
    const updateChangeInISCollection = (newValue) => setChangeInISCollection(newValue);

    return (
        <HandleDataContext.Provider value={{ 
            isFabEnabled, 
            handleFabEnabled, 
            changeInISCollection, 
            updateChangeInISCollection 
        }}>
            {children}
        </HandleDataContext.Provider>
    );
};

// Custom hook for using context
export const useHandleData = () => useContext(HandleDataContext);
