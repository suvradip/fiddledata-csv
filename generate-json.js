/**
 * @description - Generate fiddleData.json file from a CSV file. Here CSV file is a INPUT file and fiddleData.js
 *								is a OUTPU file.
 */

var fs,
		csvFileData,
		catid,
		fiddleid,
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
 		fiddleToCategory,
 		setFiddleToCategory,
 		getVizDataFormat,
 		generate;

//fs module loading
fs = require("fs");
//variable defination
catid = 0;
fiddleid = 0;
ParentCategory = {};
ChildCategory = {};
fiddleData = {};
XChild = {};
fiddleToCategory = [];
//inmporting csv file	using fs module
csvFileData = fs.readFileSync("fiddleData-maping.csv","utf-8").split("\n");

/**
 * @description - generation id for categories and fiddles
 * @return {Object} - with key values. {category: for category-id, fiddle: for fiddle-id}
 */
getId = {
	category : function(){
			catid = catid + 1;
			return catid;
	},
	fiddle : function(){
			fiddleid = fiddleid + 1;
			return fiddleid;
	}
};

/**
 * @description - helps to find out the particular parent name from pool or parentCategory
 * @param {String} name - Name of the parent
 * @return {String} - Id of the parent  
 */
getParentCategory = (function(name){
	return ParentCategory[name].cat_id;
});

setParentCategory = (function(obj){
	var catName;
	catName = obj.cat_name.toLowerCase();
	if(!ParentCategory.hasOwnProperty(obj.cat_name)) {
		obj.cat_id = getId.category(); //getId.parent();
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
		code = furl.charAt(furl.length - 1) === "/" ? furl.split("/").join("") : furl.split("/").pop();
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


//return child category-id
getChildCategory = (function(name){
	return ChildCategory[name.toLowerCase()].cat_id;
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

setFiddleToCategory = (function(obj){
	if(typeof obj.fiddle_id !== "undefined" && typeof obj.category_id !== "undefined") {
		fiddleToCategory.push(obj);
	}
});

generate = (function(){
	var prepParent,
 			prepChild,
 			prepFiddle;

	prepParent = [];
	prepChild = [];
	prepFiddle = [];
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
 output.FiddleToCategory= fiddleToCategory;
 
 fs.writeFileSync("demo.json", JSON.stringify(output, null, 4));
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
	setFiddleToCategory({fiddle_id:fid, category_id:getChildCategory(data[1])});
	setFiddleToCategory({fiddle_id:fid, category_id:cid});
}

generate();