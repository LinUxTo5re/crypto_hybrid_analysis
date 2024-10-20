import axios from "axios";
import { Price_Format_GateIO_URL } from '../constants/endpoints';

export const getPriceFormatConfig = async(market)  => {
  let priceFormatConfig = {
    type: 'price',
    precision: 2, // default precision
    minMove: 1,   // default minMove
};
  const fetchPriceFormatURL = Price_Format_GateIO_URL + '?market=' + market;

  try {
    const response = await axios.get(fetchPriceFormatURL);

    function getPrecision(precisionValue) {
      return (precisionValue.toString().split('.')[1] || '').length;
    }
    priceFormatConfig.precision = getPrecision(response.data.price)
    priceFormatConfig.minMove = response.data.price;

    return priceFormatConfig;
  } catch (error) {
    console.error(`Error fetching data for ${market}:`, error);
    throw error;
  }
}