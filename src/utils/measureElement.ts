import { findNodeHandle, UIManager } from 'react-native'
import type { ElementLayout } from '../types'

export function measureElement(element: React.Component<Record<string, unknown>> | null): Promise<ElementLayout> {
  const node = element ? findNodeHandle(element) : null
  if (!node) {
    return Promise.reject(new Error('Cannot measure element: invalid node'))
  }

  return new Promise<ElementLayout>((resolve) => {
    UIManager.measureInWindow(
      node,
      (x: number, y: number, width: number, height: number) => {
        resolve({ x, y, width, height })
      },
    )
  })
}
