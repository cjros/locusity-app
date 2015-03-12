var React = require('react')
var d = require('./index')(React)

// Simple benchmark for testing the effectiveness of memoization for JSnoX
// Usage: "time node bench.js", with and without the patch in question.
for (var i=0; i<10000; i++) {
    d('input:email.test.test2')
    d('div.foo')
    d('section.foo', { className: 'baz', id: 'asdf' })
}
console.log('done')
