// __tests__/useCurrentPath.test.ts
import { renderHook } from '@testing-library/react'
import { useCurrentPath } from '@/app/hooks/useCurrentPath'
import { usePathname, useSearchParams } from 'next/navigation'

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}))

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>
const mockUseSearchParams = useSearchParams as jest.MockedFunction<
  typeof useSearchParams
>
describe('useCurrentPath', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return pathname without search params', () => {
    mockUsePathname.mockReturnValue('/metronome/123')
    mockUseSearchParams.mockReturnValue({
      toString: () => '',
    } as any)

    const { result } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/metronome/123')
  })

  it('should return pathname with search params', () => {
    mockUsePathname.mockReturnValue('/metronome')
    mockUseSearchParams.mockReturnValue({
      toString: () => 'bpm=120&beats=4',
    } as any)

    const { result } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/metronome?bpm=120&beats=4')
  })

  it('should handle root path', () => {
    mockUsePathname.mockReturnValue('/')
    mockUseSearchParams.mockReturnValue({
      toString: () => '',
    } as any)

    const { result } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/')
  })

  it('should handle complex search params', () => {
    mockUsePathname.mockReturnValue('/search')
    mockUseSearchParams.mockReturnValue({
      toString: () => 'q=test&sort=asc&page=2',
    } as any)

    const { result } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/search?q=test&sort=asc&page=2')
  })

  it('should handle encoded search params', () => {
    mockUsePathname.mockReturnValue('/search')
    mockUseSearchParams.mockReturnValue({
      toString: () => 'q=hello%20world',
    } as any)

    const { result } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/search?q=hello%20world')
  })

  it('should update when pathname changes', () => {
    mockUsePathname.mockReturnValue('/page1')
    mockUseSearchParams.mockReturnValue({
      toString: () => '',
    } as any)

    const { result, rerender } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/page1')

    mockUsePathname.mockReturnValue('/page2')
    rerender()

    expect(result.current).toBe('/page2')
  })

  it('should update when search params change', () => {
    mockUsePathname.mockReturnValue('/search')
    mockUseSearchParams.mockReturnValue({
      toString: () => 'q=first',
    } as any)

    const { result, rerender } = renderHook(() => useCurrentPath())

    expect(result.current).toBe('/search?q=first')

    mockUseSearchParams.mockReturnValue({
      toString: () => 'q=second',
    } as any)
    rerender()

    expect(result.current).toBe('/search?q=second')
  })
})
