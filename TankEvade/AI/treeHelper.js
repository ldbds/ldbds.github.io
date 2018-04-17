var g_posX = 0;
function positionFcn(data){
	data.posX = g_posX;
	g_posX = g_posX+20;
}
function undrawFcn(data){
	if (data.showed != undefined){
		data.showed = undefined;
		return true;
	}
	return false;
}
function drawFcn(data){
	if (data.showed == undefined){
		data.showed = true;
		if (data.parent !=null){
			treeContext.beginPath();
			treeContext.moveTo(data.parent.data.posX+5,data.parent.data.depth*20+2);
			treeContext.lineTo(data.posX+5,data.depth*20-12);
			treeContext.stroke();
		}
		treeContext.strokeText(
		  //data.stepCmd,
		  data.score + Math.abs(data.tank.x - origin_pos.x) /2+Math.abs(data.tank.y - origin_pos.y) /2,
		  data.posX,
		  data.depth*20);
		return true;
	}
	return false;
}
function drawTree(tree){
	var c=document.getElementById("treeCanvas");	
	treeContext = c.getContext("2d");
	while (Unexpandedbfs(tree, undrawFcn) != null){;}
	treeContext.clearRect(0,0,1000,1000);
	treeContext.translate(0,20);
	g_posX = 0;
	UnexpandedInorder(tree, positionFcn);
	while (Unexpandedbfs(tree, drawFcn) != null){;}
	treeContext.translate(0,-20);
}
function dfs(tree,objective){
	
	var searchStack = new Array();
	searchStack.push(tree);
	while(1){
		if (searchStack.length == 0){
			break;
		}
		var top = searchStack.pop();
		if (objective(top.data)){
			return top.data;
		}else{
			if (!top.expanded) top.expand();
			for(var i = 0; i <top.children.length;i++){
				searchStack.push(top.children[i]);
			}
		}
	}
	return null;
}

function Unexpandeddfs(tree,objective){
	
	var searchStack = new Array();
	searchStack.push(tree);
	while(1){
		if (searchStack.length == 0){
			break;
		}
		var top = searchStack.pop();
		if (objective(top.data)){
			return top.data;
		}else{
			if (top.expanded){
				for(var i = 0; i <top.children.length;i++){
					searchStack.push(top.children[i]);
				}
			}
		}
	}
	return null;
}
function bfs(tree,objective){
	var searchStack = new Array();
	searchStack.unshift(tree);
	while(1){
		if (searchStack.length == 0){
			break;
		}
		var top = searchStack.pop();
		if (objective(top.data)){
			return top.data;
		}else{
			if (!top.expanded) top.expand();
			for(var i = 0; i <top.children.length;i++){
				searchStack.unshift(top.children[i]);
			}
		}
	}
	return null;
}

function Unexpandedbfs(tree,objective){
	var searchStack = new Array();
	searchStack.unshift(tree);
	while(1){
		if (searchStack.length == 0){
			break;
		}
		var top = searchStack.pop();
		if (objective(top.data)){
			return top.data;
		}else{
			if (top.expanded){
				for(var i = 0; i <top.children.length;i++){
					searchStack.unshift(top.children[i]);
				}
			}
		}
	}
	return null;
}
function Node(data,expandFcn){
	this.data = data;
	this.children = null;
	this.expanded = false;
	this.expandFcn = expandFcn;
	this.expand = function(){
		this.expanded = true;
		this.expandFcn();
	}
}

function Inorder(tree,operation){
	if (!tree.expanded) tree.expand();
	
	for(var i = 0; i <Math.floor(tree.children.length/2);i++){
		Inorder(tree.children[i],operation);
	}
	
	operation(tree.data);
	
	for(var i = Math.floor(tree.children.length/2); i <tree.children.length;i++){
		Inorder(tree.children[i],operation);
	}
	
}


function UnexpandedInorder(tree,operation){
	if (!tree.expanded) {
		operation(tree.data);
		return;
	}
	
	for(var i = 0; i <Math.floor(tree.children.length/2);i++){
		UnexpandedInorder(tree.children[i],operation);
	}
	
	operation(tree.data);
	
	for(var i = Math.floor(tree.children.length/2); i <tree.children.length;i++){
		UnexpandedInorder(tree.children[i],operation);
	}
	
}

