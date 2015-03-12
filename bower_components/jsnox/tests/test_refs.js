var test = require('tape')
var React = require('react')
var d = require('..')(React)

var TestComponent = React.createClass({
    doSomething: function() {
        this.refs.el1.getDOMNode().value = 'test'
    },

    render: function() {
        return d('div', [
            d('input@el1'),
            d('input@el2'),
        ])
    }
})


// TODO: figure out how to test these refs
// test('Parses refs', function(t) {
// })
