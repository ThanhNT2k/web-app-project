import {
  faBan,
  faBookOpen,
  faComments,
  faFlag,
  faGaugeHigh,
  faUsers,
} from '../lib/icons';
import ManagementLayoutShell from './ManagementLayoutShell';

const ADMIN_NAV_ITEMS = [
  { to: '/admin', end: true, label: 'Tổng quan hệ thống', icon: faGaugeHigh },
  { to: '/admin/users', label: 'Quản lý người dùng', icon: faUsers },
  { to: '/admin/stories', label: 'Quản lý truyện', icon: faBookOpen },
  { to: '/admin/reports', label: 'Quản lý báo cáo', icon: faFlag },
  { to: '/admin/comments', label: 'Quản lý bình luận', icon: faComments },
  { to: '/admin/bad-words', label: 'Quản lý từ khóa', icon: faBan },
];

function AdminLayout() {
  return (
    <ManagementLayoutShell
      brand="Admin Console"
      roleLabel="Quản trị viên"
      navItems={ADMIN_NAV_ITEMS}
      accent="blue"
    />
  );
}

export default AdminLayout;
