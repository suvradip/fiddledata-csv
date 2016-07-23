/**
 * @description - variable define and declaration.
 */

var fs,
		outputFile,
		fileData,
		ParentCategoryData,
		ChildCategoryData,
		FiddleData,
		FiddleToCategory,
		removeValues,
		_tempParentCat = [];

fs = require("fs");
outputFile = "fiddleData-maping.csv";
fileData = JSON.parse(fs.readFileSync("fiddleData.json")); //data fetching from JSON file
ParentCategoryData = fileData.ParentCategoryData; //data assign
ChildCategoryData = fileData.ChildCategoryData; //data assign
FiddleData = fileData.FiddlesData; //data assign
FiddleToCategory = fileData.FiddleToCategory; //data assign		


//CSV file creation
fs.writeFileSync(outputFile, "Outer Wrapper, Parent Category, Child Category, Visualization Type, Fiddle Url, Fiddle Description, Fiddle Thumb");

/**
 * @description - removing null or undefined values from the Array
 * @param {Array} - An array which have null, undefined or empty values
 * @return {Array} - An array, without having any null or undefined values
 */
removeValues= (function(obj){
	
	var data = [];
	for(var i=0; i<obj.data.length; i++) {
		if(obj.data[i] && typeof obj.data !== "undefined"){
			if(obj.chk && typeof obj.chk !== "undefined"){
				if(obj.chk.indexOf(obj.data[i].toLowerCase()) === -1)//if(!obj.chk.hasOwnProperty(obj.data[i].toLowerCase()))
					data.push(obj.data[i]);
			} else {
				data.push(obj.data[i]);
			}
		}
	}
	return data;
});

/**
 * @description - preparation of data for csv file
 */
for(var i=0; i<FiddleToCategory.length; i++) {
	var f2c,
			fdldata,
			chldCatData,
			prntCatData,
			csvStr;
	f2c = FiddleToCategory[i];

	for(var j=0; j<FiddleData.length; j++) {
		if(FiddleData[j].fiddle_id === f2c.fiddle_id)
			fdldata = FiddleData[j];
	} //end of for-j loop

	for(var k=0; k<ChildCategoryData.length; k++) {
		if(ChildCategoryData[k].cat_id === f2c.category_id) {
			chldCatData = ChildCategoryData[k];
		}
	} //end of for-k loop
	
	for(var l=0; l<ParentCategoryData.length; l++){
		if(ParentCategoryData[l].cat_id === chldCatData.parent_cat_id)
			prntCatData = ParentCategoryData[l];
	} //end of for-l loop

	
	if(chldCatData.visualization_type.indexOf(",") !== -1) {
		var viz,
				parent_name,
				cat_name;

		viz = chldCatData.visualization_type.split(",");
		parent_name = viz[0];
		cat_name = chldCatData.cat_name;
		
		viz = removeValues({data:viz, chk: [parent_name.toLowerCase(), cat_name.toLowerCase()]}).join("|");
		//CSV sring creation
		csvStr = "\n"+ prntCatData.cat_name +","+ parent_name +","+ cat_name +","+ viz +","+
			fdldata.fiddle_url +","+ fdldata.fiddle_description +","+ fdldata.fiddle_thumb;
	} else {
		if(_tempParentCat.indexOf(chldCatData.cat_name) === -1){
			_tempParentCat.push(chldCatData.cat_name);
			csvStr = "\n"+ prntCatData.cat_name +","+ chldCatData.cat_name +","+ chldCatData.cat_name +","+ chldCatData.visualization_type +",,,,";
		}
	}
	//append data to the CSV file
	fs.appendFileSync("fiddleData-maping.csv", csvStr);		

} //end of for-i loop

