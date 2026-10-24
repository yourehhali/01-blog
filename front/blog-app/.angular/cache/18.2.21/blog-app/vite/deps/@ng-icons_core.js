import {
  DomSanitizer
} from "./chunk-VMJNS2QW.js";
import "./chunk-OQL2VC76.js";
import "./chunk-RXIH3XRO.js";
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding,
  Injectable,
  Input,
  NgModule,
  setClassMetadata,
  ɵɵStandaloneFeature,
  ɵɵdefineComponent,
  ɵɵdefineInjectable,
  ɵɵdefineInjector,
  ɵɵdefineNgModule,
  ɵɵdirectiveInject,
  ɵɵhostProperty,
  ɵɵinject,
  ɵɵsanitizeHtml,
  ɵɵstyleProp
} from "./chunk-IEEZZCAG.js";
import "./chunk-P6U2JBMQ.js";
import {
  __spreadValues
} from "./chunk-GOMI4DH3.js";

// node_modules/@ng-icons/core/fesm2020/ng-icons-core.mjs
var IconService = class _IconService {
  /** Access the icons in the class. */
  get icons() {
    return _IconService.icons;
  }
  /**
   * Insert icons into the iconset
   */
  static addIcons(icons) {
    _IconService.icons = __spreadValues(__spreadValues({}, _IconService.icons), icons);
  }
};
IconService.icons = {};
IconService.ɵfac = function IconService_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || IconService)();
};
IconService.ɵprov = ɵɵdefineInjectable({
  token: IconService,
  factory: IconService.ɵfac,
  providedIn: "root"
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(IconService, [{
    type: Injectable,
    args: [{
      providedIn: "root"
    }]
  }], null, null);
})();
function toUpperCamelCase(str) {
  return toCapitalCase(toPropertyName(str));
}
function toPropertyName(str) {
  return str.replace(/([^a-zA-Z0-9])+(.)?/g, (_, __, chr) => chr ? chr.toUpperCase() : "").replace(/[^a-zA-Z\d]/g, "").replace(/^([A-Z])/, (m) => m.toLowerCase());
}
function toCapitalCase(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}
var NgIconComponent = class {
  constructor(elementRef, sanitizer, iconService) {
    this.elementRef = elementRef;
    this.sanitizer = sanitizer;
    this.iconService = iconService;
    this._size = "1em";
  }
  /** Define the name of the icon to display */
  set name(name) {
    name = toUpperCamelCase(name);
    if (!this.iconService.icons.hasOwnProperty(name)) {
      console.warn(`No icon named ${name} was found. You may need to import it using the withIcons function.`);
      return;
    }
    this.template = this.sanitizer.bypassSecurityTrustHtml(this.iconService.icons[name]);
  }
  /** Define the size of the icon */
  set size(size) {
    this._size = coerceCssPixelValue(size);
  }
  get size() {
    return this._size;
  }
};
NgIconComponent.ɵfac = function NgIconComponent_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || NgIconComponent)(ɵɵdirectiveInject(ElementRef), ɵɵdirectiveInject(DomSanitizer), ɵɵdirectiveInject(IconService));
};
NgIconComponent.ɵcmp = ɵɵdefineComponent({
  type: NgIconComponent,
  selectors: [["ng-icon"]],
  hostVars: 7,
  hostBindings: function NgIconComponent_HostBindings(rf, ctx) {
    if (rf & 2) {
      ɵɵhostProperty("innerHTML", ctx.template, ɵɵsanitizeHtml);
      ɵɵstyleProp("--ng-icon__size", ctx.size)("--ng-icon__stroke-width", ctx.strokeWidth)("color", ctx.color);
    }
  },
  inputs: {
    name: "name",
    size: "size",
    strokeWidth: "strokeWidth",
    color: "color"
  },
  standalone: true,
  features: [ɵɵStandaloneFeature],
  decls: 0,
  vars: 0,
  template: function NgIconComponent_Template(rf, ctx) {
  },
  styles: ["[_nghost-%COMP%]{display:inline-block;width:var(--ng-icon__size);height:var(--ng-icon__size)}"],
  changeDetection: 0
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgIconComponent, [{
    type: Component,
    args: [{
      selector: "ng-icon",
      template: "",
      standalone: true,
      changeDetection: ChangeDetectionStrategy.OnPush,
      styles: [":host{display:inline-block;width:var(--ng-icon__size);height:var(--ng-icon__size)}\n"]
    }]
  }], function() {
    return [{
      type: ElementRef
    }, {
      type: DomSanitizer
    }, {
      type: IconService
    }];
  }, {
    name: [{
      type: Input
    }],
    template: [{
      type: HostBinding,
      args: ["innerHTML"]
    }],
    size: [{
      type: HostBinding,
      args: ["style.--ng-icon__size"]
    }, {
      type: Input
    }],
    strokeWidth: [{
      type: HostBinding,
      args: ["style.--ng-icon__stroke-width"]
    }, {
      type: Input
    }],
    color: [{
      type: HostBinding,
      args: ["style.color"]
    }, {
      type: Input
    }]
  });
})();
function coerceCssPixelValue(value) {
  if (value == null) {
    return "";
  }
  return /^\d+$/.test(value) ? `${value}px` : value;
}
var NG_ICON_DIRECTIVES = [NgIconComponent];
var NgIconsModule = class _NgIconsModule {
  constructor(iconService) {
    this.iconService = iconService;
    if (Object.keys(this.iconService.icons).length === 0) {
      throw new Error("No icons have been provided. Ensure to include some icons by importing them using NgIconsModule.withIcons({ ... }).");
    }
  }
  /**
   * Define the icons that will be included in the application. This allows unused icons to
   * be tree-shaken away to reduce bundle size
   * @param icons The object containing the required icons
   */
  static withIcons(icons) {
    IconService.addIcons(icons);
    return {
      ngModule: _NgIconsModule
    };
  }
};
NgIconsModule.ɵfac = function NgIconsModule_Factory(__ngFactoryType__) {
  return new (__ngFactoryType__ || NgIconsModule)(ɵɵinject(IconService));
};
NgIconsModule.ɵmod = ɵɵdefineNgModule({
  type: NgIconsModule,
  imports: [NgIconComponent],
  exports: [NgIconComponent]
});
NgIconsModule.ɵinj = ɵɵdefineInjector({
  imports: [NG_ICON_DIRECTIVES]
});
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(NgIconsModule, [{
    type: NgModule,
    args: [{
      imports: [NG_ICON_DIRECTIVES],
      exports: [NG_ICON_DIRECTIVES]
    }]
  }], function() {
    return [{
      type: IconService
    }];
  }, null);
})();
function provideIcons(icons) {
  IconService.addIcons(icons);
  return [];
}
export {
  NG_ICON_DIRECTIVES,
  NgIconComponent,
  NgIconsModule,
  provideIcons
};
//# sourceMappingURL=@ng-icons_core.js.map
