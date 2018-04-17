
// search for 16 ticks
var SEARCH_TICK= 5;
var SEARCH_TICK_MAX= 20;

	const LIMIT_MYBULLET = 5;
// steps
const STEP_STAY = 0;
const STEP_N = 1;
const STEP_S = 2;
const STEP_W = 3;
const STEP_E = 4;
const STEP_STAYS = 5; //unused
const STEP_NS = 6;
const STEP_SS = 7;
const STEP_WS = 8;
const STEP_ES = 9;

	//	Simulator
var dangerArea = new Array(SEARCH_TICK_MAX+3);
function setInfeasibleAreaFor19Ticks(){
	for (var i =0;i<SEARCH_TICK_MAX+3;i++){
		dangerArea[i] = getAllBulletTestRegion(i+1);
	}
}
function getAllBulletTestRegion(ticks){
	var regions = new Array();
	for (var i =0; i<LIMIT_BULLET;i++){
		if (ent_bullets[i].valid){
			var bullet = ent_bullets[i].obj;
			switch(bullet.direction){
			case NORTH:
				regions.push({x:Math.floor(bullet.x), y:Math.floor(bullet.y-ticks)});
				regions.push({x:Math.floor(bullet.x-1), y:Math.floor(bullet.y-ticks)});
				break;
			case SOUTH:
				regions.push({x:Math.floor(bullet.x), y:Math.floor(bullet.y+ticks)});
				regions.push({x:Math.floor(bullet.x-1), y:Math.floor(bullet.y+ticks)});
				break;
			case WEST:
				regions.push({x:Math.floor(bullet.x-ticks), y:Math.floor(bullet.y)});
				regions.push({x:Math.floor(bullet.x-ticks), y:Math.floor(bullet.y-1)});
				break;		
			case EAST:
				regions.push({x:Math.floor(bullet.x+ticks), y:Math.floor(bullet.y)});
				regions.push({x:Math.floor(bullet.x+ticks), y:Math.floor(bullet.y-1)});
				break;		

			}
		}
	}
	return regions;
}
function getCollisionType(x,y){
	return map_collision[
		Math.floor(x)+
		Math.floor(y)*map_W]
		.type;
}
function getScore(data){
	var score = 0;
	for (var i =0; i<data.my_bullets.length;i++){
		var bullet = data.my_bullets[i];
		var steps = data.tick-bullet.tick+1;
		switch(bullet.direction){
		case NORTH:
			if (collisionTest(bullet.x,bullet.y-steps) == 3) 
				score += getCollisionType(bullet.x,(bullet.y-steps)) == 'Bullet' ? 100:100;
			if (collisionTest(bullet.x-1,bullet.y-steps) == 3)
				score += getCollisionType(bullet.x-1,(bullet.y-steps)) == 'Bullet' ? 100:100;
			break;
		case SOUTH:
			if (collisionTest(bullet.x,bullet.y+steps) == 3) 
				score += getCollisionType(bullet.x,(bullet.y+steps)) == 'Bullet' ? 100:100;
			if (collisionTest(bullet.x-1,bullet.y+steps) == 3)
				score += getCollisionType(bullet.x-1,(bullet.y+steps)) == 'Bullet' ? 100:100;
			break;
		case WEST:
			if (collisionTest(bullet.x-steps,bullet.y) == 3)
				score += getCollisionType(bullet.x-steps,bullet.y) == 'Bullet' ? 100:100;
			if (collisionTest(bullet.x-steps,bullet.y-1) == 3)
				score += getCollisionType(bullet.x-steps,bullet.y-1) == 'Bullet' ? 100:100;
			break;		
		case EAST:
			if (collisionTest(bullet.x+steps,bullet.y) == 3)
				score += getCollisionType(bullet.x+steps,bullet.y) == 'Bullet' ? 100:100;
			if (collisionTest(bullet.x+steps,bullet.y-1) == 3)
				score += getCollisionType(bullet.x+steps,bullet.y-1) == 'Bullet' ? 100:100;
			break;		

		}
		if (score == 0){
			return -1;
		}
	}	
	return score;
}
function IsFeasible(tank,tick){
	var danger = dangerArea[tick-1];
	for (var i=0;i<danger.length;i++){
		var x = danger[i].x; var y = danger[i].y;
		if ( x >= Math.floor(tank.x - tank.cw/2) &&
		     x <= Math.ceil(tank.x + tank.cw/2 - 1) &&
		     y >= Math.floor(tank.y - tank.ch/2) &&
		     y <= Math.ceil(tank.y + tank.ch/2 )){
			return false;
		}
	}
	return true;
}

function isAlive(data,command){
	var tank_model = shallowCopy(data.tank);
	
	switch(command){
		case STEP_STAYS:
		case STEP_STAY:
			return IsFeasible(tank_model, data.tick+1);
		break;
		case STEP_NS:
		case STEP_N:
			for (var i=0;i <2;i++){
				tank_model.move(NORTH);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break
		case STEP_SS:
		case STEP_S:
			for (var i=0;i <2;i++){
				tank_model.move(SOUTH);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break;
		case STEP_WS:
		case STEP_W:
			for (var i=0;i <2;i++){
				tank_model.move(WEST);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break;
		case STEP_ES:
		case STEP_E:
			for (var i=0;i <2;i++){
				tank_model.move(EAST);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break;
	}
	return true;
}
function addBullet(data,command){
	switch(command){
		case STEP_NS:
			data.my_bullets.push({
				x:data.tank.x, y:Math.floor(data.tank.y - data.tank.ch/2),
				direction:NORTH,
				tick:data.tick});
		break;
		case STEP_SS:
			data.my_bullets.push({
				x:data.tank.x, y:Math.ceil(data.tank.y + data.tank.ch/2-1),
				direction:SOUTH,
				tick:data.tick});
		break;
		case STEP_WS:
			data.my_bullets.push({
				y:data.tank.y, x:Math.floor(data.tank.x - data.tank.cw/2),
				direction:WEST,
				tick:data.tick});
		break;
		case STEP_ES:
			data.my_bullets.push({
				y:data.tank.y, x:Math.ceil(data.tank.x + data.tank.cw/2-1),
				direction:EAST,
				tick:data.tick});
		break;
	}
}

function tankMoveStep(tank,stepCmd){
	var new_tank = shallowCopy(tank);
	switch(stepCmd){
		case STEP_STAYS:
		case STEP_STAY:
		break;
		case STEP_NS:
		case STEP_N:
		new_tank.move(NORTH);
		new_tank.move(NORTH);
		break;
		case STEP_SS:
		case STEP_S:
		new_tank.move(SOUTH);
		new_tank.move(SOUTH);
		break
		case STEP_WS:
		case STEP_W:
		new_tank.move(WEST);
		new_tank.move(WEST);
		break;
		case STEP_ES:
		case STEP_E:
		new_tank.move(EAST);
		new_tank.move(EAST);
		break;
	}
	return new_tank;
}

	//  Destructor
function deleteTree(tree){
	UnexpandedInorder(tree,function(data){data.parent=null;});
}

	//	
	// Expand Tree
function expandFcn(){
	this.children = new Array();
	if (this.data.tick >=SEARCH_TICK){
		return;
	}
	if(this.score <= -4){
		return;
	}
	
	if (isAlive(this.data, STEP_STAY)){
		var new_tank = tankMoveStep(this.data.tank,STEP_STAY);
		var newNode = new Node({
			depth:this.data.depth+1,
			tick:this.data.tick+1,
			stepCmd:STEP_STAY,
			tank:new_tank,
			parent:this,
			score:this.data.score,
			my_bullets:this.data.my_bullets.slice(0,0)
		},expandFcn);
		newNode.data.score += getScore(newNode.data,newNode.data.tick);
		this.children.push(newNode);
	}
	var branches = [STEP_N,STEP_S,STEP_W,STEP_E,STEP_NS,STEP_SS,STEP_WS,STEP_ES];
	while(branches.length != 0){
		var select = Math.floor(Math.random()*(branches.length));
		var command = branches[select];
		branches.splice(select,1);
		if (isAlive(this.data, command)){
			var new_tank = tankMoveStep(this.data.tank,command);
			var newNode = new Node({
				depth:this.data.depth+1,
				tick:this.data.tick+2,
				stepCmd:command,
				tank:new_tank,
				parent:this,
				score:this.data.score,
				my_bullets:this.data.my_bullets.slice(0,0)
			},expandFcn);
			addBullet(newNode.data,command);
			newNode.data.score += getScore(newNode.data,newNode.data.tick);
			this.children.push(newNode);
		}
	}
}
function getResultCommands(data){
	var commandArray = new Array();
	
	while(data.parent != null){
		switch(data.stepCmd){
			case STEP_STAY:
			commandArray.unshift({
				shot:false,
				north:false,
				south:false,
				east:false,
				west:false
			});
			break;
			case STEP_NS:
			commandArray.unshift({
				shot:false,
				north:true,
				south:false,
				east:false,
				west:false
			});	
			commandArray.unshift({
				shot:true,
				north:true,
				south:false,
				east:false,
				west:false
			});	
			break;
			case STEP_N:
			for (var i=0;i<2;i++){
			commandArray.unshift({
				shot:false,
				north:true,
				south:false,
				east:false,
				west:false
			});				
			}
			break;
			case STEP_SS:
			commandArray.unshift({
				shot:false,
				north:false,
				south:true,
				east:false,
				west:false
			});			
			commandArray.unshift({
				shot:true,
				north:false,
				south:true,
				east:false,
				west:false
			});			
			break;
			case STEP_S:
			for (var i=0;i<2;i++){
			commandArray.unshift({
				shot:false,
				north:false,
				south:true,
				east:false,
				west:false
			});				
			}
			break;
			case STEP_WS:
			commandArray.unshift({
				shot:false,
				north:false,
				south:false,
				east:false,
				west:true
			});		
			commandArray.unshift({
				shot:true,
				north:false,
				south:false,
				east:false,
				west:true
			});		
			break;
			case STEP_W:
			for (var i=0;i<2;i++){
			commandArray.unshift({
				shot:false,
				north:false,
				south:false,
				east:false,
				west:true
			});				
			}
			break;
			case STEP_ES:
			commandArray.unshift({
				shot:false,
				north:false,
				south:false,
				east:true,
				west:false
			});		
			commandArray.unshift({
				shot:true,
				north:false,
				south:false,
				east:true,
				west:false
			});		
			break;
			case STEP_E:
			for (var i=0;i<2;i++){
			commandArray.unshift({
				shot:false,
				north:false,
				south:false,
				east:true,
				west:false
			});				
			}
			break;
		}
		data = data.parent.data;
	}
	
	return commandArray;
}
	//	objective  : live SEARCH_TICK ticks
var origin_pos;
var max_score = 0;
var max_leaf_data = null;
function objectiveFcn(data){
	if (data.tick < SEARCH_TICK){
		return false;
	}
	score = data.score +
		Math.abs(data.tank.x - origin_pos.x) /2+Math.abs(data.tank.y - origin_pos.y) /2
	if (score > max_score){
		max_score = score;
		max_leaf_data = data;
	}
	if (score >= 1000){
		return true;
	}
	return false;
}

var tree;

function DriverAstar(){
	this.search_tick = 5;	
	this.cmd = {
		shot:false,
		north:false,
		south:true,
		east:false,
		west:false
	};
	this.cmdBuffer = new Array();
	this.getCommand = function(myTank){
		origin_pos ={x:myTank.x,y:myTank.y};
		max_score = 0;
		max_leaf_data = null;
		
		setInfeasibleAreaFor19Ticks();
		var tankModel = shallowCopy(myTank);
		var needReplan = true;
		for (var i =0; i<this.cmdBuffer.length;i++){
			tankModel.move(this.cmdBuffer[i]);
			if (!IsFeasible(tankModel, i+1)){
				needReplan = true;
				break;
			}
			needReplan = false;
		}
		if (!needReplan){
			this.search_tick += 1;
			if (this.search_tick >SEARCH_TICK_MAX){
				this.search_tick = SEARCH_TICK_MAX;
			}
			SEARCH_TICK = this.search_tick;
			// one more step
			tree = new Node({
				depth:0,
				tick:this.cmdBuffer.length,
				tank:shallowCopy(tankModel),
				parent:null,
				score:0,
				my_bullets:new Array()
			},expandFcn);
			
			var result = dfs(tree,objectiveFcn) ;
			//drawTree(tree);
			if (result == null){
				if (max_leaf_data != null){
					result = max_leaf_data;
				}
			}
			
			if (result == null){
				deleteTree(tree);
				return this.getRandomMove(myTank);	
			}else{
				this.cmdBuffer = this.cmdBuffer.concat(getResultCommands(result));
				//this.drawTrace(result);
				deleteTree(tree);
				this.cmdBuffer.pop(); // discard the last 4step
				this.cmdBuffer.pop();
				this.cmdBuffer.pop();
				this.cmdBuffer.pop();
				this.cmd = this.cmdBuffer.shift();
				return this.cmd;
			}	
		}else{
			this.search_tick = 4;
			SEARCH_TICK = this.search_tick;
			tree = new Node({
					depth:0,
					tick:0,
					tank:shallowCopy(myTank),
					parent:null,
					score:0,
					my_bullets:new Array()
				},expandFcn)
								
			max_score = 0;
			max_leaf_data = null;
			var result = dfs(tree,objectiveFcn) ;
			//drawTree(tree);
			if (result == null){
				if (max_leaf_data != null){
					result = max_leaf_data;
				}
			}
			
			if (result == null){
				
				deleteTree(tree);
				return this.getRandomMove(myTank);	
			}else{
				this.cmdBuffer = getResultCommands(result);
				//this.drawTrace(result);
				deleteTree(tree);
				this.cmd = this.cmdBuffer.shift();
				
				return this.cmd;
			}
		}
	}
	
	this.getRandomMove = function(myTank){
		var MOV_TH = 0.02;
		if (isBlocked(myTank)){
			MOV_TH = 1;
		}	

		this.target
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
	
	this.drawTrace = function(data){
		
		context.beginPath();
		context.globalAlpha = 0.5;
		context.strokeStyle =  '#ffffff';
		context.moveTo(data.tank.x *MAP_UNIT, data.tank.y*MAP_UNIT);
		while(data.parent != null){
			context.lineTo(data.tank.x *MAP_UNIT, data.tank.y*MAP_UNIT);
			data = data.parent.data;
		}
		context.stroke();
		context.globalAlpha = 1;
	}
}

