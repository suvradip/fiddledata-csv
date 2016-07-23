/**
 * @description - variable define and declaration.
 */

var fs = require("fs"),
		outputFile = "fiddleData-maping.csv",
		fileData = JSON.parse(fs.readFileSync("fiddleData.json")), //data fetching from JSON file
		ParentCategoryData = fileData.ParentCategoryData, //data assign
		ChildCategoryData = fileData.ChildCategoryData, //data assign
		FiddleData = fileData.FiddlesData, //data assign
		FiddleToCategory = fileData.FiddleToCategory, //data assign
		removeValues;


//CSV file creation
fs.writeFileSync(outputFile, "Parent Category, Child Category, Visualization Type, Fiddle Url, Fiddle Description, Fiddle Thumb");

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
 * @description - preparation of data
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
			// if(chldCatData.visualization_type.indexOf(",") !== -1) {
			// 	chldCatData.viz = chldCatData.visualization_type.split(",")[0];
			// 	console.log(chldCatData.viz);
			// }
		}
	} //end of for-k loop
	
	for(var l=0; l<ParentCategoryData.length; l++){
		if(ParentCategoryData[l].cat_id === chldCatData.parent_cat_id)
			prntCatData = ParentCategoryData[l];
	} //end of for-l loop


	if(chldCatData.visualization_type.indexOf(",") !== -1) {
		var checking = {};
		chldCatData.visualization_type = chldCatData.visualization_type.split(",");
		chldCatData.parent_name = chldCatData.visualization_type[0];

		checking[chldCatData.parent_name.toLowerCase()] =1;
		checking[chldCatData.cat_name.toLowerCase()] = 2;

		chldCatData.visualization_type = removeValues({data:chldCatData.visualization_type, 
																	chk: [chldCatData.parent_name.toLowerCase(), chldCatData.cat_name.toLowerCase()]});
		chldCatData.visualization_type = chldCatData.visualization_type.join("|");
		//chldCatData.visualization_type = chldCatData.visualization_type.slice(0, chldCatData.visualization_type.length).join("|");
		//chldCatData.visualization_type = chldCatData.visualization_type.slice(2, chldCatData.visualization_type.length).join("|");
		//CSV sring creation
		csvStr = "\n" + chldCatData.parent_name +","+ chldCatData.cat_name +","+ chldCatData.visualization_type +","+
			fdldata.fiddle_url +","+ fdldata.fiddle_description +","+ fdldata.fiddle_thumb;
	}
	//append data to the CSV file
	fs.appendFileSync("fiddleData-maping.csv", csvStr);		

} //end of for-i loop

