// 工具条组件, 用于保存和分享功能
// TODO

module.exports = Vue.extend({
    template: __inline('toolbar.html'),
    methods: {
        onSave: function(){
            alert('保存')
        },
        onShare: function(){
            alert('分享')
        }
    }
});