/**
 * SettingsManager
 * 
 * Handles all application settings including:
 * - UI preferences (animations, ripple effects, dark mode)
 * - Overlay mode
 * - Audio settings
 * - Language selection
 * - Hotkey configuration
 */

const SettingsManager = {
    settings: {
        animations: true,
        ripple: true,
        darkMode: false,
        overlayMode: false,
        minimizeToTray: false,
        audioFeedback: true,
        audioVolume: 0.5,
        language: 'de',
        sessionHotkeys: {
            addKill: 'F7',
            removeKill: 'F8',
            togglePause: 'F9',
            endSession: 'F10'
        }
    },

    open() {
        const modal = document.getElementById('settingsModal');
        modal.classList.add('show');
    },

    close() {
        const modal = document.getElementById('settingsModal');
        modal.classList.remove('show');
    },

    toggleAnimation() {
        this.settings.animations = !this.settings.animations;
        const toggle = document.getElementById('animToggle');
        toggle.classList.toggle('active');
        this.save();
    },

    toggleRipple() {
        this.settings.ripple = !this.settings.ripple;
        const toggle = document.getElementById('rippleToggle');
        toggle.classList.toggle('active');
        this.initRippleEffect();
        this.save();
    },

    initRippleEffect() {
        const buttons = document.querySelectorAll('.action-button, .nav-tab, .account-tab, .grind-tab');

        buttons.forEach(button => {
            button.removeEventListener('click', this.createRipple);

            if (this.settings.ripple) {
                button.addEventListener('click', this.createRipple);
            }
        });
    },

    createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.className = 'ripple-effect';

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    },

    toggleDarkMode() {
        this.settings.darkMode = !this.settings.darkMode;
        const toggle = document.getElementById('darkToggle');
        toggle.classList.toggle('active');
        this.applyDarkMode();
        this.save();
    },

    applyDarkMode() {
        if (this.settings.darkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }

        // Update statistics if available
        if (window.StatisticsManager && typeof window.StatisticsManager.loadStatistics === 'function') {
            const currentPeriod = document.querySelector('.action-buttons .action-button.active[data-period]')?.dataset.period || 'all';
            window.StatisticsManager.loadStatistics(currentPeriod);
        }
    },

    async save() {
        localStorage.setItem('cotw-calculator-settings', JSON.stringify(this.settings));
    },

    async load() {
        const saved = localStorage.getItem('cotw-calculator-settings');
        if (saved) {
            this.settings = JSON.parse(saved);
        }

        // Sync minimizeToTray from main process
        if (window.electronAPI && window.electronAPI.getSettings) {
            try {
                const mainSettings = await window.electronAPI.getSettings();
                if (mainSettings.success && mainSettings.data) {
                    this.settings.minimizeToTray = mainSettings.data.minimizeToTray || false;
                }
            } catch (e) {
                console.error('Failed to sync settings from main:', e);
            }
        }

        // Initialize sessionHotkeys with defaults
        if (!this.settings.sessionHotkeys) {
            this.settings.sessionHotkeys = {
                addKill: 'F7',
                removeKill: 'F8',
                togglePause: 'F9',
                endSession: 'F10'
            };
        }

        // Load individual hotkeys from localStorage
        const hotkeyIds = ['addKill', 'removeKill', 'togglePause', 'endSession'];
        hotkeyIds.forEach(id => {
            const stored = localStorage.getItem(`hotkey-${id}`);
            if (stored) {
                this.settings.sessionHotkeys[id] = stored;
            }
        });

        // GrindService as fallback
        if (window.electronAPI && window.electronAPI.grind) {
            try {
                const grindSettings = await window.electronAPI.grind.getSettings();
                if (grindSettings.success && grindSettings.data?.sessionHotkeys) {
                    hotkeyIds.forEach(id => {
                        if (!localStorage.getItem(`hotkey-${id}`) && grindSettings.data.sessionHotkeys[id]) {
                            this.settings.sessionHotkeys[id] = grindSettings.data.sessionHotkeys[id];
                        }
                    });
                }
            } catch (error) {
                console.error('Fehler beim Laden der Hotkeys aus GrindService:', error);
            }
        }

        // Apply UI state
        const animToggle = document.getElementById('animToggle');
        const rippleToggle = document.getElementById('rippleToggle');
        const darkToggle = document.getElementById('darkToggle');
        const overlayToggle = document.getElementById('overlayToggle');
        const audioToggle = document.getElementById('audioToggle');
        const trayToggle = document.getElementById('trayToggle');

        if (animToggle) animToggle.classList.toggle('active', this.settings.animations);
        if (rippleToggle) rippleToggle.classList.toggle('active', this.settings.ripple);
        this.initRippleEffect();
        if (darkToggle) darkToggle.classList.toggle('active', this.settings.darkMode);
        if (overlayToggle) overlayToggle.classList.toggle('active', this.settings.overlayMode);
        if (audioToggle) audioToggle.classList.toggle('active', this.settings.audioFeedback);
        if (trayToggle) {
            trayToggle.classList.remove('active');
            if (this.settings.minimizeToTray) {
                trayToggle.classList.add('active');
            }
        }

        const volumeControl = document.getElementById('volumeControl');
        if (volumeControl) {
            const volumeInput = volumeControl.querySelector('input');
            if (volumeInput) {
                volumeInput.value = this.settings.audioVolume || 0.5;
            }
        }

        // Language buttons
        const langDe = document.getElementById('langDe');
        const langEn = document.getElementById('langEn');
        const lang = this.settings.language || 'de';
        if (langDe) langDe.classList.toggle('active', lang === 'de');
        if (langEn) langEn.classList.toggle('active', lang === 'en');

        this.applyDarkMode();
        this.updateHotkeyInputs();

        // Apply saved language
        if (window.TranslationManager) {
            window.TranslationManager.updateAll();
        }
    },

    toggleOverlayMode() {
        this.settings.overlayMode = !this.settings.overlayMode;
        document.getElementById('overlayToggle').classList.toggle('active');

        if (window.electronAPI && window.electronAPI.setAlwaysOnTop) {
            window.electronAPI.setAlwaysOnTop(this.settings.overlayMode);
        }

        this.save();
    },

    toggleAudioFeedback() {
        this.settings.audioFeedback = !this.settings.audioFeedback;
        document.getElementById('audioToggle').classList.toggle('active');
        this.save();
    },

    toggleMinimizeToTray() {
        this.settings.minimizeToTray = !this.settings.minimizeToTray;
        document.getElementById('trayToggle').classList.toggle('active');

        if (window.electronAPI && window.electronAPI.setMinimizeToTray) {
            window.electronAPI.setMinimizeToTray(this.settings.minimizeToTray);
        }

        this.save();
        const msg = this.settings.minimizeToTray
            ? (window.TranslationManager?.t('toastTrayEnabled') || 'Tray aktiviert')
            : (window.TranslationManager?.t('toastTrayDisabled') || 'Tray deaktiviert');
        window.ToastManager?.show(msg, 'success');
    },

    setAudioVolume(volume) {
        this.settings.audioVolume = parseFloat(volume);
        this.save();
    },

    setLanguage(lang) {
        this.settings.language = lang;

        const langDe = document.getElementById('langDe');
        const langEn = document.getElementById('langEn');
        if (langDe) langDe.classList.toggle('active', lang === 'de');
        if (langEn) langEn.classList.toggle('active', lang === 'en');

        if (window.TranslationManager) {
            window.TranslationManager.updateAll();
        }

        // Update dependent managers
        if (window.GrindManager?.updateAnimalDropdowns) {
            window.GrindManager.updateAnimalDropdowns();
        }
        if (window.StatisticsManager?.loadStatistics) {
            window.StatisticsManager.loadStatistics('all');
        }
        if (window.Calculator?.calculate) {
            window.Calculator.calculate(false);
        }
        if (window.AccountManager?.renderAccounts) {
            window.AccountManager.renderAccounts();
        }
        if (window.TemplateManager?.renderTemplates) {
            window.TemplateManager.renderTemplates();
        }

        this.save();
        const msg = lang === 'de'
            ? (window.TranslationManager?.t('toastLanguageDe') || 'Sprache: Deutsch')
            : (window.TranslationManager?.t('toastLanguageEn') || 'Language: English');
        window.ToastManager?.show(msg, 'success');
    },

    recordHotkey(hotkeyId) {
        const input = document.getElementById(`hotkey-${hotkeyId}`);
        if (!input) return;

        input.value = 'Drücke eine Taste...';
        input.classList.add('recording');
        input.disabled = true;

        const self = this;

        const handleKeyDown = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
                return;
            }

            const hotkeyString = self.formatHotkey(e);

            input.value = hotkeyString;
            input.classList.remove('recording');
            input.disabled = false;

            localStorage.setItem(`hotkey-${hotkeyId}`, hotkeyString);

            if (!self.settings.sessionHotkeys) {
                self.settings.sessionHotkeys = {};
            }
            self.settings.sessionHotkeys[hotkeyId] = hotkeyString;

            if (window.electronAPI && window.electronAPI.grind) {
                await window.electronAPI.grind.updateHotkeys({ [hotkeyId]: hotkeyString });

                if (window.GrindManager?.isSessionRunning) {
                    await window.electronAPI.grind.registerHotkeys();
                }
            }

            document.removeEventListener('keydown', handleKeyDown, { capture: true });
            document.removeEventListener('keyup', handleKeyUp, { capture: true });
        };

        const handleKeyUp = (e) => {
            e.preventDefault();
            e.stopPropagation();
        };

        document.addEventListener('keydown', handleKeyDown, { capture: true });
        document.addEventListener('keyup', handleKeyUp, { capture: true });
    },

    formatHotkey(event) {
        event.preventDefault();

        const parts = [];
        if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
        if (event.altKey) parts.push('Alt');
        if (event.shiftKey) parts.push('Shift');

        const code = event.code;
        let keyName = '';

        if (/^F([1-9]|1[0-2])$/.test(code)) {
            keyName = code;
        } else if (/^Key([A-Z])$/.test(code)) {
            keyName = code.replace('Key', '');
        } else if (/^Digit([0-9])$/.test(code)) {
            keyName = code.replace('Digit', '');
        } else if (/^Numpad([0-9])$/.test(code)) {
            keyName = 'num' + code.replace('Numpad', '');
        } else if (code === 'Space') keyName = 'Space';
        else if (code === 'Enter') keyName = 'Enter';
        else if (code === 'Escape') keyName = 'Escape';
        else if (code === 'Backspace') keyName = 'Backspace';
        else if (code === 'Tab') keyName = 'Tab';
        else if (code === 'Delete') keyName = 'Delete';
        else if (code === 'Insert') keyName = 'Insert';
        else if (code === 'Home') keyName = 'Home';
        else if (code === 'End') keyName = 'End';
        else if (code === 'PageUp') keyName = 'PageUp';
        else if (code === 'PageDown') keyName = 'PageDown';
        else if (code === 'ArrowUp') keyName = 'Up';
        else if (code === 'ArrowDown') keyName = 'Down';
        else if (code === 'ArrowLeft') keyName = 'Left';
        else if (code === 'ArrowRight') keyName = 'Right';
        else if (code === 'Minus') keyName = '-';
        else if (code === 'Equal') keyName = '=';
        else if (code === 'BracketLeft') keyName = '[';
        else if (code === 'BracketRight') keyName = ']';
        else if (code === 'Semicolon') keyName = ';';
        else if (code === 'Quote') keyName = "'";
        else if (code === 'Backquote') keyName = '`';
        else if (code === 'Backslash') keyName = '\\';
        else if (code === 'Comma') keyName = ',';
        else if (code === 'Period') keyName = '.';
        else if (code === 'Slash') keyName = '/';
        else if (code === 'IntlBackslash') keyName = '<';
        else if (code.startsWith('Dead')) keyName = '^';
        else keyName = code || event.key || 'Unknown';

        parts.push(keyName);
        return parts.join(' + ');
    },

    updateHotkeyInputs() {
        if (this.settings.sessionHotkeys) {
            Object.keys(this.settings.sessionHotkeys).forEach(key => {
                const input = document.getElementById(`hotkey-${key}`);
                if (input) {
                    let value = this.settings.sessionHotkeys[key];
                    value = value
                        .replace('CommandOrControl', 'Ctrl')
                        .replace('DeadCircumflex', '^')
                        .replace('Space', 'Leertaste');
                    input.value = value;
                }
            });
        }
    },

    async resetToDefaults() {
        if (!confirm('Möchtest du wirklich alle Einstellungen zurücksetzen?')) return;

        this.settings = {
            animations: true,
            ripple: true,
            darkMode: false,
            overlayMode: false,
            audioFeedback: true,
            audioVolume: 0.5,
            sessionHotkeys: {
                addKill: 'F7',
                removeKill: 'F10',
                togglePause: 'F9',
                endSession: 'F8'
            }
        };

        this.save();
        this.load();

        if (window.electronAPI) {
            if (window.electronAPI.grind) {
                await window.electronAPI.grind.updateHotkeys(this.settings.sessionHotkeys);
            }
            if (window.electronAPI.setAlwaysOnTop) {
                window.electronAPI.setAlwaysOnTop(false);
            }
        }

        const msg = window.TranslationManager?.t('toastSettingsReset') || 'Einstellungen zurückgesetzt';
        window.ToastManager?.show(msg, 'success');
    }
};

export default SettingsManager;
