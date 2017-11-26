
function MapModel(bullets,tank){
	// ---------- Entitys
	this.myTank = new Object();
	this.myTank.x = tank.x;
	this.myTank.y = tank.y;
	this.myTank.direction = tank.direction;
	this.myTank.valid = tank.valid;
	
	this.bullets = new Array(LIMIT_BULLET);
	for (var i = 0;i < LIMIT_BULLET;i++){
		this.bullets[i] = new Object();
		this.bullets[i].x = bullets[i].x;
		this.bullets[i].y = bullets[i].y;
		this.bullets[i].valid = bullets[i].valid;
		this.bullets[i].direction = bullets[i].direction;
	}
	this.oneStep = function(command){
		var mdl_tank = new TankModel(this.myTank);
		var mdl_bullets = new Array(LIMIT_BULLET);
		for (i=0;i<LIMIT_BULLET;i++){
			mdl_bullets[i] = new BulletModel(this.bullets[i]);
		}
		
		
		// update tank
		var ismoving = false;
		if (command.north){
			ismoving = true;
			dir = NORTH;
		}else if(command.south){
			ismoving = true;
			dir = SOUTH;		
		}else if(command.west){
			ismoving = true;
			dir = WEST;
		}else if(command.east){
			ismoving = true;
			dir = EAST;
		}
		if (ismoving){
			mdl_tank.move(dir);
		}
		if (command.shot){
			var x;
			var y;
			var dir = mdl_tank.direction;
			switch(dir){
				case NORTH:
				x = mdl_tank.x;y =Math.floor(mdl_tank.y - 4/2)-1;
				break;
				case SOUTH:
				x =mdl_tank.x;y =Math.ceil(mdl_tank.y+4/2-1)+1;
				break;
				case WEST:
				x =Math.floor(mdl_tank.x - 4/2)-1;y =mdl_tank.y;
				break;
				case EAST:
				x = Math.ceil(mdl_tank.x+ 4/2-1)+1;y =mdl_tank.y;
				break;
			}
			for (i=0;i<LIMIT_BULLET;i++){
				if (!mdl_bullets[i].valid){
					mdl_bullets[i].x = x;
					mdl_bullets[i].y = y;
					mdl_bullets[i].direction = dir;	
					mdl_bullets[i].valid = true;			
					break;
				}
			}
		}
		
		
		// update bullet  & check
		for (var i=0;i<LIMIT_BULLET;i++){
			if (mdl_bullets[i].valid){
				mdl_bullets[i].fly();
				
				dir = mdl_bullets[i].direction;
				xx = mdl_bullets[i].x;
				yy = mdl_bullets[i].y;
				
				//  check Bullet Collision
				for (var j=0;(j<LIMIT_BULLET) && mdl_bullets[i].valid;j++){
					if (!(j == i) && mdl_bullets[j].valid){
						switch(dir){
							case NORTH:
							case SOUTH:
								if(mdl_bullets[j].y == yy){
									if(mdl_bullets[j].x == xx || mdl_bullets[j].x == xx) {
										mdl_bullets[i].valid = false;
										mdl_bullets[j].valid = false;
									}	
								}
								break;
							case WEST:	
							case EAST:
								if(mdl_bullets[j].x == xx){
									if(mdl_bullets[j].y==yy || mdl_bullets[j].y==yy) {
										mdl_bullets[i].valid = false;
										mdl_bullets[j].valid = false;
									}	
								}
								break;		
						}
					}
				}
				// check Tank Collision
				if(mdl_bullets[i].valid && mdl_tank.valid){
					var xxx = mdl_tank.x;
					var yyy = mdl_tank.y;
					switch(dir){
						case NORTH:
						case SOUTH:
							if ((xx >=  Math.floor(xxx - 2))&&(xx <=  Math.ceil(xxx + 1))){
								if ((yy >=  Math.floor(yyy - 2))&&(yy <=  Math.ceil(yyy + 1))){
									mdl_bullets[i].valid = false;
									mdl_tank.valid = false;
								}
							}
							break;
						case WEST:	
						case EAST:
							if ((xx >=  Math.floor(xxx - 2))&&(xx <=  Math.ceil(xxx + 1))){
								if ((yy >=  Math.floor(yyy - 2))&&(yy <=  Math.ceil(yyy + 1))){
									mdl_bullets[i].valid = false;
									mdl_tank.valid = false;
								}
							}
							break;		
					}
				}
			}
		}
		
		
		// return new map model
		return new MapModel(mdl_bullets,mdl_tank)
	}
	
	this.drawModel = function(){
		context.globalAlpha = 0.7;
		for (var i = 0;i < LIMIT_BULLET;i++){
			x = this.bullets[i].x;
			y = this.bullets[i].y;;
			direction = this.bullets[i].direction;
			if (this.bullets[i].valid){
				context.save();
				context.translate(x*MAP_UNIT,y*MAP_UNIT);
				context.rotate(direction*90*Math.PI/180);
				context.drawImage(res_pictures.bullet, 
					0,
					0,
					4,
					4,
					-MAP_UNIT*1/2/2,
					-MAP_UNIT*1/2/2,
					MAP_UNIT*1/2,
					MAP_UNIT*1/2);
				context.restore();
			}
		}
		
		{
			x = this.myTank.x;
			y = this.myTank.y;;
			direction = this.myTank.direction;
			if (this.myTank.valid){
				context.save();
				context.translate(x*MAP_UNIT,y*MAP_UNIT);
				context.rotate(direction*90*Math.PI/180);
				context.drawImage(res_pictures.mytank, 
					0,
					0,
					32,
					32,
					-MAP_UNIT*4/2,
					-MAP_UNIT*4/2,
					MAP_UNIT*4,
					MAP_UNIT*4);
				context.restore();
			}
		}
		
		context.globalAlpha = 1;
	}
}

function TankModel(tank){
	this.x = tank.x;
	this.y = tank.y;
	this.direction = tank.direction;
	this.valid = tank.valid;
	
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
				break;
			case SOUTH:
				this.x = this.x;
				this.y = this.y +0.5;
			break;
			case WEST:
				this.x = this.x-0.5;
				this.y = this.y ;
			break;
			case EAST:
				this.x = this.x+0.5;
				this.y = this.y ;
			break;
			}		
			this.direction = dir;	
		}
		if (this.x < 0 || this.x > map_W){
			this.valid = false;			
		}
		if (this.y <0 || this.y > map_H){
			this.valid = false;
		}
	};
}

function BulletModel(bullet){
	this.x = bullet.x;
	this.y = bullet.y;
	this.direction = bullet.direction;
	this.valid = bullet.valid;
	
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
		if (this.x < 0 || this.x > map_W){
			this.valid = false;			
		}
		if (this.y <0 || this.y > map_H){
			this.valid = false;
		}
	};
}