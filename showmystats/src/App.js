import React, { useState, Fragment } from 'react';
import Header from './components/Header';
import AnalyticFrame from './components/AnalyticFrame';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [cryptoValue, setCryptoValue] = useState('');

  const handleCryptoValueChange = (value) => {
    setCryptoValue(value);
  };

  return (
    <Fragment>
      <div style={{ marginBottom: '20px', overflowX: 'hidden'}}>
        <Header onCryptoValueChange={handleCryptoValueChange} />
      </div>
      <div className="">
        <AnalyticFrame cryptoValue={cryptoValue} />
      </div>
      <div>
        <Footer style={{ color: 'black' }} />
      </div>
    </Fragment>
  );
}

export default App;
