import './App.css';
import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Route, Switch } from 'react-router-dom'
import bg from './Resources/Images/rg.png'

// Components
import Home from './components/Library/Home'
import Reader from './components/reader/Reader'
import NavBar from './components/Navbar'
const customTitlebar = window.require('custom-electron-titlebar');
 
new customTitlebar.Titlebar({
    backgroundColor: customTitlebar.Color.fromHex('#000000'),
    drag: true,
})
const useStyles = makeStyles(() => ({
  bg : {
    backgroundImage : `url(${bg})`,
    backgroundSize: 'cover',
    position: 'fixed',
    minWidth: 'cover',
    minHeight: 'cover',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    zIndex: -5,
  },
  '@global' : {
    WebkitFontSmoothing: 'antialiased'
  }
}))

function App() {
  const classes = useStyles();

  return (
    <React.Fragment>
      <div className={classes.bg}></div>
      <NavBar/>
      <React.Fragment>
        <Switch>
          <Route exact path='/' component={Home} ></Route>
          <Route exact path='/reader' component={Reader} ></Route>
        </Switch>
      </React.Fragment>
    </React.Fragment>
  );
}

export default App;
