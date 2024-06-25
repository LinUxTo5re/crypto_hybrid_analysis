import React, { useState, Fragment } from 'react';
import Header from './components/Header';
import AnalyticFrame from './components/AnalyticFrame';
import './App.css';

function App() {
  const [cryptoValue, setCryptoValue] = useState('');

  const handleCryptoValueChange = (value) => {
    setCryptoValue(value);
  };

  return (
    <Fragment>
      <div style={{ marginBottom: '20px' }}>
        <Header onCryptoValueChange={handleCryptoValueChange} />
      </div>
      <div className="">
        <AnalyticFrame cryptoValue={cryptoValue} />
      </div>
    </Fragment>
  );
}

export default App;
