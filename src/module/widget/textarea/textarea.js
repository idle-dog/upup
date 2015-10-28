/**
 * 文本输入组件
 *
 * 功能描述：
 * 这里是一个textarea输入框
 * 无边框，有 1px 线条底纹
 * 有 placeholder 占位提示
 * 高度自适应
 * vue组件接收 外部参数 content 表示文本内容
 * 也支持外部传参定义 placeholder
 */

module.exports = Vue.extend({
    template: __inline('textarea.html'),
    props: {
	    content: String,
	    placeholder: {
	      type: String,
	      default: '输入举牌文字'
	    }
    }
});
