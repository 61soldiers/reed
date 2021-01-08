import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import { useHistory } from 'react-router-dom'
// Css files
import '../index.css'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  navbar : {
    background: 'rgba(0,0,0,0)',
    boxShadow: 'none',
    marginTop: 33,
  },
  menuButton: {
    marginRight: theme.spacing(2),
    color: theme.palette.primary.main,
  },
  title: {
    flexGrow: 1,
    color: theme.palette.primary.main,
    fontFamily: 'Amatic SC',
    fontWeight: 'bold',
    letterSpacing: 5,
    cursor: 'default',
  },
  settingsButton : {
    color: theme.palette.primary.main,
    marginLeft: 15,
    padding: 8,
    transition: 'all 0.2s ease',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    borderRadius: 3,
    '&:hover': {
      background: '#9c9c9c',
      color: 'black',
      cursor: 'pointer',
      transition: 'all 0.1s ease'
    },
  }
}));

export default function ButtonAppBar() {
  const classes = useStyles()
  const history = useHistory()

  return (
    <div className={classes.root}>
      <AppBar className={classes.navbar} position="fixed">
        <Toolbar variant="dense">
          <Typography variant="h5" className={classes.title}>
            R E E D
          </Typography>
          <Typography onClick={()=>{history.push('/convert')}} id="allbooks" color="primary" className={classes.settingsButton}>
            {"Pdf to ePub"}
          </Typography>
          <Typography onClick={()=>{history.push('/')}} id="allbooks" color="primary" className={classes.settingsButton}>
            {"Library"}
          </Typography>
          <Typography onClick={()=>{history.push('/epubreader')}} id="allbooks" color="primary" className={classes.settingsButton}>
            {"Continue reading"}
          </Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
