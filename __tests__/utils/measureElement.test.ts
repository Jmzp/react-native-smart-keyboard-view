import { measureElement } from '../../src/utils/measureElement'
import { UIManager } from 'react-native'

describe('measureElement', () => {
  it('rejects when element is null', async () => {
    await expect(measureElement(null)).rejects.toThrow('Cannot measure element: invalid node')
  })

  it('rejects when findNodeHandle returns null', async () => {
    const mockElement = {} as any
    await expect(measureElement(mockElement)).rejects.toThrow('Cannot measure element: invalid node')
  })

  it('resolves with element layout on valid element', async () => {
    const mockNode = 42
    const mockElement = { _nativeTag: mockNode } as any

    jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(mockNode)
    ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
      (_node: any, cb: (x: number, y: number, w: number, h: number) => void) => {
        cb(10, 20, 300, 50)
      },
    )

    const layout = await measureElement(mockElement)
    expect(layout).toEqual({ x: 10, y: 20, width: 300, height: 50 })
    expect(UIManager.measureInWindow).toHaveBeenCalledWith(mockNode, expect.any(Function))
  })

  it('passes correct coordinates from UIManager callback', async () => {
    const mockNode = 99
    jest.spyOn(require('react-native'), 'findNodeHandle').mockReturnValue(mockNode)
    ;(UIManager.measureInWindow as jest.Mock).mockImplementation(
      (_node: any, cb: (x: number, y: number, w: number, h: number) => void) => {
        cb(0, 100, 200, 40)
      },
    )

    const layout = await measureElement({} as any)
    expect(layout).toEqual({ x: 0, y: 100, width: 200, height: 40 })
  })
})
