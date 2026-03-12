import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { nextTick } from 'vue'

describe('useBreakpoint composable', () => {
  const originalInnerWidth = window.innerWidth

  function setWindowWidth(width: number) {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    })
    window.dispatchEvent(new Event('resize'))
  }

  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })
  })

  it('should detect mobile when width < 768px', async () => {
    setWindowWidth(500)
    const { useBreakpoint } = await import('../../src/composables/useBreakpoint')
    const { isMobile, isTablet, isDesktop } = useBreakpoint()

    await nextTick()
    expect(isMobile.value).toBe(true)
    expect(isTablet.value).toBe(false)
    expect(isDesktop.value).toBe(false)
  })

  it('should detect tablet when 768px <= width < 992px', async () => {
    setWindowWidth(800)
    const { useBreakpoint } = await import('../../src/composables/useBreakpoint')
    const { isMobile, isTablet, isDesktop } = useBreakpoint()

    await nextTick()
    expect(isMobile.value).toBe(false)
    expect(isTablet.value).toBe(true)
    expect(isDesktop.value).toBe(false)
  })

  it('should detect desktop when width >= 992px', async () => {
    setWindowWidth(1200)
    const { useBreakpoint } = await import('../../src/composables/useBreakpoint')
    const { isMobile, isTablet, isDesktop } = useBreakpoint()

    await nextTick()
    expect(isMobile.value).toBe(false)
    expect(isTablet.value).toBe(false)
    expect(isDesktop.value).toBe(true)
  })

  it('should update on resize', async () => {
    setWindowWidth(1200)
    const { useBreakpoint } = await import('../../src/composables/useBreakpoint')
    const { isMobile, isDesktop } = useBreakpoint()

    await nextTick()
    expect(isMobile.value).toBe(false)
    expect(isDesktop.value).toBe(true)

    setWindowWidth(500)
    await nextTick()

    expect(isMobile.value).toBe(true)
    expect(isDesktop.value).toBe(false)
  })
})