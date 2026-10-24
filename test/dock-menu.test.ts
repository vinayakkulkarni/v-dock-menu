import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vite-plus/test';
import { DockMenu, DockPosition } from '../src';

const items = [
  { name: 'File', menu: [{ name: 'Open' }, { name: 'Exit' }] },
  { name: 'Edit', menu: [{ name: 'Copy' }] },
];

describe('DockMenu', () => {
  it('renders one menubar item per entry', () => {
    const wrapper = mount(DockMenu, { props: { items } });
    expect(wrapper.findAll('[role="menuitem"]')).toHaveLength(2);
    expect(wrapper.text()).toContain('File');
    expect(wrapper.classes()).toContain('top');
  });

  it('follows the dock prop', async () => {
    const wrapper = mount(DockMenu, { props: { items } });
    await wrapper.setProps({ dock: DockPosition.LEFT });
    expect(wrapper.classes()).toContain('left');
    expect(
      wrapper.find('[role="menubar"]').attributes('aria-orientation'),
    ).toBe('vertical');
  });

  it('reports the selected item with its full path', async () => {
    const onSelected = vi.fn();
    const wrapper = mount(DockMenu, {
      props: { items, onSelected },
      attachTo: document.body,
    });
    const file = wrapper.findAll('.menu-bar-item-container')[0];
    await file?.trigger('mouseenter');
    await file?.trigger('click');
    const open = wrapper.findAll('.menu-item')[0];
    await open?.trigger('click');
    expect(onSelected).toHaveBeenCalledWith({
      name: 'Open',
      path: 'file>open',
    });
    wrapper.unmount();
  });
});
