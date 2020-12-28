import React, { useState, useEffect } from 'react'
import { makeStyles } from '@material-ui/core/styles';
import { EpubView } from "react-reader";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, Select, Typography } from '@material-ui/core';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import { MenuItem } from 'react-contextmenu';
// Componenets / custom exports

const { ipcRenderer } = window.require("electron")
const fs = window.require('fs')

// CSS
const useStyles = makeStyles((theme) => ({
  root : {
    marginTop: 80,
    height: '80vh',
    width: '80%',
    margin: '0 auto',
  },
  pageTraversalButtons : {
    marginRight: 10,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
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
  // States
  const [rendition, setRendition] = useState(null)
  const [bookContent, setBookContent] = useState(null)
  const [bookToLoad, setBookToLoad] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [cloc, setCLoc] = useState(null)
  const [chapters, setChapters] = useState([])
  const [selectedChapter, setSelectedChapter] = useState(null)
  const [openSCDG, setOpenSCDG] = useState(false)
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
  useEffect(function() {
    if (rendition) {
      rendition.themes.default(require('./readerStyles.js').default)
    }
  }, [rendition])
  // Get crbook
  
  useEffect(function() {
    async function getCurrentReadingBook() {
      await ipcRenderer.send('getCurrentReadingBook')
      await ipcRenderer.once('getCurrentReadingBook', async function(_event, data) {
        if(data.status==='success') {
          setBookToLoad(data.book)
          try {
            await fs.readFile(data.book.path, {encoding: 'base64'}, function(e, d){setBookContent(d);setIsLoaded(true)})
          } catch {/* Empty noti */}
        } else {/* Error noti */}
      })
    }
    getCurrentReadingBook()
    
  }, [])
  useEffect(function() {
    if (rendition) {
      async function getLocation() {
        await ipcRenderer.send('getLoc', bookToLoad.identifier)
        await ipcRenderer.once('getLoc', async function(_e, d){if(d.status==='success'){setCLoc(d.location)}})
      }
      getLocation()
    }
  }, [rendition, bookToLoad])
  // >
  const handleClickOpen = () => {setOpenSCDG(true)}
  const handleClose = () => {setOpenSCDG(false)}
  // Render
  return (
    <React.Fragment>
      {isLoaded ? 
      <div className={classes.root}>
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
        <Button className={classes.pageTraversalButtons} variant="contained" color="primary" onClick={() => {prevPage()}}><ArrowBackIosIcon/></Button>
        <Button className={classes.pageTraversalButtons} variant="contained" color="primary" onClick={() => {nextPage()}}><ArrowForwardIosIcon/></Button>
        <Typography>{}</Typography>
      </div> : null}
    </React.Fragment>
  )
}

function SCDGDialog(props) {
  const { setCLoc, openSCDG, chapters, selectedChapter, setSelectedChapter, handleClose } = props
  const classes = useStyles()
  return (
    <React.Fragment>
      <Dialog open={openSCDG} onClose={handleClose}>
        <DialogTitle>Select chapter</DialogTitle>
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
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
