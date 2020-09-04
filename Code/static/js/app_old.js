/* Global variables */
var url = "data/samples.json"
var file_content = d3.json(url)
var radius = 0.8;
// ------------------------------------------------------------------------------------------------
//                                                  BAR PLOT 
//Input:- Data corresponds to specific individial (specimen ID), the placeholder of where to draw 
//        specimen ID as name, restyle(bool)
//Outcome:- Draw the top 10 OTUs in a bar chart
// ------------------------------------------------------------------------------------------------

function top10BarhPlot(individual, name, id, restyle=false){
    //Sort individual OTU ids based on sample values in descending order
    var otu = individual["otu_ids"].sort((a,b)=> individual.sample_values[individual["otu_ids"].indexOf(b)] - individual.sample_values[individual["otu_ids"].indexOf(a)] ).map(item => "OTU "+item);
    var otu_labels = individual["otu_labels"].sort((a,b)=> individual.sample_values[individual["otu_labels"].indexOf(b)] - individual.sample_values[individual["otu_labels"].indexOf(a)]);
    var sample_values = individual["sample_values"].sort((a,b)=>b-a);
    //Title styling
    var title = {'text':`Washing frequency of <br> Subject ID ${name}`, 'font':{'family':'Arial Black', 'color':'#3895D3', 'size':16}, 'x':0.5, 'xanchor':'center', 'y':0.85, 'yanchor':'top'};
    var xtitle = {title: {"text":`Count of OTUs in the sample`}, 'font':{'family':'Courier New, monospace', 'color':'#3895D3', 'size':12}, 'y':-0.05};
    var ytitle = {title: {"text":`Top 10 OTUs in the sample`}, 'font':{'family':'Courier New, monospace', 'color':'#3895D3', 'size':12}};
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
        
        if(!restyle){
            var data = [{
                type: "bar",
                x: sample_values,
                y: otu,
                marker: {
                    color: "#3895D3"},
                orientation: "h",
                text: otu_labels,
            }];
            var layout = {
                title: title,
                xaxis: xtitle,
                yaxis: ytitle
            }
            
            var config = {responsive: true};
            Plotly.newPlot(id, data, layout, config);
        }
        else{
            //Plotly.restyle(id, {"x": [sample_values], "y":[otu]}, [0]);
            Plotly.update(id, {"x": [sample_values], "y":[otu], "text": [otu_labels]}, {"title": title, "xaxis":xtitle, "yaxis":ytitle}, {responsive: true});
        }
    }else{
        console.log("Here");
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{type: "bar", orientation: "h", x: [], y: [], marker: {color: "#3895D3"}, text: []}], {title: title, xaxis: xtitle, yaxis: ytitle}, {responsive: true});
    }
    
}

// ------------------------------------------------------------------------------------------------
//                                                  Bubble Chart
//Input:- Data corresponds to specific individial (specimen ID), the placeholder of where to draw 
//        specimen ID as name, restyle(bool)
//Outcome:- Draw the bubble chart
// ------------------------------------------------------------------------------------------------

function bubbleChart(individual, name, id, restyle=false){
    
    var otu = individual["otu_ids"];
    var sample_values = individual["sample_values"];
    var otu_labels = individual["otu_labels"];
    otu_labels = otu_labels.map(item=>item.replace(/;/g, "<br>"));
    //Title styling
    var title = {'text':`Sample values for each OTUs in Subject ID ${name}`, 'font':{'family':'Arial Black', 'color':'#3895D3', 'size':16}, 'x':0.5, 'xanchor':'center', 'y':0.85, 'yanchor':'top'};
    var ytitle = {title: {"text":`Count of OTUs in the sample`}, 'font':{'family':'Courier New, monospace', 'color':'#3895D3', 'size':12}};
    var xtitle = {title: {"text":`OTUs in the sample`}, 'font':{'family':'Courier New, monospace', 'color':'#3895D3', 'size':12}};
    if(otu.length){
        var cmin = otu.reduce(function (a,b){
            return (parseInt(a)<parseInt(b) ? a:b);
        })
        var cmax = otu.reduce(function (a,b){
            return (parseInt(a)>parseInt(b) ? a:b);
        })
        //console.log(otu, cmin, cmax);
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
                xaxis: xtitle,
                yaxis: ytitle
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
            }]}, {"title": title, "xaxis": xtitle, "yaxis": ytitle},{responsive: true});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{x: [], y: []}], {title: title, xaxis: xtitle, yaxis: ytitle}, {responsive: true});
    }
    
}

//Function to find max and min wash frequencies (It is called by multiple functions)
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


// ------------------------------------------------------------------------------------------------
//                                                  Gauge Chart
//Input:- The placeholder of where to draw , min & max wash frequencies, radius of the pie,
//        restyle(bool)
//Outcome:- Draw the gauge chart
// ------------------------------------------------------------------------------------------------

function gaugeChart(id, min_wfreq, max_wfreq, wfreq, radius, restyle=false, name){


    //Helper functions within the scope of gaugeChart (To create the dynamic colors)
    function colorShades(N){
        var arr = [];
        var start = 10, end = 250, opacity=0.1;
        for(let i=0; i<N; i++){
            opacity += (0.7/N);
            arr.push(`rgba(${Math.floor(end-(i+1)*(end-start)/N)},${Math.floor(start+(i+1)*(end-start)/N)},${Math.floor(end-(i+1)*(end-start)/N)},${opacity.toFixed(1)})`)
        }
        return arr;
    }

    //This function finds the position of the needle based on x-y cordinate system
    function convertValueToCords(wfreq, min_wfreq , max_wfreq, radius, x_init, y_init){
        var degrees = 180 - (180/(max_wfreq-min_wfreq))*wfreq;
        //Some corrections are required for SVG path to make it look good
        if(wfreq < (max_wfreq-min_wfreq)/2){
            degrees-=1;
        }else{
            degrees+=1;
        }
        var radians = (Math.PI/180)*degrees;
        var x = x_init + radius*Math.cos(radians);
        var y = y_init + radius*Math.sin(radians);
        return [x.toFixed(2), y.toFixed(2)];
    }

    // The basic structure of a gauge chart is similar to a donut chart. 
    // This means that we can use some cleverly selected values and create simple gauge charts by still keeping the type attribute set to pie. 
    // Basically, we will be hiding some sections of the full pie to make it look like a gauge chart.
    // The trick they did is to put a hole into the pie with an radius of 0.5, 
    // now they have a donut chart. What they did in addition is kind of tricky, they put N + 1 values to the pie/donut Chart. 
    // N is the number of gauge chart elements you want to have. You also have to define N + 1 colors and N + 1 labels for the chart.
    // This divides the whole pie equally between the hidden and visible part (Last value corresponds to invisible)
    
    var labels = Array.from(Array(max_wfreq).keys()).slice(min_wfreq).map(item=>`${item}-${item+1}`);
    //create values - We need to build an array of all ones for all the labels , no of labels
    var values = new Array(max_wfreq-min_wfreq).fill(1);
    values.push(max_wfreq-min_wfreq);
    labels.push("");
    var x_cord, y_cord;
    [x_cord , y_cord] = convertValueToCords(wfreq, min_wfreq, max_wfreq, radius, 0.5, 0.5);
    gauge_colors = colorShades(max_wfreq-min_wfreq);
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
    console.log(`-.0 -0.025 L .0 0.025 ${x_cord} ${y_cord} Z`);
    var shape = [
    
        {
            type: 'path',
            domain: { x: [0, 1], y: [0, 1] },
            path: `-.0 -0.025 L .0 0.025 ${x_cord} ${y_cord} Z`,
            fillcolor: 'red',
            line: {
              color: 'red'
            },
        },

        {
            type: 'scatter',
            showlegend: false,
            x: [0],
            y: [0],
            marker: { size: 30, color: 'red' },
            name: wfreq,
            hoverinfo: 'name'
        }

    ]

    var config = {responsive: true};
    var title = {'text': `Washing frequency of <br> Subject ID ${name}`, 'font':{'family':'Arial Black', 'color':'#3895D3', 'size':16}, 'y':0.2, yref: 'paper'};
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

// ------------------------------------------------------------------------------------------------
//                                                  INITIALIZATION
//                                              Renders the page with the first look
// ------------------------------------------------------------------------------------------------
function init(file_content){

    //Function to choose unique values
    function unique(arr){
        return arr.filter(function(val, index, array){
            return array.indexOf(val)==index;
        })
    }


    file_content.then(function(data) {
        /* ID selection and demographics */
        //Fill the test subject IDs in the dropdown
        var names = data[0]["names"];
        var dropdownTestID = d3.select("#selDataset")
        names.forEach(id => dropdownTestID.append("option").attr("value", id).attr("label", id))
        //Fill the demographic info
        var demographics_initial = data[0]['metadata'].filter(item=>item.id==names[0])[0];
        //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
        d3.select('#sample-metadata').html(`<p>id: ${demographics_initial.id}</p><p>ethnicity: ${demographics_initial.ethnicity}</p><p>gender: ${demographics_initial.gender}</p><p>age: ${demographics_initial.age}</p><p>location: ${demographics_initial.location}</p><p>bbtype: ${demographics_initial.bbtype}</p><p>wfreq: ${demographics_initial.wfreq}</p>`);
        
        var individual = data[0]['samples'].filter(item=>item.id==names[0])[0];
        top10BarhPlot(individual, names[0], "bar");
        bubbleChart(individual, names[0], "bubble");
        gaugeChart("gauge", ...wfreqStats(data), demographics_initial.wfreq, radius, false, names[0]);
    }
    );

}
//INIT function is called
init(file_content);

// ------------------------------------------------------------------------------------------------
//                                              Option changed
//                             Renders the page dynamically when option is changed
// ------------------------------------------------------------------------------------------------
function optionChanged(value){
    //console.log(value);
    file_content.then(function(data){
        var demographics = data[0]['metadata'].filter(item=>item.id==value)[0];
        //d3.select("#sample-metadata").html(`<ul style="list-style-type:none;"><li>id: ${demographics_initial.id}</li><li>ethnicity: ${demographics_initial.ethnicity}</li><li>gender: ${demographics_initial.gender}</li><li>age: ${demographics_initial.age}</li><li>location: ${demographics_initial.location}</li><li>bbtype: ${demographics_initial.bbtype}</li><li>wfreq: ${demographics_initial.wfreq}</li></ul>`);
        d3.select('#sample-metadata').html(`<p>id: ${demographics.id}</p><p>ethnicity: ${demographics.ethnicity}</p><p>gender: ${demographics.gender}</p><p>age: ${demographics.age}</p><p>location: ${demographics.location}</p><p>bbtype: ${demographics.bbtype}</p><p>wfreq: ${demographics.wfreq}</p>`);
        var individual = data[0]['samples'].filter(item=>item.id==value)[0];
        top10BarhPlot(individual, value, "bar", true);
        bubbleChart(individual, value, "bubble");
        gaugeChart("gauge", ...wfreqStats(data), demographics.wfreq, radius, true, value);
    });
    
}