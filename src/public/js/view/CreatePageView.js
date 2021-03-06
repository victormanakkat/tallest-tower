define(
	
	['backbone',  
	'text!templates/create.html',
	'view/FeatureListView',
	'model/GameData',
	'SignalMap'], 

	function(Backbone,
			 template, 
			 FeatureListView, 
			 GameData,
			 SignalMap) {
	
	return Backbone.View.extend({

		id: 'create',

		events : {
			'click #save-btn' : 'onSave'
		},
		

		initialize : function(options) {
			this.featureList = new FeatureListView({
										collection:this.model.get('features'), 
										model:this.model.get('game'),
										user: this.model.get('user')});

			this.listenTo(this.model.get('game'), 'change:value', this.renderTotal);
			
			
		},

		onSave: function() {
			var game = this.model.get('game');
			game.set({
				features: this.featureList.getData(),
				data: new Backbone.Collection([])
			});
			
			SignalMap.saveGame.dispatch(game);
		},

		release : function() {
			this.undelegateEvents();
			this.model = null;
		},

		renderTotal : function() {
			
			
			//this.$el.find('.row-fluid #total').html('$ ' + this.model.get('game').get('value'));
		},

		render : function() {


			
			
			var t = _.template(template);
			this.$el.append(t);

			this.renderTotal();

			
			this.$el.find('form').empty().append(this.featureList.el)
			return this;
		}
	});
});