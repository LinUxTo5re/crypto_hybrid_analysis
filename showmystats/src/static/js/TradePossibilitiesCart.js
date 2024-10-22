import '../../static/css/ResizablePopup.css';
import Draggable from 'react-draggable';
import React, { useState } from 'react';


const TradePossibilitiesCart = () => {

    const [size, setSize] = useState({ width: 300, height: 200 }); // Initial size

    // Handle resizing
    const onResize = (e) => {
        const newWidth = e.clientX - e.target.parentElement.getBoundingClientRect().left;
        const newHeight = e.clientY - e.target.parentElement.getBoundingClientRect().bottom;
        if (newWidth > 100 && newHeight > 100) { // Minimum size constraints
            setSize({ width: newWidth, height: newHeight });
        }
    };

    return(
        <>
         <Draggable>
                    <div
                        className="resizable-popup"
                        style={{
                            width: size.width,
                            height: size.height,
                            padding: '20px',
                            backgroundColor: 'rgba(255, 255, 255)',
                            border: '1px solid #ccc',
                            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                            position: 'absolute',
                            bottom: '6%',
                            left: '1%',
                            zIndex: 1000,
                        }}
                    >
                        <h2>your data here</h2>
                        
                        {/* Resize handle */}
                        <div className="resize-handle" onMouseDown={onResize}></div>
                    </div>
                </Draggable>
        </>
    );
};

export default TradePossibilitiesCart;