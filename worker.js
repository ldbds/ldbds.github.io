// timer_flag
var f_inproc = false;

//  settings
var canvas_w = 100;
var canvas_h = 100;

// map constant
const ENT_NONE = 0;
const ENT_SAND = 1;
const ENT_BUBBLE = 2;

// entity pool
const LIMIT = 8192;
var sands = new Array(LIMIT);
var bubbles = new Array(LIMIT);
const STT_ACTIVE = 1;
const STT_INACT = 0;

// active list
var act_bubble;
var act_sand;
//   buffer
var new_act_bubble;
var new_act_sand;
//  map  = type: 0- empty 1- sand 2- bubble , index
var map;

//update_list
var update_bubb;
var update_sand;
var update_none;

//  cmd
var cmd = new Object();
const CMD_IDLE = 0;
const CMD_ADD_ENT_SAND = 1;
const CMD_ADD_ENT_BUBB = 2;
const CMD_REMOVE = 3;
const CMD_GET_DATA = 4;
//============================ initial
self.onmessage = function(event){
    if (event.data.type == "start"){
		if(!(event.data.mapdata)){
			// init without data
			// initial settings
			canvas_w = event.data.value[0];
			canvas_h = event.data.value[1]; 

			// initial active list
			act_sand = new Array();
			act_bubble = new Array();
			
			// init cmd
			cmd.type = CMD_IDLE;
			//initial map
			map = new Array(canvas_w*canvas_h);
			for (var i=0; i < map.length;i++){
				map[i] = {type:ENT_NONE, index:0};
			}			
		}else{
			// initial settings
			canvas_w = event.data.value[0];
			canvas_h = event.data.value[1]; 
			// init cmd
			cmd.type = CMD_IDLE;
			
			// init with data
			sands = event.data.mapdata.sands;
			bubbles = event.data.mapdata.bubbles;
			act_sand = event.data.mapdata.act_sand;
			act_bubble = event.data.mapdata.act_bubble;
			map = event.data.mapdata.map;
			
		}
		// start main loop
        process();
    }else if(event.data.type == "addSand"){
		if (cmd.type != CMD_ADD_ENT_SAND){
			cmd.type = CMD_ADD_ENT_SAND;
			cmd.data = new Array();
			cmd.data.push(event.data);
		}else{
			cmd.data.push(event.data);
		}
	}else if(event.data.type == "addBubble"){
		if (cmd.type != CMD_ADD_ENT_BUBB){
			cmd.type = CMD_ADD_ENT_BUBB;
			cmd.data = new Array();
			cmd.data.push(event.data);
		}else{
			cmd.data.push(event.data);
		}
	}else if(event.data.type == "remove"){
		if (cmd.type != CMD_REMOVE){
			cmd.type = CMD_REMOVE;
			cmd.data = new Array();
			cmd.data.push(event.data);
		}else{
			cmd.data.push(event.data);
		}
	}else if(event.data.type == "getData"){
		cmd.type = CMD_GET_DATA;
	}
};

//=============================main loop
function process(){
	if (f_inproc){
		self.postMessage({
			type:"debug",
			message:"timeout..."
		});
	}
	f_inproc = true;
	//-----------start--------
	//update list	
		update_sand = new Array();
		update_bubb = new Array();
		update_none = new Array();
		
	// execute cmd
	var data = cmd.data;
	switch(cmd.type){
		case CMD_GET_DATA:
		var mapdata = new Object();
			mapdata.sands = sands;
			mapdata.bubbles = bubbles;
			mapdata.act_sand = act_sand;
			mapdata.act_bubble = act_bubble;
			mapdata.canvas_w = canvas_w;
			mapdata.canvas_h = canvas_h;
			mapdata.map = map;
			self.postMessage({
				type:"data",
				data:mapdata
			});	
		break;
		case CMD_IDLE:
		break;
		case CMD_ADD_ENT_SAND:
		for (var i = 0; i< data.length;i++){
			add_sand(data[i].value[0],data[i].value[1]);
		}
		break;
		case CMD_ADD_ENT_BUBB:
		for (var i = 0; i< data.length;i++){
			add_bubble(data[i].value[0],data[i].value[1]);
		}
		break;
		case CMD_REMOVE:
		for (var i = 0; i< data.length;i++){
			remove(data[i].value[0],data[i].value[1]);
		}
		break;
	};
	cmd.type = CMD_IDLE;
	
	// loop timer
	setTimeout("process()",160);
	// self.postMessage({
		// type:"debug",
		// message:"starting..."
	// });	
	
	// buffer act_list:
	new_act_bubble= act_bubble.slice(0);
	new_act_sand= act_sand.slice(0);
	
	//update active
	for (var i=0; i< act_bubble.length;i++){
		bubble_float(i);
	}
	
	for (var i=0; i< act_sand.length;i++){
		sand_sink(i);
	}
	// random joggle
	for (var i =0;i < 200 - act_sand.length - act_bubble.length;i++){
		joggle_random();
	}
	
	// remove overlapped update
	for (var i=0;i<update_none.length;i++){
		if (get_map_data_type(update_none[i].x, update_none[i].y) != ENT_NONE){
			update_none[i].x = -1;
		}
	}
	for (var i=0;i<update_sand.length;i++){
		if (get_map_data_type(update_sand[i].x, update_sand[i].y) != ENT_SAND){
			update_sand[i].x = -1;
		}
	}
	for (var i=0;i<update_bubb.length;i++){
		if (get_map_data_type(update_bubb[i].x, update_bubb[i].y) != ENT_BUBBLE){
			update_bubb[i].x = -1;
		}
	}
	// post update
	self.postMessage({update_sand:update_sand,
	                  update_bubb:update_bubb, 
					  update_none:update_none});
	self.postMessage({
		type:"info",
		data:{data1: act_sand.length,
			  data2: act_bubble.length,
			  data3: update_sand.length,
			  data4: update_bubb.length,
			  data5: update_none.length}
	});
	act_sand = new_act_sand;
	act_bubble = new_act_bubble;
	//------------End------------
	// self.postMessage({
		// type:"debug",
		// message:"finishing..."
	// });
	f_inproc = false;
}

// ==================== Update Algorithm
function joggle_random(){
	var x = Math.floor(Math.random()*canvas_w);
	var y = Math.floor(Math.random()*canvas_h);
	var dx;
	var dy;
	
	var i = get_map_data_index(x,y);
	switch (get_map_data_type(x,y)){
		case ENT_NONE:
		return false;
		case ENT_BUBBLE:
		dx = Math.random()>0.5?1:-1;
		dy = Math.random()>0.5?1:-1;
		if (get_map_data_type(x+dx,y+dy) == ENT_NONE){
			move_bubble(i,x+dx,y+dy);
			if (bubbles[i].stt == STT_INACT){
				new_act_bubble.push(i);
				bubbles[i].stt = STT_ACTIVE;
			}
		}else{
			return false;
		}
		break;
		case ENT_SAND:
		dx = Math.random()>0.5?1:-1;
		dy = Math.random()>0.5?1:-1;
		if (get_map_data_type(x+dx,y+dy) == ENT_NONE){
			move_sand(i,x+dx,y+dy);
			if (sands[i].stt == STT_INACT){
				new_act_sand.push(i);
				sands[i].stt = STT_ACTIVE;
			}
		}else{
			return false;
		}
		break;
	}
	
	return true;
}

function bubble_float(active_index){
	var index = new_act_bubble[active_index];
	if (!(bubbles[index])){
		//removed
		new_act_bubble.splice(active_index,1);
		return false;
	}
	var x = bubbles[index].x;
	var y = bubbles[index].y;
	
	switch(get_map_data_type(x,y -1)){
		case ENT_SAND:
		// inactivate
		new_act_bubble.splice(active_index,1);
		bubbles[index].stt = STT_INACT;
	// self.postMessage({
		// type:"debug",
		// message:"bubb inactive" + index,
		// data:bubbles
	// });
		return false;
		break;
		case ENT_NONE:
		move_bubble(index,x,y-1);
		break;
		case ENT_BUBBLE:
		{
			if (Math.random() >0.5){
				// flow left
				if (get_map_data_type(x-1,y) == ENT_NONE){
					move_bubble(index,x-1,y);
				}else{
						// inactivate
		new_act_bubble.splice(active_index,1);
		bubbles[index].stt = STT_INACT;
	// self.postMessage({
		// type:"debug",
		// message:"bubb inactive" + index,
		// data:bubbles
	// });
		return false;	
				}
			}else{
				// flow right
				if (get_map_data_type(x+1,y) == ENT_NONE){
					move_bubble(index,x+1,y);
				}else{
							// inactivate
		new_act_bubble.splice(active_index,1);
		bubbles[index].stt = STT_INACT;
	// self.postMessage({
		// type:"debug",
		// message:"bubb inactive" + index,
		// data:bubbles
	// });
		return false;
				}
			}
		}
		break;
	}
	
	// activate prev pos
	activate_neigh(x,y);
	return true;
}

function sand_sink(active_index){
	var index = new_act_sand[active_index];
	if (!(sands[index])) {
		//removed
		new_act_sand.splice(active_index,1);
		return false;
	}
	var x = sands[index].x;
	var y = sands[index].y;
	
	switch(get_map_data_type(x,y +1))	{
		case ENT_BUBBLE:
		// inactivate
		new_act_sand.splice(active_index,1);
		sands[index].stt = STT_INACT;
	// self.postMessage({
		// type:"debug",
		// message:"sand inactive" + index,
		// data:bubbles
	// });
		return false;
		break;
		case ENT_NONE:
		move_sand(index,x,y+1);
		break;
		case ENT_SAND:
		if (Math.random() >0.5){
				// flow right
				if (get_map_data_type(x+1,y+1) == ENT_NONE){
					move_sand(index,x+1,y+1);
				}else{
					
		// inactivate
		new_act_sand.splice(active_index,1);
		sands[index].stt = STT_INACT;
	// self.postMessage({
		// type:"debug",
		// message:"sand inactive" + index,
		// data:bubbles
	// });
		return false;
				}
		}else{
				// flow left
				if (get_map_data_type(x-1,y+1) == ENT_NONE){
					move_sand(index,x-1,y+1);
				}else{
					
		// inactivate
		new_act_sand.splice(active_index,1);
		sands[index].stt = STT_INACT;
	// self.postMessage({
		// type:"debug",
		// message:"sand inactive" + index,
		// data:bubbles
	// });
		return false;
				}
			
		}
		break;
	}
	// activate prev pos
	activate_neigh(x,y);
	return true;
}

// =============  active OPs

function activate_neigh(x,y){
	for (var xx= x-1; xx<= x+1; xx++){
		for (var yy = y-1; yy< y+1; yy++){
			switch(get_map_data_type(xx,yy)){
				case ENT_NONE:
				break;
				case ENT_BUBBLE:
				var i = get_map_data_index(xx,yy);
				if (bubbles[i].stt == STT_INACT){
		// self.postMessage({
			// type:"debug",
			// message:"bubb active" + i,
			// data:bubbles
		// });
					new_act_bubble.push(i);
					bubbles[i].stt = STT_ACTIVE;
				}
				break;
				case ENT_SAND:
				var i = get_map_data_index(xx,yy);
				if (sands[i].stt == STT_INACT){
	// self.postMessage({
		// type:"debug",
		// message:"sand active" + i,
		// data:bubbles
	// });
					new_act_sand.push(i);
					sands[i].stt = STT_ACTIVE;
				}
				break;
			}
		}
	}
}
// ============ basic op
function move_sand(index,nx,ny){
	nx = (nx+canvas_w)%canvas_w ;
	ny = (ny+canvas_h)%canvas_h ;
	var x = sands[index].x;
	var y = sands[index].y;
	set_map_data(nx,ny, ENT_SAND,index);
	set_map_data(x,y,ENT_NONE,0);	 
	sands[index].x = nx;
	sands[index].y = ny;
	update_none.push({x:x,y:y});
	update_sand.push({x:nx, y:ny});
}
function move_bubble(index,nx,ny){
	nx = (nx+canvas_w)%canvas_w ;
	ny = (ny+canvas_h)%canvas_h ;
	var x = bubbles[index].x;
	var y = bubbles[index].y;
	set_map_data(nx,ny, ENT_BUBBLE,index);
	set_map_data(x,y,ENT_NONE,0);	 
	bubbles[index].x = nx;
	bubbles[index].y = ny;	
	update_none.push({x:x,y:y});
	update_bubb.push({x:nx, y:ny});
}

// ==============  data manu
function add_sand(x,y){
	if (get_map_data_type(x,y) != ENT_NONE) return;
	for (var i=0;i<LIMIT;i++){
		if (!(sands[i])){
			sands[i] = {x:x,y:y,stt:STT_ACTIVE};
			set_map_data(x,y,ENT_SAND,i);
			update_sand.push({x:x, y:y});
			new_act_sand.push(i);
			
	self.postMessage({
		type:"debug",
		message:"add sand" + i,
		data:bubbles
	});
			return;
		}
	}
}

function add_bubble(x,y){
	if (get_map_data_type(x,y) != ENT_NONE) return;
	for (var i=0;i<LIMIT;i++){
		if (!(bubbles[i])){
			bubbles[i] = {x:x,y:y,stt:STT_ACTIVE};
			set_map_data(x,y,ENT_BUBBLE,i);
			update_bubb.push({x:x, y:y});
			new_act_bubble.push(i);
				
	self.postMessage({
		type:"debug",
		message:"add bubb" + i,
		data:bubbles
	});
			return;
		}
	}
}

function remove(x,y){
	var i = get_map_data_index(x,y);
	switch(get_map_data_type(x,y)){
		case ENT_BUBBLE:
			bubbles[i] = undefined;
			set_map_data(x,y, ENT_NONE,0);
			update_none.push({x:x,y:y});
				
	self.postMessage({
		type:"debug",
		message:"remove bubb" + i,
		data:bubbles
	});
		break;
		case ENT_SAND:
			sands[i] = undefined;
			set_map_data(x,y, ENT_NONE,0);
			update_none.push({x:x,y:y});
					
	self.postMessage({
		type:"debug",
		message:"remove sand" + i,
		data:bubbles
	});
		break;
		case ENT_NONE:
		break;
	}
	activate_neigh(x,y);
}

function get_map_data_type(x,y){
	return map[(x+canvas_w)%canvas_w + 
	   ((y+canvas_h)%canvas_h) *canvas_w].type;
}
function get_map_data_index(x,y){
	return map[(x+canvas_w)%canvas_w + 
	   ((y+canvas_h)%canvas_h) *canvas_w].index;
}	   
function set_map_data(x,y,type,index){
	var i = x+y*canvas_w;
	map[i].type= type
	map[i].index = index;
}
//---------------- tool

function moveX(x, dx){
	return (x+canvas_w +dx) % canvas_w;
}
function moveY(y,dy){
	return (y+canvas_h +dy) % canvas_h;
}
