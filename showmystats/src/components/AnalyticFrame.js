import { Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import SendIcon from '@mui/icons-material/Send';
import '../static/css/styles.css';
import React, { useState} from 'react';
import StatisticalAnalysis from './StatisticalAnalysis';
import TradePossibilities from './TradePossibilities';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

function AnalyticFrame({ cryptoValue }) {
  const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    padding: theme.spacing(),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  }));

  const timeFrames = ['5m','15m','4h','1d'];
  const tickers = ['BTC','PEPE', 'KAS','WIF','PEOPLE']
  const [checked, setChecked] = useState(false);

  const handleChange = (event) => {
    setChecked(event.target.checked);
  };
  const handleInputChange = (event) => {
    setEnteredMarket(event.target.value.toUpperCase());
  }
  const cryptoValueInt = parseInt(cryptoValue);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [selectedValue, setEnteredMarket] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedStrategies, setSelectedStrategies] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedTf, setSelectedTf] = useState('');
  const [isValued, setIsValued] = useState(Array.from({ length: cryptoValueInt }, () => false));

   const handleAutocomplete = (id, value, index) => {
    console.log(id,value,index)
    const updateState = (setState) => {
      setState(prevState => {
        const newState = [...prevState];
        newState[index] = value;
        return newState;
      });
    };

    switch (id) {
      case "markets":  
          updateState(setSelectedMarket);
          setIsValued(prevState => {
          const newState = [...prevState];
          newState[index] = value ? value.length > 0 : false;
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
              
        <FormControlLabel
          control={
          <Switch
            checked={checked}
            onChange={handleChange}
            inputProps={{ 'aria-label': 'controlled' }}
            color="secondary" />
          }
          label="custom market: "
          labelPlacement="start"
        />
      
      {!checked ? (
        <Autocomplete
          disablePortal
          id={`combo-box-markets`}
          options={tickers}
          value={selectedMarket}
          sx={{ width: 300, margin: '0 10px' }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Markets"
              required
            />
          )}
          onChange={(event, value) => {
            setSelectedMarket(value);
            handleAutocomplete('markets', value, 0);
          }}
        />
      ) : (
        <TextField
          label="Markets"
          value={selectedValue}
          onChange={handleInputChange}
          sx={{ width: 300, margin: '0 10px' }}
          required
        />
      )}
                <Autocomplete
                  disablePortal
                  id={`combo-box-tf-${index}`}
                  options={timeFrames}
                  value={selectedTf[index]}
                  sx={{ width: 300, margin: '0 80px 0 10px' }}
                  renderInput={(params) => (
                    <TextField
                    {...params}
                    label="time-frame"
                    />
                  )}
                  onChange={(event, value) =>
                    handleAutocomplete("tf", value, index)

                  }
                />

                <Autocomplete
                  disablePortal
                  id={`combo-box-indicator-${index}`}
                  options={timeFrames}
                  value={selectedIndicators[index]}
                  sx={{ width: 300, margin: '0 10px' }}
                  renderInput={(params) => (
                    <TextField
                    {...params}
                    label="indicators"
                     />
                  )}
                  onChange={(event, value) =>
                    handleAutocomplete("indicators", value, index)
                  }
                  multiple
                />
                <Autocomplete
                  disablePortal
                  id={`combo-box-strategy-${index}`}
                  options={timeFrames}
                  value={selectedStrategies[index]}
                  sx={{ width: 300, margin: '0 10px' }}
                  renderInput={(params) => (
                    <TextField {...params} label="strategies" />
                  )}
                  onChange={(event, value) =>
                    handleAutocomplete("strategies", value, index)
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
