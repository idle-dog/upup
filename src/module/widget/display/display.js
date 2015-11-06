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

//缓存的单个小人绘制结果
var cacheSingleItems = []

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
            if (++loaded == urls.length) {
                cb(imgs)
            }
        }
        img.src    = url
    })
}

//保留透明通道, 避免直接使用putImageData方法
function mergeImageData(imgData1, imgData2, dx, dy) {
    var w1 = imgData1.width
    var w2 = imgData2.width
    var h2 = imgData2.height
    var d1 = imgData1.data
    var d2 = imgData2.data
    for (var y = dy; y < dy + h2; y++) {
        for (var x = dx; x < dx + w2; x++) {
            var i = (w1 * y + x) * 4
            var n = (w2 * (y - dy) + x - dx) * 4
            if (d2[n + 3] != 0) {
                if (d2[n + 3] == 255) {
                    d1[i]     = d2[n]
                    d1[i + 1] = d2[n + 1]
                    d1[i + 2] = d2[n + 2]
                    d1[i + 3] = d2[n + 3]
                } else {
                    //http://stackoverflow.com/questions/726549/algorithm-for-additive-color-mixing-for-rgb-values
                    var a1 = imgData1.data[i + 3] / 255
                    var a2 = imgData2.data[n + 3] / 255
                    var a  = 1 - (1 - a1) * (1 - a2)
                    if (a < 1.0e-6) return

                    d1[i]     = d2[n] * a2 / a + d1[i] * a1 * (1 - a2) / a
                    d1[i + 1] = d2[n + 1] * a2 / a + d1[i + 1] * a1 * (1 - a2) / a
                    d1[i + 2] = d2[n + 2] * a2 / a + d1[i + 2] * a1 * (1 - a2) / a
                    d1[i + 3] = a * 255
                }
            }
        }
    }
    return imgData1
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

//均分图片，保存成数组
function splitImage(img, total) {
    if (!img.width || !img.height) {
        console.error('无法读取图片宽高')
    }

    var ctx           = createCanvas(img.width, img.height)
    var imageDataList = []
    ctx.drawImage(img, 0, 0)
    for (var i = 0; i < total; i++) {
        var w    = ctx._width / total
        var h    = ctx._height
        var data = ctx.getImageData(w * i, 0, w, h)
        imageDataList.push(data)
    }
    return imageDataList
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
    var ctx = createCanvas(w, h)
    ctx.transform(0.766044, 0.242788, -0.742788, 0.766044, 34, -5)
    ctx.font         = config.textStyle
    ctx.textAlign    = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle    = config.textColor
    ctx.fillText(word, config.textOffsetX, config.textOffsetY)
    return ctx.getImageData(0, 0, w, h)
}

//绘制单个举牌子
function drawSingleItem(word) {
    var pData = peopleImages.pop()
    //牌子固定为一种，不随机变化
    var bData   = brandImages.array[config.brandIndex] || brandImages.pop()
    var hData   = handImages.pop()
    var w       = config.singleItemWidth
    var h       = config.singleItemHeight
    var ctx     = createCanvas(w, h)
    var tData   = drawText(word, bData.width, bData.height)
    var imgData = ctx.createImageData(w, h)

    //绘制小人
    mergeImageData(imgData, pData, config.peopleOffsetX, config.peopleOffsetY)
    //绘制牌子
    mergeImageData(imgData, bData, config.brandOffsetX, config.brandOffsetY)
    //绘制手
    mergeImageData(imgData, hData, config.handOffsetX, config.handOffsetY)
    //绘制文字
    mergeImageData(imgData, tData, config.brandOffsetX, config.brandOffsetY)

    return imgData
}

//绘制完整的content内容
function drawContent(content, scale, useCache) {
    var words = content.split('')
    var w     = Math.round(config.singleItemWidth * scale)
    var h     = Math.round(config.singleItemHeight * scale)
    var x     = Math.round(config.singleItemOffsetX * scale)
    var y     = Math.round(config.singleItemOffsetY * scale)
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
    //画布实际宽度
    var factWidth = Math.min(maxWidth, words.length * (w + x) - x)

    var ctx      = createCanvas(factWidth, maxHeight)
    var imgData1 = ctx.createImageData(factWidth, maxHeight)
    words.forEach(function (word, i) {
        var imgData2        = useCache ? cacheSingleItems[i] : drawSingleItem(word)
        cacheSingleItems[i] = imgData2
        imgData2            = makeScale(imgData2, scale, scale)
        var col             = i % maxNum
        var row             = Math.floor(i / maxNum)
        mergeImageData(imgData1, imgData2, (w + x) * col, (h * row) + (y * col))
    })
    return imgData1
}

//缩放imgData
function makeScale(imgData, scaleX, scaleY) {
    var ctx  = createCanvas(imgData.width, imgData.height)
    var ctx2 = createCanvas(imgData.width * scaleX, imgData.height * scaleY)
    ctx.putImageData(imgData, 0, 0)
    ctx2.scale(scaleX, scaleY)
    ctx2.drawImage(ctx.canvas, 0, 0)
    return ctx2.getImageData(0, 0, imgData.width * scaleX, imgData.height * scaleY)
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
            this.contentLayer = drawContent(this.content, val, true)
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
            var w   = this.contentLayer.width
            var h   = this.contentLayer.height
            var ctx = createCanvas(w, h)
            //绘制背景
            drawBackground(ctx, this.color)
            //绘制内容
            var imgData = mergeImageData(ctx.getImageData(0, 0, w, h), this.contentLayer, 0, 0)
            ctx.putImageData(imgData, 0, 0)
            this.src = ctx.canvas.toDataURL()
        }
    }
})

