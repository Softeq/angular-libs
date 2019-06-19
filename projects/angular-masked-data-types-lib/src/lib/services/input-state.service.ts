// Developed by Softeq Development Corporation
// http://www.softeq.com

import { Injectable, NgZone, OnDestroy } from '@angular/core';

const eventOptions = {
  passive: true,
};

@Injectable({ providedIn: 'root' })
export class InputState implements OnDestroy {
  // tslint:disable-next-line:variable-name
  private _mouseDown: boolean;
  // tslint:disable-next-line:variable-name
  private _touchInProcess: boolean;

  get mouseDown(): boolean {
    return this._mouseDown;
  }

  set mouseDown(_: boolean) {
    throw new Error('mouseDown field cannot be updated');
  }

  get touchInProcess(): boolean {
    return this._touchInProcess;
  }

  set touchInProcess(_: boolean) {
    throw new Error('touchInProcess field cannot be updated');
  }

  constructor(private ngZone: NgZone) {
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);

    this.onTouchStart = this.onTouchStart.bind(this);
    this.onTouchEnd = this.onTouchEnd.bind(this);

    this.ngZone.runOutsideAngular(() => {
      document.addEventListener('mousedown', this.onMouseDown, eventOptions);
      document.addEventListener('mouseup', this.onMouseUp, eventOptions);

      document.addEventListener('touchstart', this.onTouchStart, eventOptions);
      document.addEventListener('touchend', this.onTouchEnd, eventOptions);
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousedown', this.onMouseDown);
    document.removeEventListener('mouseup', this.onMouseUp);

    document.removeEventListener('touchstart', this.onTouchStart);
    document.removeEventListener('touchend', this.onTouchEnd);
  }

  private onMouseDown(): void {
    this._mouseDown = true;
  }

  private onMouseUp(): void {
    this._mouseDown = false;
  }

  private onTouchStart(): void {
    this._touchInProcess = true;
  }

  private onTouchEnd(): void {
    this._touchInProcess = false;
  }

}
