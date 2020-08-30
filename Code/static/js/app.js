var url = "../../data/samples.json";

//Function to choose unique values
function unique(arr){
    return arr.filter(function(val, index, array){
        return array.indexOf(val)==index;
    })
}

var file_content = d3.json(url)
file_content.then(function(data) {
    /* Bar plot */
    //Most browsers are not compatible with json in object format;
    //Hence, converted the json to array of objects format
    //The names are unique
    //Fill the dropdown
    var names = data[0]["names"];
    var dropdownTestID = d3.select("#selDataset")
    names.forEach(id => dropdownTestID.append("option").attr("value", id).attr("label", id))
    //Fill the demographic info
    var demographics_initial = data[0]['metadata'].filter(item=>item.id==names[0])[0];
    //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
    d3.select('#sample-metadata').html(`<p>id: ${demographics_initial.id}</p><p>ethnicity: ${demographics_initial.ethnicity}</p><p>gender: ${demographics_initial.gender}</p><p>age: ${demographics_initial.age}</p><p>location: ${demographics_initial.location}</p><p>bbtype: ${demographics_initial.bbtype}</p><p>wfreq: ${demographics_initial.wfreq}</p>`);

    // The dataset reveals that a small handful of microbial species 
    // (also called operational taxonomic units, or OTUs, in the study) were present in more than 70% of people, while the rest were relatively rare.

    //Fill the test subject IDs in the dropdown

}
);

function optionChanged(value){
    //console.log(value);
    file_content.then(function(data){
        var demographics = data[0]['metadata'].filter(item=>item.id==value)[0];
        //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
        d3.select('#sample-metadata').html(`<p>id: ${demographics.id}</p><p>ethnicity: ${demographics.ethnicity}</p><p>gender: ${demographics.gender}</p><p>age: ${demographics.age}</p><p>location: ${demographics.location}</p><p>bbtype: ${demographics.bbtype}</p><p>wfreq: ${demographics.wfreq}</p>`);

    });
    
}