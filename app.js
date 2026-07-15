/* ==========================================================================
   DK CRM - Shared Logic, Theme Switcher, & Notification Manager
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initAppTheme();
  initSidebar();
  initActiveNav();
  initNotifications();
  initLogout();
  checkLoginSession();
});

// ---------- 1. Session check to redirect if not logged in ----------
function checkLoginSession() {
  const currentPath = window.location.pathname;
  const isLoginPage = currentPath.endsWith('index.html') || currentPath === '/' || currentPath.endsWith('dk-crm/') || currentPath === '';
  
  if (!isLoginPage) {
    const isLoggedIn = sessionStorage.getItem('crm_logged_in');
    if (!isLoggedIn) {
      showToast('Session expired. Redirecting to login...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);
    }
  }
}

// ---------- 2. Active Menu Item Highlighting ----------
function initActiveNav() {
  const currentPath = window.location.pathname;
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    // Remove active class
    item.classList.remove('active');
    
    // Find parent anchor tag to see which page it goes to
    const link = item.closest('a');
    if (link) {
      const href = link.getAttribute('href');
      if (currentPath.includes(href)) {
        item.classList.add('active');
      }
    }
  });
}

// ---------- 3. Mobile Sidebar Drawer Toggles ----------
function initSidebar() {
  const sidebar = document.getElementById('app-sidebar');
  const sidebarToggle = document.getElementById('sidebar-toggle-btn');
  
  if (sidebar && sidebarToggle) {
    // Open sidebar on hamburger click
    sidebarToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });
    
    // Close sidebar when clicking outside on mobile viewports
    document.addEventListener('click', (e) => {
      const clickedInside = sidebar.contains(e.target);
      const clickedToggle = sidebarToggle.contains(e.target);
      
      if (sidebar.classList.contains('open') && !clickedInside && !clickedToggle) {
        sidebar.classList.remove('open');
      }
    });
  }
}

// ---------- 4. Notification Management System ----------
function initNotifications() {
  const notifBell = document.getElementById('notif-bell');
  
  if (!notifBell) return;
  
  // Create notifications popover dynamically if it doesn't exist
  let popover = document.getElementById('notification-popover');
  if (!popover) {
    popover = document.createElement('div');
    popover.id = 'notification-popover';
    popover.className = 'notif-popover';
    
    popover.innerHTML = `
      <div class="notif-header">
        <h3>Notifications</h3>
        <button class="clear-notifs-btn" id="clear-all-notifs">Mark all read</button>
      </div>
      <div class="notif-list" id="notif-items-list">
        <!-- Rendered in JS -->
      </div>
    `;
    
    // Place popover in relative parent to align it correctly
    notifBell.style.position = 'relative';
    notifBell.appendChild(popover);
  }

  // Toggle dropdown on bell click
  notifBell.addEventListener('click', (e) => {
    if (e.target.closest('#notification-popover')) return;
    
    e.stopPropagation();
    popover.classList.toggle('show');
  });

  // Close dropdown on clicking outside
  document.addEventListener('click', () => {
    popover.classList.remove('show');
  });

  // Load mock notifications from localStorage or generate defaults
  let notifications = JSON.parse(localStorage.getItem('crm_notifications'));
  if (!notifications) {
    notifications = [
      { id: 1, title: 'Google Deal Closed', desc: 'Enterprise package deal closed won.', time: '10 mins ago', unread: true },
      { id: 2, title: 'New customer signed up', desc: 'Microsoft Corporation added contacts.', time: '1 hr ago', unread: true },
      { id: 3, title: 'Payment received', desc: 'Amazon Services invoice #INV-4921 paid.', time: '3 hrs ago', unread: false },
      { id: 4, title: 'Meeting tomorrow', desc: 'Sync scheduled with Netflix team at 10 AM.', time: '5 hrs ago', unread: true }
    ];
    localStorage.setItem('crm_notifications', JSON.stringify(notifications));
  }

  // Render list items
  renderNotificationsList(notifications);
  
  // Clear all button handler
  document.getElementById('clear-all-notifs').addEventListener('click', (e) => {
    e.stopPropagation();
    notifications.forEach(n => n.unread = false);
    localStorage.setItem('crm_notifications', JSON.stringify(notifications));
    renderNotificationsList(notifications);
    showToast('All notifications marked as read.');
  });
}

function renderNotificationsList(notifications) {
  const listContainer = document.getElementById('notif-items-list');
  const badgeElement = document.getElementById('notif-unread-badge');
  
  if (!listContainer) return;
  
  listContainer.innerHTML = '';
  
  const unreadCount = notifications.filter(n => n.unread).length;
  
  // Render badge count
  if (unreadCount > 0) {
    if (badgeElement) {
      badgeElement.textContent = unreadCount;
      badgeElement.style.display = 'flex';
    } else {
      // Create badge dynamically
      const newBadge = document.createElement('span');
      newBadge.id = 'notif-unread-badge';
      newBadge.className = 'notif-badge';
      newBadge.textContent = unreadCount;
      document.getElementById('notif-bell').appendChild(newBadge);
    }
  } else {
    if (badgeElement) {
      badgeElement.style.display = 'none';
    }
  }
  
  if (notifications.length === 0) {
    listContainer.innerHTML = '<div class="notif-empty">You have no notifications</div>';
    return;
  }
  
  notifications.forEach(notif => {
    const item = document.createElement('div');
    item.className = `notif-item ${notif.unread ? 'unread' : ''}`;
    item.innerHTML = `
      ${notif.unread ? '<div class="notif-item-dot"></div>' : ''}
      <div class="notif-item-content">
        <div class="notif-item-title">${notif.title}</div>
        <div class="notif-item-desc">${notif.desc}</div>
        <div class="notif-item-time">${notif.time}</div>
      </div>
    `;
    
    // Mark single notification as read on click
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      notif.unread = false;
      localStorage.setItem('crm_notifications', JSON.stringify(notifications));
      renderNotificationsList(notifications);
    });
    
    listContainer.appendChild(item);
  });
}

// ---------- 5. Theme Initialization & Switching ----------
function initAppTheme() {
  const themeToggle = document.getElementById('theme-toggle-btn');
  const currentTheme = localStorage.getItem('crm_theme') || 'dark';
  
  // Set initial theme class on body
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  
  updateThemeIcon(currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      let activeTheme = 'dark';
      if (document.body.classList.contains('light-theme')) {
        document.body.classList.remove('light-theme');
        activeTheme = 'dark';
      } else {
        document.body.classList.add('light-theme');
        activeTheme = 'light';
      }
      
      localStorage.setItem('crm_theme', activeTheme);
      updateThemeIcon(activeTheme);
      showToast(`Switched to ${activeTheme} mode.`);
    });
  }
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('theme-icon');
  if (!themeIcon) return;
  
  if (theme === 'light') {
    themeIcon.setAttribute('data-lucide', 'sun');
    themeIcon.style.color = '#e8a23d';
  } else {
    themeIcon.setAttribute('data-lucide', 'moon');
    themeIcon.style.color = '';
  }
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// ---------- 6. Logout Simulation ----------
function initLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('crm_logged_in');
      showToast('Signing out...');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }
}

// ---------- 7. Shared Toast Message utility ----------
function showToast(message) {
  let toast = document.getElementById('global-toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'global-toast-msg';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  
  toast.textContent = message;
  toast.classList.add('show');
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

window.showToast = showToast;
