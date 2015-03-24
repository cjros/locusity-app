;(function(exports) {
	'use strict';

	Backbone.LocusityRouter = Backbone.Router.extend({
		initialize: function() {
			var self = this;
			this.updateUser();

			$('#map').hide();
			$('.meetup-detail').hide();
			this.left = document.querySelector('.left-content');
			this.right = document.querySelector('.right-content');
			this.username = document.querySelector('.username');
			this.meetups = document.querySelector('.meetups');
			this.actions = document.querySelector('.actions');
			this.meetupDetail = document.querySelector('.meetup-detail');


			this.infoSide = z(Backbone.FixedSide);
			React.render(this.infoSide, this.left);

			
			this.collectionExists = $.Deferred();
			this.getLocation().then(function(d) {
				this.point = d
				// console.log(this.point)
				// this.model = new Backbone.aMeetup();
				// console.log(this.model)
				this.collection = new Backbone.Meetups()
				this.collection.latitude = this.point.latitude;
				this.collection.longitude = this.point.longitude;
				
				this.collection.fetch().then(function(data) {
					this.collectionExists.resolve(this.collection);
					// console.log('testing for user')
					// console.log('this is the username: ' + this.isUser);
					
				}.bind(this))
			}.bind(this))

			Backbone.history.start();
		},
		routes: {
			'details/:event_id': 'details',
			'chat': 'chatroom',
			'*default': 'home'
		},
		updateUser: function(){
			this.isUser = localStorage.getItem('username')
		},
		runPubNub: function() {
			this.updateUser();
			var self = this;

			Backbone.bind('chatting', function(data){
				console.log(data.chat)
				send(data.chat);
			})
			

			this.pubnub = PUBNUB.init({
                publish_key: 'pub-c-28310c24-9919-4f88-9bc3-817089853ade',
				subscribe_key: 'sub-c-db7a32e2-c8ea-11e4-9356-02ee2ddab7fe',
	        });

	        this.pubnub.time(
                function(time) {
                    console.log(time)
                }
            );

	        function chatRange(coord, resolution) {
		        var rez = Math.pow( 10, resolution || 0 );
		        return Math.floor(coord * rez) / rez;
		    }

		    function safe_text(text) {
                return ('' + text).replace(/[<>]/g, '');
            }

            function showMessage(text) {
            	update.innerHTML += '<p class="aMsg">' + '<span class="bolduser">' +username + '</span>' + ': ' + safe_text(text) + '</p>';
            }

            function receive(data) {
            	console.log(data)
            	showMessage(data)
            }

			var username = this.isUser,
				// chatbox = this.pubnub.$('.username-box'),
				update = document.querySelector('.core'),
				channel = 'locusity',
				chatarea = chatRange(this.point.latitude, 1) + '' + chatRange(this.point.longitude, 1);

				console.log(username)
				
				this.pubnub.subscribe({
	                channel: chatarea,
	                message: receive
	            });				

				function send(text) {
	                self.pubnub.publish({
	                	sender_id: username,
	                    channel: chatarea,
	                    message: text
	                });
            }

			document.querySelector('.headline').innerHTML = this.pubnub.supplant(
		    	'Connected to the {channel} channel as {sender_id}', {sender_id: username, channel: channel})
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
					// console.log(data)
					this.chatSide = z(Backbone.ChooseUserName);
					React.render(this.chatSide, this.username);
				}
				
			}.bind(this))
			
		},
		chatroom: function() {
			$('.meetup-detail').hide();
			$('.main').removeClass('dim');
			$('.main').removeClass('noclicks');
			this.updateUser()
			if (!this.isUser) {
				// console.log('if no username, input should come up')
				this.navigate('#home', {trigger: true, replace: true});
			} else {
				this.collectionExists.then(function(data) {
						// console.log(data)
						this.meetupView = z(Backbone.MeetupsView, {collection: this.collection});
						this.chatView = z(Backbone.ChatView);
						this.shiftView = z(Backbone.ShiftContent);

						$('.meetups').show()
						$('#map').show();

						if (!this.meetMap) this.getGoogleMap();
						React.render(this.shiftView, this.left);
						React.render(this.meetupView, this.meetups);
						// React.render(this.chatView, this.actions);

						//starting a pubnub chatroom instance;
						if (!this.pubnub) this.runPubNub();

				}.bind(this))
			}

		},
		details: function(event_id) {
			this.updateUser();
			if (!this.isUser) {
				this.navigate('#home', {trigger: true});
			} else {
				// console.log('this should show details of the event');
				this.collectionExists.then(function(data) {

					//create promise to check if any of these things already exist
					this.meetupView = z(Backbone.MeetupsView, {collection: this.collection});
					this.chatView = z(Backbone.ChatView);
					this.shiftView = z(Backbone.ShiftContent);

					$('.meetups').show()
					$('#map').show();

					if (!this.meetMap) this.getGoogleMap();
					React.render(this.shiftView, this.left);
					React.render(this.meetupView, this.meetups);
					// React.render(this.chatView, this.actions);

					//starting a pubnub chatroom instance;
					if (!this.pubnub) this.runPubNub();
					//end of the promise check


					this.detailView = z(Backbone.MeetupDetail, { collection: this.collection });
					React.render(this.detailView, this.meetupDetail);
				}.bind(this))
			}
			
			
		},
		getGoogleMap: function() {
			//probably create a cache for this whole map?
			this.meetMap = new GMaps({
					el: '#map',
					lat: this.collection.latitude,
					lng: this.collection.longitude,
					zoom: 10
			})

			this.collection.models.map(function(d, i, a) {
				// debugger;

				if(d.get('venue')) {
					this.lat = d.get('venue').lat;
					this.lng = d.get('venue').lon;

					this.meetMap.addMarker({
						lat: this.lat,
						lng: this.lng,
						title: d.get('name'),
						infoWindow: {
							content: '<p style="font-weight: bold;">' + d.get('name') + '</p>' +
								'<p> Event held at: ' + d.get('venue').name + '</p>' +
								'<p>Date and Time: ' + new Date(d.get('time')) + '</p>'
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
				alert('Is your internet enabled? Please try again!\n' +
					'Did you block your location? Please re-enable your location to use this app!\n'+
					'\nThank you!');
			}

			navigator.geolocation.getCurrentPosition(success, fail);
			return deferred.promise();
		}
	});

	Backbone.aMeetup = Backbone.Model.extend({
		parse: function(data) {
			// console.log(data)
			$.getJSON(
				['https://api.meetup.com/2/groups.json?callback=?&sign=true&photo-host=public&group_id=',
				data.group.id,
				'&page=10&key=2963568336371205b3948793023157b'
				].join(''))
			.then(function(moreData) {
				console.log(moreData)
				data.group = moreData.results[0] //overwriting the collection's group object with this fetch. 
				console.log(data.group)
			})
			return data
		}
	});

	Backbone.Meetups = Backbone.Collection.extend({
		model: Backbone.aMeetup,
		url: function() {
			return ['https://api.meetup.com/2/open_events.json?callback=?&sign=true&photo-host=public&',
			'lat='+ this.latitude,
			'&topic=javascript,coding,ruby&',
			'lon='+ this.longitude,
			'&time=,2w&radius=35&page=10&',
			'key=2963568336371205b3948793023157b'].join('')
		},
		parse: function(data) {
			data = data.results;
			// debugger;
			
			return data
		}
	});

	Backbone.Header = React.createClass({
		displayName: 'Header',
		render: function() {
			return z('header', [
					z('div.title', [
						z('h1', 'Locusity'),
						z('h6', 'Connect and meet with those around you')
					])
				])
		}
	});

	Backbone.StaticContent = React.createClass({
		displayName: 'StaticContent',
		render: function() {
			return z('div.static-wrapper', [
				z('div.features', [
					z('h3', {key: 1}, 'Immediately chat and quickly plan'),
					z('div.chatplan', 'No need to sign up! Just pick a username and your are taken straight to the chatroom that uses your current location'),
					z('h3', {key: 2}, 'Interested in meetups?'),
					z('div.meetup-info', 'This app also uses meetups.com\'s API to allow you to see upcoming events that are also around your current location'),
					z('h3', {key: 3}, 'Connect with others that are interested too!'),
					z('div.connectothers', 'Use the chatroom to your advantage! Talk to others about those events and quickly find those with similar interests as yours!')
				])
			])
		}
	});

	Backbone.ShiftContent = React.createClass({
		display: 'ShiftContent',
		render: function() {
			return z('div.shift-wrapper', [
				z(Backbone.Header),
				z(Backbone.ChatView),
				z(Backbone.Footer)
			])
		}
	})

	Backbone.Footer = React.createClass({
		displayName: 'Footer',
		render: function() {
			return z('nav', [
					z('ul', [
						z('a.source[href=http://github.com/cjros/locusity-app/]', ' GitHub Source Code'),
						z('a.contact[href=mailto:clor09@gmail.com]', 'Bugs or suggestions? Let me know please!')
						// z('li.techs', 'Tech Used')
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
					z('input:text.username-box[required][placeholder=Choose a Username]@username')
					// z('button', 'START!')
				])
			])
		}
	})

	Backbone.ChatView = React.createClass({
		displayName: 'ChatView',
		_sendText: function(e) {
			e.preventDefault();
			var form = document.querySelector('.textbox'),
				form_val = React.findDOMNode(this.refs.chatMessage).value;
			
			form.reset();
			Backbone.trigger('chatting', {chat: form_val})
		},
		render: function() {
			return z('div.chat-wrapper', [
				z('div.headline'),
				z('div.core'),
				z('div.users'),
				z('div.actions', [
					z('form.textbox', {onSubmit: this._sendText}, [
						z('input:text.sendmsg[placeholder=SEND A MSG!][maxlength=140]@chatMessage')
					])
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
					console.log(data)
					return z('div.'+data.get('id'), [
						z('div.meetName', [
							z('a[href=#details/'+ data.get('id') + ']', {key: data.get('id')}, data.get('name'))
						]),
						// z('img[src='+ data.get('group').)
						z('div.rsvp', data.get('yes_rsvp_count')),
						z('div.when', new Date(data.get('time'))),
						z('div.desc', [data.get('description')]),
						z('a[href='+data.get('event_url')+']', 'MORE INFO HERE')
					])
				})
			)
		}
	})

	Backbone.MeetupDetail = React.createClass({
		display: 'MeetupDetail',
		_close: function(e) {
			e.preventDefault();
			$('.meetup-detail').hide();
			$('.main').removeClass('dim');
			$('.main').removeClass('noclicks');

			window.location.hash = '#chat';
		},
		render: function() {
			$('.meetup-detail').show();
			$('.main').addClass('dim');
			$('.main').addClass('noclicks');
			console.log(this.props);
			return z('div.lightbox', [
				z('h4.detail-title', this.props.collection.models[0].get('name')),
				z('button', {onClick: this._close}, 'X')
			])
		}
	})


})(typeof module === 'object' ? module.exports: window);