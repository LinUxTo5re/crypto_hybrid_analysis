import React, { useState, createContext, useContext } from 'react';
import { Grid, Box, Paper, Autocomplete, TextField, Button, Switch, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import SendIcon from '@mui/icons-material/Send';
import StatisticalAnalysis from './StatisticalAnalysis';
import '../static/css/styles.css';
import * as vj from '../constants/variables';
import { handleAutocompleteChange, initiateDataFetching} from '../utils/analyticframeUtils';
import LoadingIndicator from '../static/js/LoadingIndicator';
import Fab from '@mui/material/Fab';
import TradePossibilitiesCart from '../static/js/TradePossibilitiesCart';
import Tooltip from '@mui/material/Tooltip';
import ChecklistIcon from '@mui/icons-material/Checklist';
import ConstructionIcon from '@mui/icons-material/Construction';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ISCollection from '../static/js/ISCollection';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  padding: theme.spacing(2),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

//Context API
const HandleDataContext = createContext();

function AnalyticFrame({ cryptoValue }) {

  const cryptoValueInt = parseInt(cryptoValue);
  const [checked, setChecked] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [marketValue, setMarketValue] = useState('');
  const [isValued, setIsValued] = useState(Array.from({ length: cryptoValueInt }, () => false));
  const [isAppliedBtnClicked, setIsAppliedBtnClicked] = useState(null);

  const setStateFunctions = {
    setSelectedMarket,
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

  const [changeInISCollection, setChangeInISCollection] = useState(null);
  const [previousCryptoData, setPreviousCryptoData] = useState([]);

  const handleApplyButtonClick = async(market, selectedTf, selectedIndicators, selectedStrategies) => {
    setIsAppliedBtnClicked(true);
    setIsFabEnabled(false);
    console.log("Apply btn clicked, starting fetching relevant crypto data");
    const result = await initiateDataFetching(market, selectedTf, selectedIndicators, selectedStrategies); 

    if (result){
      setPreviousCryptoData(result);
      setIsAppliedBtnClicked(false);
      setIsValued((prevState) =>{
        const newState = [...prevState];
        newState[0] = false;
        return newState;
      });
    }
  }

  const boxArray = Array.from({ length: cryptoValueInt }, (_, index) => index);
  const [checklistVisible, setchecklistVisible] = useState(false); // To toggle pop-up visibility
  const [addStrategyVisible,  setAddStrategyVisible] = useState(false); // To toggle pop-up visibility
  const [addIndicators,  setAddIndicators] = useState(false); // To toggle pop-up visibility

  //Context API
  const [isFabEnabled, setIsFabEnabled] = useState(false);
  const handleFabEnabled = () => setIsFabEnabled((prev) => !prev);

  return (
    <HandleDataContext.Provider value={{ isFabEnabled , handleFabEnabled}}>
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
                        <TextField {...params} label="Markets"
                         required
                         />
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
                  
                  <Button
                    color="secondary"
                    variant="contained"
                    disabled={!isValued[index]}
                    endIcon={<SendIcon />}
                    onClick={() => handleApplyButtonClick(selectedMarket?selectedMarket:marketValue)}
                  >
                    Fetch
                  </Button>

                  {checklistVisible && (
                <TradePossibilitiesCart />
                )}

                {addIndicators && (
                  <ISCollection type={'I'} ISchange = {setChangeInISCollection}/>
                )}

                {addStrategyVisible && (
                  <ISCollection type={'S'} ISchange = {setChangeInISCollection}/>
                )}

                    <>
                    <Tooltip title="Indicators" arrow>
    <Fab
        color="secondary" 
        aria-label="add" 
        style={{
            position: 'relative',
            margin: 'auto',
        }}
        onClick={() => setAddIndicators(!addIndicators)}
        disabled = { !isFabEnabled }
    >
        <ConstructionIcon />
    </Fab>
</Tooltip>

<Tooltip title="Add Strategy">
                     <Fab 
                         color="secondary" 
                         aria-label="add" 
                         style={{
                             position: 'relative',
                             margin: 'auto',
                         }}
                         disabled
                         onClick={() => setAddStrategyVisible(!addStrategyVisible)}
                     >
                         <AddBoxIcon />
                     </Fab>
                     </Tooltip>


<Tooltip title="Trade Possibilities">
                     <Fab 
                         color="secondary" 
                         aria-label="add" 
                         style={{
                             position: 'relative',
                             margin: 'auto',
                         }}
                         onClick={() => setchecklistVisible(!checklistVisible)}
                         disabled= { !isFabEnabled }
                     >
                         <ChecklistIcon />
                     </Fab>
                     </Tooltip>
                    </>
                    
                  
                </div>
              </Item>
            </Grid>
          
            <Grid container justifyContent="center" alignItems="center" >

              {isAppliedBtnClicked && (
                <LoadingIndicator msg = {"Fetching Previous Crypto Data ...."}/>
              )}
              
           </Grid>
           
           <Grid item xs={12} >
            <StatisticalAnalysis previousCryptoData={previousCryptoData}
            changeInISCollection = {changeInISCollection}/>
          </Grid>

          </React.Fragment>
        ))}
      </Grid>
    </Box>
    </HandleDataContext.Provider>
  );
}

export {HandleDataContext};
export default AnalyticFrame;
