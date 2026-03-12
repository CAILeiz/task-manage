import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FilterDrawer from '../../src/components/Task/FilterDrawer.vue'

describe('FilterDrawer.vue', () => {
  it('should render correctly when visible', () => {
    const wrapper = mount(FilterDrawer, {
      props: { visible: true }
    })
    expect(wrapper.find('.filter-drawer').exists()).toBe(true)
  })

  it('should display filter options', async () => {
    const wrapper = mount(FilterDrawer, {
      props: { visible: true }
    })
    
    expect(wrapper.find('.filter-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('优先级')
    expect(wrapper.text()).toContain('状态')
  })

  it('should emit update:filter when apply is clicked', async () => {
    const wrapper = mount(FilterDrawer, {
      props: { visible: true }
    })
    
    await wrapper.find('.apply-btn').trigger('click')
    
    expect(wrapper.emitted('update:filter')).toBeTruthy()
    expect(wrapper.emitted('update:visible')).toBeTruthy()
    expect(wrapper.emitted('update:visible')![0]).toEqual([false])
  })

  it('should reset filters when reset is clicked', async () => {
    const wrapper = mount(FilterDrawer, {
      props: { 
        visible: true,
        priority: 'HIGH'
      }
    })
    
    await wrapper.find('.reset-btn').trigger('click')
    
    expect(wrapper.emitted('update:filter')).toBeFalsy()
  })
})