import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { ColorPickerComponent } from './color-picker.component';

@NgModule({
  declarations: [
    ColorPickerComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  exports: [
    ColorPickerComponent
  ]
})
export class ColorPickerModule { }
