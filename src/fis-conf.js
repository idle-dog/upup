// 基于FIS2

/**
 * 定义开发规范
 */
fis.config.set('roadmap.path', [
    {
        reg: '**.md',           // 所有md后缀的文件
        release: false          // 不发布
    }, {
        reg: 'map.json',        // fis默认生成的资源表文件
        release: false          // 不发布
    }, {
        reg: 'module/**.html',  // module目录下的html后缀文件
        release: false          // 不发布（在js中inline使用）
    }, {
        reg: '*.html',          // 根目录下的html后缀文件
        isPage: true,           // 添加 isPage:true 属性（打包插件中用到）
        isMod: true,            // 添加 isMod:true 属性（后处理插件中到）
        useCache: false         // 无缓存构建
    }, {
        reg: /^\/module\/([^\/]+)\/\1\.js$/,        // module目录下目录与文件同名的js文件
        isMod: true,                                // 添加 isMod:true 属性（后处理插件中到）
        id: '$1'                                    // 文件id为文件名（缩短id，方便编码）
    }, {
        reg: /^\/module\/(.*\/([^\/]+))\/\2\.js$/,  // 与上条规则相似，只是一条正则不方便实现
        isMod: true,
        id: '$1'
    }, {
        reg: /^\/module\/(.*\.(?:js|css))$/,        // module目录下的其他js、css文件
        isMod: true,                                // 添加 isMod:true 属性（后处理插件中到）
        id: '$1'                                    // 资源id是去掉module路径剩下的部分
    }
]);

// 在travis-ci上构建时添加 /upup 路径作为前缀
if(process.env.GH_PAGES_DEPLOY){
    fis.config.set('roadmap.domain', '/upup');
}

/**
 * 针对所有js文件，判断文件对象的isMod属性是否为true，
 * 如果为true，则包裹define，进行模块化封装
 */
fis.config.set('modules.postprocessor.js', function(content, file){
    if(file.isMod){
        content = "define('" + file.getId() + "', " + 
                  "function(require, exports, module){" + 
                  content + "})";
    }
    return content;
});

/**
 * 配置简单打包插件，按页面合并资源
 */
fis.config.set('modules.postpackager', function(ret, conf, settings, opt){
    for(var path in ret.src){
        var file = ret.src[path];
        if(file.isPage){
            pack(file, ret, opt);
        }
    }
});


/**
 * 合并多个资源
 */
function concat(path, res, pkg) {
    var file = fis.file(fis.project.getProjectPath(path));
    file.compiled = true;
    var content = [];
    res.forEach(function(file){
        content.push(file.getContent());
    });
    content = content.join((file.isJsLike ? ';' : '') + '\n');
    file.setContent(content);
    pkg[file.subpath] = file;
    return [ file ];
}

/**
 * 生成资源引用地址
 */
function genHTML(res, type, withHash, withDomain) {
    var left, right;
    if(type === 'js'){
        left = '<script src="';
        right = '"></script>';
    } else {
        left = '<link rel="stylesheet" href="';
        right = '"/>';
    }
    var html = '';
    res.forEach(function(file){
        html += left + file.getUrl(withHash, withDomain) + right + '\n';
    });
    return html;
}

/**
 * 以页面为单位进行打包合并
 */
function pack(file, ret, opt) {
    var depsJS = [];
    var depsCSS = [];
    var added = {};
    var collect = function(file){
        if(added[file.origin]) return;
        added[file.origin] = 1;
        file.requires.forEach(function(id){
            var f = ret.ids[id];
            if(f) collect(f);
        });
        if(file.isJsLike){
            depsJS.push(file);
        } else if(file.isCssLike){
            depsCSS.push(file);
        }
    };
    collect(file);
    if(opt.pack){
        depsJS = concat('pkg/aio.js', depsJS, ret.pkg);
        depsCSS = concat('pkg/aio.css', depsCSS, ret.pkg);
    }
    var scripts = genHTML(depsJS, 'js', opt.md5, opt.domain);
    var styles = genHTML(depsCSS, 'css', opt.md5, opt.domain);
    var content = file.getContent();
    content = content
                .replace(/<!--\s*scripts\s*-->\s*/, scripts)
                .replace(/<!--\s*styles\s*-->\s*/, styles);
    file.setContent(content);
}