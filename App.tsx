import React from 'react';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';

// Import your store
import Route from './src/navigation/Route';

const App = () => {
  return (
    <Provider store={store}>
      <Route />
    </Provider>
  );
};

export default App;
