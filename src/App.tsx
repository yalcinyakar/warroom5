import React from 'react';
import logo from './logo.svg';
import './App.css';
import AuthComponent from './AuthComponent';

function App() {
  return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">WarRoom</h1>
          <AuthComponent />
        </header>
      </div>
  );
}

export default App;
