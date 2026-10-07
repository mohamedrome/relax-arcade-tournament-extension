import type { ExtensionContext } from '../types.js';

export class RelaxArcadeAdapter {
  private readonly context: ExtensionContext;

  constructor(context: ExtensionContext) {
    this.context = context;
  }

  public getContext(): ExtensionContext {
    return this.context;
  }

  public showOverlay(content: string): void {
    if (this.context.uiEnabled === false) return;
    console.log('[RelaxArcadeAdapter] Overlay rendered');
    console.log(content);
  }
}
