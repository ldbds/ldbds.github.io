
function getMapString(width,height,data){
	var str_prex = 
	'var map_level0 = JSON.parse(\'{ \\\r\n  \
	\\\"height\\\" : ' + height + ', \\\r\n  \
	\\\"width\\\" : '+ width +',   \\\r\n  \
	\\\"data\\\" : [ \\\r\n ';
	
	var str_sufx = ']}\'); \r\n   ';
	
	
	var str_data = '';
	var y = 0;
	var x = 0;
	for (y = 0; y <height-1;y++){
		for (x = 0;x < width;x++){
			str_data = str_data + data[x+y*width] + ',';
		}
		str_data = str_data + ' \\\r\n  ';
	}
	for (x = 0;x < width-1;x++){
		str_data = str_data + data[x+y*width] + ',';
	}
	str_data = str_data + data[height*width-1] + '  \\\r\n  ';
	
	return str_prex + str_data +str_sufx;
};