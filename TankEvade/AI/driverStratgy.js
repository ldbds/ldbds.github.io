
// search for 16 ticks
const SEARCH_TICK= 12;

const STEP_STAY = 0;
const STEP_N = 1;
const STEP_S = 2
const STEP_W = 3;
const STEP_E = 4;
const STEP_SW = 5;
const STEP_NE = 6;
const STEP_WN = 7;
const STEP_ES = 8;


	//  Destructor
function deleteTree(tree){
	UnexpandedInorder(tree,function(data){data.parent=null;});
}
	
	// Expand Tree
function expandFcn(){
	this.children = new Array();
	
	
	var branches = [STEP_N,STEP_S,STEP_W,STEP_E,STEP_SW,STEP_NE,STEP_WN,STEP_ES];
	while(branches.length != 0){
		var select = Math.floor(Math.random()*(branches.length));
		var command = branches[select];
		branches.splice(select,1);
		
		var commands = getCommands(command);
		var mdl = this.data.model;
		for (var i = 0; i< commands.length; i++){
			mdl = mdl.oneStep(commands[i])
		}
		if (mdl.myTank.valid){
			this.children.push(new Node({
				depth:this.data.depth+1,
				tick:this.data.tick+2,
				stepCmd:command,
				parent:this,
				model: mdl
			},expandFcn));		
		}
	}
	var prefer = STEP_STAY;
	if (Math.abs(mdl.myTank.x -map_W/2)>Math.abs(mdl.myTank.y -map_H/2)){
		if (mdl.myTank.x -map_W/2 >2){
			 prefer = STEP_W;
		}else if (mdl.myTank.x -map_W/2 <-2){
			 prefer = STEP_E;			
		}
	}else{
		if (mdl.myTank.y -map_H/2 >2){
			 prefer = STEP_N;
		}else if (mdl.myTank.y -map_H/2 <-2){
			 prefer = STEP_S;			
		}
	}
	var commands = getCommands(prefer);
	var mdl = this.data.model;
	for (var i = 0; i< commands.length; i++){
		mdl = mdl.oneStep(commands[i])
	}
	if (mdl.myTank.valid){
		this.children.push(new Node({
			depth:this.data.depth+1,
			tick:this.data.tick+2,
			stepCmd:prefer,
			parent:this,
			model: mdl
		},expandFcn));		
	}
}

function getResultCommands(data){
	var commandArray = new Array();
	
	while(data.parent != null){
		var commands = getCommands(data.stepCmd);
		commandArray = commands.concat(commandArray);
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

function DriverStratgy(){
	this.cmd = {
		shot:false,
		north:false,
		south:false,
		east:false,
		west:false
	};
	this.cmdBuffer = new Array();
	this.getCommand = function(myTank){
		//this.cmdBuffer = this.cmdBuffer.concat(getCommands(STEP_ES));
		
		var mdl = new  MapModel(ent_bullets,ent_myTank);
		var needReplan = false;
		for (var i =0; i<this.cmdBuffer.length;i++){
			mdl = mdl.oneStep(this.cmdBuffer[i]);
			if (!mdl.myTank.valid){
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
				parent:null,
				model:mdl
			},expandFcn);
			
			var result = dfs(tree,objectiveFcn) ;
			
			if (result == null){				
				deleteTree(tree);	
			var tree = new Node({
				depth:0,
				tick:this.cmdBuffer.length,
				parent:null,
				model:mdl
			},expandFcn);
			var result = dfs(tree,objectiveFcn) ;
				needReplan = true;
			}else{
				this.cmdBuffer = this.cmdBuffer.concat(getResultCommands(result));
				// dicard last 4 step
				this.cmdBuffer.pop();
				this.cmdBuffer.pop();
				this.cmdBuffer.pop();
				this.cmdBuffer.pop();
				
			//	this.drawTree(result);
			//	this.drawTreeDetail(result);
				deleteTree(tree);
				this.cmd = this.cmdBuffer.shift();
				
				return this.cmd;
			}	
		}
		
		console.log("Replaning...");
		var tree = new Node({
			depth:0,
			tick:-6,
			parent:null,
			model:new  MapModel(ent_bullets,ent_myTank)
		},expandFcn);
		var result = dfs(tree,objectiveFcn) ;
		
		if (result == null){
			
			deleteTree(tree);
			
			console.log("Can evade!!!");
			this.cmd = this.cmdBuffer.shift();
			if (this.cmd == null){
				return  {
					shot:true,
					north:false,
					south:false,
					east:false,
					west:false
				};
			}
			return this.cmd;	
		}else{
			this.cmdBuffer = getResultCommands(result);
			this.drawTree(result);
			this.drawTreeDetail(result);
			deleteTree(tree);
			this.cmd = this.cmdBuffer.shift();
			
			return this.cmd;
		}
	}
	
	this.drawTree = function(data){
		
		context.beginPath();
		context.globalAlpha = 0.5;
		context.strokeStyle =  '#ffffff';
		context.moveTo(data.model.myTank.x *MAP_UNIT, data.model.myTank.y*MAP_UNIT);
		while(data.parent != null){
			context.lineTo(data.model.myTank.x *MAP_UNIT, data.model.myTank.y*MAP_UNIT);
			data = data.parent.data;
		}
		context.stroke();
		context.globalAlpha = 1;
	}
	this.drawTreeDetail = function(data){
		
		while(data.parent != null){
			canvas_clear();
			data.model.drawModel();
			data = data.parent.data;
		}
	}
}


function getCommands(stepCmd){
	var commandArray = new Array();
	switch(stepCmd){
		case STEP_STAY:
		commandArray.unshift({
			shot:false,
			north:false,
			south:false,
			east:false,
			west:false
		});
		commandArray.unshift({
			shot:false,
			north:false,
			south:false,
			east:false,
			west:false
		});
		break;
		case STEP_N:
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
		case STEP_S:
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
		case STEP_W:	
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
		commandArray.unshift({
			shot:false,
			north:false,
			south:false,
			east:true,
			west:false
		});	
		case STEP_E:
		commandArray.unshift({
			shot:true,
			north:false,
			south:false,
			east:true,
			west:false
		});	
		break;
		case STEP_SW:
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
			south:false,
			east:false,
			west:true
		});			
		break;
		case STEP_NE:
		commandArray.unshift({
			shot:false,
			north:true,
			south:false,
			east:false,
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
		case STEP_WN:	
		commandArray.unshift({
			shot:false,
			north:false,
			south:false,
			east:false,
			west:true
		});		
		commandArray.unshift({
			shot:true,
			north:true,
			south:false,
			east:false,
			west:false
		});			
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
			south:true,
			east:false,
			west:false
		});			
		break;
	}
	
	return commandArray;
}