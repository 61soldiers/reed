import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import './index.css';
import App from './App'
import { ThemeProvider } from '@material-ui/core/styles'
import theme from './mui_theme'

const customTitlebar = window.require('custom-electron-titlebar')
 
new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#000000'),
    drag: true,
})

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <HashRouter>
      <App />
    </HashRouter>
  </ThemeProvider>,
  document.getElementById('root')
);
