import { ref, onMounted, onUnmounted } from 'vue'

const BREAKPOINTS = {
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
} as const

export function useBreakpoint() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(true)
  const width = ref(0)

  function update() {
    width.value = window.innerWidth
    isMobile.value = width.value < BREAKPOINTS.md
    isTablet.value = width.value >= BREAKPOINTS.md && width.value < BREAKPOINTS.lg
    isDesktop.value = width.value >= BREAKPOINTS.lg
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
  })

  return {
    isMobile,
    isTablet,
    isDesktop,
    width,
  }
}