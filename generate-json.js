/**
 * @description - Generate fiddleData.json file from a CSV file. Here CSV file is a INPUT file and fiddleData.js
 *								is a OUTPU file.
 */

var fs,
		csvFileData,
		catid,
		fiddleid,
		parentid,
 		getId,
 		ParentCategory,
 		getParentCategory,
 		setParentCategory,
 		fiddleData,
 		getFiddleData,
 		setFiddleData,
 		ChildCategory,
 		getChildCategory,
 		setChildCategory,
 		XChild,
 		setXChild,
 		getXChild,
 		fiddleToCategory,
 		getVizDataFormat,
 		generate,
 		prepParent,
 		prepChild,
 		prepFiddle;

fs = require("fs");
catid = fiddleid =  parentid = 0;
ParentCategory = ChildCategory = fiddleData = XChild = {};
fiddleToCategory = [];

//inmporting csv file	
csvFileData = fs.readFileSync("fiddleData-maping.csv","utf-8").split("\n");

getId = {
	category : function(){
			catid = catid + 1;
			return catid;
	},
	fiddle : function(){
			fiddleid = fiddleid + 1;
			return fiddleid;
	},
	parent : function(){
			parentid = parentid + 1;
			return parentid;
	}
};

//return parent category-id
getParentCategory = (function(name){
	return ParentCategory[name].cat_id;
});

setParentCategory = (function(obj){
	var catName;
	catName = obj.cat_name.toLowerCase();
	if(!ParentCategory.hasOwnProperty(obj.cat_name)) {
		obj.cat_id = getId.parent();
		ParentCategory[obj.cat_name] = obj;
		return obj.cat_id;
	} else {
		return getParentCategory(obj.cat_name);
	}
});

//return the fiddle-id
getFiddleData = (function(code){
	return fiddleData[code].fiddle_id;
});

setFiddleData = (function(obj){
	var code,
			furl;
	furl = obj.fiddle_url;
	if(furl && typeof furl !== "undefined"){
		code = furl.chartAt(furl.length - 1) === "/" ? furl.split("/").join("") : furl.split("/").pop();
		if(!fiddleData.hasOwnProperty(code)){
			obj.fiddle_id = getId.fiddle();
			fiddleData[code] = obj;
			return obj.fiddle_id;
		} else {
			return getFiddleData(code);
		}
	} else {
		console.log("fiddle undefined");
	}	
});

/*getXChild = (function(name){
	return XChild[name].id;
});

setXChild = (function(name){
	var cat_id = getId.category();

	if(!XChild.hasOwnProperty(name)){
		XChild[name] = {id: cat_id};
		return cat_id;
	} else {
		return getXChild(name);
	}
});*/


//return child category-id
getChildCategory = (function(name){
	console.log(ChildCategory);
	return ChildCategory[name].cat_id;
});

setChildCategory = (function(obj){
	var catName;
	catName = obj.cat_name.toLowerCase();

	if(!ChildCategory.hasOwnProperty(catName)){
		obj.cat_id = getId.category();
		ChildCategory[catName] = obj;
		return obj.cat_id;
	} else {
		return getChildCategory(catName);
	}
});



getVizDataFormat = (function(obj){
	var viz;
	if(obj[1] === obj[2])
		viz = obj[2];
	else 
		viz = obj[1]+","+obj[2];

	if(obj[3] && typeof obj[3] !== "undefined")
		viz = viz+","+obj[3];

	return viz;
});


generate = (function(){
	prepParent = prepChild = prepFiddle = [];
	var output = {};
	for(var pkey in ParentCategory) {
		prepParent.push(ParentCategory[pkey]);
	}

	for(var ckey in ChildCategory) {
		prepChild.push(ChildCategory[ckey]);
	}

	for(var fkey in fiddleData) {
		prepFiddle.push(fiddleData[fkey]);
	}
 
 output.ParentCategoryData = prepParent;
 output.ChildCategoryData = prepChild;
 output.FiddlesData = prepFiddle;
 output.FiddleToCategory= FiddleToCategory;

 fs.writeFileSync("demo.json", JSON.parese(output));
});

for(var i=1; i<csvFileData.length; i++) {
	var data,
			fid,
			cid,
			pid;

	data = csvFileData[i].split(",");	
	pid = setParentCategory({cat_name:data[0]});
	cid = setChildCategory({cat_name:data[2], parent_cat_id:pid, visualization_type: getVizDataFormat(data)});
	fid = setFiddleData({fiddle_url:data[4], fiddle_description:data[5], fiddle_thumb:data[6]});
	
	//data mapping
	fiddleToCategory.push({fiddle_id:fid, category_id:getChildCategory(data[1])});
	fiddleToCategory.push({fiddle_id:fid, category_id:cid});

}

generate();