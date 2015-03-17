;(function(exports) {
	'use strict';

	Backbone.LocusityRouter = Backbone.Router.extend({
		initialize: function() {
			var self = this;
			this.updateUser();

			$('#map').hide();
			this.left = document.querySelector('.left-content');
			this.right = document.querySelector('.right-content');
			this.username = document.querySelector('.username');
			this.meetups = document.querySelector('.meetups');


			this.infoSide = z(Backbone.FixedSide);
			React.render(this.infoSide, this.left);

			
			this.collectionExists = $.Deferred();
			this.getLocation().then(function(d) {
				this.point = d
				console.log(this.point)
				this.collection = new Backbone.Meetups()
				this.collection.latitude = this.point.latitude;
				this.collection.longitude = this.point.longitude;
				
				// debugger;
				this.collection.fetch().then(function(data) {
					this.collectionExists.resolve(this.collection);
					console.log('testing for user')
					console.log('this is the username' + this.isUser);

					// if (this.isUser) {
					// 	this.navigate('#chat', {trigger: true});
					// } else {
					// 	return;
					// }
					
				}.bind(this))
			}.bind(this))

			Backbone.history.start();
		},
		routes: {
			'chat': 'chatroom',
			'*default': 'home'
		},
		updateUser: function(){
			this.isUser = localStorage.getItem('username')
		},
		home: function() {
			this.updateUser()
			$('#map').hide();
			$('.meetups').hide();
			console.log('this is the home route');
			this.collectionExists.then(function(data) {
				if (this.isUser) {
					this.navigate('#chat', {trigger: true});
				} else {
					console.log(data)
					this.chatSide = z(Backbone.ChooseUserName);
					React.render(this.chatSide, this.username);
				}
				
			}.bind(this))
			
		},
		chatroom: function() {
			this.updateUser()
			if (!this.isUser) {
				console.log('if no username, input should come up')
				this.navigate('#home', {trigger: true, replace: true});
			} else {
				this.collectionExists.then(function(data) {
					
						this.meetupView = z(Backbone.MeetupsView, {collection: this.collection});

						$('.meetups').show()
						$('#map').show();

						this.getGoogleMap();
						React.render(this.meetupView, this.meetups);


				}.bind(this))
			}

		},
		getGoogleMap: function() {
			//probably create a cache for this whole map?
			this.meetMap = new GMaps({
					el: '#map',
					lat: this.collection.latitude,
					lng: this.collection.longitude,
					zoom: 9
			})

			this.collection.models.map(function(d, i, a) {
				// debugger;

				if(d.get('venue')) {
					this.lat = d.get('venue').lat;
					this.lng = d.get('venue').lon;

					this.meetMap.addMarker({
						lat: this.lat,
						lng: this.lng,
						title: 'Hi',
						infoWindow: {
							content: '<p>' + 'Hi' + '</p>'
						}
					})
				} else {
					return true;
				}
			}.bind(this))
		},
		getLocation: function() {
			var deferred = $.Deferred()
			function success(pos) {
				deferred.resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
			}
			function fail(error) {
				console.log(error.code + ': uh oh, that\'s not good');
			}

			navigator.geolocation.getCurrentPosition(success, fail);
			return deferred.promise();
		}
	});

	Backbone.aMeetup = Backbone.Model.extend({
		// url: function() {
		// 	return ['https://api.meetup.com/2/event/',
		// 	this.collection.id,
		// 	'?&sign=true&format=json&photo-host=public&page=1&',
		// 	'key=INSERT'].join('');
		// }
	});

	Backbone.Meetups = Backbone.Collection.extend({
		model: Backbone.aMeetup,
		url: function() {
			return ['https://api.meetup.com/2/open_events.json?callback=?&sign=true&photo-host=public&',
			'lat='+ this.latitude,
			'&topic=javascript,coding,ruby&',
			'lon='+ this.longitude,
			'&time=,2w&radius=35&page=10&',
			'key=INSERT'].join('')
			// return ['https://jsonp.nodejitsu.com/?url=https%3A%2F%2Fapi.meetup.com',
			// '%2F2%2Fopen_events%3F%26sign%3Dtrue%26format%3Djson%26photo-host%3Dpublic%',
			// '26lat%3D',this.latitude,
			// '%26topic%3Djavascript%2Ccoding%2Cruby%26',
			// 'lon%3D',this.longitude,
			// '%26time%3D%2C2w%26radius%3D35%26page%3D10%26',
			// 'key%3DINSERT'].join('');
		},
		parse: function(data) {
			return data.results;
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

	Backbone.ChooseUserName = React.createClass({
		displayName: 'ChooseUserName',
		_getUserName: function(e) {
			e.preventDefault();
			var name = React.findDOMNode(this.refs.username).value; //might need to store this username within the 'global' Backbone
			var form = document.querySelector('.username'); 
			// $('.username').addClass('disappear');

			var sessionName = localStorage.setItem('username', name)

			this.fillUser = $.Deferred()
			this.fillUser.resolve(sessionName)

			this.fillUser.then(function() {
				$('.username').hide();
				window.location.hash = '#chat'
			}.bind(this))
		},
		render: function() {
			return z('div.form-wrapper', [
				z('form.username', {onSubmit: this._getUserName}, [
					//need to regex
					z('input:text[required][placeholder=Choose a Username]@username')
					// z('button', 'START!')
				])
			])
		}
	})

	Backbone.MeetupsView = React.createClass({
		displayName: 'MeetupsView',
		render: function() {
			console.log(this.props);
			// debugger;

			// <p> content </p> = z('p', content)
			// tags without /
			// tags with /
			// <tag> grouping </tag>
			var each = this.props.collection.models;
			return z('div.meets', 
				each.map(function(data) {
					return z('div.'+data.get('id'), [
						z('div.meetName', data.get('name')),
						z('div.rsvp', data.get('yes_rsvp_count')),
						z('div.when', new Date(data.get('time'))),
						z('div.desc', [data.get('description')]),
						z('a[href='+data.get('event_url')+']', 'MORE INFO HERE')
					])
				})
			)
		}
	})


})(typeof module === 'object' ? module.exports: window);