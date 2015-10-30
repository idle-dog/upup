// 举牌小人显示区
// 根据各种配置数据生成举牌小人图像
// TODO

var config = require('./config.js')

//指定宽高，创建canvas，返回context
function createCanvas(width, height) {
	var canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	var ctx = canvas.getContext('2d')
	ctx._width = width
	ctx._height = height
	return ctx
}

//分割图片，保存成数组
function splitImage(src, total) {
	var img = new Image()
	img.src = src
	console.log(img.complete)
	var ctx = createCanvas(img.width, img.height)
	ctx.drawImage(img, 0 ,0)

	var images = []
	for(var i = 0; i < total; i++) {
		var w = ctx._width / total 
		var h = ctx._height
		var data = ctx.getImageData(w * i, 0, w, h)
		var ctx2 = createCanvas(w, h)
		ctx2.putImageData(data, 0, 0)
		var img = new Image()
		img.src = ctx2.canvas.toDataURL()
		images.push(img)
	}
	return images
}


//转换数组，自定义pop方法：随机抛出一个元素，尽量不重复。
function popArray(array) {
	return {
		_array : array.slice(),
		_poped : [],
		pop : function() {
			if(!this._array.length) {
				this._array = this._poped.slice()
				this._poped = []
			}
			var i = Math.floor(Math.random() * this._array.length)
			var o = this._array.splice(i, 1)[0]
			this._poped.push(o)
			return o
		}
	}
}

var peopleImages =  popArray(splitImage(config.peopleImage, config.peopleTotal))
var brandImages = popArray(splitImage(config.brandImage, config.brandTotal))
var handImages = popArray(splitImage(config.handImage, config.handTotal))


function drawOneWrod(word) {
	var pImg = peopleImages.pop()
	var bImg = brandImages.pop()
	var hImg = handImages.pop()
	var w = config.singleWordWidth
	var h = config.singleWordHeight
	var ctx = createCanvas(w, h)

	ctx.drawImage(pImg, 0, 0, pImg.width, pImg.height, config.peopleOffsetX, config.peopleOffsetY, pImg.width, pImg.height)
	ctx.drawImage(bImg, 0, 0, bImg.width, bImg.height, config.brandOffsetX, config.brandOffsetY, bImg.width, bImg.height)
	ctx.drawImage(hImg, 0, 0, hImg.width, hImg.height, config.handOffsetX, config.handOffsetY, hImg.width, hImg.height)
	ctx.font = config.textStyle
	ctx.fillText(word, config.textOffsetX, config.textOffsetY)
	var img = new Image()
	img.src = ctx.canvas.toDataURL()
	return img
}

function drawAllWords(sentence) {
	var words = sentence.split('')
	var maxWidth = window.innerWidth
	var maxHeight = config.canvasHeight
	var w = config.singleWordWidth
	var h = config.singleWordHeight
	var x = config.singleWordOffsetX
	var y = config.singleWordOffsetY
	var ctx = createCanvas(maxWidth, maxHeight)
	//每行最多显示个数
	var maxNum = Math.floor((maxWidth + x) / (w + x))
	words.forEach(function(word, i) {
		var img = drawOneWrod(word)
		var col = i % maxNum
		var row = Math.floor(i / maxNum)
		ctx.drawImage(img, 0, 0, w, h, (w + x) * col, (h * row)  + (y * col), w, h)
	})
	var base64Data = ctx.canvas.toDataURL()
	return base64Data
}


module.exports = Vue.extend({
    template: __inline('display.html'),
    data : function() {
    	return {
	    	src : ''
    	}
    },
    props: [ 'content', 'scale', 'color' ],
    components: {
        'w-zoom': require('widget/zoom')
    },
    attached : function() {
    	this.draw()
    },
    watch: {
    	content: function(val, oldVal) {
    		this.setContent()
    	},

    	scale : function(val, oldVal) {
    		this.setScale()
    	},

    	color: function(val, oldVal) {
    		this.setColor()
    	}
    },

    methods : {
    	_draw : function() {
    		this.draw()
    	},
    	setContent: function() {

    	},
    	setColor : function() {

    	},
    	setScale : function() {

    	},

    	//对外方法
    	draw: function(content, scale, color) {
    		this.content = content || this.content
    		this.scale = scale || this.scale
    		this.color = color || this.color

    		console.log(this.content, this.scale, this.color)
    		this.src = drawAllWords(this.content)
    	}
    }
})

