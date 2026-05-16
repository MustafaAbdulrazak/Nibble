import React from 'react'

// Thin wrapper around Ionicons web component.
// Uses React.createElement to safely pass `class` and avoid JSX attribute warnings.
export default function IonIcon({ name, size = '20px', className = '', style = {} }) {
  return React.createElement('ion-icon', {
    name,
    class: className,
    style: { fontSize: size, color: 'currentColor', display: 'inline-flex', ...style },
  })
}
