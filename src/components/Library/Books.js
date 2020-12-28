import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Dialog, DialogActions, DialogTitle, Divider, Typography } from '@material-ui/core'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import { Book } from 'epubjs'
import { useHistory } from 'react-router-dom'
import Dropdown from 'react-dropdown'
import './rd.css'

const fs = window.require('fs').promises
const { dialog } = window.require('electron').remote
const { ipcRenderer } = window.require("electron")

// Css
const useStyles = makeStyles((theme) => ({
  colltitle : {
    position: 'fixed',
    color: theme.palette.primary.main,
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 7,
    zIndex: 3,
  },
  bookGrid : {
    display: 'flex',
    flexDirection: 'column',
    marginTop: 110,
    '@media (max-width: 1500px)' : {
      gridTemplateColumns: 'auto auto auto auto',
    },
    '@media (max-width: 1000px)' : {
      gridTemplateColumns: 'auto auto',
    }
  },
  bookCard : {
    backdropFilter: 'black',
    padding: 10,
    borderRadius: 4,
    color: theme.palette.primary.main,
    transition: 'all 0.2s ease',
    overflow: 'hidden',
    '&:hover' : {
      transition: 'all 0.1s ease',
      backgroundColor: '#9c9c9c',
      color: 'black',
      cursor: 'pointer',
    }
  },
  addBookButton : {
    position: 'fixed',
    background: 'black',
    color: theme.palette.primary.main,
    right: 55,
    padding: 10,
    transition: 'all 0.2s ease',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    borderRadius: 4,
    '&:hover': {
      background: '#9c9c9c',
      color: 'black',
      cursor: 'pointer',
      transition: 'all 0.1s ease'
    },
  },
  title : {
    fontWeight: 'bold',
    fontSize: 14,
  },
  creator : {
    fontSize: 12,
    fontStyle: 'italic',
  },
  collContextMenu : {
    background: '#7d7d7d',
    padding: 10,
    borderRadius: '2.5px 2.5px 2.5px 2.5px',
    zIndex: 4,
  },
  collContextMenuButtons : {
    padding: 6,
    fontFamily: 'Oxygen',
    fontWeight: 450,
    fontSize: 15,
    color: 'black',
    transition: 'all 0.2s ease',
    borderRadius: '3px',
    '&:hover' : {
      backgroundColor: 'black',
      color: theme.palette.primary.main,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }
  },
  bookDivider : {
    backgroundColor: '#454545', 
    marginTop: 1, 
    marginBottom: 1
  },
  mtdialog : {
    height: 240,
    width: 340,
    textAlign: 'center',
  },
  mtdialogDropdown : {
    color: theme.palette.primary.main,
    width: '70%',
    margin: '0 auto',
    borderRadius: 5,  
  }
}))

export default function Books(props) {
  const history = useHistory()
  // Css
  const classes = useStyles()
  // States
  const [books, setBooks] = useState([])
  const { toLoadCollection, colls } = props
  // Dem funcs
  async function getBooksOfSaidColl() {
    if (!toLoadCollection) {
      await ipcRenderer.send('getAllBooks')
      await ipcRenderer.once('getAllBooks', async function(_event, data) {
        setBooks(data)
      })
    } else {
      await ipcRenderer.send('getCollBooks', toLoadCollection)
      await ipcRenderer.once('getCollBooks', async function(_event, data) {
        setBooks(data)
      })
    }
  }
  useEffect(function() {
    getBooksOfSaidColl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toLoadCollection, setBooks])
  // >
  async function fileSelectorAddBooks() {
    try {
      let { filePaths } = await dialog.showOpenDialog({properties:['openFile','multiSelections'],filters:[{ name: 'eBooks', extensions: ['epub'] }]})
      let booksToAdd = []
      for(let i=0; i<filePaths.length; i++) {
        const contents = await fs.readFile(filePaths[i], {encoding: 'base64'})
        let book = new Book(contents, {encoding: 'base64'})
        let md = await book.loaded.metadata
        booksToAdd.push({path: filePaths[i], metadata: {...md, collection: toLoadCollection}})
      }
      // Comms
      await ipcRenderer.send('addBooks', booksToAdd)
      await ipcRenderer.once('addBooks', async function(_event, data) {if(data.status==='success'){await getBooksOfSaidColl()}})
    } catch {
      // Error noti
    }
  }
  // >
  async function setCrBookAndOpen(id) {
    await ipcRenderer.send('setCurrentReadingBook', id)
    await ipcRenderer.once('setCurrentReadingBook', async function(_event, data) {
      if(data.status==='success') {
        history.push('/reader')
      } else {/* Error noti */}
    })
  }
  // Render
  return (
    <React.Fragment>
      <BookContextMenu getBooksOfSaidColl={getBooksOfSaidColl} colls={colls} />

      <div className={classes.colltitle}>
        <Typography variant="h3" > {toLoadCollection ? toLoadCollection : "All Books"} </Typography>
      </div>
      <Typography onClick={()=>{fileSelectorAddBooks()}} id="allbooks" color="primary" className={classes.addBookButton}>
        {"Add Books"}
      </Typography>
      <div className={classes.bookGrid}>
        {books.map(function(data, x) {
          return <ContextMenuTrigger key={x} id="book-cm"><BookComponent id={data.identifier} data={data} setCrBookAndOpen={setCrBookAndOpen} /></ContextMenuTrigger>
        })}
      </div>
    </React.Fragment>
  )
}

// Book card
function BookComponent({data, setCrBookAndOpen}) {
  const classes = useStyles()
  const { title, creator, identifier } = data
  // Render
  return (
    <div id={identifier} onClick={()=>{setCrBookAndOpen(identifier)}}>
      <div className={classes.bookCard} id={identifier}>
        <Typography className={classes.title} id={identifier}>
          {title}
        </Typography>
        <Typography className={classes.creator} id={identifier}>
          {creator}
        </Typography>
      </div>
      <Divider className={classes.bookDivider} />
    </div>
  )
}

//// Book card context menu
function BookContextMenu(props) {
  const { getBooksOfSaidColl, colls } = props
  const classes = useStyles()
  const [deldgOpen, setDelDgOpen] = useState(false)
  const [moveToDialog, setMoveToDialog] = useState(false)
  const [toBeEdited, setToBeEdited] = useState(null)
  return (
    <React.Fragment>
      <BookDelConfirmationDialog deldgOpen={deldgOpen} setDelDgOpen={setDelDgOpen} toBeEdited={toBeEdited} setToBeEdited={setToBeEdited} getBooksOfSaidColl={getBooksOfSaidColl} />
      <MoveToCollDialog colls={colls} moveToDialog={moveToDialog} setMoveToDialog={setMoveToDialog} toBeEdited={toBeEdited} setToBeEdited={setToBeEdited} getBooksOfSaidColl={getBooksOfSaidColl} />
      
      <ContextMenu className={classes.collContextMenu} id="book-cm">
        <MenuItem className={classes.collContextMenuButtons} onClick={(_e, d)=>{setToBeEdited(d.target.id);setMoveToDialog(true)}}>
          {"Move to"}
        </MenuItem>
        <MenuItem className={classes.collContextMenuButtons} onClick={(_e, d)=>{setToBeEdited(d.target.id);setDelDgOpen(true)}}>
          {"Delete"}
        </MenuItem>
      </ContextMenu>
    </React.Fragment>
  )
}

// Delete Collection Dialog component
function BookDelConfirmationDialog(props) {
  const { deldgOpen, setDelDgOpen, toBeEdited, setToBeEdited, getBooksOfSaidColl } = props
  // >
  function handleClose () {
    setDelDgOpen(false)
    setToBeEdited(null)
  };
  // Delete coll
  async function delBook() {
    await ipcRenderer.send("delBook", toBeEdited)
    await getBooksOfSaidColl()
  }
  return (
    <React.Fragment>
      <Dialog open={deldgOpen} onClose={handleClose}>
        <DialogTitle>Are you sure you want to delete ?</DialogTitle>
        <DialogActions style={{padding: 20}}>
          <Button onClick={()=>{delBook();setToBeEdited(null);handleClose()}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            Yes
          </Button>
          <Button onClick={()=>{setToBeEdited(null);handleClose()}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

// Delete Collection Dialog component
function MoveToCollDialog(props) {
  const classes = useStyles()
  const { colls, moveToDialog, setMoveToDialog, toBeEdited, setToBeEdited, getBooksOfSaidColl } = props
  // >
  function handleClose () {
    setMoveToDialog(false)
    setToBeEdited(null)
  };
  // Move book to said coll
  async function moveToColl(coll) {
    await ipcRenderer.send("moveBookToColl", {book: toBeEdited, to: coll})
    await getBooksOfSaidColl()
  }
  function options () {
    let arr = []; colls.forEach(coll => {arr.push({value: coll.name, label: coll.name})}); return arr
  }
  return (
    <React.Fragment>
      <Dialog open={moveToDialog} onClose={handleClose} >
        <div className={classes.mtdialog}>
          <DialogTitle>Select collection</DialogTitle>
          <Dropdown
            className={classes.mtdialogDropdown}
            options={options()} 
            onChange={(d)=>{moveToColl(d.value);setToBeEdited(null);handleClose()}} 
            value={options ? options[0] : null} 
            placeholder="Select an option" />
          <DialogActions style={{padding: 20, position: 'absolute', right: 0, bottom: 0,}}>
            <Button onClick={()=>{setToBeEdited(null);handleClose()}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
              Cancel
            </Button>
          </DialogActions>
        </div>
      </Dialog>
    </React.Fragment>
  );
}