/**
 * @description - Generate fiddleData.json file from a CSV file. Here CSV file is a INPUT file and fiddleData.js
 *								is a OUTPU file.
 */

var fs,
		inputFileName,
		exploreLinksCSVFileName,
		outputFileName,
		csvFileData,
		catid,
		fiddleid,
 		getId,
 		ParentCategory,
 		FiddleData,
 		FiddleToCategory,
 		ExploreLinks,
 		Operations;

//fs module loading
fs = require("fs");
//variable defination
inputFileName = "fiddleData-maping.csv";
exploreLinksCSVFileName = "exploreLinks.csv";
outputFileName = "demo.json";
catid = 0;
fiddleid = 0;
ParentCategory = {};
ChildCategory = {};
FiddleData = {};
FiddleToCategory = {};
Operations = {};
//inmporting csv file	using fs module
csvFileData = fs.readFileSync(inputFileName,"utf-8").split("\n");

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
 * @description - helps to find out the particular parent name or set the data in ParentCategory object.
 *
 */
ParentCategory = {
	data : {},
	get : function(name){
		return ParentCategory.data[name].cat_id;
	},
	set : function(obj){
		var catName;
		catName = obj.cat_name.toLowerCase();
		if(!ParentCategory.data.hasOwnProperty(obj.cat_name)) {
			obj.cat_id = getId.category(); //getId.parent();
			ParentCategory.data[obj.cat_name] = obj;
			return obj.cat_id;
		} else {
			return ParentCategory.get(obj.cat_name);
		}
	}
};



/**
 * @description - helps to find out the particular childData informattion or set childData data in ChildCategory object.
 * 
 */
ChildCategory = {
	data : {},
	get : function(name){
		return ChildCategory.data[name.toLowerCase()].cat_id;
	},
	set : function(obj){
		var catName;
		catName = obj.cat_name.toLowerCase();

		if(!ChildCategory.data.hasOwnProperty(catName)){
			obj.cat_id = getId.category();
			obj.cat_name = obj.cat_name.replace(/\|/g,",");
			ChildCategory.data[catName] = obj;
			return obj.cat_id;
		} else {
			return ChildCategory.get(catName);
		}
	}
};



/**
 * @description - helps to find out the particular fiddle or set fiddle data in FiddleData object.
 * 
 */
FiddleData = {
	data : {},
	get : function(code){
		return FiddleData.data[code].fiddle_id;
	},
	set : function(obj){
		var code,
				furl;
		furl = obj.fiddle_url;

		if(furl && typeof furl !== "undefined"){
			code = furl.charAt(furl.length - 1) === "/" ? furl.split("/").join("") : furl.split("/").pop();
			if(!FiddleData.data.hasOwnProperty(code)){
				obj.fiddle_id = getId.fiddle();
				FiddleData.data[code] = obj;
				return obj.fiddle_id;
			} else {
				return FiddleData.get(code);
			}
		} else {
			//console.log("fiddle undefined");
		}	
	}
};


/**
 * @description - Mapping each fiddle to each category
 */
FiddleToCategory = {
	data : [],
	set : function(obj){
		if(typeof obj.fiddle_id !== "undefined" && typeof obj.category_id !== "undefined") {
			FiddleToCategory.data.push(obj);
		}
	}
};


/**
 * @description -
 */
ExploreLinks = {
	data : [],
	set : function(){
		var explorelinks;
		explorelinks =fs.readFileSync(exploreLinksCSVFileName, "utf-8").split("\n");
		for(var i=1; i<explorelinks.length; i++){
			var data = explorelinks[i].split(",");
			ExploreLinks.data.push({FilteredBy:data[0], Text:data[1], Links: data[2]});
		}
	}
};



/**
 * @description - Some internal operation and functionallity
 */
Operations = {
	constructViz : function(obj){
		var viz;
		if(obj[1] === obj[2])
			viz = obj[2];
		else 
			viz = obj[1]+","+obj[2];

		if(obj[3] && typeof obj[3] !== "undefined")
			viz = viz+","+obj[3];

		viz = viz.replace(/\|/ig, ",");
		return viz;
	},
	generate : function(){
		var prepParent,
	 			prepChild,
	 			prepFiddle;

		prepParent = [];
		prepChild = [];
		prepFiddle = [];
		var output = {};
		for(var pkey in ParentCategory.data) {
			prepParent.push(ParentCategory.data[pkey]);
		}

		for(var ckey in ChildCategory.data) {
			prepChild.push(ChildCategory.data[ckey]);
		}

		for(var fkey in FiddleData.data) {
			prepFiddle.push(FiddleData.data[fkey]);
		}
	 
	 output.ParentCategoryData = prepParent;
	 output.ChildCategoryData = prepChild;
	 output.FiddlesData = prepFiddle;
	 output.FiddleToCategory = FiddleToCategory.data;
	 output.ExploreLinks = ExploreLinks.data;
	 
	 fs.writeFileSync(outputFileName, JSON.stringify(output, null, 4));
	},
	run: function(){
		for(var i=1; i<csvFileData.length; i++) {
			var data,
					fid,
					cid,
					pid;

			data = csvFileData[i].split(",");	
			pid = ParentCategory.set({cat_name:data[0]});
			cid = ChildCategory.set({cat_name:data[2], parent_cat_id:pid, visualization_type: Operations.constructViz(data)});
			fid = FiddleData.set({fiddle_url:data[4], fiddle_description:data[5], fiddle_thumb:data[6]});
			
			//data mapping
			FiddleToCategory.set({fiddle_id:fid, category_id:ChildCategory.get(data[1])});
			FiddleToCategory.set({fiddle_id:fid, category_id:cid});
		} //end of for loop

		//create explorelinks
		ExploreLinks.set();
	}
};


//running the program
Operations.run();
//exporting the output
Operations.generate();