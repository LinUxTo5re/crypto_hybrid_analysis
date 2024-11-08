import NestedEMACheckboxes from "./NestedEMACheckboxes";
import '../../static/css/ResizablePopup.css';
import Draggable from 'react-draggable';
import React, { useState } from 'react';

// ISCollection -> Indicatores-Strategies collection
const ISCollection =  ({type}) => {
    const [size, setSize] = useState({ width: 600, height: 200 }); // Initial size
   
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

            <Draggable >
                    <div
                        className="resizable-popup"
                        style={{
                            width: size.width,
                            height: size.height,
                            padding: '20px',
                            backgroundColor: 'transparent',
                            border: '1px solid red',
                            position: 'fixed', // Use fixed positioning to keep it centered
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)', // Center the div
                            display: 'flex', // Enable flexbox for center alignment
                            zIndex: 1000,
                            overflow: 'auto',
                        }}
                    >
                       {type === 'I' ?(
                        <NestedEMACheckboxes/>

                       ):
                       <h1>hello</h1>}

                        {/* Resize handle */}
                        <div onMouseDown={onResize}></div>
                    </div>
                </Draggable>

        </>
    );
}

export default ISCollection;