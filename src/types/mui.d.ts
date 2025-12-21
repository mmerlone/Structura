import '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Theme {
    backgroundOpacity: string
  }
  interface ThemeOptions {
    backgroundOpacity?: string
  }
  // If you want it under theme.vars.backgroundOpacity
  interface ThemeVars {
    backgroundOpacity: string
  }
  // For the color schemes options (where you defined it in the theme object)
  interface ColorSystemOptions {
    backgroundOpacity?: string
  }
}

// Keep the augmentation for themeCssVarsAugmentation as well
import type {} from '@mui/material/themeCssVarsAugmentation'
