import {
  faBookOpen,
  faComments,
  faClockRotateLeft,
  faFlag,
  faGaugeHigh,
  faUser,
} from '../lib/icons';
import ManagementLayoutShell from './ManagementLayoutShell';

const MODERATOR_NAV_ITEMS = [
  { to: '/moderator/dashboard', label: 'Tổng quan kiểm duyệt', icon: faGaugeHigh },
  { to: '/moderator/pending-stories', label: 'Truyện chờ duyệt', icon: faBookOpen },
  { to: '/moderator/reports', label: 'Quản lý báo cáo', icon: faFlag },
  { to: '/moderator/comments', label: 'Quản lý bình luận', icon: faComments },
  { to: '/moderator/profiles', label: 'Quản lý profile', icon: faUser },
  { to: '/moderator/logs', label: 'Nhật ký hoạt động', icon: faClockRotateLeft },
];

function ModeratorLayout() {
  return (
    <ManagementLayoutShell
      brand="Moderation Hub"
      roleLabel="Kiểm duyệt viên"
      navItems={MODERATOR_NAV_ITEMS}
      accent="teal"
    />
  );
}

export default ModeratorLayout;
