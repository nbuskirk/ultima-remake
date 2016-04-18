Crafty.scene('Game', function() {
	Crafty.background('#000000');
	map = Crafty.e("TiledLevel").tiledLevel("maps/start64.json", 'DOM');
	map.bind("TiledLevelLoaded", Game.begin );
});
Crafty.scene("Introduction",function(){

	Crafty.background('#0000A8');
	Crafty.e('2D, DOM, Text')
	.text('RPG 64')
	.attr({ x:0,y:Crafty.viewport.height/2-16, w:Crafty.viewport.width }).textColor('#FFFFFF').textFont({ size: '34px', family: 'Fixedsys' }).css('text-align','center').unselectable()
	
	Crafty.e('2D, Mouse').attr({x:0,y:0, w:Crafty.viewport.width,h:Crafty.viewport.height,z:5})
	.bind('Click',function(){
		Crafty.scene("Game") 
	});
	
});
Crafty.scene('Loading', function(){
	Crafty.background('#0000A8');
	Crafty.e('2D, DOM, Text')
	.text('Loading...')
	.attr({ x:0,y:Crafty.viewport.height/2-16, w:Crafty.viewport.width }).textColor('#FFFFFF').textFont({ size: '34px', family: 'Fixedsys' }).css('text-align','center').unselectable()
	
	Crafty.load(['assets/u5_tileset.png','assets/audio/block.mp3','assets/cursor_sprites.png','assets/audio/move.mp3','assets/audio/theme.mp3'], function(){
	Crafty.audio.add("blocked", "assets/audio/block.mp3");	
	Crafty.audio.add("move", "assets/audio/block.mp3");
	Crafty.audio.add("theme", "assets/audio/theme.mp3");
	Crafty.sprite(64, 'assets/u5_tileset.png', {		
		spr_player:  [13, 10],
		spr_headless_one: [17,14]
	});
	Crafty.sprite(64,'assets/cursor_sprites.png', {
		spr_target: [1,0],
		spr_move: [0,0]
	});
    Crafty.scene("Introduction");
  })
});