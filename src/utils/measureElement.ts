import { findNodeHandle, UIManager } from 'react-native'
import type { ElementLayout } from '../types'

/**
 * Measures the on-screen position and dimensions of a React element.
 *
 * Uses `UIManager.measureInWindow` under the hood.
 *
 * @param element - The React component instance to measure.
 * @returns A promise that resolves with the element's `{ x, y, width, height }`.
 * @throws Rejects if the element cannot be resolved to a native node.
 */
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
