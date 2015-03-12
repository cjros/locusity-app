;(function(exports){

    "use strict";

    exports.TemplateView = function createTemplateView(backboneOrParse, _, $){
        return backboneOrParse.View.extend({
            cache: {},
            stream: function(url) {
                var x = $.Deferred();
                if (this.cache[url]) {
                    x.resolve(this.cache[url]);
                } else {
                    $.get(url).then((function(d) {
                        this.cache[url] = _.template(d);
                        x.resolve(_.template(d));
                    }).bind(this));
                }
                return x;
            },
            loadTemplate: function(name) {
                return this.stream('./Templates/' + name + '.html');
            },
            initialize: function(options) {
                this.options = options || {};

                this.model && this.model.on("change", this.render.bind(this));
                this.collection && this.collection.on("sync", this.render.bind(this));
            },
            render: function() {
                var self = this;
                this.loadTemplate(this.options.view || this.view).then(function(fn) {
                    var d = self.model || self.collection;
                    self.el.innerHTML = fn({
                        data: d
                    });
                })
            }
        })
    }

    if(typeof module !== "object"){
        (window.Parse || window.Backbone)["TemplateView"] = TemplateView(window.Parse || window.Backbone, _, $)
    }

})(typeof module === "object" ? module.exports : window);