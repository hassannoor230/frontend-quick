import React from 'react';
import Sidebar from './Sidebar';
export default function Layout({ title, actions, children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <div className="topbar">
          <h1 className="page-title">{title}</h1>
          <div className="topbar-right">{actions}</div>
        </div>
        <div className="page-body fade-in">{children}</div>
      </div>
    </div>
  );
}
