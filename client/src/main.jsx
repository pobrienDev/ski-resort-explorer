import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline, useMediaQuery } from '@mui/material'
import './index.css'
import App from './App.jsx'

const FONT_STACK =
  'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'

// Follow the browser/OS color scheme so MUI components (cards, typography)
// switch palettes together with the page styles.
function Root() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () =>
      createTheme({
        palette: prefersDark
          ? {
              mode: 'dark',
              primary: { main: '#7ab8e0' },
              background: { default: '#0e1721', paper: '#16222e' },
            }
          : {
              mode: 'light',
              primary: { main: '#1a5e8f' },
              background: { default: '#f6fafd', paper: '#ffffff' },
            },
        typography: { fontFamily: FONT_STACK },
        shape: { borderRadius: 10 },
      }),
    [prefersDark],
  )
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
