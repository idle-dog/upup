// 页面初始化

exports.init = function (selector, options) {
    new Vue({
        el: selector,
        data: function () {
            return {
                content: 'UPUP!',
                scale: 1,
                color: '#FC7D63'
            }
        },
        replace: false,
        template: __inline('index.html'),
        components: {
            'w-display': require('widget/display'),
            'w-bgcolor': require('widget/bgcolor'),
            'w-textarea': require('widget/textarea'),
            'w-toolbar': require('widget/toolbar')
        }
    });
};
