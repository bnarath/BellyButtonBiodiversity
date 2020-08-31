var url = "../../data/samples.json";

//Function to choose unique values
function unique(arr){
    return arr.filter(function(val, index, array){
        return array.indexOf(val)==index;
    })
}

function top10BarhPlot(individual, title, id, restyle=false){
    //Sort individual OTU ids based on sample values in descending order
    var otu = individual["otu_ids"].sort((a,b)=> individual.sample_values[individual["otu_ids"].indexOf(b)] - individual.sample_values[individual["otu_ids"].indexOf(a)] ).map(item => "OTU "+item);
    var otu_labels = individual["otu_labels"].sort((a,b)=> individual.sample_values[individual["otu_labels"].indexOf(b)] - individual.sample_values[individual["otu_labels"].indexOf(a)]);
    var sample_values = individual["sample_values"].sort((a,b)=>b-a);
    if(otu.length){
        if (otu.length>10){
            otu = otu.slice(0,10);
            sample_values = sample_values.slice(0,10);
            otu_labels = otu_labels.slice(0,10);
        }
        otu_labels = otu_labels.map(item=>item.replace(/;/g, "<br>"));
        //reverse the arrays to get the vertical alignment right
        otu = otu.sort((a,b)=> -1);
        sample_values = sample_values.sort((a,b)=> -1);
        
        //Title styling
        var title = {'text':title, 'font':{'family':'Arial Black', 'color':'black', 'size':16}, 'x':0.5, 'xanchor':'center', 'y':0.85, 'yanchor':'top'};
        if(!restyle){
            data = [{
                type: "bar",
                x: sample_values,
                y: otu,
                orientation: "h",
                text: otu_labels,
            }];
            layout = {
                title: title,
                xaxis: {title: {"text":"Sample Values"}}
            }
            
            Plotly.newPlot(id, data, layout);
        }
        else{
            //Plotly.restyle(id, {"x": [sample_values], "y":[otu]}, [0]);
            Plotly.update(id, {"x": [sample_values], "y":[otu], "text": [otu_labels]}, {"title": title});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{type: "bar", orientation: "h", x: [], y: [], text: []}], {title: title, xaxis: {title: {"text":"Sample Values"}}});
    }
    
}

function bubbleChart(individual, title, id, restyle=false){
    
    var otu = individual["otu_ids"];
    var sample_values = individual["sample_values"];
    var otu_labels = individual["otu_labels"];
    otu_labels = otu_labels.map(item=>item.replace(/;/g, "<br>"));

    if(otu.length){
        var cmin = otu.reduce(function (a,b){
            return (parseInt(a)<parseInt(b) ? a:b);
        })
        var cmax = otu.reduce(function (a,b){
            return (parseInt(a)>parseInt(b) ? a:b);
        })
        //console.log(otu, cmin, cmax);
        //Title styling
        var title = {'text':title, 'font':{'family':'Arial Black', 'color':'black', 'size':16}, 'x':0.5, 'xanchor':'center', 'y':0.85, 'yanchor':'top'};
        if(!restyle){
            data = [{
                mode: "markers",
                x: otu,
                y: sample_values,
                text: otu_labels,
                marker: {
                    color: otu,
                    colorscale: "Viridis",
                    cmin: cmin,
                    cmax: cmax,
                    size: sample_values
                }
            }];
            layout = {
                title: title,
            }
            
            Plotly.newPlot(id, data, layout);
        }
        else{
            Plotly.update(id, {"x": [sample_values], "y":[otu], "text": otu_labels, "marker": [{
                color: otu,
                colorscale: "Viridis",
                cmin: cmin,
                cmax: cmax,
                size: sample_values
            }]}, {"title": title});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{x: [], y: []}], {title: title});
    }
    
}


var file_content = d3.json(url)
file_content.then(function(data) {
    
    //Most browsers are not compatible with json in object format;
    //Hence, converted the json to array of objects format
    
    /* ID selection and demographics */
    //The names are unique
    //Fill the test subject IDs in the dropdown
    var names = data[0]["names"];
    var dropdownTestID = d3.select("#selDataset")
    names.forEach(id => dropdownTestID.append("option").attr("value", id).attr("label", id))
    //Fill the demographic info
    var demographics_initial = data[0]['metadata'].filter(item=>item.id==names[0])[0];
    //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
    d3.select('#sample-metadata').html(`<p>id: ${demographics_initial.id}</p><p>ethnicity: ${demographics_initial.ethnicity}</p><p>gender: ${demographics_initial.gender}</p><p>age: ${demographics_initial.age}</p><p>location: ${demographics_initial.location}</p><p>bbtype: ${demographics_initial.bbtype}</p><p>wfreq: ${demographics_initial.wfreq}</p>`);

    /* Bar plot */
    // The dataset reveals that a small handful of microbial species 
    // (also called operational taxonomic units, or OTUs, in the study) were present in more than 70% of people, while the rest were relatively rare.
    var individual = data[0]['samples'].filter(item=>item.id==names[0])[0];
    //console.log(individual);
    top10BarhPlot(individual, `Top 10 OTUs in Subject ID ${names[0]}`, "bar");
    bubbleChart(individual, `Sample values for each OTUs in Subject ID ${names[0]}`, "bubble");
    

}
);

function optionChanged(value){
    //console.log(value);
    file_content.then(function(data){
        var demographics = data[0]['metadata'].filter(item=>item.id==value)[0];
        //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
        d3.select('#sample-metadata').html(`<p>id: ${demographics.id}</p><p>ethnicity: ${demographics.ethnicity}</p><p>gender: ${demographics.gender}</p><p>age: ${demographics.age}</p><p>location: ${demographics.location}</p><p>bbtype: ${demographics.bbtype}</p><p>wfreq: ${demographics.wfreq}</p>`);
        var individual = data[0]['samples'].filter(item=>item.id==value)[0];
        top10BarhPlot(individual, `OTUs in Subject ID ${value}`, "bar", true);
        bubbleChart(individual, `Sample values for each OTUs in Subject ID ${value}`, "bubble");
    });
    
}