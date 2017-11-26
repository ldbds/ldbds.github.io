
// ---------- resources
var res_patterns = new Object();
var res_pictures = new Object();
var res_animations = new Object();

//  -------- canvas
var context;
var canvas_w;
var canvas_h;
var m_canvas;
var m_mapdata;
// ---------- map
var map_W;
var map_H;

var MAP_UNIT = 6;
var MAP_offX = 0;
var MAP_offY = 0;
// ---------- looper
var f_inproc;
var f_onload;
var f_restart = false;

var map_blocks;
var map_collision;

const TIME_LOOP = 36000;
var sys_time;
// ---------- control
var cmd1 = new Object();
var cmd2 = new Object();

var mouseTank;
var f_mouseshot = false;
var f_mousecdCnt = 0;
// ---------- Effects
var eff_animations = new Array();

// ---------- Entitys
var ent_myTank;
const LIMIT_BULLET = 60;
var ent_bullets = new Array(LIMIT_BULLET);

// --------- Enemy basement
var last_refresh_tick = -10000;
//  ---------- const
const NORTH = 0;
const WEST = 3;
const SOUTH = 2;
const EAST = 1;

const INTERVAL = 60;
const MINION = 0.0001;


// ====================== main ======================
function tank_start(canvas,mapdata){
	f_inproc = false;
	f_onload = 0;
	m_canvas = canvas;
	m_mapdata = mapdata;
	context =canvas.getContext("2d");
	canvas_w = canvas.width;
	canvas_h = canvas.height;
	map_W = mapdata.width;
	map_H = mapdata.height;	
	MAP_UNIT = Math.floor(Math.min(canvas_w/map_W,canvas_h/map_H));
	MAP_offX = (canvas_w - map_W*MAP_UNIT)/2;
	MAP_offY = (canvas_h - map_H*MAP_UNIT)/2;
	context.save();
	context.translate(MAP_offX, MAP_offY);
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
	map_blocks = mapdata.data;
	map_collision = new Array(map_W*map_H);
	for (var i = 0;i<map_W*map_H; i++){
		map_collision[i] = null;
	}
	
	// --------- init entity ----------
	// mouse tank
	mouseTank = new Object();
	mouseTank.ammo = 20;
	
	// bullets
	for (var i= 0;i< LIMIT_BULLET;i++){
		ent_bullets[i] = new Bullet(res_pictures.bullet,0,0,NORTH,null,false);
	}
	//        myTank
	ent_myTank = new Tank(res_pictures.mytank,map_W/2,map_H/2,SOUTH,40);
	ent_myTank.driver = new DriverStratgy();
	
	addBullet(20,9,WEST,null);
	// ---------init state & cmd --------
	registUI();
	
	// ------- Start --------
	repaintMap();
	sys_time = 0;
	process();
};
// --------mouse shot
function onKeyPress(event){
	if (mouseTank.ammo > 0 && !f_mouseshot){
		f_mouseshot = true;f_mousecdCnt = 0;
		// on PC
		if (event.offsetX){
			mouseTank.ammo--;
			X = Math.round((event.offsetX-MAP_offX)/MAP_UNIT);
			Y = Math.round((event.offsetY-MAP_offY)/MAP_UNIT);
			if (Y>map_H){Y = map_H;} if (Y<0){Y = 0;}
			if (X>map_W){X = map_W;} if (X<0){X = 0;}
			if (Math.abs(X - map_W/2) > Math.abs(Y - map_H/2) ){
				if (X < map_W/2){
					addBullet(4,Y,EAST,mouseTank);
				}else{
					addBullet(map_W-4,Y,WEST,mouseTank);
				}
			}else{
				if (Y < map_H/2){
					addBullet(X,4,SOUTH,mouseTank);
				}else{
					addBullet(X,map_H-4,NORTH,mouseTank);
				}			
			}	
		}else if (!event.touches[1]){
		// on Phone
			mouseTank.ammo--;
			event.preventDefault(); //阻止触摸时浏览器的缩放、滚动条滚动等
			var touch = event.touches[0]; //获取第一个触点
			var px = Number(touch.pageX); //页面触点X坐标
			var py = Number(touch.pageY); //页面触点Y坐标
			
			X = Math.round((px-MAP_offX)/MAP_UNIT);
			Y = Math.round((py-MAP_offY)/MAP_UNIT);
			if (Y>map_H){Y = map_H;} if (Y<0){Y = 0;}
			if (X>map_W){X = map_W;} if (X<0){X = 0;}
			if (Math.abs(X - map_W/2) > Math.abs(Y - map_H/2) ){
				if (X < map_W/2){
					addBullet(4,Y,EAST,mouseTank);
				}else{
					addBullet(map_W-4,Y,WEST,mouseTank);
				}
			}else{
				if (Y < map_H/2){
					addBullet(X,4,SOUTH,mouseTank);
				}else{
					addBullet(X,map_H-4,NORTH,mouseTank);
				}			
			}	
		}
	}
}	
//   ---tank Control
function registUI(){	
	cmd1.shot = false;
	cmd1.north = false;
	cmd1.south = false;
	cmd1.east = false;
	cmd1.west = false;
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
		}
	}
	document.onkeydown=function(event){
		event.preventDefault();
		var e = event ||
			window.event ||
			arguments.callee.caller.arguments[0];
		if(e && e.keyCode==13){  // enter
			cmd1.shot = true;
		}else if(e && e.keyCode==37){  // left
			cmd1.west = true;
		}else if(e && e.keyCode==39){  // right
			cmd1.east = true;
		}else if(e && e.keyCode==38){  // up
			cmd1.north = true;
		}else if(e && e.keyCode==40){  // down
			cmd1.south = true;
		}else if(e && e.keyCode==116){  // F5
			f_restart = true;
		}
	}; 
}

function process(){
	if (f_restart){
		f_restart = false;
		context.restore();	
		tank_start(m_canvas,m_mapdata);
		return;
	}
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
	
	
	//    --- mouse Cooldown----
	if (f_mouseshot){
		f_mousecdCnt ++;
	}
	if (f_mousecdCnt >4){
		f_mouseshot = false;
	}

	//              ---  BG  paint ---
	//  blocks
	for (var x = 0; x < map_W;x++){
	for (var y = 0; y < map_H;y++){
		drawBlock(x,y);
	}}
	
	//               ---  bullets move--
	//   Bullet fly 
	// update bullet  & check
	for (var i=0;i<LIMIT_BULLET;i++){
		var bullet = ent_bullets[i];
		if (bullet.valid){
			bullet.occupy(false);
			bullet.fly();
			
			dir = bullet.direction;
			xx = bullet.x;
			yy = bullet.y;
			
			//  check Bullet Collision
			for (var j=0;(j<LIMIT_BULLET) && bullet.valid;j++){
				if (!(j == i) && ent_bullets[j].valid){
					switch(dir){
						case NORTH:
						case SOUTH:
							if(ent_bullets[j].y == yy){
								if(ent_bullets[j].x == xx || ent_bullets[j].x == xx) {
									bullet.valid = false;
									ent_bullets[j].valid = false;ent_bullets[j].onhit();
								}	
							}
							break;
						case WEST:	
						case EAST:
							if(ent_bullets[j].x == xx){
								if(ent_bullets[j].y==yy || ent_bullets[j].y==yy) {
									bullet.valid = false;
									ent_bullets[j].valid = false;ent_bullets[j].onhit();
								}	
							}
							break;		
					}
				}
			}
			// check Tank Collision
			if(bullet.valid && ent_myTank.valid){
				var xxx = ent_myTank.x;
				var yyy = ent_myTank.y;
				switch(dir){
					case NORTH:
					case SOUTH:
						if ((xx >=  Math.floor(xxx - 2))&&(xx <=  Math.ceil(xxx + 1))){
							if ((yy >=  Math.floor(yyy - 2))&&(yy <=  Math.ceil(yyy + 1))){
								bullet.valid = false;
								ent_myTank.valid = false;
							}
						}
						break;
					case WEST:	
					case EAST:
						if ((xx >=  Math.floor(xxx - 2))&&(xx <=  Math.ceil(xxx + 1))){
							if ((yy >=  Math.floor(yyy - 2))&&(yy <=  Math.ceil(yyy + 1))){
								bullet.valid = false;
								ent_myTank.valid = false;
							}
						}
						break;		
				}
			}
			
			if (bullet.valid){
				bullet.occupy(true);
			}else{
				explodeAt(bullet,Math.floor(bullet.x),Math.floor(bullet.y-1));
				eff_animations.push(new Animation(res_animations.fire,bullet.x,bullet.y,NORTH,32,32,2,2,4,null));
				bullet.onhit();
			}
		}
	}
	
	//               --- my Tank move--
	if (ent_myTank.valid){
		var cmdBuffer;
			ent_myTank.occupy(false);
		if (ent_myTank.driver != undefined){
			cmdBuffer = shallowCopy(cmd1);
			cmd1.shot = false;
			if (cmdBuffer.shot ||cmdBuffer.north||cmdBuffer.south||cmdBuffer.west||cmdBuffer.east){
				controlTank(ent_myTank,cmdBuffer);
			}else{
				cmdBuffer = ent_myTank.driver.getCommand(ent_myTank);
				controlTank(ent_myTank,cmdBuffer);
			}
		}else{
			//   execute command
			cmdBuffer = shallowCopy(cmd1);
				cmd1.shot = false;
			controlTank(ent_myTank,cmdBuffer);
		}
			ent_myTank.occupy(true);
		//console.log(cmdBuffer);
	}else{
	}
	
	
	// ---------- redraw canvas-----
	
	//  tanks
	if (ent_myTank.valid){
		ent_myTank.draw();
	}
	
	//  bullets
	for (var i =0; i<LIMIT_BULLET;i++){
		if (ent_bullets[i].valid){
			var bullet = ent_bullets[i];
			if (bullet.valid){
				bullet.draw();	
			}else{
				bullet.occupy(false);
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
	
	
	
	if (!ent_myTank.valid){
		// game over
		
		context.globalAlpha = 0.2;
		ctx.fillStyle="#00ff00";
		context.font="50px Georgia";
		context.fillText("You win",map_W*MAP_UNIT/2-100,map_H*MAP_UNIT/2+25);
		
		context.globalAlpha = 1;
	}
	
	// model test
	// var model = new  MapModel(ent_bullets,ent_myTank);
	// for (var i = 0; i <10; i++)
		// model = model.oneStep(cmd1);
	// model.drawModel();
	
	
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
		break;
		case 2:
		break;
		case 3:
//			entity = map_collision[x +map_W*y];
//			entity.onhit();
		break;
	}
}


function addBullet(x,y,dir,src){
	for (i=0;i<LIMIT_BULLET;i++){
		if (!ent_bullets[i].valid){
			ent_bullets[i].x = x;
			ent_bullets[i].y = y;
			ent_bullets[i].direction = dir;	
			ent_bullets[i].src = src;		
			ent_bullets[i].valid = true;			
			break;
		}
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
function Bullet(pic,x,y,dir,src,valid){
	Entity.call(this,pic,x,y,dir,4,4,1/2,1/2,1,1);
	this.valid = valid;
	this.type = 'Bullet';
	this.src = src;
	this.onhit= function(){
		this.valid = false;
		this.occupy(false);
		
		if (this.src != null){
			this.src.ammo ++;
		}
	};
	this.fly = function(){
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
			if (this.x < 0 +4|| this.x > map_W-4){
				this.valid = false;			
			}
			if (this.y <0 +4|| this.y > map_H-4){
				this.valid = false;
			}
		return;
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
		//	this.ammo --;
			switch(this.direction){
				case NORTH:
				addBullet(this.x,Math.floor(this.y - this.ch/2)-1,this.direction,this);
				break;
				case SOUTH:
				addBullet(this.x,Math.ceil(this.y+this.ch/2-1)+1,this.direction,this);
				break;
				case WEST:
				addBullet(Math.floor(this.x - this.ch/2)-1,this.y,this.direction,this);
				break;
				case EAST:
				addBullet(Math.ceil(this.x+this.ch/2-1)+1,this.y,this.direction,this);
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
	return obj;
}
// ==============  Collision helper =============


function collisionTest(x,y,src){
	x = Math.floor(x); y = Math.floor(y);	
	if (map_collision[x + map_W*y] != null){
		if (map_collision[x + map_W*y].src != undefined && src != undefined){
			if(src != map_collision[x + map_W*y].src){
				return 3;
			}
			if(src == mouseTank){
				return 3;
			}
		}else{
			return 3;
		}
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
	context.fillRect(0,0,map_W*MAP_UNIT,map_H*MAP_UNIT);
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

