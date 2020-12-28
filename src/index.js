import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.css';
import App from './App'
import { ThemeProvider } from '@material-ui/core/styles'
import theme from './mui_theme'

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <HashRouter>
      <App />
    </HashRouter>
  </ThemeProvider>,
  document.getElementById('root')
);
