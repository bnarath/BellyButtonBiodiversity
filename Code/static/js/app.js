var url = "../../data/samples.json";
d3.json(url).then(function(data) {
    //Most browsers are not compatible with json in object format;
    //Hence, converted the json to array of objects format
    console.log(data[0]);
}
)