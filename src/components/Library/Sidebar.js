import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography, Divider, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@material-ui/core';
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu"
import '../../index.css'
const { ipcRenderer } = window.require("electron")
// Components

// CSS
const useStyles = makeStyles((theme) => ({
  root : {
    backgroundColor: 'black',
    color: theme.palette.primary.main,
    padding: 20,
    borderRadius: 7,
    minWidth: '170px',
    maxWidth: '170px',
    maxHeight: '70vh',
  },
  dividers : {
    backgroundColor: '#454545',
  },
  cblist : {
    marginTop: 1,
    maxHeight: '55vh',
    overflowY: 'auto',
  },
  cblistItem : {
    padding: 10,
    transition: 'all 0.2s ease',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    '&:hover': {
      background: '#9c9c9c',
      color: 'black',
      cursor: 'pointer',
      transition: 'all 0.1s ease'
    },
  },
  addColl : {
    marginTop: 10,
    color: 'black',
    backgroundColor: '#9c9c9c',
    textAlign: 'center',
    transition: 'all 0.2s ease',
    '&:hover' : {
      backgroundColor: 'black',
      color: theme.palette.primary.main,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    }
  },
  addCollButton : {
    '&:hover' : {
      transition: 'all 0.2s ease',
      cursor: 'pointer',
      transform: 'scale(1.15,1.15)'
    }
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
  '@global': {
    '*::-webkit-scrollbar': {
      width: '0.4em'
    },
    '*::-webkit-scrollbar-track': {
      '-webkit-box-shadow': 'inset 0 0 6px rgba(0,0,0,0.00)'
    },
    '*::-webkit-scrollbar-thumb': {
      backgroundColor: '#9c9c9c',
      borderRadius: '2px 2px 2px 2px',
    },
  }
}));



export default function SideBar(props) {
  // CSS
  const classes = useStyles()
  // States
  const [open, setOpen] = useState(false)
  const { colls, setColls, setToLoadCollection } = props
  // Maintain Colls state
  async function getColls() {
    await ipcRenderer.send('getColls')
    await ipcRenderer.once('getColls', async function (_event, data) {
      if (data.status==='success') {
        setColls(data.docs)
      } else {
        // Error noti
      }
    })
  }
  useEffect(function() {
    getColls()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setColls])
  // Dialog open
  const handleClickOpen = () => {
    setOpen(true);
  };
  // Render
  return (
    <div className={classes.root}>
      <CollContextMenu getColls={getColls} />
      <Typography variant="h3" gutterBottom> Library </Typography>
      <Divider className={classes.dividers} />
      <div className={classes.cblist}>
        <Typography onClick={()=>{setToLoadCollection(null)}} id="allbooks" color="primary" className={classes.cblistItem}>
          {"All books"}
        </Typography>
        <Divider className={classes.dividers} style={{marginBottom: 10}} />
        {colls.map(function(col, i) {
          return <ContextMenuTrigger key={i} id="col-cm"><Typography onClick={()=>{setToLoadCollection(col.name)}} key={i} id={col.name} color="primary" className={classes.cblistItem} >{col.name}</Typography></ContextMenuTrigger>
        })}
      </div>
      <div className={classes.addColl}>
        <Typography onClick={() => {handleClickOpen()}} className={classes.addCollButton} variant="h4" ><LibraryAddIcon/></Typography>
        <CreateCollectonDialog open={open} setOpen={setOpen} getColls={getColls} />
      </div>
    </div>
  )
}

// Collections context menu component
function CollContextMenu(props) {
  const { getColls } = props
  const [open1, setOpen1] = useState(false)
  const [open2, setOpen2] = useState(false)
  const [toBeEdited, setToBeEdited] = useState(null)
  const classes = useStyles()
  return (
    <React.Fragment>

      <DelConfirmationDialog open1={open1} setOpen1={setOpen1} toBeEdited={toBeEdited} setToBeEdited={setToBeEdited} getColls={getColls} />
      <RenameCollectionDialog open2={open2} setOpen2={setOpen2} toBeEdited={toBeEdited} setToBeEdited={setToBeEdited} getColls={getColls} />

      <ContextMenu className={classes.collContextMenu} id="col-cm">
        <MenuItem className={classes.collContextMenuButtons} onClick={(_e, data)=>{setToBeEdited(data.target.id);setOpen2(true)}}>
          {"Rename"}
        </MenuItem>
        <MenuItem divider />
        <MenuItem className={classes.collContextMenuButtons} onClick={(_e, data)=>{setToBeEdited(data.target.id);setOpen1(true)}}>
          {"Delete"}
        </MenuItem>
      </ContextMenu>
    </React.Fragment>
  )
}

// Create Collection Dialog component
function CreateCollectonDialog(props) {
  const [value, setValue] = useState("")
  const { open, setOpen, getColls } = props
  // Create collection
  async function createCollection() {
    await ipcRenderer.send('addColl', value)
    // reply
    await ipcRenderer.once('addColl', async function(event, data) {
      if (data.status==="success") {getColls()}
      else {
        // Error noti
      }
    })
  }
  function handleClose () {
    setOpen(false);
  };
  return (
    <React.Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create collection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            variant="filled"
            fullWidth
            value={value}
            onChange={(e)=>{setValue(e.target.value)}}
          />
        </DialogContent>
        <DialogActions style={{padding: 20}}>
          <Button onClick={()=>{createCollection();handleClose();setValue("")}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            Create
          </Button>
          <Button onClick={()=>{handleClose();setValue("")}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}


//// Collections context menu
// Rename Collection Dialog component
function RenameCollectionDialog(props) {
  const [value, setValue] = useState("")
  const { open2, setOpen2, toBeEdited, setToBeEdited, getColls } = props
  // >
  function handleClose () {
    setOpen2(false);
  };
  // Rename Collection
  async function renameColl() {
    let payload = {prev: toBeEdited, new: value}
    await ipcRenderer.send('renameColl', payload)
    await getColls()
  }
  return (
    <React.Fragment>
      <Dialog open={open2} onClose={handleClose}>
        <DialogTitle>Rename {toBeEdited}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Name"
            variant="filled"
            fullWidth
            value={value}
            onChange={(e)=>{setValue(e.target.value)}}
          />
        </DialogContent>
        <DialogActions style={{padding: 20}}>
          <Button onClick={()=>{renameColl();setToBeEdited(null);handleClose();setValue("")}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            Rename
          </Button>
          <Button onClick={()=>{setToBeEdited(null);handleClose();setValue("")}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

// Delete Collection Dialog component
function DelConfirmationDialog(props) {
  const { open1, setOpen1, toBeEdited, setToBeEdited, getColls } = props
  // >
  function handleClose () {
    setOpen1(false);
  };
  // Delete coll
  async function delColl() {
    await ipcRenderer.send("delColl", toBeEdited)
    await getColls()
  }
  return (
    <React.Fragment>
      <Dialog open={open1} onClose={handleClose}>
        <DialogTitle>Are you sure you want to delete <strong>{toBeEdited}</strong> ?</DialogTitle>
        <DialogActions style={{padding: 20}}>
          <Button onClick={()=>{delColl();handleClose();setToBeEdited(null)}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            Yes
          </Button>
          <Button onClick={()=>{handleClose();setToBeEdited(null)}} color="primary" variant="contained" style={{fontWeight: 'bold'}}>
            No
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}