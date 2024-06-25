import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import '../static/css/styles.css';
import React, { useState } from 'react';
import StatisticalAnalysis from './StatisticalAnalysis';
import TradePossibilities from './TradePossibilities';

function AnalyticFrame({ cryptoValue }) {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    padding: theme.spacing(),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const top100Films = ['a', 'b', 'c'];

  const cryptoValueInt = parseInt(cryptoValue);
  const [selectedMarket, setSelectedMarket] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedIndicators, setSelectedIndicators] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedStrategies, setSelectedStrategies] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedTf, setSelectedTf] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [isValued, setIsValued] = useState(Array.from({ length: cryptoValueInt }, () => false));


   const handleCheckboxValues = (id, value, index) => {
         console.log("handleCheckboxValues started", value);
    const updateState = (setState) => {
      setState(prevState => {
        const newState = [...prevState];
        newState[index] = value;
        return newState;
      });
      console.log("handleCheckboxValues completed", value);
    };

    switch (id) {
      case "markets":
        updateState(setSelectedMarket);
          setIsValued(prevState => {
          console.log("apply btn state change started");
          const newState = [...prevState];
          newState[index] = value ? value.length > 0 : false;
          console.log("apply btn state changed: ", value);
          return newState;
        });

        break;
      case "indicators":
        updateState(setSelectedIndicators);
        break;
      case "strategies":
        updateState(setSelectedStrategies);
        break;
      case "tf":
        updateState(setSelectedTf);
        break;
      default:
        break;
    }

  };


  const handleApplyButtonClick = () => {
    console.log(" Apply Button clicked");
  };

  const boxArray = Array.from({ length: cryptoValueInt }, (_, index) => index);

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#D3CFD1'}}>
      <Grid container spacing={2} >
        {boxArray.map((index) => (
        <>
          <Grid item xs={12} key={index} sx={{border: '2px solid black'}}>
            <Item>
              <div className="autoComplete customPadding">
                 <Autocomplete
                  disablePortal
                  id={`combo-box-markets-${index}`}
                  options={top100Films}
                  value={selectedMarket[index]}
                  sx={{ width: 300, margin: '0 10px' }}
                  renderInput={(params) =>
                    <TextField
                      {...params}
                      label="markets"
                      required
                    />}
                  onChange={(event, value) =>
                   handleCheckboxValues("markets", value, index)
                   }
                />
                <Autocomplete
                  disablePortal
                  id={`combo-box-indicator-${index}`}
                  options={top100Films}
                  value={selectedIndicators[index]}
                  sx={{ width: 300, margin: '0 10px' }}
                  renderInput={(params) => (
                    <TextField
                    {...params}
                    label="indicators"
                     />
                  )}
                  onChange={(event, value) =>
                    handleCheckboxValues("indicators", value, index)
                  }
                  multiple
                />
                <Autocomplete
                  disablePortal
                  id={`combo-box-strategy-${index}`}
                  options={top100Films}
                  value={selectedStrategies[index]}
                  sx={{ width: 300, margin: '0 10px' }}
                  renderInput={(params) => (
                    <TextField {...params} label="strategies" />
                  )}
                  onChange={(event, value) =>
                    handleCheckboxValues("strategies", value, index)
                  }
                  multiple
                />
                <Autocomplete
                  disablePortal
                  id={`combo-box-tf-${index}`}
                  options={top100Films}
                  value={selectedTf[index]}
                  sx={{ width: 300, margin: '0 80px 0 10px' }}
                  renderInput={(params) => (
                    <TextField {...params} label="time-frame" />
                  )}
                  onChange={(event, value) =>
                    handleCheckboxValues("tf", value, index)
                  }
                  multiple
                />

                <Button
                  color="secondary"
                  variant="contained"
                  disabled={!isValued[index]}
                  endIcon={<SendIcon />}
                  onClick={handleApplyButtonClick}
                >
                  Apply
                </Button>
              </div>
            </Item>
          </Grid>
           <Grid item xs={8} >
              <Item>
                <StatisticalAnalysis/>
              </Item>
            </Grid>
            <Grid item xs={4} sx={{marginBottom: '20px'}}>
              <Item>
              <h1>
             <TradePossibilities/>
              </h1>
              </Item>
            </Grid>
            </>
        ))}
      </Grid>
    </Box>
  );
}

export default AnalyticFrame;
