/**
 * Application Initialization
 * 
 * Sets up event listeners and triggers initial data loading.
 */

let userHasModifiedValues = false;
let debounceTimer;

document.addEventListener('DOMContentLoaded', async function () {
    console.log('DOM Content Loaded');
    console.log('Managers available:', {
        Calculator: typeof Calculator,
        NavigationManager: typeof NavigationManager,
        GrindManager: typeof GrindManager,
        UIManager: typeof UIManager,
        TooltipManager: typeof TooltipManager
    });

    try {
        // Await SettingsManager.load() to ensure settings are ready
        if (typeof SettingsManager !== 'undefined') {
            await SettingsManager.load();
        }

        if (typeof UIManager !== 'undefined') {
            UIManager.setupPSliders();
        }

        if (typeof TooltipManager !== 'undefined') {
            TooltipManager.setup();
        }

        // Initial ratio update
        ['rare', 'diamond', 'super', 'go'].forEach(type => {
            const val = document.getElementById('p_' + type)?.value;
            if (val && typeof UIManager !== 'undefined') {
                UIManager.updateRatio(type, val);
            }
        });

        console.log('Starting Calculator.calculate()...');
        // Initial calculation does NOT save to history
        if (typeof Calculator !== 'undefined') {
            await Calculator.calculate(false);
        }
        console.log('Calculator.calculate() completed');
    } catch (error) {
        console.error('Initialization error:', error);
        if (typeof ToastManager !== 'undefined') {
            ToastManager.show('Fehler bei der Initialisierung', 'error');
        }
    }

    const inputFields = document.querySelectorAll('input[type="number"]');
    inputFields.forEach(input => {
        input.addEventListener('input', function () {
            // User has modified values - now history should be saved
            userHasModifiedValues = true;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                // Only save to history if user has modified values
                if (typeof Calculator !== 'undefined') {
                    Calculator.calculate(userHasModifiedValues);
                }
            }, 200);
        });
        input.addEventListener('change', () => {
            userHasModifiedValues = true;
            if (typeof UndoRedoManager !== 'undefined' && typeof UIManager !== 'undefined') {
                UndoRedoManager.saveState(UIManager.getCurrentFormData());
            }
        });
    });

    window.addEventListener('click', (e) => {
        // Close dropdowns if clicking outside (ignore clicks on the button or the list itself)
        if (!e.target.closest('.mini-btn') && !e.target.closest('.preset-list')) {
            if (typeof UIManager !== 'undefined') {
                UIManager.closeAllDropdowns();
            }
        }
    });
});
