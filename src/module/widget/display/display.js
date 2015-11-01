// 举牌小人显示区
// 根据各种配置数据生成举牌小人图像

//配置文件
var config = require('./config.js')
//小人图片数组
var peopleImages = null
//牌子图片
var brandImages = null
//手掌图片
var handImages = null

//资源图片准备完毕
function resourceReady(cb) {
    loadImages([config.peopleImage, config.brandImage, config.handImage], function (imgs) {
        peopleImages = getRandomPopArray(splitImage(imgs[0], config.peopleTotal))
        brandImages  = getRandomPopArray(splitImage(imgs[1], config.brandTotal))
        handImages   = getRandomPopArray(splitImage(imgs[2], config.handTotal))
        cb()
    })
}

//载入图片
function loadImages(urls, cb) {
    var loaded = 0
    var imgs   = []
    urls.forEach(function (url, i) {
        var img    = new Image()
        img.onload = function () {
            imgs[i] = img
            loaded++
            if (loaded == urls.length) {
                cb(imgs)
            }
        }
        img.src    = url
    })
}

//指定宽高，创建canvas，返回context
function createCanvas(width, height) {
    var canvas    = document.createElement('canvas')
    canvas.width  = width
    canvas.height = height
    var ctx       = canvas.getContext('2d')
    ctx._width    = width
    ctx._height   = height
    return ctx
}

//从context获取图片
function getCanvasImage(ctx) {
    var img     = new Image()
    img._width  = ctx._width
    img._height = ctx._height
    img.src     = ctx.canvas.toDataURL("image/png", 1.0)
    return img
}

//均分图片，保存成数组
function splitImage(img, total) {
    if (!img.width || !img.height) {
        console.error('无法读取图片宽高')
    }

    var ctx    = createCanvas(img.width, img.height)
    var images = []
    ctx.drawImage(img, 0, 0)
    for (var i = 0; i < total; i++) {
        var w    = ctx._width / total
        var h    = ctx._height
        var data = ctx.getImageData(w * i, 0, w, h)
        var ctx2 = createCanvas(w, h)
        ctx2.putImageData(data, 0, 0)
        images.push(getCanvasImage(ctx2))
    }
    return images
}


//转换数组，自定义pop方法：随机抛出一个元素，尽量不重复。
function getRandomPopArray(array) {
    return {
        array   : array,
        _unpoped: array.slice(),
        _poped  : [],
        pop     : function () {
            if (!this._unpoped.length) {
                this._unpoped = this.array.slice()
                this._poped   = []
            }
            var i = Math.floor(Math.random() * this._unpoped.length)
            var o = this._unpoped.splice(i, 1)[0]
            this._poped.push(o)
            return o
        }
    }
}

//绘制单个文字
function drawText(word, w, h) {
    var ctx          = createCanvas(w, h)
    ctx.transform(0.766044, 0.242788, -0.742788, 0.766044, 34, -5)
    ctx.font         = config.textStyle
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle    = config.textColor
    ctx.fillText(word, config.textOffsetX, config.textOffsetY)
    var img          = getCanvasImage(ctx)
    return img
}

//绘制单个举牌子
function drawSingleItem(word, scale) {
    var pImg = peopleImages.pop()
    //牌子固定为一种，不随机变化
    var bImg = brandImages.array[config.brandIndex] || brandImages.pop()
    var hImg = handImages.pop()
    var w    = config.singleItemWidth * scale
    var h    = config.singleItemHeight * scale
    var ctx  = createCanvas(w, h)
    var tImg = drawText(word, bImg._width, bImg._height)

    ctx.scale(scale, scale)
    //绘制小人
    ctx.drawImage(pImg, 0, 0, pImg._width, pImg._height, config.peopleOffsetX, config.peopleOffsetY, pImg._width, pImg._height)
    //绘制牌子
    ctx.drawImage(bImg, 0, 0, bImg._width, bImg._height, config.brandOffsetX, config.brandOffsetY, bImg._width, bImg._height)
    //绘制手
    ctx.drawImage(hImg, 0, 0, hImg._width, hImg._height, config.handOffsetX, config.handOffsetY, hImg._width, hImg._height)
    //绘制文字
    ctx.drawImage(tImg, 0, 0, bImg._width, bImg._height, config.brandOffsetX, config.brandOffsetY, bImg._width, bImg._height)
    return ctx
}

//绘制完整的content内容
function drawContent(content, scale) {
    var words = content.split('')
    var w     = config.singleItemWidth * scale
    var h     = config.singleItemHeight * scale
    var x     = config.singleItemOffsetX * scale
    var y     = config.singleItemOffsetY * scale
    //画布最大宽度
    var maxWidth = window.innerWidth
    //每行最多显示个数
    var maxNum = Math.floor((maxWidth + x) / (w + x))
    //最后一行高度
    var lastLineHeight = (words.length % maxNum == 0) ? 0 : h + (words.length % maxNum - 1) * y
    //完整一行偏移量总和
    var addedHeight = (maxNum - 1) * y
    //画布最大高度
    var maxHeight = Math.floor((words.length / maxNum)) * h + Math.max(lastLineHeight, addedHeight)

    var ctx = createCanvas(maxWidth, maxHeight)
    words.forEach(function (word, i) {
        var img    = getCanvasImage(drawSingleItem(word, scale))
        var col    = i % maxNum
        var row    = Math.floor(i / maxNum)
        img.onload = function () {
            ctx.drawImage(img, 0, 0, w, h, (w + x) * col, (h * row) + (y * col), w, h)
        }
    })
    return ctx
}

//绘制背景
function drawBackground(ctx, color) {
    ctx.fillStyle = color
    ctx.fillRect(0, 0, ctx._width, ctx._height)
    return ctx
}

module.exports = Vue.extend({
    template  : __inline('display.html'),
    data      : function () {
        return {
            src         : '',
            contentLayer: ''
        }
    },
    props     : ['content', 'scale', 'color'],
    components: {
        'w-zoom': require('widget/zoom')
    },
    ready     : function () {
        var self = this
        resourceReady(function () {
            self.contentLayer = drawContent(self.content, self.scale)
            self.draw()
        })
    },
    watch     : {
        content: function (val, oldVal) {
            this.contentLayer = drawContent(val, this.scale)
            this.draw()
        },
        scale  : function (val, oldVal) {
            this.contentLayer = drawContent(this.content, val)
            this.draw()
        },
        color  : function (val, oldVal) {
            this.draw()
        }
    },

    methods: {
        refresh: function () {
            this.contentLayer = drawContent(this.content, this.scale)
            this.draw()
        },
        draw   : function () {
            var self = this
            var ctx  = createCanvas(this.contentLayer._width, this.contentLayer._height)
            //绘制背景
            drawBackground(ctx, this.color)
            //绘制内容， 需要内容图片加载完成之后调用drawImage，否则可能无法绘制上
            var contentImage    = getCanvasImage(this.contentLayer)
            contentImage.onload = function () {
                ctx.drawImage(getCanvasImage(self.contentLayer), 0, 0)
                self.src = ctx.canvas.toDataURL()
            }
        }
    }
})

