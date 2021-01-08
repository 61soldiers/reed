import { createMuiTheme } from '@material-ui/core/styles'

const theme = createMuiTheme({
  typography : {
    fontFamily: 'Oxygen'
  },
  palette : {
    primary: {
      main: '#c2c2c2'
    },
    secondary: {
      main: '#9c9c9c'
    },
    background: {
      paper: "#9c9c9c",
    },
    success: {
      main: '#3f8a53',
    },
    error : {
      main: '#ff6459'
    }

  },
})
export default theme