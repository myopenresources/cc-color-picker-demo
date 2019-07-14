import {
  Component, ElementRef, Input, Output, AfterViewChecked, OnDestroy, EventEmitter,
  forwardRef, Renderer2, ViewChild, ChangeDetectorRef, OnInit
} from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';



@Component({
  selector: 'cc-color-picker',
  templateUrl: './color-picker.component.html',
  styleUrls: ['./color-picker.component.less'],
  animations: [
    trigger('panelState', [
      state('hidden', style({
        opacity: 0
      })),
      state('visible', style({
        opacity: 1
      })),
      transition('visible => hidden', animate('400ms ease-in')),
      transition('hidden => visible', animate('400ms ease-out'))
    ])
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ColorPickerComponent),
      multi: true
    }
  ]
})
export class ColorPickerComponent implements OnInit, ControlValueAccessor, AfterViewChecked, OnDestroy {

  @Input() style: any;

  @Input() styleClass: string;

  @Input() inline: boolean;

  @Input() format: string = 'hex';

  @Input() appendTo: string;

  @Input() disabled: boolean;

  @Input() tabindex: string;

  @Input() inputId: string;

  @Output() colorPickerChange: EventEmitter<any> = new EventEmitter();

  @ViewChild('panel', { static: false }) panelViewChild: ElementRef;

  @ViewChild('colorSelector', { static: true }) colorSelectorViewChild: ElementRef;

  @ViewChild('colorHandle', { static: true }) colorHandleViewChild: ElementRef;

  @ViewChild('hue', { static: true }) hueViewChild: ElementRef;

  @ViewChild('hueHandle', { static: true }) hueHandleViewChild: ElementRef;

  @ViewChild('input', { static: false }) inputViewChild: ElementRef;


  static zindex: number = 1111;

  value: any;

  inputBgColor: string;

  shown: boolean;

  panelVisible: boolean;

  defaultColor: string = 'ffffff';

  onModelChange: Function = () => { };

  onModelTouched: Function = () => { };

  documentClickListener: Function = () => { };

  documentMousemoveListener: Function = () => { };

  documentMouseupListener: Function = () => { };

  documentHueMoveListener: Function = () => { };

  selfClick: boolean;

  colorDragging: boolean;

  hueDragging: boolean;

  constructor(public el: ElementRef, public renderer: Renderer2, public cd: ChangeDetectorRef) { }


  ngOnInit() { }

  ngAfterViewChecked() {
    if (this.shown) {
      this.onShow();
      this.shown = false;
    }
  }

  onHueMousedown(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    this.bindDocumentMousemoveListener();
    this.bindDocumentMouseupListener();

    this.hueDragging = true;
    this.pickHue(event);
  }

  pickHue(event: MouseEvent) {
    const top: number = this.hueViewChild.nativeElement.getBoundingClientRect().top + document.body.scrollTop;
    this.value = this.validateHSB({
      h: Math.floor(360 * (150 - Math.max(0, Math.min(150, (event.pageY - top)))) / 150),
      s: 100,
      b: 100
    });

    this.updateColorSelector();
    this.updateUI();
    this.updateModel();
    this.colorPickerChange.emit({ originalEvent: event, value: this.value });
  }

  onColorMousedown(event: MouseEvent) {
    if (this.disabled) {
      return;
    }

    this.bindDocumentMousemoveListener();
    this.bindDocumentMouseupListener();

    this.colorDragging = true;
    this.pickColor(event);
  }

  pickColor(event: MouseEvent) {
    const rect = this.colorSelectorViewChild.nativeElement.getBoundingClientRect();
    const top = rect.top + document.body.scrollTop;
    const left = rect.left + document.body.scrollLeft;
    const saturation = Math.floor(100 * (Math.max(0, Math.min(150, (event.pageX - left)))) / 150);
    const brightness = Math.floor(100 * (150 - Math.max(0, Math.min(150, (event.pageY - top)))) / 150);
    this.value = this.validateHSB({
      h: this.value.h,
      s: saturation,
      b: brightness
    });

    this.updateUI();
    this.updateModel();
    this.colorPickerChange.emit({ originalEvent: event, value: this.getValueToUpdate() });
  }

  getValueToUpdate() {
    let val: any;
    switch (this.format) {
      case 'hex':
        val = '#' + this.HSBtoHEX(this.value);
        break;

      case 'rgb':
        val = this.HSBtoRGB(this.value);
        break;

      case 'hsb':
        val = this.value;
        break;
    }

    return val;
  }

  updateModel(): void {
    this.onModelChange(this.getValueToUpdate());
  }

  writeValue(value: any): void {
    if (value) {
      switch (this.format) {
        case 'hex':
          this.value = this.HEXtoHSB(value);
          break;

        case 'rgb':
          this.value = this.RGBtoHSB(value);
          break;

        case 'hsb':
          this.value = value;
          break;
      }
    } else {
      this.value = this.HEXtoHSB(this.defaultColor);
    }

    this.updateColorSelector();
    this.updateUI();
  }

  updateColorSelector() {
    this.colorSelectorViewChild.nativeElement.style.backgroundColor = '#' + this.HSBtoHEX(this.value);
  }

  updateUI() {
    this.colorHandleViewChild.nativeElement.style.left = Math.floor(150 * this.value.s / 100) + 'px';
    this.colorHandleViewChild.nativeElement.style.top = Math.floor(150 * (100 - this.value.b) / 100) + 'px';
    this.hueHandleViewChild.nativeElement.style.top = Math.floor(150 - (150 * this.value.h / 360)) + 'px';
    this.inputBgColor = '#' + this.HSBtoHEX(this.value);
  }

  onInputFocus() {
    this.onModelTouched();
  }

  show() {
    this.panelViewChild.nativeElement.style.zIndex = String(++ColorPickerComponent.zindex);
    this.panelVisible = true;
    this.shown = true;
  }

  hide() {
    this.panelVisible = false;
    this.unbindDocumentClickListener();
  }

  onShow() {
    this.alignPanel();
    this.bindDocumentClickListener();
  }

  getHiddenElementDimensions(element: any): any {
    const dimensions: any = {};
    element.style.visibility = 'hidden';
    element.style.display = 'block';
    dimensions.width = element.offsetWidth;
    dimensions.height = element.offsetHeight;
    element.style.display = 'none';
    element.style.visibility = 'visible';

    return dimensions;
  }


  getViewport(): any {
    const win = window,
      d = document,
      e = d.documentElement,
      g = (d.getElementsByTagName('body')[0]) as Element,
      w = win.innerWidth || e.clientWidth || g.clientWidth,
      h = win.innerHeight || e.clientHeight || g.clientHeight;

    return { width: w, height: h };
  }

  getWindowScrollTop(): number {
    const doc = document.documentElement;
    return (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
  }

  /**
  * 获得窗口滚动宽度
  */
  getWindowScrollLeft(): number {
    const doc = document.documentElement;
    return (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
  }

  absolutePosition(element: any, target: any): void {
    const elementDimensions = element.offsetParent ?
      { width: element.offsetWidth, height: element.offsetHeight } : this.getHiddenElementDimensions(element);
    const elementOuterHeight = elementDimensions.height;
    const elementOuterWidth = elementDimensions.width;
    const targetOuterHeight = target.offsetHeight;
    const targetOuterWidth = target.offsetWidth;
    const targetOffset = target.getBoundingClientRect();
    const windowScrollTop = this.getWindowScrollTop();
    const windowScrollLeft = this.getWindowScrollLeft();
    const viewport = this.getViewport();
    let top, left;

    if (targetOffset.top + targetOuterHeight + elementOuterHeight > viewport.height) {
      top = targetOffset.top + windowScrollTop - elementOuterHeight;
      if (top < 0) {
        top = 0 + windowScrollTop;
      }
    } else {
      top = targetOuterHeight + targetOffset.top + windowScrollTop;
    }

    if (targetOffset.left + targetOuterWidth + elementOuterWidth > viewport.width) {
      left = targetOffset.left + windowScrollLeft + targetOuterWidth - elementOuterWidth;
    } else {
      left = targetOffset.left + windowScrollLeft;
    }


    element.style.top = top + 'px';
    element.style.left = left + 'px';
  }

  relativePosition(element: any, target: any): void {
    const elementDimensions = element.offsetParent ?
      { width: element.offsetWidth, height: element.offsetHeight } : this.getHiddenElementDimensions(element);
    const targetHeight = target.offsetHeight;
    const targetWidth = target.offsetWidth;
    const targetOffset = target.getBoundingClientRect();
    const windowScrollTop = this.getWindowScrollTop();
    const viewport = this.getViewport();
    let top, left;

    if ((targetOffset.top + targetHeight + elementDimensions.height) > viewport.height) {
      top = -1 * (elementDimensions.height);
      if (targetOffset.top + top < 0) {
        top = 0;
      }
    } else {
      top = targetHeight;
    }


    if ((targetOffset.left + elementDimensions.width) > viewport.width) {
      left = targetWidth - elementDimensions.width;
    } else {
      left = 0;
    }


    element.style.top = top + 'px';
    element.style.left = left + 'px';
  }

  alignPanel() {
    if (this.appendTo) {
      this.absolutePosition(this.panelViewChild.nativeElement, this.inputViewChild.nativeElement);
    } else {
      this.relativePosition(this.panelViewChild.nativeElement, this.inputViewChild.nativeElement);
    }

  }

  onInputClick() {
    this.selfClick = true;
    this.togglePanel();
  }

  togglePanel() {
    if (!this.panelVisible) {
      this.show();
    } else {
      this.hide();
    }

  }

  onInputKeydown(event: any) {
    switch (event.which) {
      case 32:
        this.togglePanel();
        event.preventDefault();
        break;
      case 27:
      case 9:
        this.hide();
        break;
    }
  }

  onPanelClick() {
    this.selfClick = true;
  }

  registerOnChange(fn: Function): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: Function): void {
    this.onModelTouched = fn;
  }

  setDisabledState(val: boolean): void {
    this.disabled = val;
  }

  bindDocumentClickListener() {
    if (!this.documentClickListener) {
      this.documentClickListener = this.renderer.listen('document', 'click', () => {
        if (!this.selfClick) {
          this.panelVisible = false;
          this.unbindDocumentClickListener();
        }

        this.selfClick = false;
        this.cd.markForCheck();
      });
    }
  }

  unbindDocumentClickListener() {
    if (this.documentClickListener) {
      this.documentClickListener();
      this.documentClickListener = null;
    }
  }

  bindDocumentMousemoveListener() {
    if (!this.documentMousemoveListener) {
      this.documentMousemoveListener = this.renderer.listen('document', 'mousemove', (event: MouseEvent) => {
        if (this.colorDragging) {
          this.pickColor(event);
        }

        if (this.hueDragging) {
          this.pickHue(event);
        }
      });
    }
  }

  unbindDocumentMousemoveListener() {
    if (this.documentMousemoveListener) {
      this.documentMousemoveListener();
      this.documentMousemoveListener = null;
    }
  }

  bindDocumentMouseupListener() {
    if (!this.documentMouseupListener) {
      this.documentMouseupListener = this.renderer.listen('document', 'mouseup', () => {
        this.colorDragging = false;
        this.hueDragging = false;
        this.unbindDocumentMousemoveListener();
        this.unbindDocumentMouseupListener();
      });
    }
  }

  unbindDocumentMouseupListener() {
    if (this.documentMouseupListener) {
      this.documentMouseupListener();
      this.documentMouseupListener = null;
    }
  }

  validateHSB(hsb) {
    return {
      h: Math.min(360, Math.max(0, hsb.h)),
      s: Math.min(100, Math.max(0, hsb.s)),
      b: Math.min(100, Math.max(0, hsb.b))
    };
  }

  validateRGB(rgb) {
    return {
      r: Math.min(255, Math.max(0, rgb.r)),
      g: Math.min(255, Math.max(0, rgb.g)),
      b: Math.min(255, Math.max(0, rgb.b))
    };
  }

  validateHEX(hex) {
    const len = 6 - hex.length;
    if (len > 0) {
      const o = [];
      for (let i = 0; i < len; i++) {
        o.push('0');
      }
      o.push(hex);
      hex = o.join('');
    }
    return hex;
  }

  HEXtoRGB(hex) {
    const hexValue = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
    return { r: hexValue >> 16, g: (hexValue & 0x00FF00) >> 8, b: (hexValue & 0x0000FF) };
  }

  HEXtoHSB(hex) {
    return this.RGBtoHSB(this.HEXtoRGB(hex));
  }

  RGBtoHSB(rgb) {
    const hsb = {
      h: 0,
      s: 0,
      b: 0
    };
    const min = Math.min(rgb.r, rgb.g, rgb.b);
    const max = Math.max(rgb.r, rgb.g, rgb.b);
    const delta = max - min;
    hsb.b = max;
    if (max !== 0) {

    }
    hsb.s = max !== 0 ? 255 * delta / max : 0;
    if (hsb.s !== 0) {
      if (rgb.r === max) {
        hsb.h = (rgb.g - rgb.b) / delta;
      } else if (rgb.g === max) {
        hsb.h = 2 + (rgb.b - rgb.r) / delta;
      } else {
        hsb.h = 4 + (rgb.r - rgb.g) / delta;
      }
    } else {
      hsb.h = -1;
    }
    hsb.h *= 60;
    if (hsb.h < 0) {
      hsb.h += 360;
    }
    hsb.s *= 100 / 255;
    hsb.b *= 100 / 255;
    return hsb;
  }

  HSBtoRGB(hsb) {
    let rgb = {
      r: null, g: null, b: null
    };
    let h = Math.round(hsb.h);
    const s = Math.round(hsb.s * 255 / 100);
    const v = Math.round(hsb.b * 255 / 100);
    if (s === 0) {
      rgb = {
        r: v,
        g: v,
        b: v
      };
    } else {
      const t1 = v;
      const t2 = (255 - s) * v / 255;
      const t3 = (t1 - t2) * (h % 60) / 60;
      if (h === 360) {
        h = 0;
      }
      if (h < 60) {
        rgb.r = t1; rgb.b = t2; rgb.g = t2 + t3;
      } else if (h < 120) {
        rgb.g = t1; rgb.b = t2; rgb.r = t1 - t3;
      } else if (h < 180) {
        rgb.g = t1; rgb.r = t2; rgb.b = t2 + t3;
      } else if (h < 240) {
        rgb.b = t1; rgb.r = t2; rgb.g = t1 - t3;
      } else if (h < 300) {
        rgb.b = t1; rgb.g = t2; rgb.r = t2 + t3;
      } else if (h < 360) {
        rgb.r = t1; rgb.g = t2; rgb.b = t1 - t3;
      } else {
        rgb.r = 0; rgb.g = 0; rgb.b = 0;
      }
    }
    return { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) };
  }

  RGBtoHEX(rgb) {
    const hex = [
      rgb.r.toString(16),
      rgb.g.toString(16),
      rgb.b.toString(16)
    ];

    for (const key in hex) {
      if (hex[key].length === 1) {
        hex[key] = '0' + hex[key];
      }
    }

    return hex.join('');
  }

  HSBtoHEX(hsb) {
    return this.RGBtoHEX(this.HSBtoRGB(hsb));
  }

  ngOnDestroy() {
    this.unbindDocumentClickListener();
  }
}

