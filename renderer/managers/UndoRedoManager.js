/**
 * UndoRedoManager
 * 
 * Provides undo/redo functionality for form data.
 */

const UndoRedoManager = {
    undoStack: [],
    redoStack: [],
    maxSize: 50,

    saveState(data) {
        this.undoStack.push(JSON.stringify(data));
        if (this.undoStack.length > this.maxSize) {
            this.undoStack.shift();
        }
        this.redoStack = [];

        const msg = window.TranslationManager?.t('toastStateSaved') || 'Zustand gespeichert';
        window.ToastManager?.show(msg, 'info');
    },

    undo() {
        if (this.undoStack.length === 0) {
            const msg = window.TranslationManager?.t('toastNothingToUndo') || 'Nichts zum Rückgängig machen';
            window.ToastManager?.show(msg, 'error');
            return;
        }

        // Get current form data function should be available globally
        if (typeof getCurrentFormData !== 'function') {
            console.error('getCurrentFormData not available');
            return;
        }

        const currentState = JSON.stringify(getCurrentFormData());
        this.redoStack.push(currentState);

        const previous = JSON.parse(this.undoStack.pop());

        if (typeof applyFormData === 'function') {
            applyFormData(previous);
        }

        if (window.Calculator?.calculate) {
            window.Calculator.calculate();
        }

        const msg = window.TranslationManager?.t('toastUndone') || 'Rückgängig gemacht';
        window.ToastManager?.show(msg, 'success');
    },

    redo() {
        if (this.redoStack.length === 0) {
            window.ToastManager?.show('Nichts zum Wiederholen', 'error');
            return;
        }

        if (typeof getCurrentFormData !== 'function') {
            console.error('getCurrentFormData not available');
            return;
        }

        const currentState = JSON.stringify(getCurrentFormData());
        this.undoStack.push(currentState);

        const next = JSON.parse(this.redoStack.pop());

        if (typeof applyFormData === 'function') {
            applyFormData(next);
        }

        if (window.Calculator?.calculate) {
            window.Calculator.calculate();
        }

        window.ToastManager?.show('Wiederholt', 'success');
    },

    clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
};

export default UndoRedoManager;
