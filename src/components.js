Crafty.c('Grid', {
  init: function() {
    this.attr({
      w: Game.map_grid.tile.width,
      h: Game.map_grid.tile.height
    })
  },
  at: function(x, y) {
    if (x === undefined && y === undefined) {
      return { x: this.x/Game.map_grid.tile.width, y: this.y/Game.map_grid.tile.height }
    } else {
      this.attr({ x: x * Game.map_grid.tile.width, y: y * Game.map_grid.tile.height });
      return this;
    }
  }
});
Crafty.c('ViewportBounded', {
	init: function() {
		this.requires('2D');
	},
	checkOutOfBounds: function(from) {
		
		if(!this.within(64, 64, Game.width()-256, Game.height()-128)) {
			//we cant move here, reset from where you came
			Game._gameHud.log('Blocked!');
			console.log('trigger scene change..');//TODO:scene change
			this.attr({x: from.x, y: from.y});
			
		} else {	
			
			this.animate('Walk',1);
			if(this.y>from.y){
				Game._gameHud.log('South');
			}else if(this.y<from.y){
				Game._gameHud.log('North');
			}else if(this.x<from.x){
				Game._gameHud.log('West');
			}else if(this.x>from.x){
				Game._gameHud.log('East');
			}
			Crafty.audio.play('blocked',1,0.05); //this is walk sound, confusing eh?;p									
			/* TILE DEFINITIONS FOR AI START */
			/* ************************************ */
		
			
			var outdoorTrigger = this.hit('OutdoorTile');			
			if(outdoorTrigger.length>0){
				this.outdoorTrigger();
			//	Game._gameHud.log(outdoorTrigger[0].obj.desc);
			}			
			var indoorTrigger = this.hit('IndoorTile');
			if(indoorTrigger.length>0){
				this.indoorTrigger();
				if(indoorTrigger[0].obj.has('Solid')){
					//Game._gameHud.log("Blocked!");
				}else{
					//Game._gameHud.log(indoorTrigger[0].obj.desc);
				}
			}
			var hit = this.hit('Interactable');			
			if(hit.length>0){			
				this.interact(hit);
			}else{
				if(this.has('spr_interaction')){
					this.removeComponent('spr_interaction');
					this.setSprite('spr_player');
				}
			}
		}
	}
});
Crafty.c("ViewportStatic", {
  _viewportPreviousX: 0,
  _viewportPreviousY: 0,
  _viewportStartX: 0,
  _viewportStartY: 0,
  init: function() {    
    this.bind("Moved", this._frame); 
  },
  _frame: function() {
	console.log('running relocation for vp');
   if(this._viewportPreviousX != Crafty.viewport._x) {
      this._viewportStartX = Crafty.viewport._x;        
      this.x += this._viewportPreviousX
      this.x -= Crafty.viewport._x;        
      this._viewportPreviousX = this._viewportStartX;
    }     
    if(this._viewportPreviousY != Crafty.viewport._y) {
      this._viewportStartY = Crafty.viewport._y;        
      this.y += this._viewportPreviousY
      this.y -= Crafty.viewport._y;
      this._viewportPreviousY = this._viewportStartY;
    }
  }
});
Crafty.c('Actor', {
  init: function() {
    this.requires('2D, DOM, Grid');
	console.log('Actor initialized.. ');	
	this.bind('Remove',function(){
		console.log('Actor removed..');
	});
  },
  setSprite:function(spr) {  
	if( !(this.has(spr)) ) {
		this.addComponent(spr);
		return this;
	}
  }	
});
Crafty.c('MouseTarget',{
	init:function() {
		this.requires('Mouse')
		.bind('MouseOver',function() {
			if(Game._playerCharacter._currentAction !== null) {
				Game._playerCharacter._cursor.x = this.x
				Game._playerCharacter._cursor.y = this.y			
			}
		})		
	}	
});
Crafty.c('Right_Torch', {
	init:function() {
		this.requires('2D, DOM, SpriteAnimation');
		this.reel('Default',200,15,5,2);
		this.animate('Default',-1);
	}
});
Crafty.c('Left_Torch', {
	init:function() {
		this.requires('2D, DOM, SpriteAnimation');
		this.reel('Default',200,17,5,2);
		this.animate('Default',-1);
	}
});
Crafty.c('Stove', {
	init:function() {
		this.requires('2D, DOM, SpriteAnimation');
		this.reel('Default',200,30,5,2);
		this.animate('Default',-1);
	}
});
Crafty.c('HeadlessOne', {
	init:function() {
		this.desc = "A headless one.";
		this.requires('MapTile, 2D, DOM, SpriteAnimation, spr_headless_one, Solid, IndoorTerrain');
		this.reel('Default',1000,16,14,4);
		this.animate('Default',-1);
	}
});
Crafty.c('TargetCursor',{
	init:function(){ 
		this.requires('Actor, Collision, Fourway, spr_target,  ViewportBounded, SpriteAnimation')
		.fourway(64)
		.reel('Glow',500,1,0,3)
		.animate('Glow',-1)
		.bind('KeyDown',function(e){ 
			this.checkAction(e);
		})
	},
	checkAction:function(e) {
		if(e.key===Crafty.keys.ENTER){
			
			var hitbox = Game._playerCharacter.rangeFinder();
			var doorTest = this.hit('Door');					
			var monsterTest = this.hit('Monster');
			
			/* If we hit a door */
			if(doorTest.length>0 && this.within(hitbox) && Game._playerCharacter._currentAction === 'Use'){
				doorTest[0].obj.destroy();
				Game._playerCharacter.stopTargetting();				
				Game._gameHud.log('Door opened.');					
			}			
			if(monsterTest.length>0 && this.within(hitbox) && Game._playerCharacter._currentAction === 'Fight'){

				Game._playerCharacter.stopTargetting();
				Crafty.scene('Battle');
				//Game._gameHud.log('Monster vanquished!');
			}			
			
			/*We didn't hit any objects, but are still in range of using something, show its desc */
			if(this.within(hitbox) ){					
				switch(Game._playerCharacter._currentAction){
					case 'Use':
						Game._gameHud.log('You cant use this!'); //You can no use tiles!
						break;
					case 'Look':
						Game._gameHud.log(Game._playerCharacter._tile.desc); //Look at the tile							
						break;
					case 'Fight':
						Game._gameHud.log('You cant fight this!');
				}					
			} 
			/* We are out of range of any objects */
			else {
				Game._gameHud.log('Out of Range!');
			}
			this.destroy();
			Game._playerCharacter.stopTargetting();
		}
	}
})

Crafty.c('PlayerCharacter', {
	
	_health: 100,
	_cursor: null,
	_inAction: false,
	_tile: null, //a reference to the tile we are inspecting, for targetting
	_currentAction: null,
	
	init: function() {
		this.requires('Actor, Fourway, Collision, ViewportBounded, SpriteAnimation, MapTile')
		.fourway(64)
		.attr({x:768,y:640}) // start in your house
		.reel('Walk',400,12,10,3)		
		.onHit('Solid', this.stopMovement)		
		.onHit('Interactable', this.interact);
		
		this.desc = "You are you.";
		
		this.bind('Moved',function(oldPosition){
			Crafty('ViewportStatic').trigger('Moved');
			this.checkOutOfBounds(oldPosition);			
        })		
		.bind('KeyUp',function(e){
			switch(e.key) {
				case Crafty.keys.U : 
					this._currentAction = 'Use';
					this.beginTargetting();
					break;
				case Crafty.keys.L :
					this._currentAction = 'Look';
					this.beginTargetting();
			}
		})
		//this._viewFinder = this.viewFinder();
	},
	beginTargetting:function() {
		this._inAction = true;
		this.disableControls = true;	
		Crafty('TargetCursor').destroy(); // previous cursors
		Crafty('RangeTester').destroy(); // any previous range finders lingering
		this._cursor = Crafty.e('TargetCursor').attr({x:this.x,y:this.y,z:1000});
		Game._gameHud.log(this._currentAction+' what-?');
	},
	stopTargetting:function() {
		this._currentAction = null;
		this._inAction = false;
		this.disableControls = false;
		this._cursor.destroy();
	},
	interact:function(e){
		if(this.isPlaying('Walk')){
			this.pauseAnimation();
		}
		if(this.has('spr_player') && !this.isPlaying('Walk')) {
			this.removeComponent('spr_player');			
			this._tile = e[0].obj.interactionSprite.split(",");
			Crafty.sprite(64, "assets/u5_tileset.png", {
				spr_interaction:[this._tile[0],this._tile[1]]
			});
			this.addComponent('spr_interaction');
		}
		return this;
	},
	outdoorTrigger:function() {
		Crafty('IndoorTerrain').each(function(){ this.alpha = 0; });
		Crafty('OutdoorTerrain').each(function(){ this.alpha = 1; });
	},
	indoorTrigger:function() {
		Crafty('OutdoorTerrain').each(function() { this.alpha = 0; });
		Crafty('IndoorTerrain').each(function() { this.alpha = 1; });
		//Game._gameHud.log('You are home.');		
	},
	stopMovement: function(e) {
		Crafty.audio.play("blocked",1,0.25);
		this._speed = 0;
		if (this._movement) {
			this.x -= this._movement.x;
			this.y -= this._movement.y;
			//var tile = e[0].obj;
			Game._gameHud.log('Blocked!');			
		}
		Crafty('ViewportStatic').trigger('Moved', this._movement);
	},
	rangeFinder: function() {
		var hitX  = this.x-Game.map_grid.tile.width;
		var hitY  = this.y-Game.map_grid.tile.height;
		var hitW = this.w*3;
		var hitH  = this.h*3;
		var hitbox = Crafty.e('RangeTester, 2D').attr({x:hitX, y:hitY, w:hitW, h:hitH,z:1000});
		return hitbox;
	}
});

Crafty.c('MapTile', {
	init: function() {
		this.requires('MouseTarget, Collision')
		//this.alpha = 0;
		this.onHit('TargetCursor',function() {
			Game._playerCharacter._tile = this;
		})
		.bind('Click',function() {
			if(Game._playerCharacter._currentAction !== null) {
				Crafty.trigger('KeyDown',{
					key:Crafty.keys.ENTER
				})
			}
		})
	}
});
Crafty.c('InventoryIcon',{
	init:function() {
		this.requires('2D, DOM, spr_player, Mouse, Color, ViewportStatic').color('none');
	}
});
Crafty.c('IndoorTile', {
	init:function() {
		this.alpha = 0;		
	}
});
Crafty.c('OutdoorTile', {
	init:function() {
		this.alpha = 0;
	}
});
Crafty.c('SceneTrigger',{
	init:function(){
		this.alpha = 0;
	}
});
Crafty.c('FadeIn', {
	init: function() {
		this.requires('2D');
		this.bind("EnterFrame", function() {
		console.log('running');
			this.alpha = Math.max(this._alpha + this._fadeSpeed, 0.0);
			if (this.alpha >= 1) {
				this.trigger('Faded');
				this.unbind('EnterFrame');
				//this.destroy();
			}
		});
	},
	fadeIn: function(speed) {
		this._fadeSpeed = speed;
		return this; // so we can chain calls to setup functions
	}
});
Crafty.c('Panel',{
	init:function(){
	//	this.requires('FadeIn, ViewportStatic');		
	//	this.alpha = 0;
		//this.fadeIn(0.1);
	}
});
Crafty.c('MouseBlock',{

	_direction:null,
	
	
	init:function(){
		this.requires('2D, DOM, Color, Mouse, ViewportStatic');
		this.alpha = 1;
		this.bind('MouseDown',function() {
			
			this.alpha = 0.5;
			Crafty.trigger('KeyDown',{
				key:this._direction
			})			
		})
		.bind('MouseUp',function() {
			this.alpha = 1;
			Crafty.trigger('KeyUp',{
				key:this._direction
			})			
		})
		
	}
})
Crafty.c('GameHud', {
	
	/* GameHud Options */
	_showPlayerIcons: true,
	_borderColor: '#000000',
	_panelColor: '#0000A8',
	
	_posY:0, //Hud Y
	_width: 192,
	_borderWidth:0,
	_padding:5,
	_posX:Crafty.viewport.width - this._width, //Hud X
	_playerIcon: null, //Crafty object for the player sprite reference
	_playerHealth: null, //Crafty object for the player health text
	
	init:function() {
		this.setup();
	},
	setup:function(){
		
		Crafty.e('Panel,2D, DOM, Color, ViewportStatic').attr({x:0,y:0, w:Crafty.viewport.width, h:64, z: 1}).color('#0000A8');
		Crafty.e('Panel,2D, DOM, Color, ViewportStatic').attr({x:0,y:0, w:64, h:Crafty.viewport.height, z: 1}).color('#0000A8');
		Crafty.e('Panel,2D, DOM, Color, ViewportStatic').attr({x:0,y:Crafty.viewport.height-64, w:Crafty.viewport.width, h:64, z: 1}).color('#0000A8');
		Crafty.e('Panel,2D, DOM, Color, ViewportStatic').attr({x:Crafty.viewport.width-192,y:0, w:192, h:Crafty.viewport.height, z: 1}).color('#0000A8');
		
		Crafty.e('MouseBlock').attr({x:Crafty.viewport.width-192,y:Crafty.viewport.height-128,w:64,h:64,z:2}).color('red').attr({_direction:Crafty.keys.A});
		Crafty.e('MouseBlock').attr({x:Crafty.viewport.width-64,y:Crafty.viewport.height-128,w:64,h:64,z:5}).color('red').attr({_direction:Crafty.keys.D});
		Crafty.e('MouseBlock').attr({x:Crafty.viewport.width-128,y:Crafty.viewport.height-192,w:64,h:64,z:5}).color('red').attr({_direction:Crafty.keys.W});
		Crafty.e('MouseBlock').attr({x:Crafty.viewport.width-128,y:Crafty.viewport.height-128,w:65,h:64,z:10}).color('green').attr({_direction:Crafty.keys.S});
		
		Crafty.e('MouseBlock').attr({x:Crafty.viewport.width-192+16,y:192,w:64,h:64,z:5}).color('#0d9adb').attr({_direction:Crafty.keys.U});
		Crafty.e('MouseBlock').attr({x:Crafty.viewport.width-128+48,y:192,w:64,h:64,z:5}).color('#0d9adb').attr({_direction:Crafty.keys.L});
		
		this._updateStatus();
	},
	width:function(){
		return this._width;
	},
	_updateStatus:function(str) {
		var version = Crafty.e('PanelText, 2D, DOM, Text, ViewportStatic').attr({w:Crafty.viewport.width-128, x:64, y:16,z:2}).textColor('#FFFFFF').textFont({ size: '22px', family: 'Fixedsys' }).text('version.01');
		var player = Crafty('PlayerCharacter');
		/* text displays */
		this._playerName = Crafty.e('PanelName, 2D, DOM, Text, ViewportStatic').attr({x:Crafty.viewport.width-192+64, y:64,z:2}).text('TEST').textColor('#FFFFFF').textFont({ size: '22px', family: 'Fixedsys' });
		//this._playerHealth = Crafty.e('PanelHealth, 2D, Canvas, Text, ViewportStatic').attr({x:((Crafty.viewport.width-this._width)+this._borderWidth)+this._playerName.w+this._padding+15, y:this._padding,z:10}).text(player._health+ 'g').textColor('#FFFFFF').textFont({ size: '22px', family: 'Fixedsys' });
		this._desc = Crafty.e('PanelText, 2D, DOM, Text, ViewportStatic').attr({w:Crafty.viewport.width-128, x:64, y:Crafty.viewport.height-48,z:2}).textColor('#FFFFFF').textFont({ size: '22px', family: 'Fixedsys' })
	
		Crafty.e('InventoryIcon').attr({x:Crafty.viewport.width-192+16,y:64,z:2, w:32, h:32 });
	
	},
	removeInterface:function() {
		Crafty('Panel, PanelBorder, PanelIcon, PanelHealth, PanelName, PanelText').each(function() { this.destroy(); });
		this.destroy();		
	},
	log:function(str) {
		var cstring = this._desc.text(function() {
			return this._text;
		})
		//this._desc.text(cstring._text+"<br\>"+"> "+str);
		this._desc.text("> "+str);
	},
	askQuestion:function(str){
		if(str==='undefined'){str='undefined';}
		
		
	},
})