import React, { useState, useEffect } from 'react';
import RadioGroup from '@mui/material/RadioGroup';
import { Radio, TextField } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import '../static/css/styles.css';

function Header({onCryptoValueChange}) {
    const title = "Futures Web Socket Trading (gate.io)";
    const [isMultiSelected, setIsMultiSelected] = useState(false);
    const [cryptoValue, setCryptoValue] = useState('');

     useEffect(() => {
        if (!isMultiSelected)
        {
            setCryptoValue('1');
            onCryptoValueChange('1');
        }
        else{
            setCryptoValue('2');
            onCryptoValueChange('2');
        }
       
    }, [isMultiSelected, onCryptoValueChange]);

    const handleRadioChange = (event) => {

        if (event.target.value === 'multi') {
            setIsMultiSelected(true);
        } else {
            setCryptoValue('')
            setIsMultiSelected(false);
        }
    };

    const handleInputChange = (event) => {
        let value = event.target.value;
        if (value > 4)
        {
             alert('Value cannot exceed 4, setting back to 4');
             value = '4';
        }
        setCryptoValue(value);
        onCryptoValueChange(value);
    };
    
    return (
        <div className='headerImg'>
            <h1 className='headerContainer'>
            <u>
                <b>
                    {title}
                </b>
                </u>
            </h1>
            <div className='radioContainer'>
                <RadioGroup row name='position' defaultValue='single' onChange={handleRadioChange}>
                    <FormControlLabel
                        control={<Radio />}
                        label="single"
                        labelPlacement="start"
                        value="single"
                    />
                    <FormControlLabel
                        control=
                        {<Radio 
                            disabled
                            />}
                        label="multi"
                        labelPlacement="start"
                        value="multi"
                    />
                </RadioGroup>
                {isMultiSelected && (
                <TextField
                    hiddenLabel
                    variant='standard'
                    className='textField'
                    placeholder="crypto <4"
                    color="success"
                    size="small"
                    disabled={!isMultiSelected}
                    focused={isMultiSelected}
                    value={cryptoValue}
                    onChange={handleInputChange}
                    style={{ textAlign: 'center' }}
                />
                )}
            </div>
        </div>
    );
}

export default Header;
