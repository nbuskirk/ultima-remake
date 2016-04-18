Game = {
	
	_playerCharacter: null, //Our active player character
	_gameHud: null, //Our active hud
	
	map_grid: {
		width:  38,
		height: 21,
		tile: {
			width:  64,
			height: 64
		}
	},
	width: function() {
	return this.map_grid.width * this.map_grid.tile.width;
	},
	height: function() {
	return this.map_grid.height * this.map_grid.tile.height;
	},
	start: function() {
		Crafty.init(832, 576); //21x13 for now
		Game.showHTMLInfo();
		Crafty.pixelart(true);
		Crafty.timer.FPS(30);
		Crafty.scene('Loading');
	},
	begin: function() {
		//Crafty.audio.play('theme',-1);
		Game._playerCharacter = Crafty.e('PlayerCharacter'); //store reference to our player. always use this.
		Game._playerCharacter.setSprite('spr_player');
		Crafty.viewport.follow(Game._playerCharacter,-64,0);
		Game._gameHud = Crafty.e('GameHud');
		Game._playerCharacter.indoorTrigger(); //we start inside
		
		Crafty.e('HeadlessOne').attr({x:Game._playerCharacter.x,y:Game._playerCharacter.y+64,z:5});
		Crafty('ViewportStatic').trigger('Moved',Game._playerCharacter.at());
	},
	showHTMLInfo:function() {
		var newinfo = $('.info').clone();		
		$('body').append(newinfo);
		$(newinfo).fadeIn();
	}
}