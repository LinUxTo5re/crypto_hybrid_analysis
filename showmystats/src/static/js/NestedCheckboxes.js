import React, { useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  AccordionDetails,
  Typography,
  FormGroup,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const NestedCheckboxes = () => {
  const [expanded, setExpanded] = useState(false);
  const [childExpanded, setChildExpanded] = useState({
    ema5min: false,
    ema15min: false,
    ema1hour: false,
    ema4hour: false,
    ema1day: false,
  });
  const [checkboxes, setCheckboxes] = useState({
    ema5min: false,
    ema5min_9: false,
    ema5min_12: false,
    ema5min_50: false,
    ema15min: false,
    ema15min_9: false,
    ema15min_12: false,
    ema15min_50: false,
    ema1hour: false,
    ema1hour_9: false,
    ema1hour_12: false,
    ema1hour_50: false,
    ema4hour: false,
    ema4hour_9: false,
    ema4hour_12: false,
    ema4hour_50: false,
    ema1day: false,
    ema1day_9: false,
    ema1day_12: false,
    ema1day_50: false,
  });

  const handleExpand = () => {
    setExpanded(!expanded);
    setChildExpanded({
        ema5min: false,
    ema15min: false,
    ema1hour: false,
    ema4hour: false,
    ema1day: false,
    })
  };

  const handleParentCheckboxChange = (parent) => {
    const isChecked = !checkboxes[parent];
    setCheckboxes((prev) => ({
      ...prev,
      [parent]: isChecked,
      [`${parent}_9`]: isChecked,
      [`${parent}_12`]: isChecked,
      [`${parent}_50`]: isChecked,
    }));
  };

  const handleChildCheckboxChange = (parent, child) => {
    const isChecked = !checkboxes[child];
    setCheckboxes((prev) => {
      const updatedCheckboxes = {
        ...prev,
        [child]: isChecked,
      };

      const children = [`${parent}_9`, `${parent}_12`, `${parent}_50`];
      const allChildrenChecked = children.every((childKey) => updatedCheckboxes[childKey]);

      return {
        ...updatedCheckboxes,
        [parent]: allChildrenChecked,
      };
    });
  };

  const handleChildExpand = (panel) => {
    setChildExpanded((prev) => ({
      ...prev,
      [panel]: !prev[panel],
    }));
  };

  return (
    <>
     <Box onClick={handleExpand} alignItems="center"
  sx={{
    position: 'absolute',
    display: 'flex',        // Align horizontally
    flexDirection: 'row',   // Ensure boxes are in a row
    backgroundColor: 'transparent',
    zIndex: 1000,
}}
>
  <Typography variant="h6" style={{ 
      color:'white',
      boxShadow: 'none',
      fontSize: '15px' 
  }}>
      EMA
  </Typography>
  {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
</Box>

<Box 
          sx={{
            position: 'absolute',
            display: 'flex',        // Align horizontally
            flexDirection:'row',
            backgroundColor: 'transparent',
            zIndex: 1000,
            marginTop: '5px',
        }}
        >
{expanded && (
        <AccordionDetails style={{
            marginTop: '15px',
            position:'absolute',
            display:'flex',
            backgroundColor: 'transparent',
            flexDirection:'row',
            }}>
         
            {/* Child Checkbox EMA 5min */}
            <Box
  sx={{
    display: 'flex',
    padding: '0',
    backgroundColor: 'transparent',
    zIndex: 1000,
    flexDirection: 'column', // Align vertically
    marginRight: '10px'
  }}>
  <Box display="flex" alignItems="center" flexDirection='row'>
    <FormControlLabel
      control={<Checkbox checked={checkboxes.ema5min} onChange={() => handleParentCheckboxChange('ema5min')} />}
      label={<span style={{ color: 'white', fontSize: '15px' }}>5M</span>} // Adjust margin here
      style={{
        marginRight:'0'
      }}
    />
    <ExpandMoreIcon style={{ cursor: 'pointer' }} onClick={() => handleChildExpand('ema5min')} />
  </Box>

  {childExpanded.ema5min && (
    <AccordionDetails>
      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={checkboxes.ema5min_9} onChange={() => handleChildCheckboxChange('ema5min', 'ema5min_9')} />}
          label={<span style={{ color: 'white', fontSize: '15px' }}>9</span>}
        />
        <FormControlLabel
          control={<Checkbox checked={checkboxes.ema5min_12} onChange={() => handleChildCheckboxChange('ema5min', 'ema5min_12')} />}
          label={<span style={{ color: 'white', fontSize: '15px' }}>12</span>}
        />
        <FormControlLabel
          control={<Checkbox checked={checkboxes.ema5min_50} onChange={() => handleChildCheckboxChange('ema5min', 'ema5min_50')} />}
          label={<span style={{ color: 'white', fontSize: '15px' }}>50</span>}
        />
      </FormGroup>
    </AccordionDetails>
  )}
</Box>

            {/* Repeat for each child checkbox section with consistent names */}
            <Box  sx={{
                display: 'flex',   
                padding: '0',
                backgroundColor: 'transparent',
                zIndex: 1000,
                flexDirection: 'column',
                marginRight: '10px',
            }}>

<Box display="flex" alignItems="center" flexDirection='row'>

              <FormControlLabel
                control={<Checkbox checked={checkboxes.ema15min} onChange={() => handleParentCheckboxChange('ema15min')} />}
                label={<span style={{ color: 'white', fontSize: '15px'  }}>15M</span>}
                style={{marginRight: '0'}}
              />
              <ExpandMoreIcon style={{ cursor: 'pointer' }} onClick={() => handleChildExpand('ema15min')} />

              </Box>
              {childExpanded.ema15min && (
                <AccordionDetails>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema15min_9} onChange={() => handleChildCheckboxChange('ema15min', 'ema15min_9')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>9</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema15min_12} onChange={() => handleChildCheckboxChange('ema15min', 'ema15min_12')} />}
                      label={<span style={{ color: 'white', fontSize: '15px'  }}>12</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema15min_50} onChange={() => handleChildCheckboxChange('ema15min', 'ema15min_50')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>50</span>}
                    />
                  </FormGroup>
                </AccordionDetails>
              )}
            </Box>

            {/* Child Checkbox EMA 1 Hour */}
            <Box  sx={{
                display: 'flex',     
                padding: '0',
                backgroundColor: 'transparent',
                zIndex: 1000,
                flexDirection: 'column',
                marginRight: '10px'
            }}>

<Box display="flex" alignItems="center">

              <FormControlLabel
                control={<Checkbox checked={checkboxes.ema1hour} onChange={() => handleParentCheckboxChange('ema1hour')} />}
                label={<span style={{ color: 'white', fontSize: '15px'  }}>1H</span>}
                style={{marginRight: '0'}}
              />
              <ExpandMoreIcon style={{ cursor: 'pointer' }} onClick={() => handleChildExpand('ema1hour')} />

              </Box>
              {childExpanded.ema1hour && (
                <AccordionDetails>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema1hour_9} onChange={() => handleChildCheckboxChange('ema1hour', 'ema1hour_9')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>9</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema1hour_12} onChange={() => handleChildCheckboxChange('ema1hour', 'ema1hour_12')} />}
                      label={<span style={{ color: 'white', fontSize: '15px'  }}>12</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema1hour_50} onChange={() => handleChildCheckboxChange('ema1hour', 'ema1hour_50')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>50</span>}
                    />
                  </FormGroup>
                </AccordionDetails>
              )}
            </Box>

            {/* Child Checkbox EMA 4 Hour */}
            <Box  sx={{
                display: 'flex',     
                padding: '0',
                backgroundColor: 'transparent',
                zIndex: 1000,
                flexDirection: 'column',
                marginRight: '10px',
            }}>
                                            <Box display="flex" alignItems="center">

              <FormControlLabel
                control={<Checkbox checked={checkboxes.ema4hour} onChange={() => handleParentCheckboxChange('ema4hour')} />}
                label={<span style={{ color: 'white', fontSize: '15px'  }}>4H</span>}
                style={{marginRight: '0'}}
              />
                            <ExpandMoreIcon style={{ cursor: 'pointer' }} onClick={() => handleChildExpand('ema4hour')} />

              </Box>
              {childExpanded.ema4hour && (
                <AccordionDetails>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema4hour_9} onChange={() => handleChildCheckboxChange('ema4hour', 'ema4hour_9')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>9</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema4hour_12} onChange={() => handleChildCheckboxChange('ema4hour', 'ema4hour_12')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>12</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema4hour_50} onChange={() => handleChildCheckboxChange('ema4hour', 'ema4hour_50')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>50</span>}
                    />
                  </FormGroup>
                </AccordionDetails>
              )}
            </Box>

            {/* Child Checkbox EMA 1 Day */}
            <Box  sx={{
                display: 'flex',  
                padding: '0',
                backgroundColor: 'transparent',
                zIndex: 1000,
                flexDirection: 'column',
                marginRight: '10px',
            }}>
              <Box display="flex" alignItems="center">

              <FormControlLabel
                control={<Checkbox checked={checkboxes.ema1day} onChange={() => handleParentCheckboxChange('ema1day')} />}
                label={<span style={{ color: 'white' , fontSize: '15px' }}>1D</span>}
                style={{marginRight: '0'}}
              />
                            <ExpandMoreIcon style={{ cursor: 'pointer' }} onClick={() => handleChildExpand('ema1day')} />

              </Box>
              {childExpanded.ema1day && (
                <AccordionDetails>
                  <FormGroup>
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema1day_9} onChange={() => handleChildCheckboxChange('ema1day', 'ema1day_9')} />}
                      label={<span style={{ color: 'white' , fontSize: '15px' }}>9</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema1day_12} onChange={() => handleChildCheckboxChange('ema1day', 'ema1day_12')} />}
                      label={<span style={{ color: 'white', fontSize: '15px'  }}>12</span>}
                    />
                    <FormControlLabel
                      control={<Checkbox checked={checkboxes.ema1day_50} onChange={() => handleChildCheckboxChange('ema1day', 'ema1day_50')} />}
                      label={<span style={{ color: 'white', fontSize: '15px' }}>50</span>}
                    />
                  </FormGroup>
                </AccordionDetails>
              )}
            </Box>
        </AccordionDetails>
      )}
          </Box>

</>
  );
};

export default NestedCheckboxes;
