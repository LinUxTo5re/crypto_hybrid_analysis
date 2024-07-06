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
  