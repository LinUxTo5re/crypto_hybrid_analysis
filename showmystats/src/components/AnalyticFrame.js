import React, { useEffect, useState } from 'react';
import { Grid, Box, Paper, Autocomplete, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import StatisticalAnalysis from './StatisticalAnalysis';
import TradePossibilities from './TradePossibilities';
import '../static/css/styles.css';
import * as vj from '../constants/variables';
import { handleAutocompleteChange, initiateDataFetching} from '../utils/analyticframeUtils';


const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

function AnalyticFrame({ cryptoValue }) {

  const cryptoValueInt = parseInt(cryptoValue);
  const [checked, setChecked] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [selectedIndicators, setSelectedIndicators] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedStrategies, setSelectedStrategies] = useState(Array.from({ length: cryptoValueInt }, () => []));
  const [selectedTf, setSelectedTf] = useState(Array.from({ length: cryptoValueInt }, () => ''));
  const [isValued, setIsValued] = useState(Array.from({ length: cryptoValueInt }, () => false));

  const setStateFunctions = {
    setSelectedMarket,
    setSelectedIndicators,
    setSelectedStrategies,
    setSelectedTf,
    setIsValued
  };

  const handleMarketInputChange = (event, index) => {
    const upperCaseValue = event.target.value.toUpperCase();
    setMarketValue(upperCaseValue);
  
    setIsValued((prevState) => {
      const newState = [...prevState];
      newState[index] = upperCaseValue.length > 0;
      return newState;
    });
  };
  

  const handleSwitchChange = (event) => {
    setChecked(event.target.checked);
    setMarketValue("");

    setIsValued((prevState) =>{
      const newState = [...prevState];
      newState[0] = false;
      return newState;
    });
  };

  const [previousCryptoData, setPreviousCryptoData] = useState([]);

  const handleApplyButtonClick = async(market, selectedTf, selectedIndicators, selectedStrategies) => {
    console.log("Apply btn clicked, starting fetching relevant crypto data");
    const result = await initiateDataFetching(market, selectedTf, selectedIndicators, selectedStrategies); 

    if (result){
      setPreviousCryptoData(result);
    }
    console.log(result);
  }

  const boxArray = Array.from({ length: cryptoValueInt }, (_, index) => index);

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#D3CFD1' }}>
      <Grid container spacing={2}>
        {boxArray.map((index) => (
          <React.Fragment key={index}>
            <Grid item xs={12} sx={{ border: '2px solid black' }}>
              <Item>
                <div className="autoComplete customPadding">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={checked}
                        onChange={handleSwitchChange}
                        inputProps={{ 'aria-label': 'controlled' }}
                        color="secondary"
                      />
                    }
                    label="custom market: "
                    labelPlacement="start"
                  />

                  {!checked ? (
                    <Autocomplete
                      disablePortal
                      id={`combo-box-markets`}
                      options={vj.tickers}
                      value={selectedMarket}
                      sx={{ width: 300, margin: '0 10px' }}
                      renderInput={(params) => (
                        <TextField {...params} label="Markets" required />
                      )}
                      onChange={(event, value) => {
                        handleAutocompleteChange('markets', value, 0, setStateFunctions);
                      }}
                    />
                  ) : (
                    <TextField
                      label="Markets"
                      value={marketValue}
                      onChange={(event) => {handleMarketInputChange(event, 0);}}
                      sx={{ width: 300, margin: '0 10px' }}
                      inputProps={{ maxLength: 6 }}
                      required
                    />
                  )}
                  <Autocomplete
                    disablePortal
                    id={`combo-box-tf-${index}`}
                    options={vj.timeFrames}
                    value={selectedTf[index]}
                    sx={{ width: 300, margin: '0 80px 0 10px' }}
                    renderInput={(params) => (
                      <TextField {...params} label="time-frame" />
                    )}
                    onChange={(event, value) =>
                      handleAutocompleteChange('tf', value, index, setStateFunctions)
                    }
                    disabled
                  />

                  <Autocomplete
                    disablePortal
                    id={`combo-box-indicator-${index}`}
                    options={vj.indicators}
                    value={selectedIndicators[index]}
                    sx={{ width: 300, margin: '0 10px' }}
                    renderInput={(params) => (
                      <TextField {...params} label="indicators" />
                    )}
                    onChange={(event, value) =>
                      handleAutocompleteChange('indicators', value, index, setStateFunctions)
                    }
                    multiple
                  />
                  <Autocomplete
                    disablePortal
                    id={`combo-box-strategy-${index}`}
                    options={vj.strategies}
                    value={selectedStrategies[index]}
                    sx={{ width: 300, margin: '0 10px' }}
                    renderInput={(params) => (
                      <TextField {...params} label="strategies" />
                    )}
                    onChange={(event, value) =>
                      handleAutocompleteChange('strategies', value, index, setStateFunctions)
                    }
                    multiple
                  />

                  <Button
                    color="secondary"
                    variant="contained"
                    disabled={!isValued[index]}
                    endIcon={<SendIcon />}
                    onClick={() => handleApplyButtonClick(selectedMarket?selectedMarket:marketValue, selectedTf, selectedIndicators, selectedStrategies)}
                  >
                    Apply
                  </Button>
                </div>
              </Item>
            </Grid>
            <Grid item xs={8}>
              <Item>
                <StatisticalAnalysis  previousCryptoData = {previousCryptoData}/>
              </Item>
            </Grid>
            <Grid item xs={4} sx={{ marginBottom: '20px' }}>
              <Item>
                <h1>
                  <TradePossibilities />
                </h1>
              </Item>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
    </Box>
  );
}

export default AnalyticFrame;
