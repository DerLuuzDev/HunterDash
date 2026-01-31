/**
 * UndoRedoManager
 * 
 * Handles undo/redo functionality for form state.
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
        window.ToastManager.show(window.TranslationManager.t('toastStateSaved'), 'info');
    },

    undo() {
        if (this.undoStack.length === 0) {
            window.ToastManager.show(window.TranslationManager.t('toastNothingToUndo'), 'error');
            return;
        }

        const currentState = JSON.stringify(window.getCurrentFormData());
        this.redoStack.push(currentState);

        const previous = JSON.parse(this.undoStack.pop());
        window.applyFormData(previous);
        window.Calculator.calculate();
        window.ToastManager.show(window.TranslationManager.t('toastUndone'), 'success');
    },

    redo() {
        if (this.redoStack.length === 0) {
            window.ToastManager.show(window.TranslationManager.t('toastNothingToRedo'), 'error');
            return;
        }

        const currentState = JSON.stringify(window.getCurrentFormData());
        this.undoStack.push(currentState);

        const next = JSON.parse(this.redoStack.pop());
        window.applyFormData(next);
        window.Calculator.calculate();
        window.ToastManager.show(window.TranslationManager.t('toastRedone'), 'success');
    }
};

// Expose globally for compatibility
window.UndoRedoManager = UndoRedoManager;
