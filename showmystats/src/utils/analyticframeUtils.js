import axios from 'axios';
import * as endpoints from '../constants/endpoints';
import  cccaggAppendIndicator from './cccaggAppendIndicatorUtils';
import { fetchLiveTrades } from './fetchLiveUtils';

export const handleAutocompleteChange = (id, value, index, setStateFunctions) => {
    const { setSelectedMarket, setSelectedIndicators, setSelectedStrategies, setSelectedTf, setIsValued } = setStateFunctions;
  
    const updateState = (setState) => {
      setState((prevState) => {
        const newState = [...prevState];
        newState[index] = value;
        return newState;
      });
    };
  
    switch (id) {
      case 'markets':
        setSelectedMarket(value);
        setIsValued((prevState) => {
          const newState = [...prevState];
          newState[index] = value ? value.length > 0 : false;
          return newState;
        });
        break;
      case 'indicators':
        updateState(setSelectedIndicators);
        break;
      case 'strategies':
        updateState(setSelectedStrategies);
        break;
      case 'tf':
        updateState(setSelectedTf);
        break;
      default:
        break;
    }
  };
  
//   On Apply btn click, this function would be called.
//   function would trigger websockets for live bar graph with most traded area and
//   trade posibilites

  export const handleApplyButtonClick = async(market, selectedTf, selectedIndicators, selectedStrategies) => {
    const formData = {
      market: market,
      indicators: selectedIndicators,
      strategies: selectedStrategies,
      tf: selectedTf,
    };

    try {
      // const response = await axios.post(endpoints.Submit_Btn_URL, formData, {
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      // });

      // market-> string ('BTC')
      // tf -> string ('4h')
      // isml -> bool (true)

      let isml = false; // default machine prdiction set to false, modify later
      selectedTf = '15m' //default TF, modify this later for multiple TF

      const Fetch_HistData_URL = endpoints.Fetch_HistData_URL + '?market=' + market + '&tf=' + selectedTf + '&isml=' + isml;

      const response = await axios.get(Fetch_HistData_URL, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const previous_data = {};

      if (Array.isArray(response.data)){ // fetching last record
        previous_data.EMA_5m = [
        response.data[response.data.length-1]['EMA_12'],
        response.data[response.data.length-1]['EMA_50'],
        response.data[response.data.length-1]['EMA_9']];

        previous_data.Last_UpdateTm = response.data[response.data.length - 1]['time'];
      }
      
    

      console.log('Form data submitted successfully');
    } catch (error) {
      console.error('Error submitting form data', error);
    }
  };

 