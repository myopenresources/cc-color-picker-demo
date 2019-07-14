# angular版 二维码组件cc-color-picker

## 安装
npm install cc-color-picker --save 或 yarn add cc-color-picker

## 使用
```javascript
// 业务模块
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ColorPickerModule } from 'cc-color-picker';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ColorPickerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }



//业务html
<div>
  <cc-color-picker [(ngModel)]="selectColor"></cc-color-picker>
</div>

//业务组件
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {

  selectColor = '#00ff00';
}


```

## 参数
1. style: 样式<br>
2. styleClass: CSS<br>
3. inline:是否内联<br>
4. format:分别是：hex、hsb、rgb，默认hex<br>
5. disabled:是否可用<br>
6. tabindex:TAB键在控件中的移动顺序<br>
7. inputId:Input的id<br>
8. 可通过ngModel双向绑定
9. colorPickerChange:颜色改事件，返回颜色
