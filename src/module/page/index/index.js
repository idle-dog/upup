module.exports = Vue.extend({
    template: __inline('index.html'),
    components: {
        'w-header': require('widget/header')
    }
});