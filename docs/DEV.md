# 开发规范

描述项目各种规范

## 技术选型

* 构建工具: [fis2](http://fex-team.github.io/fis-site/)
* 模块化规范: [CommonJS Modules/1.0](http://wiki.commonjs.org/wiki/Modules/1.0)
* 模块化框架: [md.js](https://github.com/fouber/md.js)
* 组件化框架: [vue.js](http://vuejs.org/)
* 资源管理方案: 在 ``fis-conf.js`` 中实现的以页面为单位简单打包

## 目录结构

```bash
src
  ├─ module         # 模块化资源
  │  ├─ common        # 公共模块
  │  ├─ widget        # UI组件
  │  └─ page          # 页面组件
  ├─ lib            # 第三方lib
  │  ├─ md.js         # 模块化框架, https://github.com/fouber/md.js
  │  └─ vue.js        # 组件化框架, http://vuejs.org/
  ├─ index.html     # 首页
  └─ fis-conf.js    # fis2构建配置
```

目录说明:

* ``module`` 目录用于存放模块化资源, 每个模块一个目录, 其中维护模块所需的 js, css, html 以及 图片 等资源
* ``module/common`` 目录存放公共模块, 比如 ``store``, ``ajax``, ``grid`` 等
* ``module/widget`` 目录用于存放UI组件, 比如 ``header``, ``footer`` 等
* ``module/page`` 目录用于存放页面组件, 比如 ``index`` , 可在其中组合 ``module/widget`` 目录下的UI组件
* ``lib`` 目录用于存放第三方lib库或框架, 比如 ``vue.js``

## 规范描述

* 所有 ``md`` 后缀的文件(比如README.md), 不发布
* ``module`` 目录下的html文件不发布, 用于在模块的js中内嵌(inline)使用
* ``module`` 目录下的js和css文件为模块化资源, js文件根据 commonjs 规范进行编码, 构建后会自动包裹 ``define`` 进行模块化封装

## 模块化开发

在 ``module`` 目录下的js和css为模块化资源, 彼此可以相互引用, 其方法为:

* 在js中引用其他js或css模块

    ```js
    /*
     * 在单行或多行注释中使用 @require 来引用资源:
     * 
     * @require path/to/bar.css
     */
    
    // 使用 require 函数引用js模块
    var foo = require('path/to/foo.js');
    ```

* 在css中引用其他css模块

    ```css
    /*
     * 在多行注释中使用 @require 来引用资源:
     * 
     * @require path/to/bar.css
     */
    ```

资源之间通过以上依赖声明标识建立依赖关系, 构建工具会自动识别这些标识, 并根据依赖关系进行资源合并打包.

除了显示的声明依赖之外, 工具还会将同名文件自动建立依赖, 比如 ``index.js`` 文件的同级目录下存在 ``index.css`` 文件, 那么, 你无须在 index.js 中声明对 index.css 的依赖, 系统会自动建立这个关系.

## 模块id

在模块化开发中, 通过js中的 ``require(id|path)`` 函数或注释中的 ``@require id|path`` 标识可以标记对资源的引用, 其参数可以是资源id或资源路径.

资源路径支持相对路径或绝对路径定位资源, 相对路径是相对当前文件, 绝对路径是相对项目根目录, 在本项目中, 根目录为 ``src`` 目录

模块id可以通过如下示例来了解其规则:

|文件路径|模块id|
|-------|-----|
|module/foo.js|foo.js|
|module/foo.css|foo.css|
|module/foo/foo.js|foo|
|module/foo/foo.css|foo/foo.css|
|module/foo/bar/bar.js|foo/bar|
|module/foo/bar/bar.css|foo/bar/bar.css|
|module/foo/bar/a.js|foo/bar/a.js|

总之, 除了文件名与目录名相同的js文件有缩短id之外, 其他资源的id都是去掉 module 之后的文件路径.

## 组件化开发

当前项目采用 [vue.js](http://vuejs.org/) 作为组件化框架, 根据 vue 的 [组件化设计](http://vuejs.org/guide/components.html), 我们通常这样定义一个组件:

1. 假设我们在开发一个header的UI组件, 根据目录结构说明, 我们需要在 ``module/widget`` 目录下新建 ``header`` 目录, 然后创建组件模板文件 ``module/widget/header/header.html``, 其内容大致为:

    ```html
    <div class="w-header">
        <h1>{{title}}</h1>
        <button v-on="click: onClick">菜单</button>
    </div>
    ```

1. 然后我们创建 ``module/widget/header/header.js`` 来使用该模板:

    ```js
    // 将组件封装为vue的类
    module.exports = Vue.extend({
        // 利用fis的__inline标识内嵌模板
        template: __inline('header.html'),
        // 组件接收 title 参数, 作为当前scope下的数据
        props: [ 'title' ],
        // 定义一些方法与模板中的v-on事件绑定
        methods: {
            onClick: function(){
                alert('It works!');
            }
        }
    });
    ```

1. 接下来也可以创建 ``module/widget/header/header.css`` 来定义组件样式:

    ```css
    .w-header {
        color: red;
    }
    ```

1. OK, 组件开发完成, 我们需要在页面组件中使用这个UI组件. 我们会在 ``module/page/index/index.js`` 文件中这样使用:

    ```js
    // 页面组件也继承自Vue
    module.exports = Vue.extend({
        // 使用模板
        template: __inline('index.html'),
        components: {
            // 将header组件注册到当前容器中
            'w-header': require('widget/header')
        }
    });
    ```

1. 利用 vue 的 ``components`` 属性再结合模块化框架的require函数,即可将组件注册到 ``page/index`` 组件的模板中使用:

    ```html
    <div class="p-index">
        <w-header title="举牌小人"></w-header>
    </div>
    ```

## 组件化拆分与CSS选择器命名

组件化拆分以 ``BEM`` 作为标准, 所有可独立运行的UI组件均平级存放在 ``module/widget`` 目录下, 每个UI组件内最外层都应该有一层元素包裹, 其class命名为 ``w-组件名``, 其中的 元素(BEM中的E, Element)应以 ``w-组件名`` 为前缀, 比如:

```css
.w-header { ... }
.w-header_title { ... }
.w-header_menu { ... }
```

对应的HTML内容为:

```html
<div class="w-header">
    <h1 class="w-header_title">{{title}}</h1>
    <button class="w-header_menu">菜单</button>
</div>
```

可能大家会有疑问, 什么不这样写呢:

```css
.w-header { ... }
.w-header .title { ... }
.w-header .menu { ... }
```

因为组件与组件是会相互组合使用的, 如果在 .w-header 中有 .title 的定义, 如果header组件组合了其他组件也有自定义的 .title 元素, 其样式就会相互影响.