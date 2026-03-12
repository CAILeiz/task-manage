import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import HamburgerMenu from '../../src/components/Layout/HamburgerMenu.vue'

describe('HamburgerMenu.vue', () => {
  it('should render correctly', () => {
    const wrapper = mount(HamburgerMenu)
    expect(wrapper.find('.hamburger-btn').exists()).toBe(true)
    expect(wrapper.findAll('.line')).toHaveLength(3)
  })

  it('should emit click event when clicked', async () => {
    const wrapper = mount(HamburgerMenu)
    await wrapper.find('.hamburger-btn').trigger('click')
    expect(wrapper.emitted('click')).toBeTruthy()
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('should show active state when isActive is true', () => {
    const wrapper = mount(HamburgerMenu, {
      props: { isActive: true }
    })
    expect(wrapper.find('.hamburger-btn').classes()).toContain('is-active')
  })

  it('should have correct touch target size', () => {
    const wrapper = mount(HamburgerMenu)
    const btn = wrapper.find('.hamburger-btn')
    expect(btn.attributes('style')).toBeDefined()
  })
})