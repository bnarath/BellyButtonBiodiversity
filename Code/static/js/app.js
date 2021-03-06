var url = 'data/samples.json';
var file_content = d3.json(url);
var radius = 0.4;
var title_color = '#0074E1';
var axis_font = "Courier New";
var title_font = 'Arial Black';


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
    //Layout styling
    var layout = {
        title: {'text':`<b>Sample values of Top 10 OTUs <br> in Subject ID ${name}</b>`, 'font':{'color':title_color, 'size':16}, 'x':0.5, 'xanchor':'center', 'y':0.85, 'yanchor':'top'},
        xaxis: {title: {"text":`Count of OTUs in the sample`}, font:{'size':12}, tickfont: {size: 12}, y:-0.05, showline:true, linewidth:2, linecolor:'black', mirror:true,  titlefont:{size:16, family:'Courier', color:title_color}},
        yaxis: {title: {"text":`Top 10 OTUs in the sample`}, font:{size:12}, tickfont: {size: 12}, showline:true, linewidth:2, linecolor:'black', mirror:true, titlefont:{size:16, family:'Courier', color:title_color}},
    };
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
            var config = {responsive: true};
            Plotly.newPlot(id, data, layout, config);
        }
        else{
            //Plotly.restyle(id, {"x": [sample_values], "y":[otu]}, [0]);
            Plotly.update(id, {"x": [sample_values], "y":[otu], "text": [otu_labels]}, layout, {responsive: true});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{type: "bar", orientation: "h", x: [], y: [], marker: {color: "#3895D3"}, text: []}], layout, {responsive: true});
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
    var layout = {
        font_family: axis_font,
        title: {'text':`<b>Sample values for each OTUs in Subject ID ${name}</b>`, 'font':{'color':title_color, 'size':16}, 'x':0.5, 'xanchor':'center', 'y':0.85, 'yanchor':'top'},
        xaxis: {title: {"text":`OTUs in the sample`}, font:{'size':12}, tickfont: {size: 12}, titlefont:{size:16, family:'Courier', color:title_color}},
        yaxis: {title: {"text":`Count of OTUs in the sample`}, font:{size:12}, tickfont: {size: 12}, titlefont:{size:16, family:'Courier', color:title_color}},
    };
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
            }]}, layout,{responsive: true});
        }
    }else{
        Plotly.deleteTraces(id, 0);
        Plotly.newPlot(id, [{x: [], y: []}], layout, {responsive: true});
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
    function convertValueToCords(wfreq, min_wfreq , max_wfreq, radius){
        var degrees = 180 - (180/(max_wfreq-min_wfreq))*wfreq;
        var radians = (Math.PI/180)*degrees;
        var x = radius*Math.cos(radians);
        var y = radius*Math.sin(radians);
        return [x.toFixed(2), y.toFixed(2)];
    }

    //Create an array of objects with keys range and colors dynamically
    var labels = Array.from(Array(max_wfreq).keys()).slice(min_wfreq).map(item=> [item, item+1]);
    var gauge_colors = colorShades(max_wfreq-min_wfreq);
    var steps = [];
    for(i=0;i<labels.length;i++){
        steps.push({"range": labels[i], "color": gauge_colors[i]})
    }
   
    //Create gauge object for trace
    var gauge = {
        domain: {'x':[0, 1], 'y':[0,1]}, //The occupation within the frame
        type: "indicator",
        values: wfreq,
        type: "indicator",
        mode: "gauge",
        gauge: {
            axis: {
                range: [min_wfreq, max_wfreq],
                tickmode: 'linear',
                tickfont : {
                    size: 15,
                }
            },
            bar: { color: 'rgba(0,0,0,0)' }, // Transparent gauge mark as we dont want that 
            //steps: steps
            steps: steps, //Array of labels and colors
        }, 
    };
    //Needle centre
    var needleBase = {
        type: 'scatter',
        x: [0],
        y: [0],
        marker: { size: 30, color: 'red' },
        name: wfreq,
        hoverinfo: 'name'
    };

    //Find the x-y cordinates corresponds to the wfreq
    var x_cord, y_cord;
    [x_cord , y_cord] = convertValueToCords(wfreq, min_wfreq, max_wfreq, radius);
    
    
    //layout definition
    var layout = {

        shapes: [
            //Needle pointer (triangle)
            {
                type: 'path',
                path: `M 0 -0.03 L 0 0.03 L ${x_cord} ${y_cord} Z`,
                fillcolor: 'red',
                line: {
                  color: 'red',
                },
            },
        ],

        title: {
                text: `<b>Washing frequency <br> (scrubes per week) <br> of Subject ID ${name}</b>`, 
                font: {
                        color : title_color,
                        size :16,
                        }, 
                y: 0,
                yref: 'paper'
            },

        height: 470,
        width: 470,

        xaxis: {
            range: [-0.5, 0.5],
            zeroline:false,
            showgrid: false,
            fixedrange: true, // If zoom, disrupt the radius calculation
            showticklabels: false, //Enable this to fine tune
        },

        yaxis: {
            range: [-0.22,0.73], //This value is derived based on the gauge position relative to the origin
            zeroline:false,
            fixedrange: true, // If zoom, disrupt the radius calculation
            showgrid: false,
            showticklabels: false, //Enable this to fine tune
        }
    }

    var config = {responsive: true};
    
    if(!restyle){
        //  The next part of the code deals with the needle of the gauge chart. The value that you set for the degrees variable will determine the angle at which the needle is drawn. The radius variable determines the length of the needle. The attributes x0 and y0 are used to set the starting point of our line. Similarly, the attributes x1 and y1 are used to set the ending point of our line. 
        Plotly.newPlot(id, [gauge, needleBase], layout, config);
    }else{
        Plotly.update(id, {"values":[wfreq], "name":[wfreq]},   layout, config);
    }

}

// ------------------------------------------------------------------------------------------------
//                                                  INITIALIZATION
//                                              Renders the page with the first look
// ------------------------------------------------------------------------------------------------
function init(file_content){

    file_content.then(function(data) {
        /* ID selection and demographics */
        //Fill the test subject IDs in the dropdown
        var names = data[0]["names"];
        var dropdownTestID = d3.select("#selDataset")
        names.forEach(id => dropdownTestID.append("option").attr("value", id).attr("label", id))
        
        //Fill the demographic info
        var demographics_initial = data[0]['metadata'].filter(item=>item.id==names[0])[0];
        var demoDiv = d3.select('#sample-metadata');
        demoDiv.append("ul").attr("class", "list-group list-group-flush");
        Object.entries(demographics_initial).forEach(([key, val])=>{
            demoDiv.select("ul").append("li").attr("class", "list-group-item p-1 demo-text bg-transparent")
                        .text(`${key} : ${val}`);
        })

        var individual = data[0]['samples'].filter(item=>item.id==names[0])[0];
        top10BarhPlot(individual, names[0], "bar");
        bubbleChart(individual, names[0], "bubble");
        gaugeChart("gauge", ...wfreqStats(data), demographics_initial.wfreq ? demographics_initial.wfreq:0 , radius, false, names[0]);
    
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
        //Fill the demographic info
        var demoDiv = d3.select('#sample-metadata');
        demoDiv.html("");
        demoDiv.append("ul").attr("class", "list-group list-group-flush");
        Object.entries(demographics).forEach(([key, val])=>{
            demoDiv.select("ul").append("li").attr("class", "list-group-item p-1 demo-text bg-transparent")
                        .text(`${key} : ${val}`);
        })
        //d3.select('#sample-metadata').html(`<p>id: ${demographics.id}</p><p>ethnicity: ${demographics.ethnicity}</p><p>gender: ${demographics.gender}</p><p>age: ${demographics.age}</p><p>location: ${demographics.location}</p><p>bbtype: ${demographics.bbtype}</p><p>wfreq: ${demographics.wfreq}</p>`);
        var individual = data[0]['samples'].filter(item=>item.id==value)[0];
        top10BarhPlot(individual, value, "bar", true);
        bubbleChart(individual, value, "bubble");
        gaugeChart("gauge", ...wfreqStats(data), demographics.wfreq ? demographics.wfreq: 0, radius, true, value);
    });
    
}