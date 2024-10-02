import axios from 'axios';
import * as endpoints from '../constants/endpoints';

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
  

  export const handleApplyButtonClick = async(market, selectedTf, selectedIndicators, selectedStrategies) => {

    console.log(market);
    if (market === ""){
      console.log("hello buddy")
    }
    console.log('Apply Button clicked');
    const formData = {
      market: market,
      indicators: selectedIndicators,
      strategies: selectedStrategies,
      tf: selectedTf,
    };

    try {
      const response = await axios.post(endpoints.Submit_Btn_URL, formData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Form data submitted successfully:', response.data);
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
  };
