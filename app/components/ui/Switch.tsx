import React from 'react'
import { clsx } from 'clsx'

interface SwitchProps {
  checked: boolean
  onChange?: (checked: boolean) => void
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function Switch({ checked, onChange, size = 'sm', disabled = false }: SwitchProps) {
  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={clsx(
        'relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500/20',
        {
          'bg-green-500': checked && !disabled,
          'bg-zinc-600': !checked && !disabled,
          'bg-zinc-700 cursor-not-allowed': disabled,
          'h-4 w-7': size === 'sm',
          'h-5 w-9': size === 'md'
        }
      )}
    >
      <span
        className={clsx(
          'pointer-events-none inline-block transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          {
            'h-3 w-3': size === 'sm',
            'h-4 w-4': size === 'md',
            'translate-x-3': checked && size === 'sm',
            'translate-x-4': checked && size === 'md',
            'translate-x-0': !checked
          }
        )}
      />
    </button>
  )
}