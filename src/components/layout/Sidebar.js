import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IC } from '../Icons';
import toast from 'react-hot-toast';

const MENUS = {
  admin: [
    { section: 'Operations' },
    { to: '/dashboard', icon: IC.dashboard, label: 'Dashboard' },
    { to: '/pos',       icon: IC.pos,       label: 'POS Terminal' },
    { to: '/orders',    icon: IC.orders,    label: 'Orders' },
    { to: '/reports', icon: IC.dashboard, label: 'Reports' },
    { section: 'Inventory' },
    { to: '/products',   icon: IC.products,   label: 'Products' },
    { to: '/categories', icon: IC.categories, label: 'Categories' },
    { to: '/stock',      icon: IC.stock,      label: 'Stock' },
    
    { section: 'Administration' },
    { to: '/users', icon: IC.users, label: 'Users' },
  ],
  manager: [
    { section: 'Operations' },
    { to: '/dashboard', icon: IC.dashboard, label: 'Dashboard' },
    { to: '/pos',       icon: IC.pos,       label: 'POS Terminal' },
    { to: '/orders',    icon: IC.orders,    label: 'Orders' },
    { section: 'Inventory' },
    { to: '/products',   icon: IC.products,   label: 'Products' },
    { to: '/categories', icon: IC.categories, label: 'Categories' },
    { to: '/stock',      icon: IC.stock,      label: 'Stock' },
  ],
  cashier: [
    { section: 'Workspace' },
    { to: '/pos',    icon: IC.pos,    label: 'POS Terminal' },
    { to: '/orders', icon: IC.orders, label: 'My Orders' },
  ],
};

const ROLE_COLORS = { admin: '#5dace0', manager: '#e2c27a', cashier: '#4db87a' };
const ROLE_LABELS = { admin: 'Administrator', manager: 'Manager', cashier: 'Cashier' };

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const menu = MENUS[user?.role] || MENUS.cashier;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const doLogout = () => { 
    logout(); 
    toast.success('Signed out'); 
    navigate('/login'); 
  };

  return (
    <nav className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-mark" style={{ width: 32, height: 32 }}>
          {IC.store}
        </div>
        <div>
          <div className="brand-text">QuickPOS</div>
          <div className="brand-sub">Point of Sale</div>
        </div>
      </div>

      {/* Nav */}
      <div className="sidebar-scroll">
        {menu.map((item, i) => {
          if (item.section) return <div key={i} className="nav-label">{item.section}</div>;
          return (
            <NavLink 
              key={item.to} 
              to={item.to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span style={{ width: 20, height: 20, display: 'block', flexShrink: 0 }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User */}
      <div className="sidebar-user">
        <div className="user-info">
          <div className="user-ava">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user?.name}
            </div>
            <div className="user-role-badge">
              <span className="badge badge-gold" style={{ fontSize: 9 }}>
                {ROLE_LABELS[user?.role]}
              </span>
            </div>
          </div>
        </div>
        <button 
          onClick={doLogout} 
          className="btn btn-ghost w-full"
          style={{ 
            justifyContent: 'center', 
            fontSize: 10, 
            letterSpacing: '.05em',
            gap: 6 
          }}
        >
          <span style={{ width: 16, height: 16, display: 'block' }}>
            {IC.logout}
          </span>
          Sign Out
        </button>
      </div>
    </nav>
  );
}