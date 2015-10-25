// 举牌小人显示区
// 根据各种配置数据生成举牌小人图像
// TODO

module.exports = Vue.extend({
    template: __inline('display.html'),
    props: [ 'data' ],
    components: {
        'w-zoom': require('widget/zoom')
    }
});