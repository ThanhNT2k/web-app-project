import { NavLink } from 'react-router-dom';

import {
  FontAwesomeIcon,
  faBookmark,
  faClockRotateLeft,
  faGear,
} from '../lib/icons';

const items = [
  { to: '/account/following', label: 'Truyện theo dõi', icon: faBookmark },
  { to: '/account/history', label: 'Lịch sử đọc', icon: faClockRotateLeft },
  { to: '/account/settings', label: 'Cài đặt tài khoản', icon: faGear },
];

function AccountSectionNav() {
  return (
    <nav className="account-section-nav" aria-label="Điều hướng tủ sách và hồ sơ">
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `account-section-nav__item${isActive ? ' active' : ''}`}
        >
          <FontAwesomeIcon icon={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export default AccountSectionNav;
