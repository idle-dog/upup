// 背景色拾取组件
// TODO

module.exports = Vue.extend({
    template: __inline('bgcolor.html'),
    props: ['color'],
    data: function() {
        return {
            colors: [{
                rgb: '#E50012'
            }, {
                rgb: '#FC7D63'
            }, {
                rgb: '#F49EC0'
            }, {
                rgb: '#F6F08B'
            }, {
                rgb: '#C1D540'
            }, {
                rgb: '#60C3BA'
            }, {
                rgb: '#77CFF0'
            }, {
                rgb: '#980C7E'
            }, {
                rgb: '#FFFFFF'
            }]
        };
    },
    methods: {
        onSelect: function(event, selected) {
            if (this.color !== selected) {
                this.color = selected;
            }
        }
    }
});