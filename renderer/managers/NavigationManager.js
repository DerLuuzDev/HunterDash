/**
 * NavigationManager
 * 
 * Handles navigation between application tabs.
 */

const NavigationManager = {
    currentTab: 'calculator',

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
            const headerTitle = document.getElementById('header-title-text');
            if (headerTitle) {
                const titleMap = {
                    'calculator': 'navCalculator',
                    'grind': 'navGrindHelper',
                    'history': 'navHistory',
                    'templates': 'navTemplates',
                    'accounts': 'navAccounts',
                    'statistics': 'navStatistics'
                };
                const key = titleMap[tabName] || 'appSubtitle';
                headerTitle.setAttribute('data-i18n', key);
                if (window.TranslationManager) window.TranslationManager.updateAll();
            }

            if (tabName === 'templates') {
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
            }
        } catch (error) {
            console.error('Navigation error:', error);
            window.ToastManager?.show?.(`Tab wechsel fehlgeschlagen: ${error.message}`, 'error');
        }
    }
};

// Expose globally for compatibility
window.NavigationManager = NavigationManager;
