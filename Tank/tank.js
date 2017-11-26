//  -------- canvas
var context;
var canvas_w;
var canvas_h;
var updateBlockList;
// ---------- resources
var res_patterns = new Object();
var res_pictures = new Object();
var res_animations = new Object();

// ---------- looper
var f_inproc;
var f_onload;

// ---------- map
var map_W;
var map_H;
var map_blocks;
var map_collision;

const TIME_LOOP = 36000;
var sys_time;
// ---------- control
var cmd1 = new Object();
var cmd2 = new Object();

// ---------- Effects
var eff_animations = new Array();

// ---------- Entitys
var ent_myTank;
var ent_myTank2;

const LIMIT_ENEMY = 5;
var ent_enemyTank = new Array(LIMIT_ENEMY);

const LIMIT_BULLET = 20;
var ent_bullets = new Array(LIMIT_BULLET);

// --------- Enemy basement
var last_refresh_tick = -10000;
//  ---------- const
const NORTH = 0;
const WEST = 3;
const SOUTH = 2;
const EAST = 1;

const INTERVAL = 60;
const MAP_UNIT = 6;
const MINION = 0.0001;

// ====================== main ======================
function tank_start(canvas,mapdata){
	f_inproc = false;
	f_onload = 0;
	context =canvas.getContext("2d");
	canvas_w = canvas.width;
	canvas_h = canvas.height;
	
	//--------- Loading Images -----	
	res_patterns.block = loadPattern('res\\BLOCK.png');	
	res_patterns.iron = loadPattern('res\\IRON.png');	
	res_pictures.mytank = loadPicture('res\\myTANK.png');	
	res_pictures.mytank2 = loadPicture('res\\myTANK2.png');	
	res_pictures.bullet = loadPicture('res\\BULLET.png');	
	res_pictures.tankSmall = loadPicture('res\\TANKsmall.png');	
	res_animations.blink = loadPicture('res\\BLINK.png');
	res_animations.fire = loadPicture('res\\FIRE.png');
	
	// --------- load map data ------------
	map_W = mapdata.width;
	map_H = mapdata.height;	
	map_blocks = mapdata.data;
	map_collision = new Array(map_W*map_H);
	for (var i = 0;i<map_W*map_H; i++){
		map_collision[i] = null;
	}
	
	//  ---------init memory -----------
	ent_bullets = new Pool(LIMIT_BULLET);
	ent_enemyTank = new Pool(LIMIT_ENEMY);
	
	// --------- init entity ----------
	//        myTank
	ent_myTank = new Tank(res_pictures.mytank,14,14,SOUTH,1);
	ent_myTank2 = new Tank(res_pictures.mytank2,14,18,NORTH,1);
	ent_myTank2.driver = new DriverAstar();
	ent_myTank.driver = new DriverAstar();
	
	ent_bullets.add(new Bullet(res_pictures.bullet, 20,9,WEST,null));
	// ---------init state & cmd --------
	registUI();
	
	// ------- Start --------
	repaintMap();
	sys_time = 0;
	process();
};

function registUI(){	
	cmd1.shot = false;
	cmd1.north = false;
	cmd1.south = false;
	cmd1.east = false;
	cmd1.west = false;
	cmd2.shot = false;
	cmd2.north = false;
	cmd2.south = false;
	cmd2.east = false;
	cmd2.west = false;
	document.onkeyup=function(event){
		var e = event ||
			window.event ||
			arguments.callee.caller.arguments[0];
		if(e && e.keyCode==37){  // left
			cmd1.west = false;
		}else if(e && e.keyCode==39){  // right
			cmd1.east = false;
		}else if(e && e.keyCode==38){  // up
			cmd1.north = false;
		}else if(e && e.keyCode==40){  // down
			cmd1.south = false;
		}else if(e && e.keyCode==65 ){  // a
			cmd2.west = false;
		}else if(e && e.keyCode==68 ){  // d
			cmd2.east = false;
		}else if(e && e.keyCode==87){  // w
			cmd2.north = false;
		}else if(e && e.keyCode==83 ){  // s
			cmd2.south = false;
		}
	}
	document.onkeydown=function(event){
		event.preventDefault();
		var e = event ||
			window.event ||
			arguments.callee.caller.arguments[0];
		if(e && e.keyCode==27){ //  Esc 
			context.fillStyle="#ff0000";;
			context.fillRect(0,0,canvas_w,canvas_h);
		}else if(e && e.keyCode==113){ // F2 
			context.fillStyle="#00ff00";;
			context.fillRect(0,0,canvas_w,canvas_h);
		}else if(e && e.keyCode==13){  // enter
			cmd1.shot = true;
		}else if(e && e.keyCode==37){  // left
			cmd1.west = true;
		}else if(e && e.keyCode==39){  // right
			cmd1.east = true;
		}else if(e && e.keyCode==38){  // up
			cmd1.north = true;
		}else if(e && e.keyCode==40){  // down
			cmd1.south = true;
		}else if(e && e.keyCode==32){  // space
			cmd2.shot = true;
		}else if(e && e.keyCode==65 ){  // a
			cmd2.west = true;
		}else if(e && e.keyCode==68 ){  // d
			cmd2.east = true;
		}else if(e && e.keyCode==87){  // w
			cmd2.north = true;
		}else if(e && e.keyCode==83 ){  // s
			cmd2.south = true;
		}
	}; 
}
var tank1_reborn = false;
var tank2_reborn = false;
function process(){
	sys_time  = (++sys_time) % TIME_LOOP;
	// loop timer
	setTimeout("process()", INTERVAL);
	if (f_onload > 0){
		console.log('loading unfinished');	
		return;		
	}
	if (f_inproc){
		console.log('update timeout');
		return;		
	}
	f_inproc = true;
	// try{
	//------------Start------------
	// console.log('starting update');
	
	// ----------update engine ------
	updateBlockList = new Array();
	
	//               --- add background update --
	for (var i = 0;i<eff_animations.length;i++){
		eff_animations[i].addUpdate();
	}
	for (var i =0; i<LIMIT_BULLET;i++){
		if (ent_bullets[i].valid)
			ent_bullets[i].obj.addUpdate();
	}
	ent_myTank.addUpdate();
	ent_myTank2.addUpdate();
	
	for (var i =0; i<LIMIT_ENEMY;i++){
		if (ent_enemyTank[i].valid){
			ent_enemyTank[i].obj.addUpdate();
		}
	}
	
	//               ---  bullets move--
	//   Bullet fly 
	for (var i =0; i<LIMIT_BULLET;i++){
		if (ent_bullets[i].valid){
			var bullet = ent_bullets[i].obj;
			
			bullet.occupy(false);
			var exploded = bullet.fly();		
			if (!exploded){
				bullet.occupy(true);
			}
		}
	}
	
	//               --- enemy refresh --
	if ((sys_time - last_refresh_tick +TIME_LOOP)%TIME_LOOP > 50){ // 5s
		last_refresh_tick = sys_time;
		var x = Math.floor(Math.random()*(map_W-8)) +4;
		var y = Math.floor(Math.random()*(map_H-8)) +4;
		eff_animations.push(new Animation(res_animations.blink,x,y,NORTH,32,32,4,4,24,
			function(){
				var newTank = new Tank(res_pictures.tankSmall,x,y,WEST,1);				
				newTank.driver = new DriverAggressive();
				if (Math.random()>0.5){
					newTank.driver.setTarget(ent_myTank);
				}else{
					newTank.driver.setTarget(ent_myTank2);
				}
				ent_enemyTank.add(newTank);
			}
		));
	}
	//               --- my Tank move--
	if (ent_myTank.valid){
			ent_myTank.occupy(false);
		if (ent_myTank.driver != undefined){
			var cmdBuffer = shallowCopy(cmd1);
			cmd1.shot = false;
			if (cmdBuffer.shot ||cmdBuffer.north||cmdBuffer.south||cmdBuffer.west||cmdBuffer.east){
				controlTank(ent_myTank,cmdBuffer);
			}else{
				controlTank(ent_myTank,ent_myTank.driver.getCommand(ent_myTank));
			}
		}else{
			//   execute command
			var cmdBuffer = shallowCopy(cmd1);
				cmd1.shot = false;
			controlTank(ent_myTank,cmdBuffer);
		}
			ent_myTank.occupy(true);
	}else{
		if (!tank1_reborn){
			var x = Math.floor(Math.random()*(map_W-8)) +4;
			var y = Math.floor(Math.random()*(map_H-8)) +4;
			eff_animations.push(new Animation(res_animations.blink,x,y,NORTH,32,32,4,4,24,
				function(){
					ent_myTank.x = x;ent_myTank.y = y; ent_myTank.valid= true;
					tank1_reborn = false;
				}
			));		
			tank1_reborn = true;
		}
	}
	
			
	if (ent_myTank2.valid){
			ent_myTank2.occupy(false);
		if (ent_myTank2.driver != undefined){
			var cmdBuffer = shallowCopy(cmd2);
				cmd2.shot = false;
			if (cmdBuffer.shot ||cmdBuffer.north||cmdBuffer.south||cmdBuffer.west||cmdBuffer.east){
				controlTank(ent_myTank2,cmdBuffer);
			}else{
				controlTank(ent_myTank2,ent_myTank2.driver.getCommand(ent_myTank2));
			}
		}else{
			//   execute command
			var cmdBuffer = shallowCopy(cmd2);
				cmd2.shot = false;
			controlTank(ent_myTank2,cmdBuffer);
		}
			ent_myTank2.occupy(true);
	}else{
		if (!tank2_reborn){
			var x = Math.floor(Math.random()*(map_W-8)) +4;
			var y = Math.floor(Math.random()*(map_H-8)) +4;
			eff_animations.push(new Animation(res_animations.blink,x,y,NORTH,32,32,4,4,24,
				function(){
					ent_myTank2.x = x;ent_myTank2.y = y; ent_myTank2.valid= true;
					tank2_reborn = false;
				}
			));		
			tank2_reborn = true;
		}
	}
		
	
	//                --  enemy Tank move--
	for (var i =0; i<LIMIT_ENEMY;i++){
		if (ent_enemyTank[i].valid){
			var enemy = ent_enemyTank[i].obj;
			
			enemy.occupy(false);
			if (enemy.driver != undefined){
				controlTank(enemy,enemy.driver.getCommand(enemy));
			}
			// var exploded = bullet.fly();		
			// if (exploded){
				// ent_bullets.release(i);
			// }else{
			// }
			enemy.occupy(true);
		}
	}
	
	
	// ---------- redraw canvas-----
	//  blocks
	for (var i = 0; i < updateBlockList.length;i++){
		drawBlock(updateBlockList[i].x,updateBlockList[i].y);
	}
	//  tanks
	if (ent_myTank.valid){
		ent_myTank.draw();
	}
	if (ent_myTank2.valid){
		ent_myTank2.draw();
	}
	//  enemy
	for (var i =0; i<LIMIT_ENEMY;i++){
		if (ent_enemyTank[i].valid){
			var enemy = ent_enemyTank[i].obj;
			
			if (enemy.valid){
				enemy.draw();
			}else{
				enemy.occupy(false);
				ent_enemyTank.release(i);
			}
		}
	}
	
	//  bullets
	for (var i =0; i<LIMIT_BULLET;i++){
		if (ent_bullets[i].valid){
			var bullet = ent_bullets[i].obj;
			if (bullet.valid){
				bullet.draw();	
			}else{
				bullet.occupy(false);
				bullet.reload();
				ent_bullets.release(i);
			}
		}
	}
	//  effects
	for (var i = 0;i<eff_animations.length;i++){
		if (eff_animations[i].animate()){
			eff_animations.splice(i,1);
			i--;
		} 
	}
	//  collision
	paintCollisionMap();
	// }catch(e){
		// console.log(e.toString());
	// }
	//------------End------------
	// console.log('finishing update');
	f_inproc = false;
};


//   ------------ Commands -------------- 
function controlTank(tank,cmdBuffer){
	var ismoving = false;
	var dir = NORTH;
	if (cmdBuffer.north){
		ismoving = true;
		dir = NORTH;
	}else if(cmdBuffer.south){
		ismoving = true;
		dir = SOUTH;		
	}else if(cmdBuffer.west){
		ismoving = true;
		dir = WEST;
	}else if(cmdBuffer.east){
		ismoving = true;
		dir = EAST;
	}
	if (ismoving){
		tank.move(dir);
	}
	if (cmdBuffer.shot){
		tank.shot();
	}
}

// ---------------- updates ---------------------
/**
 *  input x,y must be integer
 */
var explodeAt = function(bullet,x,y){
	switch(collisionTest(x, y)){
		case 0:
		break;
		case 1:
		map_blocks[x+map_W*y] = 0;
		updateBlockList.push({
				x:x,
				y:y
				});
		break;
		case 2:
		break;
		case 3:
			entity = map_collision[x +map_W*y];
			if (bullet.src != ent_myTank && bullet.src != ent_myTank2){
				if (entity== ent_myTank ||entity== ent_myTank2){
					entity.onhit();
				}
			}else{
				entity.onhit();
			}
		break;
	}
}

// ==============  Entity Ops =================
function Entity(pic,x,y,dir,sw,sh,w,h,cw,ch){
	this.x = x;
	this.y = y;
	this.direction = dir;
	this.pic = pic;
	this.sw = sw;
	this.sh = sh;
	this.w = w;
	this.h = h;
	this.cw = cw;
	this.ch = ch;
	this.type = 'Entity';
	
	this.draw = function(){
		context.save();
		context.translate(this.x*MAP_UNIT,this.y*MAP_UNIT);
		context.rotate(this.direction*90*Math.PI/180);
		context.drawImage(this.pic, 
			0,
			0,
			this.sw,
			this.sh,
			-MAP_UNIT*this.w/2,
			-MAP_UNIT*this.h/2,
			MAP_UNIT*this.w,
			MAP_UNIT*this.w);
		context.restore();
	};
	this.addUpdate = function(){
		switch(this.direction){
			case NORTH:
			case SOUTH:
			addUpdateBlocks(
				this.x - this.w/2,
				this.y - this.h/2,
				this.w,
				this.h);
			break;
			case WEST:
			case EAST:
			addUpdateBlocks(
				this.x - this.h/2,
				this.y - this.w/2,
				this.h,
				this.w);
			break;
		}
	};
	this.occupy = function(flag){
		var ent = flag?this:null;
		switch(this.direction){
			case NORTH:
			case SOUTH:
		occupy(ent,this.x - this.cw/2,this.y - this.ch/2,this.cw,this.ch);
			break;
			case WEST:
			case EAST:
		occupy(ent,this.x - this.cw/2,this.y - this.ch/2,this.cw,this.ch);
			break;
		}
	};
}
function Bullet(pic,x,y,dir,src){
	Entity.call(this,pic,x,y,dir,4,4,1/2,1/2,1,1);
	this.valid = true;
	this.type = 'Bullet';
	this.src = src;
	this.onhit= function(){
		this.valid = false;
		this.occupy(false);
	};
	this.reload = function(){
		if (this.src != null){
			this.src.ammo ++;
		}
	}
	this.fly = function(){
		var exploded = false;
		switch(this.direction){
			case NORTH:
				if (collisionTest(this.x, this.y-1) ||
				collisionTest(this.x-1, this.y-1)){
					explodeAt(this,Math.floor(this.x),Math.floor(this.y-1));
					explodeAt(this,Math.floor(this.x-1),Math.floor(this.y-1));
					exploded = true;
				}
				break;
			case SOUTH:
				if (collisionTest(this.x, this.y+1) ||
				collisionTest(this.x-1, this.y+1)){
					explodeAt(this,Math.floor(this.x),Math.floor(this.y+1));
					explodeAt(this,Math.floor(this.x-1),Math.floor(this.y+1));
					exploded = true;
				}
				break;
			case WEST:
				if (collisionTest(this.x-1, this.y) ||
				collisionTest(this.x-1, this.y-1)){
					explodeAt(this,Math.floor(this.x-1),Math.floor(this.y));
					explodeAt(this,Math.floor(this.x-1),Math.floor(this.y-1));
					exploded = true;
				}
				break;		
			case EAST:
				if (collisionTest(this.x+1, this.y) ||
				collisionTest(this.x+1, this.y-1)){
					explodeAt(this,Math.floor(this.x+1),Math.floor(this.y));
					explodeAt(this,Math.floor(this.x+1),Math.floor(this.y-1));
					exploded = true;
				}
				break;			
		}
		if (exploded){
			this.valid = false;
			eff_animations.push(new Animation(res_animations.fire,this.x,this.y,NORTH,32,32,2,2,4,null));
		}else{
			switch(this.direction){
				case NORTH:
				this.x = this.x;
				this.y = this.y - 1;
				break;
				case SOUTH:
				this.x = this.x;
				this.y = this.y + 1;
				break;
				case WEST:
				this.x = this.x - 1;
				this.y = this.y;
				break;
				case EAST:
				this.x = this.x + 1;
				this.y = this.y;
				break;		
			}				
		}
		return exploded;
	};
	this.occupy = function(flag){
		var ent = flag?this:null;
		occupy(ent,this.x,this.y,this.cw,this.ch);
	};
}
function Tank(pic,x,y,dir,ammo){
	Entity.call(this,pic,x,y,dir,32,32,4,4,4,4);
	this.valid = true;
	this.type = 'Tank';
	this.ammo = ammo;
	this.onhit= function(){
		this.valid = false;
		this.occupy(false);
	};
	this.shot = function(){
		if (this.ammo > 0){
			this.ammo --;
			switch(this.direction){
				case NORTH:
				ent_bullets.add(new Bullet(res_pictures.bullet,this.x,Math.floor(this.y - this.ch/2),this.direction,this));
				break;
				case SOUTH:
				ent_bullets.add(new Bullet(res_pictures.bullet,this.x,Math.ceil(this.y+this.ch/2-1),this.direction,this));
				break;
				case WEST:
				ent_bullets.add(new Bullet(res_pictures.bullet,Math.floor(this.x - this.ch/2),this.y,this.direction,this));
				break;
				case EAST:
				ent_bullets.add(new Bullet(res_pictures.bullet,Math.ceil(this.x+this.ch/2-1),this.y,this.direction,this));
				break;
			}
		}
	};
	this.move = function(dir){
		
		if (this.direction != dir){
			// turning
			switch(this.direction){
			case NORTH:
			this.x = this.x;
			this.y = Math.ceil(this.y);
			break;
			case SOUTH:
			this.x = this.x;
			this.y = Math.floor(this.y);
			break;
			case WEST:
			this.x = Math.ceil(this.x);
			this.y = this.y ;
			break;
			case EAST:
			this.x = Math.floor(this.x);
			this.y = this.y ;
			break;
			}
			this.direction = dir;
		}else{
			switch(this.direction){
			case NORTH:
				this.x = this.x;
				this.y = this.y -0.5;
				if (collisionTest(this.x-2, this.y-2)||
					collisionTest(this.x-1, this.y-2)||
					collisionTest(this.x, this.y-2)||
					collisionTest(this.x+1, this.y-2)){
					this.y = Math.ceil(this.y );
				}
				break;
			case SOUTH:
				this.x = this.x;
				this.y = this.y +0.5;
				if (collisionTest(this.x-2, this.y+2)||
					collisionTest(this.x-1, this.y+2)||
					collisionTest(this.x, this.y+2)||
					collisionTest(this.x+1, this.y+2)){
					this.y = Math.floor(this.y );
				}
			break;
			case WEST:
				this.x = this.x-0.5;
				this.y = this.y ;
				if (collisionTest(this.x-2, this.y-2) ||
					collisionTest(this.x-2, this.y-1) ||
					collisionTest(this.x-2, this.y) ||
					collisionTest(this.x-2, this.y+1)){
					this.x = Math.ceil(this.x );
				}
			break;
			case EAST:
				this.x = this.x+0.5;
				this.y = this.y ;
				if (collisionTest(this.x+2, this.y-2) ||
					collisionTest(this.x+2, this.y-1) ||
					collisionTest(this.x+2, this.y) ||
					collisionTest(this.x+2, this.y+1)){
					this.x = Math.floor(this.x );
				}
			break;
			}		
			this.direction = dir;	
		}
	};
}

// ============== effect Ops ==============

function Animation(pic,x,y,dir,sw,sh,w,h,length, onfinish){
	var obj = {
		pic:pic,
		x:x,
		y:y,
		direction:dir,
		sw:sw,
		sh:sh,
		w:w,
		h:h,
		length:length,
		tick:0,
		onfinish:onfinish		
	};
	obj.animate = function(){
		if (this.tick >= this.length){
			if (!(this.onfinish == null)){
				this.onfinish();
			}
			return true;
		}
		context.save();
		context.translate(this.x*MAP_UNIT,this.y*MAP_UNIT);
		context.rotate(this.direction*90*Math.PI/180);
		context.drawImage(this.pic, 
			(this.sw * this.tick)% this.pic.width,
			0,
			this.sw,
			this.sh,
			-MAP_UNIT*this.w/2,
			-MAP_UNIT*this.h/2,
			MAP_UNIT*this.w,
			MAP_UNIT*this.w);
		context.restore();	
		this.tick ++;
		return false;
	}
	obj.addUpdate = function(){
		switch(this.direction){
			case NORTH:
			case SOUTH:
			addUpdateBlocks(
				this.x - this.w/2,
				this.y - this.h/2,
				this.w,
				this.h);
			break;
			case WEST:
			case EAST:
			addUpdateBlocks(
				this.x - this.h/2,
				this.y - this.w/2,
				this.h,
				this.w);
			break;
		}
	}
	return obj;
}
// ==============  Collision helper =============


function collisionTest(x,y){
	x = Math.floor(x); y = Math.floor(y);	
	if (map_collision[x + map_W*y] != null){
		return 3;
	}
	if (map_blocks[x + map_W*y] == 1){
		return 1;
	}else if (map_blocks[x + map_W*y] == 2){
		return 2;
	}
	return 0;
}

function occupy(entity,x,y,w,h){
	for (var xx = Math.floor(x); xx <= Math.ceil(x + w -1); xx++){
		for (var yy = Math.floor(y); yy <= Math.ceil(y + h -1); yy++){
			map_collision[xx + yy*map_W] = entity;
		}
	}	
}
// ============== graphics ==================
function addUpdateBlocks(x,y,w,h){
	for (var xx = Math.floor(x); xx <= Math.ceil(x + w -1); xx++){
		for (var yy = Math.floor(y); yy <= Math.ceil(y + h -1); yy++){
			updateBlockList.push({
				x:xx,
				y:yy
				});
		}
	}
}

function paintCollisionMap(){
	context.globalAlpha = 0.2;
	context.fillStyle = '#00ff00';
	for( var xx =0;xx<map_W;xx++){
		for (var yy = 0;yy<map_H;yy++){
			if (map_collision[xx+yy*map_W] != null)
				context.fillRect(xx*MAP_UNIT,yy*MAP_UNIT,MAP_UNIT,MAP_UNIT);
		}
	}
	context.globalAlpha = 1;
}
function canvas_clear(){
	context.fillStyle = '#000000';
	context.fillRect(0,0,canvas_w,canvas_h);
}
function repaintMap(){
	canvas_clear();
	for( var xx =0;xx<map_W;xx++){
		for (var yy = 0;yy<map_H;yy++){
			drawBlock(xx,yy);
		}
	}
}

function drawBlock(x,y){
	switch(map_blocks[x+y*map_W]){
		case 1:
		context.fillStyle = res_patterns.block;
		context.fillRect(x*MAP_UNIT,y*MAP_UNIT,MAP_UNIT,MAP_UNIT);
		break;
		case 2:
		context.fillStyle = res_patterns.iron;
		context.fillRect(x*MAP_UNIT,y*MAP_UNIT,MAP_UNIT,MAP_UNIT);
		break;
		case 0:
		context.fillStyle =  '#000000';
		context.fillRect(x*MAP_UNIT,y*MAP_UNIT,MAP_UNIT,MAP_UNIT);
		break;
	}
}

// ==============  helper ======================
function loadPattern(imageFileStr){
	var canvas_bg = document.createElement("canvas");  
	canvas_bg.width = MAP_UNIT*2;
	canvas_bg.height = MAP_UNIT*2;
	ctx = canvas_bg.getContext("2d");
	var img =new Image();
	img.src=imageFileStr;
	ctx.drawImage(img,0,0,MAP_UNIT*2,MAP_UNIT*2);
	return context.createPattern(canvas_bg,'repeat');
}
function loadPicture(imageFileStr){
	f_onload++;
	var img = new Image();
	img.src=imageFileStr;
	if (img.complete){
		f_onload--;
	}else{
		img.onload = function(){f_onload--};
	}
	return img
}
function shallowCopy(src) {
  var dst = {};
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      dst[prop] = src[prop];
    }
  }
  return dst;
}


function Pool(size){
	var array = new Array(size);
	for (var i = 0; i < array.length; i++){
		array[i] = new Object();
		array[i].valid = false;
		array[i].obj = null;
	}
	array.add = function(obj){
		for (var i=0;i<this.length;i++){
			if (!this[i].valid){
				break;
			}
		}
		if (i == this.length){
			console.log("pool overflowed");
			return false;
		}
		this[i].valid = true;
		this[i].obj = obj;
		return true;
	}
	array.release = function(i){
		this[i].valid = false;
		this[i].obj = null;
	}
	return array;
}