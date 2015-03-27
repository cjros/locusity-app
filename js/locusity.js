;(function(exports) {
	'use strict';

	Backbone.LocusityRouter = Backbone.Router.extend({
		initialize: function() {
			var self = this;
			this.updateUser();

			$('#map').hide();
			$('.meetsign').hide();
			$('.meetups').hide();
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
				// console.log(data.chat)
				// console.log(username)
				send({name: username, msg: data.chat});
			})
			

			this.pubnub = PUBNUB.init({
                publish_key: 'pub-c-28310c24-9919-4f88-9bc3-817089853ade',
				subscribe_key: 'sub-c-db7a32e2-c8ea-11e4-9356-02ee2ddab7fe',
				uuid: this.isUser
	        });

	        this.pubnub.time(
                function(time) {
                    // console.log(time)
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
            	// console.log(text);
            	update.innerHTML += '<p class="aMsg">' + '<span class="bolduser">' + text.name+ '</span>' + ': ' + text.msg + '</p>';
            	update.scrollTop = update.scrollHeight; //scrolls div to the latest message!
            }

            function receive(data) {
            	// console.log(data)
            	showMessage(data)
            }

			var username = this.isUser,
				// chatbox = this.pubnub.$('.username-box'),
				update = document.querySelector('.chatPlace'),
				channel = 'locusity',
				userList = document.querySelector('.users'),
				users_here = 0,
				chatarea = chatRange(this.point.latitude, 1) + '' + chatRange(this.point.longitude, 1);

				// this.pubnub.state({
				//    channel  : chatarea,
				//    state    : { "aUser": username },
				//    callback : function(m){console.log(m)},
				//    error    : function(m){console.log(m)}
				// });

				this.pubnub.here_now({
				    channel : chatarea,
				    // state: true,
				    callback : function(m){
				    	// console.log(m)
				    }
				 });
				
				this.pubnub.subscribe({
	                channel: chatarea,
	                message: receive,
	                state: {
					  uuid: username,
					  timestamp: new Date()
					},
	                presence: function(m) {
	                	// console.log(m)
	                	if (m.action !== 'join') {
	                		users_here--;
	                		// console.log(users_here);
	                		document.querySelector('.'+m.uuid).remove();
	                		$('.users').html('<span>' + users_here + ' user(s)</span>');
	                		// return;
	                	} else {
	                		users_here++;
	                		// console.log(users_here);
	                		update.innerHTML += '<p class="anEvent">' + '<span class="bolduser">' + m.uuid+ '</span> has '  + m.action + 'ed the channel</p>';
							$('.users').html('<span>' + m.occupancy + ' user(s)</span>');
							document.querySelector('.userList').innerHTML += '<span class="' + m.uuid + '">' + m.uuid + '</span>';
	                	}
						
						
						// $('.userList').html('<span class="' + m.uuid + '"</span>' + m.uuid + '<br>');

					}

					
	            });				

				// window.addEventListener('onclose', function(e) {
				// 	if (this.pubnub) {
				// 		this.pubnub.unsubscribe({
				// 			channel: chatarea,
				// 			uuid: username
				// 		})
				// 	}
				// })

				function send(text) {
	                self.pubnub.publish({
	                    channel: chatarea,
	                    // sender_id: username,
	                    message: text
	                });
            }

			document.querySelector('.headline').innerHTML = this.pubnub.supplant(
		    	'Connected as {sender_id}', {sender_id: username })
		},
		home: function() {
			this.updateUser()

			$('#map').hide();
			$('.meetups').hide();
			// console.log('this is the home route');
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

						$('.meetsign').show();
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
					$('.meetsign').show();
					$('.meetups').show()
					$('#map').show();

					if (!this.meetMap) this.getGoogleMap();
					React.render(this.shiftView, this.left);
					React.render(this.meetupView, this.meetups);
					// React.render(this.chatView, this.actions);

					//starting a pubnub chatroom instance;
					if (!this.pubnub) this.runPubNub();
					//end of the promise check

					this.collection.get(event_id).fetch().then(function() {
						this.detailView = z(Backbone.MeetupDetail, {model: this.collection.get(event_id)})
						React.render(this.detailView, this.meetupDetail);
					}.bind(this))
					// this.detailView = z(Backbone.MeetupDetail, {model: this.collection.get(event_id)})
					// this.detailView = z(Backbone.MeetupDetail, { collection: this.collection });
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
			this.meetMap.drawOverlay({
			  lat: this.collection.latitude,
			  lng: this.collection.longitude,
			  content: '<div class="overlay">.</div>'
			});

			this.collection.models.map(function(d, i, a) {
				// console.log(d)
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
								'<p> Address: ' + d.get('venue').address_1 + ' ' + d.get('venue').city + ' ' + d.get('venue').state + '</p>' +
								// '<p>Date and Time: ' + new Date(d.get('time')) + '</p>' +
								'<p>Approx. distance: ' + Math.round(d.get('distance')) + ' miles</p>' +
								'<a href="http://maps.google.com/maps?saddr='+ this.collection.latitude+ ','+ this.collection.longitude +
								'&daddr='+ d.get('venue').address_1 + '" target="_blank">Get directions to here!</a>'
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
		// url: function() {
		// 		console.log(this.get('group').id)
		// 		return ['https://api.meetup.com/2/groups.json?callback=?&sign=true&photo-host=public&group_id=',
		// 			this.get('group').id,
		// 			'&page=10&key=2963568336371205b3948793023157b'
		// 			].join('')
		// 	},
		// parse: function(data) {
		// 	if (data.results) {
		// 		this.set('group', data.results[0])
		// 		return
		// 	}
		// 	else return data
		// }
	});

	Backbone.Meetups = Backbone.Collection.extend({
		model: Backbone.aMeetup,
		url: function() {
			return ['https://api.meetup.com/2/open_events.json?callback=?&sign=true&photo-host=public&',
			'lat='+ this.latitude,
			'&topic=javascript,coding,ruby&',
			'fields=group_photo&',
			'lon='+ this.longitude,
			'&time=,2w&radius=35&page=10&',
			'key=2963568336371205b3948793023157b'].join('')
		},
		parse: function(data) {
			// console.log(data)
			data = data.results;

			return data
		}
	});

	Backbone.Header = React.createClass({
		displayName: 'Header',
		render: function() {
			return z('header', [
					z('div.title', [
						z('i.fa.fa-map-marker'),
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
					z('i.fa.fa-weixin'),
					z('h3', {key: 1}, 'Immediately chat and quickly plan'),
					z('div.chatplan', 'No need to sign up! Just pick a username and your are taken straight to the chatroom that uses your current location'),
					z('i.fa.fa-users'),
					z('h3', {key: 2}, 'Interested in meetups?'),
					z('div.meetup-info', 'This app also uses meetups.com\'s API to allow you to see upcoming events that are also around your current location'),
					z('i.fa.fa-link'),
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
				z('div.core', [
					z('div.chatPlace'),
					z('div.users'),
					z('div.userList')
				]),
				z('div.actions', [
					z('form.textbox', {onSubmit: this._sendText}, [
						z('input:text.sendmsg[placeholder=Say Hi!][maxlength=140]@chatMessage')
					])
				])
			])
		}
	})

	Backbone.MeetupsView = React.createClass({
		displayName: 'MeetupsView',
		render: function() {
			// console.log(this.props);
			// debugger;

			// <p> content </p> = z('p', content)
			// tags without /
			// tags with /
			// <tag> grouping </tag>
			var each = this.props.collection.models;
			return z('div.meets', 
					// z('i.fa.fa.users'),
					// z('div.meetsign', 'MEETUPS'),
				each.map(function(data) {
					// console.log(data)
					// debugger;
					function check(i) {
						if (i < 10) {
							i = '0'+ i;
						}
						return i;
					}
					function hour_check(i) {
						if (i > 12) {
							i = i - 12;
						}
						return i;
					}
					function am_pm(i) {
						if (i > 12) {
							return 'PM';
						} else {
							return 'AM'
						}
					}

					function photo_check(i) {
						if (i) {
							if (i.thumb_link) {
								return i.thumb_link;
							}
						} else {
							return;
						}
					}
					var dT = new Date(data.get('time'))
					var time = check(hour_check(dT.getHours())) + ':' + check(dT.getMinutes())+ ' '+ am_pm(dT.getHours());
					var date = dT.toString()
						.split(' ')
						.slice(0, 4)
						.join(' ');

					// var photo = data.get('group.').group_photo;
					return z('div.'+data.get('id'), [
						z('div.meetName', [
							z('a[href=#details/'+ data.get('id') + ']', {key: data.get('id')}, data.get('name'))
						]),
						// z('img[src='+ photo_check(photo) +']'),
						z('div.when_date', 'Date: ' + date),
						z('div.when_time', 'Time: ' + time),
						z('div.rsvp', 'Attending: ' +data.get('yes_rsvp_count').toString() + ' ' + data.get('group').who)
						
						// z('div.desc', [data.get('description')]),
						// z('a[href='+data.get('event_url')+']', 'MORE INFO HERE')
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
			var model = this.props.model,
				photo = model.get('group'),
				dT = new Date(model.get('time')),
				time = check(hour_check(dT.getHours())) + ':' + check(dT.getMinutes())+ ' '+ am_pm(dT.getHours()),
				date = dT.toString()
					.split(' ')
					.slice(0, 4)
					.join(' '),
				getDesc = model.get('description'),
				noTags = $(getDesc).text(),
				uniq = Math.random() * 4

			function check(i) {
				if (i < 10) {
					i = '0'+ i;
				}
				return i;
			}
			function hour_check(i) {
				if (i > 12) {
					i = i - 12;
				}
				return i;
			}
			function am_pm(i) {
				if (i > 12) {
					return 'PM';
				} else {
					return 'AM'
				}
			}
			//research complext custom callbacks!
			function photo_check(i) {
				if (i) {
					if (i.group_photo) {
						return z('img[src=' + i.group_photo.highres_link + ']');
					}
				} else {
					return z('i.fa.fa-users')
				}
			}

			function doesExist(i) {
				if (i) {
					return i;
				} else {
					return '';
				}
			}
						
			$('.meetup-detail').show();
			$('.main').addClass('dim');
			$('.main').addClass('noclicks');
			// console.log(this.props);
			
			//how to pass info/object/data from one react to another?
			return z('div.lightbox', [
				z('div.box-header', [
						z('h4.b-title', model.get('name')),
						z('button', {onClick: this._close}, 'X')
				]),
				z('div.box-grid.grid.grid-2-800', [
					// z('div.detailer', [
		   //              z('a[href=' + model.get('event_url') + ']',{key: uniq}, 'More details about event here!'),
		   //              z('div.when_date2', {key: uniq}, 'Date: ' + date),
		   //              z('div.when_time2', {key: uniq}, 'Time: ' + time),
		   //              z('div.rsvp2', {key: uniq}, 'Attending: ' +model.get('yes_rsvp_count').toString() + ' ' + model.get('group').who)
					// ]),
					z('div.group-info', [
						photo_check(photo),
						z('div.host', model.get('group').name)
					]),
					
					z('div.venue', [
						z('i.fa.fa-building'),
						z('div.venue-name', model.get('venue').name),
						z('div.venue-addr', model.get('venue').address_1 + ' ' + model.get('venue').city + ' ' + model.get('venue').state)
					])
				]),
				z('div.event_desc', noTags),
				z('a[href=' + model.get('event_url') + ']',{key: uniq}, 'Click for more details')
				
			])
		}
	})


})(typeof module === 'object' ? module.exports: window);