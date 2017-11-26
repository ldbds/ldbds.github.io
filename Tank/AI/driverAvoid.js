
// search for 16 ticks
const SEARCH_TICK= 12;

const STEP_STAY = 0;
const STEP_N = 1;
const STEP_S = 2;
const STEP_W = 3;
const STEP_E = 4;
	//	Simulator
var dangerArea = new Array(SEARCH_TICK+3);
function setInfeasibleAreaFor19Ticks(){
	for (var i =0;i<SEARCH_TICK+3;i++){
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
		case STEP_STAY:
			return IsFeasible(tank_model, data.tick+1);
		break;
		case STEP_N:
			for (var i=0;i <2;i++){
				tank_model.move(NORTH);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break;
		case STEP_S:
			for (var i=0;i <2;i++){
				tank_model.move(SOUTH);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break;
		case STEP_W:
			for (var i=0;i <2;i++){
				tank_model.move(WEST);
				if (!IsFeasible(tank_model, data.tick+i+1)){
					return false;
				}
			}
		break;
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


function tankMoveStep(tank,stepCmd){
	var new_tank = shallowCopy(tank);
	switch(stepCmd){
		case STEP_STAY:
		break;
		case STEP_N:
		new_tank.move(NORTH);
		new_tank.move(NORTH);
		break;
		case STEP_S:
		new_tank.move(SOUTH);
		new_tank.move(SOUTH);
		break;
		case STEP_W:
		new_tank.move(WEST);
		new_tank.move(WEST);
		break;
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
	
	if (isAlive(this.data, STEP_STAY)){
		var new_tank = tankMoveStep(this.data.tank,STEP_STAY);
		this.children.push(new Node({
			depth:this.data.depth+1,
			tick:this.data.tick+1,
			stepCmd:STEP_STAY,
			tank:new_tank,
			parent:this
		},expandFcn));
	}
	var branches = [STEP_N,STEP_S,STEP_W,STEP_E];
	while(branches.length != 0){
		var select = Math.floor(Math.random()*(branches.length));
		var command = branches[select];
		branches.splice(select,1);
		if (isAlive(this.data, command)){
			var new_tank = tankMoveStep(this.data.tank,command);
			this.children.push(new Node({
				depth:this.data.depth+1,
				tick:this.data.tick+2,
				stepCmd:command,
				tank:new_tank,
				parent:this
			},expandFcn));
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
function objectiveFcn(data){
	if (data.tick >= SEARCH_TICK){
		return true;
	}
	return false;
}

function DriverAvoid(){
	this.cmd = {
		shot:false,
		north:false,
		south:true,
		east:false,
		west:false
	};
	this.cmdBuffer = new Array();
	this.getCommand = function(myTank){
		
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
			// one more step
			var tree = new Node({
				depth:0,
				tick:this.cmdBuffer.length,
				tank:shallowCopy(tankModel),
				parent:null
			},expandFcn);
			
			var result = dfs(tree,objectiveFcn) ;
			
			if (result == null){
				
				deleteTree(tree);
				return this.getRandomMove(myTank);	
			}else{
				this.cmdBuffer = this.cmdBuffer.concat(getResultCommands(result));
				this.drawTree(result);
				deleteTree(tree);
				this.cmd = this.cmdBuffer.shift();
				
				if (Math.random()<0.05){
					this.cmd.shot = true;
				}else{
					this.cmd.shot = false;
				}
				return this.cmd;
			}	
		}else{
			var tree = new Node({
					depth:0,
					tick:0,
					tank:shallowCopy(myTank),
					parent:null
				},expandFcn)
			var result = dfs(tree,objectiveFcn) ;
			
			if (result == null){
				
				deleteTree(tree);
				return this.getRandomMove(myTank);	
			}else{
				this.cmdBuffer = getResultCommands(result);
				this.drawTree(result);
				deleteTree(tree);
				this.cmd = this.cmdBuffer.shift();
				
				if (Math.random()<0.05){
					this.cmd.shot = true;
				}else{
					this.cmd.shot = false;
				}
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
	
	this.drawTree = function(data){
		
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

