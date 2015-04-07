# Locusity

### why i built locusity
after going to a couple of meetups via meetup.com, i thought it was pretty cool. the only problem was that since i'm naturally an introvert, it was 
pretty awkward for me because i didn't know what to do or who to talk to; i didn't know how to ease in without feeling weird myself.

that's why i created locusity.

locusity allows you to simply choose a username and then connect to a chatroom based off your location. anyone around your location within a certain radius will also be put into the same chatroom.

by using meetup.com's API i have also pulled information on events NEARBY (using your current location, too) tailored to those interested in *programming, javascript, ruby, coding*.

### example of use

- you go to the website and choose a username
- you check out what events are nearby that you're interested in
- once you find one, you can communicate with others in the chatroom and get to know each other, or know more about the topic
- **it breaks that awkwardness barrier**
- now you know someone so once you go to the meetup, you're not totally looking a lost little puppy.

forget having to worry and waste too much time trying to figure out who to talk when you just want to get down into your text editor and code with others of similar interest.


### technologies used:
- backbone.js
	- allows me to manipulation and manage collections (the events) and models (each event and details about event) easily within my application
- pubnub SDK
	- chatroom was not built from scratch; pubnub helped allowed me to get my chatroom running using socket.io to listen for events and then broadcasting the messages to the particular chatroom using pub/sub
- react.js
	- nesting views is a little complicated with backbone. if you're trying to render a backbone view within a backbone view, there is extra rendering that is involved that would have an impact on performance. AND since you're depending on the first view for the second view to render within a particular DOM element (of the first view), more steps are involved as mentioned before like promises and re-rendering the whole page to have it all updated.
		- react has a virtual DOM that allows me to have REUSABLE Components like a header with a navigation; all i have to do is simply call that component to render again on different pages
		- because of this virtual dom, i can easily nest views or components within another without having to care about promises and waiting for the first view to render before the second or third or fourth.
- MEETUP.com API
	- allows me to grab data (the events) from their site and format it the way i want to do it on my site

- GMaps.JS
	- uses GOOGLE MAPS API but is compiled to make it easier to create makers, maps, and information elements within the map
- HTML5 geolocation API
	- by using this, i was able to easily grab a client (user's) coordinates and tailor the app for their location
	- of course, it would ask you for permission for your location first. if not, the app basically doesn't work. ENABLE IT PLEASE!