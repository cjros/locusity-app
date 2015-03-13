;(function(exports) {
	'use strict';

	Backbone.LocusityRouter = Backbone.Router.extend({
		initialize: function() {
			this.left = document.querySelector('.left-content');
			this.right = document.querySelector('.right-content');

			this.stuff = z(Backbone.FixedSide);
			React.render(this.stuff, this.left);

			Backbone.history.start();
		},
		routes: {
			'*default': 'home'
		},
		home: function() {
			console.log('this is the home route');
		}
	});

	Backbone.Header = React.createClass({
		displayName: 'Header',
		render: function() {
			return z('header', [
					z('div.title', [
						z('h1', 'Locusity'),
						z('h6', 'Connect with those around you')
					])
				])
		}
	});

	Backbone.StaticContent = React.createClass({
		displayName: 'StaticContent',
		render: function() {
			var lorem = 'why can\'t i use lorem ipsom whatever whatever? it doesn\'t make any sense'+
				'i cannot deal with these right now Lorem ipsum dolor sit amet, consectetur' +
				'adipisicing elit, sed do eiusmod tempor incididunt ut labore et' +
				'dolore magna aliqua. Ut enim ad minim veniam';
			return z('div.static-wrapper', [
				z('span', 'should probably add a svg img there of a laptop or something'),
				z('div.info', lorem)
			])
		}
	});

	Backbone.Footer = React.createClass({
		displayName: 'Footer',
		render: function() {
			return z('nav', [
					z('ul', [
						z('li.about', 'Social Buttons'),
						z('li.contact', 'Contact'),
						z('li.techs', 'Tech Used')
					])
				])
		}
	});

	/*main view for the LEFT side*/
	Backbone.FixedSide = React.createClass({
		displayName: 'FixedSide',
		render: function() {
			return z('div.left-side', [
				z(Backbone.Header),
				z(Backbone.StaticContent),
				z(Backbone.Footer)
			])
		}
	});

	/*main view for the RIGHT side*/
	Backbone.ChatRoom = React.createClass({
		displayName: 'ChatRoom',
		render: function() {
			return 
		}
	});

	


})(typeof module === 'object' ? module.exports: window);