import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles';

// Components
import Sidebar from './Sidebar'
import Books from './Books'
// CSS
const useStyles = makeStyles((theme) => ({
  sideBar : {
    position: 'fixed',
    left: 20,
    marginTop: 55,
  },
  bookList : {
    position: 'fixed',
    borderRadius: 7,
    marginLeft: 350,
    marginTop: 55,
    padding: 20,
    border: '1px solid',
    borderRight: 'none',
    width: '100%',
    height: '100%',
    overflowY: 'auto',
    overflowX: 'auto',
  }
}));


export default function Home() {
  // CSS
  const classes = useStyles()
  // States
  const [toLoadCollection, setToLoadCollection] = useState(null)
  const [colls, setColls] = useState([])

  // Render
  return (
    <React.Fragment>
      <div className={classes.sideBar}>
        <Sidebar setToLoadCollection={setToLoadCollection} colls={colls} setColls={setColls} />
      </div>
      <div className={classes.bookList}>
        <Books toLoadCollection={toLoadCollection} colls={colls} />
      </div>

    </React.Fragment>
  )
}
