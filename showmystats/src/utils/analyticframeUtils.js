import axios from 'axios';
import * as endpoints from '../constants/endpoints';
import { getPriceFormatConfig } from './statisticalAnalysisUtils';

export const handleAutocompleteChange = (id, value, index, setStateFunctions) => {
    const { setSelectedMarket, setIsValued } = setStateFunctions;
  
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
      default:
        break;
    }
  };
  
//   On Apply btn click, this function would be called.
//   function would trigger websockets for live bar graph with most traded area and
//   trade posibilites

  export const initiateDataFetching = async(market, selectedTf, selectedIndicators, selectedStrategies) => {
    const formData = {
      market: market,
      indicators: selectedIndicators,
      strategies: selectedStrategies,
      tf: selectedTf,
    };

    try {
      const priceFormatConfig  = await getPriceFormatConfig(market); // fetch price format
      // market-> string ('BTC')
      // tf -> string ('4h')
      // isml -> bool (true)
      const isml = false;
      
      // Wait for fetchHistDataForTimeFrames to finish
    const response = await fetchHistDataForTimeFrames(market, isml);
    console.log('Fetched all historical data for all defined timeframes'); // This will log all the fetched data for each timeframe

      const previous_data = {};

        previous_data.priceFormatConfig = priceFormatConfig;
        previous_data.formData = formData;
            
        timeIntervals.forEach(interval => {
          previous_data[interval] = {
            EMA_9: response[interval].slice(-50).map(item => item['EMA_9']),
            EMA_12: response[interval].slice(-50).map(item => item['EMA_12']),
            EMA_50: response[interval].slice(-50).map(item => item['EMA_50']),
            EMA_timeStamp: response[interval].slice(-50).map(item => item['time']),
          };
        });
      
        previous_data.Last_UpdateTm = response['EMA_5m'][response['EMA_5m'].length - 1]['time'];   

      console.log('Form data submitted successfully');
      return previous_data;
    } catch (error) {
      console.error('Error submitting form data', error);
      return false;
    }
  };

 
  const timeFrameForIndicator = ['5m', '15m', '1h', '4h', '1d'];
  const timeIntervals = ['EMA_5m', 'EMA_15m', 'EMA_1h', 'EMA_4h', 'EMA_1d'];
  
  const fetchHistDataForTimeFrames = async (market, isml) => {
    const fetchPromises = timeFrameForIndicator.map(async (timeFrame, index) => {
      const Fetch_HistData_URL = `${endpoints.Fetch_HistData_URL}?market=${market}&tf=${timeFrame}&isml=${isml}`;
  
      try {
        const response = await axios.get(Fetch_HistData_URL, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        return { [timeIntervals[index]]: response.data };
      } catch (error) {
        console.error(`Error fetching data for ${timeFrame}:`, error);
        return { [timeIntervals[index]]: null }; // Store null or handle the error as needed
      }
    });
  
    // Wait for all promises to resolve
    const resultsArray = await Promise.all(fetchPromises);
  
    // Combine all results into a single object
    return resultsArray.reduce((acc, curr) => ({ ...acc, ...curr }), {});
  };