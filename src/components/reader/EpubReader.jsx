import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { EpubView } from "react-reader"
import { Button, Dialog, DialogActions, DialogContent, Divider, FormControl, InputLabel, Select, Slider, Tooltip, Typography } from '@material-ui/core'
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos'
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos'
import SettingsIcon from '@material-ui/icons/Settings';
import { MenuItem } from 'react-contextmenu'
import { useSnackbar } from 'notistack'
import { v4 as uuidv4 } from 'uuid'
import { ColorPicker } from 'material-ui-color'
// Componenets

const { ipcRenderer } = window.require("electron")
const fs = window.require('fs')

// CSS
const useStyles = makeStyles((theme) => ({
  root : {
    marginTop: 80,
    height: '75vh',
    width: '80%',
    margin: '0 auto',
  },
  settingsButtons : {
    marginRight: 10,
  },
  formControl: {
    margin: theme.spacing(1),
    width: '93%',
  },
  chapterlistItem : {
    textAlign: 'center',
    color: theme.palette.primary.main,
    backgroundColor: 'black',
    borderRadius: 4,
    padding: 10,
    transition: 'all 0.2s ease',
    '&:hover': {
      background: '#9c9c9c',
      color: 'black',
      cursor: 'pointer',
      transition: 'all 0.1s ease'
    },
  }
}));

export default function Home() {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  //// States
  const [rendition, setRendition] = useState(null)
  const [bookContent, setBookContent] = useState(null)
  const [bookToLoad, setBookToLoad] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [cloc, setCLoc] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [openSCDG, setOpenSCDG] = useState(false)
  // Reader settings states
  const [settingsDialog, setSettingsDialog] = useState(false)
  const [currentStyle, setCurrentStyle] = useState(null)
  const [minifiedSettings, setMinifiedSettings] = useState(null)
  // CSS
  const classes = useStyles()
  
  async function setLocation(loc) {
    await ipcRenderer.send('setLoc', {identifier: bookToLoad.identifier, location: loc})
  }
  // Page logic
  async function nextPage() {
    if(rendition) {
      rendition.next()
    }
  }
  function prevPage() {
    if(rendition) {
      rendition.prev()
    }
  }
  // Styling logic
  async function setReaderSettings() {
    await ipcRenderer.send('setReaderSettings', {readerStyle: currentStyle})
  }
  async function getReaderSettings() {
    await ipcRenderer.send('getReaderSettings')
    ipcRenderer.once('getReaderSettings', function(_e, d) {
      if (d.status==="success") {rendition.themes.default(d.readerSettings)}
    })
  }
  // Set style to reader
  useEffect(function() {
    if(minifiedSettings) {
      let newStyle = {
        html : {
          'backdrop-filter': 'blur(250px)',
          'color' : `${minifiedSettings.fontColor}`,
        },
        'p, a, h1, h2, h3, h4, h5, i, span, meta, body, iframe': {
          'font-size': `${minifiedSettings.fontSize}px`,
          'color' : `${minifiedSettings.fontColor}`,
        },
      }
      setCurrentStyle(newStyle)
      if (rendition) {rendition.themes.default(newStyle)}
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minifiedSettings])


  // Get crbook
  useEffect(function() {
    async function getCurrentReadingBook() {
      await ipcRenderer.send('getCurrentReadingBook')
      await ipcRenderer.once('getCurrentReadingBook', async function(_event, data) {
        let errVariant = 'error'
        let action = (key) => <Button onClick={()=>{closeSnackbar(key)}}>OK</Button>
        if(data.status==='success') {
          setBookToLoad(data.book)
          fs.access(data.book.path, fs.F_OK, async (err) => {
            if (err) {
              let key = uuidv4()
              enqueueSnackbar("Error reading file | Check book location", {
                variant: errVariant, 
                persist: true,
                key: key,
                action: action(key)
              })
              return
            }
            await fs.readFile(data.book.path, {encoding: 'base64'}, function(e, d){setBookContent(d);setIsLoaded(true)})
          })
        } else {enqueueSnackbar("You are not currently reading any book")}
      })
    }
    getCurrentReadingBook()
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(function() {
    if (rendition) {
      async function getLocation() {
        await ipcRenderer.send('getLoc', bookToLoad.identifier)
        await ipcRenderer.once('getLoc', async function(_e, d){if(d.status==='success'){setCLoc(d.location)}})
      }
      getLocation()
      getReaderSettings()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rendition, bookToLoad])


  // Chapter select dialog >
  const handleClickOpen = () => {setOpenSCDG(true)}
  const handleClose = () => {setOpenSCDG(false)}
  // Settings dialog >
  const handleClickOpenSettings = () => {setSettingsDialog(true)}
  const handleCloseSettings = () => {setSettingsDialog(false)}
  // Render
  return (
    <React.Fragment>
      {isLoaded ? 
      <div className={classes.root}>
        <SettingsDialog minifiedSettings={minifiedSettings} setMinifiedSettings={setMinifiedSettings} settingsDialog={settingsDialog} handleClickOpen={handleClickOpenSettings} handleClose={handleCloseSettings} setReaderSettings={setReaderSettings} />
        <SCDGDialog setCLoc={setCLoc} openSCDG={openSCDG} handleClose={handleClose} chapters={chapters} selectedChapter={selectedChapter} setSelectedChapter={setSelectedChapter} />
        <Typography onClick={handleClickOpen} className={classes.chapterlistItem} >Chapters</Typography>
        <EpubView
          url={bookContent}
          location={cloc}
          locationChanged={loc => {setLocation(loc)}}
          getRendition={rendition => {setRendition(rendition)}}
          epubInitOptions={{encoding: 'base64'}}
          tocChanged={(c)=>{setChapters(c)}}
        />
        <Button className={classes.settingsButtons} variant="contained" color="primary" onClick={() => {prevPage()}}><ArrowBackIosIcon/></Button>
        <Button className={classes.settingsButtons} variant="contained" color="primary" onClick={() => {nextPage()}}><ArrowForwardIosIcon/></Button>
        <Button className={classes.settingsButtons} variant="contained" color="primary" onClick={() => {handleClickOpenSettings()}}><SettingsIcon/></Button>
        
      </div> : null}
    </React.Fragment>
  )
}

// Select chapter dialog
function SCDGDialog(props) {
  const { setCLoc, openSCDG, chapters, selectedChapter, setSelectedChapter, handleClose } = props
  const classes = useStyles()
  return (
    <Dialog open={openSCDG} onClose={handleClose}>
      <Typography variant="h5" style={{padding: 25, paddingInline: 100}}>Select chapter</Typography>
      <DialogContent>
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="chap">Age</InputLabel>
          <Select
            labelId="chap"
            id="chap"
            value={selectedChapter ? selectedChapter : ""}
            onChange={(e)=>{setSelectedChapter(e.target.value)}}
          >
          {chapters.map(function(chapter, x) {
            return <MenuItem key={x} value="">
              <Typography style={{borderRadius: 0,}} className={classes.chapterlistItem} onClick={()=>{handleClose();setCLoc(chapter.href)}}>{chapter.label}</Typography>
            </MenuItem>
          })}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button color="primary" variant="contained" style={{fontWeight: 'bold'}} onClick={handleClose}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  )
}

// Settings dialog
function SettingsDialog(props) {
  const { minifiedSettings, setMinifiedSettings, settingsDialog, handleClose, setReaderSettings } = props
  // States
  // >
  function ValueLabelComponent(props) {
    const { children, open, value } = props;
  
    return (
      <Tooltip open={open} enterTouchDelay={0} placement="top" title={value}>
        {children}
      </Tooltip>
    );
  }
  // >
  async function getSettings() {
    await ipcRenderer.send('getReaderSettings')
    ipcRenderer.once('getReaderSettings', function(_e, d) {
      if (d.status==="success") {
        let m = d.readerSettings['p, a, h1, h2, h3, h4, h5, i, span, meta, body, iframe']
        let miniSetts = {
          fontSize: parseInt(m['font-size'].replace('px', '')),
          fontColor: m['color']
        }
        setMinifiedSettings(miniSetts)
      }
    })
  }
  useEffect(function() {
    getSettings()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // Render
  return (
    <Dialog open={settingsDialog} onClose={handleClose}>
      <Typography variant="h4" style={{padding: 25}}>Reader settings</Typography>
      {minifiedSettings ? 
        <DialogContent>
          <Typography>Font size</Typography>
          <Slider
            ValueLabelComponent={ValueLabelComponent}
            aria-label="font-size-thumb"
            max={30}
            min={5}
            onChange={(_e,v)=>{setMinifiedSettings({...minifiedSettings, fontSize: v})}}
            value={minifiedSettings.fontSize}
          />
          <Divider style={{marginBottom: 10,}} />
          <Typography>Font color</Typography>
          <ColorPicker value={minifiedSettings.fontColor} onChange={(e)=>{setMinifiedSettings({...minifiedSettings, fontColor: `#${e.hex}`})}} disableAlpha />
        </DialogContent> : null
      }
      <DialogActions>
        <Button color="primary" variant="contained" style={{fontWeight: 'bold'}} onClick={()=>{setReaderSettings();handleClose()}}>
          Update
        </Button>
        <Button color="primary" variant="contained" style={{fontWeight: 'bold'}} onClick={handleClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
