

function Driver(){
	this.cmd = {
		shot:false,
		north:false,
		south:true,
		east:false,
		west:false
	};
	this.getCommand = function(myTank){
		return this.getRandomMove(myTank);
	}
	
	this.getRandomMove = function(myTank){
		var MOV_TH = 0.02;
		if (isBlocked(myTank)){
			MOV_TH = 1;
		}	

		if (Math.random() <MOV_TH){
			var rand = Math.random();
			if (rand < 0.25){
				this.cmd.north = true;
				this.cmd.south = false;
				this.cmd.east = false;
				this.cmd.west = false;
			}else if(rand < 0.5){
				this.cmd.north = false;
				this.cmd.south = true;
				this.cmd.east = false;
				this.cmd.west = false;
			}else if(rand < 0.75){
				this.cmd.north = false;
				this.cmd.south = false;
				this.cmd.east = true;
				this.cmd.west = false;
			}else{
				this.cmd.north = false;
				this.cmd.south = false;
				this.cmd.east = false;
				this.cmd.west = true;
			}
		}
		
		if (Math.random()<0.2){
			this.cmd.shot = true;
		}else{
			this.cmd.shot = false;
		}
		return this.cmd;		
	}
	
}

function isBlocked(tank){
	switch(tank.direction){
		case NORTH:
			tank.x = tank.x;
			tank.y = tank.y -0.01;
			if (collisionTest(tank.x-2, tank.y-2)||
				collisionTest(tank.x-1, tank.y-2)||
				collisionTest(tank.x, tank.y-2)||
				collisionTest(tank.x+1, tank.y-2)){
					return true;
			}
			break;
		case SOUTH:
			tank.x = tank.x;
			tank.y = tank.y +0.01;
			if (collisionTest(tank.x-2, tank.y+2)||
				collisionTest(tank.x-1, tank.y+2)||
				collisionTest(tank.x, tank.y+2)||
				collisionTest(tank.x+1, tank.y+2)){
					return true;
			}
		break;
		case WEST:
			tank.x = tank.x-0.01;
			tank.y = tank.y ;
			if (collisionTest(tank.x-2, tank.y-2) ||
				collisionTest(tank.x-2, tank.y-1) ||
				collisionTest(tank.x-2, tank.y) ||
				collisionTest(tank.x-2, tank.y+1)){
					return true;
			}
		break;
		case EAST:
			tank.x = tank.x+0.01;
			tank.y = tank.y ;
			if (collisionTest(tank.x+2, tank.y-2) ||
				collisionTest(tank.x+2, tank.y-1) ||
				collisionTest(tank.x+2, tank.y) ||
				collisionTest(tank.x+2, tank.y+1)){
					return true;
			}
		break;
	}	
	return false;
}

