/**
 * History Manager for Pot Shaping, Painting, and Pattern Decorating
 * Maintains deep snapshots of radii, height, and canvas texture.
 */
export class HistoryManager {
  constructor(maxSteps = 25) {
    this.maxSteps = maxSteps;
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Clone a pot state snapshot.
   * Copies radii Float32Array and duplicates texture ImageData if present.
   */
  createSnapshot(radii, height, textureCtx, width, heightTex) {
    const radiiCopy = new Float32Array(radii);
    let textureData = null;
    if (textureCtx) {
      textureData = textureCtx.getImageData(0, 0, width, heightTex);
    }
    return {
      radii: radiiCopy,
      height,
      textureData,
      width,
      heightTex
    };
  }

  /**
   * Push a new state snapshot to undo stack.
   */
  push(snapshot) {
    if (this.undoStack.length >= this.maxSteps) {
      this.undoStack.shift();
    }
    this.undoStack.push(snapshot);
    this.redoStack = []; // Clear redo stack on new action
  }

  /**
   * Pop previous state from undo stack.
   */
  undo(currentSnapshot) {
    if (this.undoStack.length === 0) return null;
    const previous = this.undoStack.pop();
    if (currentSnapshot) {
      this.redoStack.push(currentSnapshot);
    }
    return previous;
  }

  /**
   * Redo action if available.
   */
  redo(currentSnapshot) {
    if (this.redoStack.length === 0) return null;
    const next = this.redoStack.pop();
    if (currentSnapshot) {
      this.undoStack.push(currentSnapshot);
    }
    return next;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
