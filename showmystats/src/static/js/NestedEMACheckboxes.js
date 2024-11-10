import React, { useState } from 'react';
import {
  Checkbox,
  FormControlLabel,
  AccordionDetails,
  Typography,
  FormGroup,
  Box,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { pink } from '@mui/material/colors';
import { useHandleData } from '../../utils/HandleDataContext';

const NestedEMACheckboxes = () => {
  // Use Context API
  const { isFabEnabled, handleFabEnabled, 
    changeInISCollection, updateChangeInISCollection 
  } = useHandleData();

  const [expanded, setExpanded] = useState(false);

  const [childExpanded, setChildExpanded] = useState({
    ema5min: false,
    ema15min: false,
    ema1hour: false,
    ema4hour: false,
    ema1day: false,
  });


  const [checkboxes, setCheckboxes] = useState(changeInISCollection !== null ?
    changeInISCollection: {
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

  const commonCheckboxStyles = {
    color: pink[800],
    '&.Mui-checked': {
      color: pink[600],
    },
  };

  const labelStyle = { color: 'white', fontSize: '15px' };
  const formControlLabelStyle = { marginRight: '0' };

  const handleExpand = () => {
    setExpanded(!expanded);
    setChildExpanded({
      ema5min: false,
      ema15min: false,
      ema1hour: false,
      ema4hour: false,
      ema1day: false,
    });
  };

  const handleParentCheckboxChange = (parent) => {
    const isChecked = !checkboxes[parent];
    setCheckboxes((prev) => {
      const newCheckboxes = {
          ...prev,
          [parent]: isChecked,
          [`${parent}_9`]: isChecked,
          [`${parent}_12`]: isChecked,
          [`${parent}_50`]: isChecked,
      };
      updateChangeInISCollection(newCheckboxes);
      return newCheckboxes;
  });
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

        updateChangeInISCollection(updatedCheckboxes);

        return {
            ...updatedCheckboxes,
            [parent]: allChildrenChecked,
        };
    });
    console.log(checkboxes)
};


const handleChildExpand = (panel) => {
  setChildExpanded((prev) => ({
    ...prev,
    [panel]: !prev[panel],
  }));
};


  return (
    <>
      <Box
        onClick={handleExpand}
        alignItems="center"
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'transparent',
          zIndex: 1000,
        }}
      >
        <Tooltip title="weighted_volume_price = (weights['hightW'] + weights['lowW'] +
                                                weights['closeW'] + weights['openW']) / volumeW" arrow>
          <Typography variant="h6" style={labelStyle}>
            EMA(price + volume)
          </Typography>
        </Tooltip>
        {expanded ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: 'transparent',
          zIndex: 1000,
          marginTop: '5px',
        }}
      >
        {expanded && (
          <AccordionDetails
            style={{
              marginTop: '15px',
              position: 'absolute',
              display: 'flex',
              backgroundColor: 'transparent',
              flexDirection: 'row',
            }}
          >
            {['ema5min', 'ema15min', 'ema1hour', 'ema4hour', 'ema1day'].map((interval) => (
              <Box
                key={interval}
                sx={{
                  display: 'flex',
                  padding: '0',
                  backgroundColor: 'transparent',
                  zIndex: 1000,
                  flexDirection: 'column',
                  marginRight: '10px',
                }}
              >
                <Box display="flex" alignItems="center" flexDirection="row">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={checkboxes[interval]}
                        onChange={() => handleParentCheckboxChange(interval)}
                        sx={commonCheckboxStyles}
                        size="small"
                        disabled={interval === 'ema1day'}
                      />
                    }
                    label={<span style={labelStyle}>{interval.replace('ema', '')}</span>}
                    style={formControlLabelStyle}
                  />
                  <ExpandMoreIcon
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleChildExpand(interval)}
                  />
                </Box>

                {childExpanded[interval] && (
                  <AccordionDetails>
                    <FormGroup>
                      {[9, 12, 50].map((value) => (
                        <FormControlLabel
                          key={`${interval}_${value}`}
                          control={
                            <Checkbox
                              checked={checkboxes[`${interval}_${value}`]}
                              onChange={() => handleChildCheckboxChange(interval, `${interval}_${value}`)}
                              sx={commonCheckboxStyles}
                              size="small"
                            />
                          }
                          label={<span style={labelStyle}>{value}</span>}
                        />
                      ))}
                    </FormGroup>
                  </AccordionDetails>
                )}
              </Box>
            ))}
          </AccordionDetails>
        )}
      </Box>
    </>
  );
};

export default NestedEMACheckboxes;
