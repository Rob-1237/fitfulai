import { useUIStore } from '../../stores/useUIStore';
import BottomTabBar from './BottomTabBar';
import SidebarDrawer from './SideBarDrawer';

const ResponsiveNavigation = () => {
  const { isMobile } = useUIStore();

  return (
    <>
      {isMobile ? <BottomTabBar /> : <SidebarDrawer />}
    </>
  );
};

export default ResponsiveNavigation;