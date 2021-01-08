import './App.css';
import React from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { Route, Switch } from 'react-router-dom'
import { SnackbarProvider } from 'notistack';
import bg from './Resources/Images/rg.png'

// Components
import Home from './components/Library/Home'
import EpubReader from './components/Reader/EpubReader'
import NavBar from './components/Navbar'
import Convert from './components/Convert/Convert'
// >
const useStyles = makeStyles((theme) => ({
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
  },
  error : {
    backgroundColor: '#ff6459'
  }
}))

function App() {
  const classes = useStyles();

  return (
    <SnackbarProvider maxSnack={7} classes={{variantError: classes.error}}>
      <div className={classes.bg}></div>
      <NavBar/>
      <Switch>
        <Route exact path='/' component={Home} ></Route>
        <Route exact path='/epubreader' component={EpubReader} ></Route>
        <Route exact path='/convert' component={Convert} ></Route>
      </Switch>
    </SnackbarProvider>
  );
}

export default App;
