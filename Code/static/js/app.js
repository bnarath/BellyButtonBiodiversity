/* Global variables */
var url = "../../data/samples.json";
var file_content = d3.json(url)
var radius = 0.3;



//Barplot
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
            var data = [{
                type: "bar",
                x: sample_values,
                y: otu,
                marker: {
                    color: "rgba(128,0,128,0.5)"},
                orientation: "h",
                text: otu_labels,
            }];
            var layout = {
                title: title,
                xaxis: {title: {"text":"Sample Values"}}
            }
            
            var config = {responsive: true};
            Plotly.newPlot(id, data, layout, config);
        }
        else{
            //Plotly.restyle(id, {"x": [sample_values], "y":[otu]}, [0]);
            Plotly.update(id, {"x": [sample_values], "y":[otu], "text": [otu_labels]}, {"title": title}, {responsive: true});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{type: "bar", orientation: "h", x: [], y: [], text: []}], {title: title, xaxis: {title: {"text":"Sample Values"}}}, {responsive: true});
    }
    
}

//Bubble chart
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
            var data = [{
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
            var layout = {
                title: title,
            }

            var config = {responsive: true};
            
            Plotly.newPlot(id, data, layout, config);
        }
        else{
            Plotly.update(id, {"x": [sample_values], "y":[otu], "text": otu_labels, "marker": [{
                color: otu,
                colorscale: "Viridis",
                cmin: cmin,
                cmax: cmax,
                size: sample_values
            }]}, {"title": title},{responsive: true});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{x: [], y: []}], {title: title}, {responsive: true});
    }
    
}



function wfreqStats(data){
    //wfreq
    var wfreq = data[0]["metadata"].map(item=>item.wfreq);
    //Replace null with zeros
    wfreq = Array.from(wfreq, item => item || 0);
    //Find max and min
    var max_wfreq = wfreq.reduce((a, b) => {
        return (a>b ? a:b);
    })
    var min_wfreq = wfreq.reduce((a, b) => {
        return (a<b ? a:b);
    })
    return [min_wfreq, max_wfreq];
}

//Gauge chart
function gaugeChart(id, min_wfreq, max_wfreq, wfreq, radius, restyle=false, title){
    //Helper functions within the scope of gaugeChart
    function greenShades(N){
        var arr = [];
        var start = 10, end = 250, opacity=0.1;
        for(let i=0; i<N; i++){
            opacity += (0.7/N);
            arr.push(`rgba(${Math.floor(end-(i+1)*(end-start)/N)},${Math.floor(start+(i+1)*(end-start)/N)},${Math.floor(end-(i+1)*(end-start)/N)},${opacity.toFixed(1)})`)
        }
        return arr;
    }

    function convertValueToCords(wfreq, min_wfreq , max_wfreq, radius, x_init, y_init){
        var degrees = 180 - (180/(max_wfreq-min_wfreq))*wfreq;
        //Some corrections are required for SVG path to make it look good
        if(wfreq < (max_wfreq-min_wfreq)/2){
            degrees-=4;
        }else{
            degrees+=1;
        }
        var radians = (Math.PI/180)*degrees;
        var x = x_init + radius*Math.cos(radians);
        var y = y_init + radius*Math.sin(radians);
        return [x.toFixed(2), y.toFixed(2)];
    }

    //console.log(max_wfreq, min_wfreq, Math.min(...wfreq), Math.max(...wfreq));
    var labels = Array.from(Array(max_wfreq).keys()).slice(min_wfreq).map(item=>`${item}-${item+1}`);
    //create values - We need to build an array of all ones for all the labels , no of labels
    var values = new Array(max_wfreq-min_wfreq).fill(1);
    values.push(max_wfreq-min_wfreq);
    labels.push("");
    var x_cord, y_cord;
    [x_cord , y_cord] = convertValueToCords(wfreq, min_wfreq, max_wfreq, radius, 0.5, 0.5);
    gauge_colors = greenShades(max_wfreq-min_wfreq);
    gauge_colors.push("rgba(255,255,255,1)");

    
    var gauge = {
        type: "pie",
        values: values,
        rotation: 90,
        text: labels,
        textinfo: "text",
        textposition: "inside",
        "marker": {
            colors: gauge_colors,
        },
        labels: labels,
        hoverinfo: "label",
        hole: .5,
        type: "pie",
        showlegend: false,
        direction: "clockwise"
      };
    var indicator = {
            type: "indicator",
            value: wfreq,
            number: {"font":{"size":20, "color":"green"}},
            gauge: { axis: { visible: false, range: [min_wfreq, max_wfreq] } },
            domain: { x: [0, 1], y: [0, 0.9] }
    }
    var shape = [

        //Quadratic Bezier Curves
    
        {
            type: 'path',
            path: `M .49 0.5 L 0.51 0.5 L ${x_cord} ${y_cord} Z`,
            fillcolor: 'red',
            line: {
              color: 'red'
            },
        }]

    var config = {responsive: true};
    var title = {'text': title, 'font':{'family':'Arial Black', 'color':'black', 'size':16}, 'y':0.2, yref: 'paper'};
    var margin ={
        l: 0,
        r: 0,
        b: 0,
        t: 50,
        pad: 0
      }
    if(!restyle){
        //  The next part of the code deals with the needle of the gauge chart. The value that you set for the degrees variable will determine the angle at which the needle is drawn. The radius variable determines the length of the needle. The attributes x0 and y0 are used to set the starting point of our line. Similarly, the attributes x1 and y1 are used to set the ending point of our line. 
        Plotly.newPlot(id, [gauge, indicator], {"shapes": shape, "height": 400, "width":400, "title":title, "margin": margin}, config);
    }else{
        Plotly.update(id, {"value":wfreq}, {"shapes": shape, "title":title}, config, [1]);
    }

}
function init(file_content){

    //Function to choose unique values
    function unique(arr){
        return arr.filter(function(val, index, array){
            return array.indexOf(val)==index;
        })
    }

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
        top10BarhPlot(individual, `Top 10 OTUs in Subject ID ${names[0]}`, "bar");
        bubbleChart(individual, `Sample values for each OTUs in Subject ID ${names[0]}`, "bubble");

        // The basic structure of a gauge chart is similar to a donut chart. This means that we can use some cleverly selected values and create simple gauge charts by still keeping the type attribute set to pie. Basically, we will be hiding some sections of the full pie to make it look like a gauge chart.
        // The trick they did is to put a hole into the pie with an radius of 0.5, 
        // now they have a donut chart. What they did in addition is kind of tricky, they put N + 1 values to the pie/donut Chart. 
        // N is the number of gauge chart elements you want to have. You also have to define N + 1 colors and N + 1 labels for the chart.
        // This divides the whole pie equally between the hidden and visible part (Last value corresponds to invisible)
        gaugeChart("gauge", ...wfreqStats(data), demographics_initial.wfreq, radius, false, `Washing frequency of <br> Subject ID ${names[0]}`);
    }
    );

}
init(file_content);


function optionChanged(value){
    //console.log(value);
    file_content.then(function(data){
        var demographics = data[0]['metadata'].filter(item=>item.id==value)[0];
        //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
        d3.select('#sample-metadata').html(`<p>id: ${demographics.id}</p><p>ethnicity: ${demographics.ethnicity}</p><p>gender: ${demographics.gender}</p><p>age: ${demographics.age}</p><p>location: ${demographics.location}</p><p>bbtype: ${demographics.bbtype}</p><p>wfreq: ${demographics.wfreq}</p>`);
        var individual = data[0]['samples'].filter(item=>item.id==value)[0];
        top10BarhPlot(individual, `OTUs in Subject ID ${value}`, "bar", true);
        bubbleChart(individual, `Sample values for each OTUs in Subject ID ${value}`, "bubble");
        gaugeChart("gauge", ...wfreqStats(data), demographics.wfreq, radius, true, `Washing frequency of <br> Subject ID ${value}`);
    });
    
}