import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FloatingActionButton from '../../src/components/Layout/FloatingActionButton.vue'

describe('FloatingActionButton.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render correctly', () => {
    const wrapper = mount(FloatingActionButton, {
      props: { visible: true }
    })
    expect(wrapper.find('.fab-button').exists()).toBe(true)
  })

  it('should not render when visible is false', () => {
    const wrapper = mount(FloatingActionButton, {
      props: { visible: false }
    })
    expect(wrapper.find('.fab-button').isVisible()).toBe(false)
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mount(FloatingActionButton, {
      props: { visible: true }
    })
    await wrapper.find('.fab-button').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
  })

  it('should debounce rapid clicks', async () => {
    const wrapper = mount(FloatingActionButton, {
      props: { visible: true }
    })
    
    await wrapper.find('.fab-button').trigger('click')
    await wrapper.find('.fab-button').trigger('click')
    await wrapper.find('.fab-button').trigger('click')
    
    vi.advanceTimersByTime(600)
    
    expect(wrapper.emitted('click')).toHaveLength(1)
  })
})

import { afterEach } from 'vitest'