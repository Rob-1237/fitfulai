import { useUIStore } from '../../stores/useUIStore';
import BottomTabBar from './BottomTabBar';
import SidebarDrawer from './SideBarDrawer';

const ResponsiveNavigation = ({ isDark }: { isDark: boolean }) => {
  const { isMobile } = useUIStore();

  return (
    <>
      {isMobile ? <BottomTabBar isDark={isDark} /> : <SidebarDrawer isDark={isDark} />}
    </>
  );
};

export default ResponsiveNavigation;
