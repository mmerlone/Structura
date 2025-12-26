import type React from 'react'

export enum ComponentSizeEnum {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}
export type ComponentSize = `${ComponentSizeEnum}`

export enum ComponentVariantsEnum {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}
export type ComponentVariant = `${ComponentVariantsEnum}`

export type LabelledToggleOption<T extends string | number> = {
  label: React.ReactNode
  value: T
  disabled?: boolean
  ariaLabel?: string
}
