/**
 * NavigationManager
 * 
 * Handles tab navigation and routing between app sections.
 */

const NavigationManager = {
    currentTab: 'dashboard',

    switchTab(tabName, element) {
        try {
            // Handle Active State for Sidebar
            if (element) {
                document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
                element.classList.add('active');
            }

            // Map 'statistics' to 'accounts' tab container
            let targetTabId = tabName;
            if (tabName === 'statistics') {
                targetTabId = 'accounts';
            }

            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.toggle('active', content.id === `tab-${targetTabId}`);
            });

            this.currentTab = tabName;

            // Update header title
            const headerTitle = document.getElementById('header-title-text');
            if (headerTitle) {
                const titleMap = {
                    'dashboard': 'navDashboard',
                    'calculator': 'navCalculator',
                    'grind': 'navGrindHelper',
                    'history': 'navHistory',
                    'templates': 'navTemplates',
                    'accounts': 'navAccounts',
                    'statistics': 'navStatistics',
                    'reference': 'navReference'
                };
                const key = titleMap[tabName] || 'appSubtitle';
                headerTitle.setAttribute('data-i18n', key);
                if (window.TranslationManager) {
                    window.TranslationManager.translatePage();
                }
            }

            // Tab-specific initialization
            if (tabName === 'dashboard') {
                window.DashboardManager?.update?.();
            } else if (tabName === 'templates') {
                window.TemplateManager?.loadTemplates?.();
            } else if (tabName === 'history') {
                window.HistoryManager?.loadHistory?.();
            } else if (tabName === 'accounts') {
                window.AccountManager?.loadAccounts?.();
            } else if (tabName === 'statistics') {
                window.AccountManager?.loadAccounts?.();
                window.AccountManager?.switchSubTab?.('statistics');
            } else if (tabName === 'grind') {
                if (!window.GrindManager) {
                    throw new Error('GrindManager nicht initialisiert');
                }
                window.GrindManager.init();
                window.GrindManager.switchSubTab('timer');
            } else if (tabName === 'reference') {
                if (window.ReferenceManager) {
                    window.ReferenceManager.init();
                }
            }
        } catch (error) {
            console.error('Navigation error:', error);
            window.ToastManager?.show?.(`Tab wechsel fehlgeschlagen: ${error.message}`, 'error');
        }
    }
};

export default NavigationManager;
