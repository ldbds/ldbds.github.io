
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
