import React, { useEffect, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useSnackbar } from 'notistack'
import CircularProgress from '@material-ui/core/CircularProgress'
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@material-ui/core'
import MuiAlert from '@material-ui/lab/Alert'
import { useHistory } from 'react-router-dom'

const { ipcRenderer } = window.require("electron")
const { dialog } = window.require('electron').remote
const shell = window.require("electron").shell
// Css
const useStyles = makeStyles((theme) => ({
  convertEbookButtonInner : {
    position: 'absolute',
    background: 'black',
    color: theme.palette.primary.main,
    fontWeight: 'bold',
    padding: 30, paddingRight: 40, paddingLeft: 40,
    transition: 'all 0.2s ease',
    borderRadius: 8,
    left: '50%',
    top: '50%',
    WebkitTransform: 'translate(-50%,-50%)',
    '&:hover': {
      WebkitBoxShadow: '3px 3px 45px black',
      background: '#9c9c9c',
      color: 'black',
      cursor: 'pointer',
      transition: 'all 0.1s ease'
    },
  },
  convertEbookButtonLoad : {
    position: 'absolute',
    background: 'black',
    padding: 30, paddingRight: 40, paddingLeft: 40,
    borderRadius: 8,
    left: '50%',
    top: '50%',
    WebkitTransform: 'translate(-50%,-50%)',
  }
}))
// >
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}
// >
export default function Convert () {
  const { enqueueSnackbar } = useSnackbar()
  const classes = useStyles()
  // States
  const [isCalibreConvertExist, setIsCalibreConvertExist] = useState(true)
  const [openInitCompDialog, setOpenInitCompDialog] = useState(false)
  const [openConvFinishedDialog, setOpenConvFinishedDialog] = useState(false)
  const [isConvDone, setIsConvDone] = useState(true)
  // >
  function handleClickOpenInitCompDialog() {setOpenInitCompDialog(true)}
  // Set state of 'isCalibreConvertExist'
  async function isCCexist() {
    await ipcRenderer.send('isCalibreConvertExist')
    await ipcRenderer.once('isCalibreConvertExist', function(_e, d) {
      setIsCalibreConvertExist(d.isExist)
    })
  }
  useEffect(function() {
    isCCexist()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  })
  useEffect(function() {
    if (!isCalibreConvertExist) {handleClickOpenInitCompDialog()}
  }, [isCalibreConvertExist])
  // Convert onclick
  async function convertOnclick() {
    try {
      isCCexist()
      if (isCalibreConvertExist) {
        let { filePaths } = await dialog.showOpenDialog({properties:['openFile'],filters:[{ name: 'PDF', extensions: ['pdf'] }]})
        if (!filePaths[0]) {return} else {setIsConvDone(false)}
        await ipcRenderer.send('convertPdfToEpub', {path: filePaths[0]})
        await ipcRenderer.once('convertPdfToEpub', function(_e, d) {
          if(d.status==="success") {
            setIsConvDone(true)
            // Show book converted success dialog
            setOpenConvFinishedDialog(true)
          } else {enqueueSnackbar("Something went wrong during conversion!", {variant: 'error'});setIsConvDone(true);console.log(d)}
        })

      } else {handleClickOpenInitCompDialog()}
    } catch {enqueueSnackbar("Something went wrong!", {variant: 'error'})}
  }
  // Render
  return (
    <React.Fragment>
      <ConvFinished openConvFinishedDialog={openConvFinishedDialog} setOpenConvFinishedDialog={setOpenConvFinishedDialog} />
      <InitCompDialog openInitCompDialog={openInitCompDialog} setOpenInitCompDialog={setOpenInitCompDialog} />
      <div className={classes.convertEbookButtonOuter}>
        <div onClick={()=>{convertOnclick()}} id="allbooks" color="primary">
          {isConvDone ? 
            <Typography className={classes.convertEbookButtonInner}>CONVERT PDF TO EPUB</Typography> 
            : <div className={classes.convertEbookButtonLoad}><CircularProgress /></div>}
        </div>
      </div>
    </React.Fragment>
  )
}

// Display this dialog if calibre doesn't exist
function InitCompDialog({openInitCompDialog, setOpenInitCompDialog}) {
  const history = useHistory()
  function handleClose() {setOpenInitCompDialog(false);history.push('/')}
  // >
  async function openLinkWithDefaultBrowser(e) {
    e.preventDefault()
    await shell.openExternal('https://calibre-ebook.com/download')
  }
  // Render
  return (
    <div>
      <Dialog
        open={openInitCompDialog}
        onClose={handleClose}
        aria-labelledby="InitCompDialog-title"
        aria-describedby="InitCompDialog-description"
      >
        <DialogTitle id="InitCompDialog-title">{"CALIBRE NOT FOUND!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This conversion feature needs calibre app to convert pdf files to epub.
          </DialogContentText>
          <Button color="primary" variant="contained" style={{fontWeight: 'bold'}} onClick={(e) => {openLinkWithDefaultBrowser(e)}} >Download Calibre</Button>
          <DialogContentText id="alert-dialog-description">
            And even then if its still not working, make sure you add the calibre app's root path environment variable.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="contained" style={{fontWeight: 'bold'}} onClick={()=>{handleClose();history.push('/')}}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

// Display this dialog when conversion is finished
function ConvFinished({openConvFinishedDialog, setOpenConvFinishedDialog}) {
  function handleClose() {setOpenConvFinishedDialog(false)}
  // Render
  return (
    <div>
      <Dialog
        open={openConvFinishedDialog}
        onClose={handleClose}
        aria-labelledby="InitCompDialog-title"
        aria-describedby="InitCompDialog-description"
      >
        <DialogTitle id="InitCompDialog-title">{"Conversion complete!"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            The converted epub file can be found in the directory of your pdf file.
          </DialogContentText>
          <Alert severity="warning">
            Some converted epub files may not be viewable as text but images. 
            Reed recommends you to buy/get the epub book directly without converting.
            In the next update there will be another option to convert pdf file to epub ensuring text, but will be a bit dirty and contain no images.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button color="primary" variant="contained" style={{fontWeight: 'bold'}} onClick={()=>{handleClose()}}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}