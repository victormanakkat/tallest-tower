require.config({
	urlArgs: 'cb=' + Math.random(),
	'paths': {
		'jquery': 'libs/jquery-1.8.3.min',
		'backbone': 'libs/backbone-0.9.10',
		'underscore': 'libs/underscore-min',
		'easel' : 'libs/easeljs-0.5.0.min',
		'facebook' : '//connect.facebook.net/en_US/all',
		'signal' : 'libs/signals.min'
	},
 
	shim: {
		'backbone': {
			deps: ['underscore', 'jquery'],
			exports: 'Backbone'
		},
		'underscore': {
			exports: '_'
		},
		'easel': {
            exports: 'createjs'
        },
        'facebook' : {
            exports: 'FB'
        },
        'signal' : {
        	exports : 'Signal'
        } 
	}
});
 
require([
	'App', 
	'jquery',	
	'facebook',
	'model/User'
], function(App, $, FB, User) {

	$(function(){

		FB.init({
	      appId      : '490996157610487', // App ID
	      channelUrl : 'http://localhost:3000/channel.html', // Channel File
	      status     : true, // check login status
	      cookie     : true, // enable cookies to allow the server to access the session
	    });

		var app; 
		var user = new User();
	   	

	   
		
	    FB.getLoginStatus(function (response) {
	    	console.log(response.status)
	    	if(response.status == 'connected') {
	    		console.log('USER AUTHORIZED');
	    		
	    		user.fetch({success: function(model, res, options) {
	    			FB.api('/me', function(me) {
	    				user.set({facebook:me});
	    				app = new App({model:user});
	    			});
				}, error:function() {
					//console.log('error')
				}});
	    		
	    	} else  {
	    		// USER NOT LOGGED IN
	    		app = new App({model:user});
	    	} 
	    });

	})
});