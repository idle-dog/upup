/**
 * 缩放组件
 *
 * 功能描述：
 * 点击放大缩小图标，滑块跟随变化
 * 缩放滑块移动要有过渡
 * vue组件接收 外部参数 scale 表示缩放等级，max 表示最大缩放值，min 表示最小缩放值，step 表示步长
 * 默认缩放值(scale)为1，最小级别(min)为0.1，最大级别(max)为2，步长(step)为0.2
 */
module.exports = Vue.extend({
    template: __inline('zoom.html'),
    props: {
        scale: {
            type: Number,
            default: 0.1
        },
        min: {
            type: Number,
            default: 0.1
        },
        max: {
            type: Number,
            default: 2
        },
        step: {
            type: Number,
            default: 0.2
        }
    },
    data: function () {
        return {
            top: '50%'
        }
    },
    computed: {
        top: {
            get: function () {
                return (1 - (this.scale - this.min) / (this.max - this.min)) * 100 + '%';
            }
        }
    },
    methods: {
        zoomUp: function () {   // 放大
            this.scale + this.step <= this.max && (this.scale = (this.scale * 100 + this.step * 100) / 100);
        },
        zoomDown: function () { // 缩小
            this.scale - this.step >= this.min && (this.scale = (this.scale * 100 - this.step * 100) / 100);
        }
    }
});
