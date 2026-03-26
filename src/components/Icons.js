import React from 'react';

const iconClass = "w-5 h-5 flex-shrink-0";
const stroke = 1.6;

export const IC = {
  dashboard: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,

  pos: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="9" x2="22" y2="9"/><line x1="7" y1="15" x2="9" y2="15"/><line x1="15" y1="15" x2="17" y2="15"/></svg>,

  orders: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>,

  products: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,

  categories: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z"/></svg>,

  users: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,

  stock: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2"/></svg>,

  logout: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>,

  search: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>,

  x: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,

  plus: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,

  edit: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,

  trash: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6"/></svg>,

  cart: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/></svg>,

  minus: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><line x1="5" y1="12" x2="19" y2="12"/></svg>,

  check: <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={stroke}><polyline points="20 6 9 17 4 12"/></svg>,
};