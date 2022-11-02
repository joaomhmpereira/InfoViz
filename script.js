const margin = { top: 20, right: 30, bottom: 40, left: 100 };
const clientWidth = document.documentElement.clientWidth;
const clientHeight = document.documentElement.clientHeight;
const widthSmaller = clientWidth/3.8 - margin.left - margin.right;
const heightSmaller = clientHeight/2.6 - margin.top - margin.bottom;
const widthBigger = clientWidth/1.8 - margin.left - margin.right;
const heightBigger = clientHeight/2 - margin.top - margin.bottom;

var currentSelectedBars = [];
var currentSelectedBubbles = [];
var bubbleCombinations = [];
var parallelCoordsSliders = [];
var currentGender = -1;
var currentAge = [18,55];
var currentAgeO = [18,55];
var currentAttr = [1, 10];
var currentAmb = [1, 10];
var currentSinc = [1, 10];
var currentIntel = [1, 10];
var currentFun = [1, 10];
var currentShar = [1, 10];

function init(){
    console.log(clientWidth)
    console.log(clientHeight)
    createParallelCoordinates("#chart1svg")
    createBubbleChart("#chart2svg");
    createSlopeGraph("#chart3svg");
    createGoalBarChart("#chart4svg");
}

/**
 * CASOS A TRATAR:
 * - Quando já temos pouca data e selecionamos uma bubble/barra p.ex pode não haver matches e o slopegraph nao atualiza
 * 
 */

/**
 * ===================================================================================
 * ---------------------------------------SLOPE---------------------------------------
 * ===================================================================================
 */

function callUpdates(){
    updateBubbleChart(currentGender, currentSelectedBars, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
    updateGoalBarChart(currentGender, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
    updateSlopeGraph(currentGender, currentSelectedBars, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
    updateParallelCoordinates(currentGender, currentSelectedBars, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
}

function createSlopeGraph(id){
    const svg = d3
        .select(id)
        .attr("width", widthSmaller*1.4 + margin.left + margin.right + 200)
        .attr("height", widthSmaller + margin.top + margin.bottom)
        .append("g")
        .attr("id", "gSlope")
        .attr("transform", `translate(${margin.left}, ${margin.top })`);

    d3.json("data.json").then(function (data) {
        data = data.filter(function(d){
            return d.age != -3 && d.age_o != -3 && d.match == 1
        })
        var dimensions = Object.keys(data[0]).filter(function(d) { return d == "age" || d == "age_o" });
        //console.log(data)

        // For each dimension, I build a linear scale. I store all in a y object
        const y = {}
        for (i in dimensions) {
          name = dimensions[i]
          y[name] = d3.scaleLinear()
            .domain([18,43])
            .range([heightSmaller, 0])
        }

        // Build the X scale -> it find the best position for each Y axis
        x = d3.scalePoint()
          .range([0, widthSmaller])
          .padding(0)
          .domain(dimensions);

        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }


        // Draw the lines
        svg
          .selectAll("mySlopePath")
          .data(data, (d) => d.id)
          .join("path")
          .attr("d",  path)
          .attr("class", "mySlopePath")
          .attr("fill", "none")
          .attr("stroke", (d) =>  lineColor(d.gender))
          .attr("stroke-opacity", 0.5)
          .attr("stroke-width", 1.5)

          .on("mouseover", function(event, d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke-width", 6)
              .attr("stroke-opacity", 1)
              .attr("stroke", "red")
          })
          .on("mouseleave", function(d) {
            d3.select(this)
              .transition()
              .duration(100)
              .attr("stroke-width", 2)
              .attr("stroke-opacity", 0.5)
              .attr("stroke", (d) =>  lineColor(d.gender))
          });
            
        var sliderAge = d3
            .sliderLeft()
            .min(18)
            .max(d3.max(data, (d) => d.age))
            .width(200)
            .height(heightSmaller-20)
            .ticks(0)
            .step(1)
            .default([18, 55])
            .fill('#1a4b8e')
            .on('end',  val => {
                currentAge = val;
                callUpdates();
            })
            
        
        var sliderAgeO = d3
            .sliderRight()
            .min(18)
            .max(d3.max(data, (d) => d.age_o))
            .width(200)
            .height(heightSmaller-20)
            .ticks(0)
            .step(1)
            .default([18, 55])
            .fill('#1a4b8e')
            .on('end',  val => {
                currentAgeO = val;
                callUpdates();
            })
        
        //console.log(y["age"](18) - y["age"](55))
        x_pos = x("age") + 100;
        var gAge = d3
            .select(id)
            .append('svg')
            .attr('width', 200)
            .attr('height', y["age"](18) - y["age"](55))
            .append('g')
            .attr('transform', 'translate('+ x_pos.toString() +',30)');
        
        x_pos = x("age_o") + 100;
        var gAgeO = d3
            .select(id)
            .append('svg')
            .attr('width', 600)
            .attr('height', 450)
            .append('g')
            .attr('transform', 'translate('+ x_pos.toString() +',30)');
        
        gAge.call(sliderAge);
        gAgeO.call(sliderAgeO);
    });

}

function updateSlopeGraph(gender, goals, combinations, ageGap, ageOGap, attr, sinc, intel, amb, fun, shar) {
    console.log("Gender slope: " + gender + " Goals Slope: " + goals + " Bubbles Slope: " + combinations.length)
    d3.json("data.json").then(function (data) {
        data = data.filter(function(elem){
            return elem.age >= ageGap[0] && elem.age <= ageGap[1] && elem.match == 1 && elem.age_o >= ageOGap[0] && elem.age_o <= ageOGap[1]
                   && elem.attr_o >= attr[0] && elem.attr_o <= attr[1] && elem.sinc_o >= sinc[0] && elem.sinc_o <= sinc[1] && elem.intel_o >= intel[0] && elem.intel_o <= intel[1]
                   && elem.amb_o >= amb[0] && elem.amb_o <= amb[1] && elem.fun_o >= fun[0] && elem.fun_o <= fun[1] && elem.shar_o >= shar[0] && elem.shar_o <= shar[1];
        })
        //gender is specified
        if(gender != -1){
            //goals are specified
            if(goals.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && goals.includes(elem.goal) && elem.match == 1;
                })
            } if(combinations.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && checkBubbles(elem, combinations) && elem.match == 1;
                })
            }  else { //goals are not specified
                data = data.filter(function(elem){
                    return elem.gender == gender && elem.match == 1;
                })
            }
        } else { //gender is not specified
            //goals are specified
            if(goals.length != 0){
                data = data.filter(function(elem){
                    return goals.includes(elem.goal) && elem.match == 1;
                })
            } if(combinations.length != 0){
                data = data.filter(function(elem){
                    return checkBubbles(elem, combinations) && elem.match == 1;
                })
            } else { //goals and gender are not specified
                data = data.filter(function(elem){
                    return elem.match == 1;
                })
            }
        }

        var data = data.filter((d) => {return d.age != -3 && d.age_o != -3 })
        const svg = d3.select("#gSlope");

        if(data.length != 0) 
            var dimensions = Object.keys(data[0]).filter(function(d) { return d == "age" || d == "age_o"});
        else
            console.log("No data")
        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }


        // For each dimension, I build a linear scale. I store all in a y object
        const y = {}
        for (i in dimensions) {
            name = dimensions[i]
            y[name] = d3.scaleLinear()
            .domain([18,43])
            .range([heightSmaller, 0])
        }
 
         // Build the X scale -> it find the best position for each Y axis
         x = d3.scalePoint()
           .range([0, widthSmaller])
           .padding(0)
           .domain(dimensions);


        svg
            .selectAll("path.mySlopePath")
            .data(data, (d) => d.id)
            .join(
                (enter) => {
                    console.log("enter")
                    lines = enter
                        .append("path")
                        .attr("class", "mySlopePath")
                        .attr("d",  x(0))
                        .attr("fill", "none")
                        .attr("stroke", (d) =>  lineColor(d.gender))
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-width", 1.5)
                    lines
                        .transition()
                        .duration(1000)
                        .attr("d",  path)
                }, 
                (update) => {
                    console.log("update")
                    update
                        .transition()
                        .duration(1500)
                        .attr("d",  path)
                },
                (exit) => {
                    console.log("exit")
                    exit.remove();
                }
            )
    });
}


/**age
 * ===================================================================================
 * -------------------------------------PARALLEL--------------------------------------
 * ===================================================================================
 */

function lineColor(gender){
    if(gender == 0){
        return "#74c7fd";

    } else {
        return "#fb74fd";
    }
}


function filterData(data) {
    var array = [];
    for (var i = 1; i <= 552; i++) {
            var newData = data.filter((d) => {return d.id == i})
            if (newData.length != 0) {
                var object = {
                    id: i,
                    gender: newData[0].gender,
                    attr_o:  newData[0].attr_o,
                    sinc_o:  newData[0].sinc_o,
                    intel_o:  newData[0].intel_o,
                    amb_o:  newData[0].amb_o,
                    fun_o: newData[0].fun_o,
                    shar_o: newData[0].shar_o
                }
            }
            array.push(object);

    }
    console.log(array)
    return array;
}

function filterDatav2(data){
    var array = []
    var seenIds = []
    data.map((d) => {
        if(!seenIds.includes(d.id)){
            array.push(d)
            seenIds.push(d.id)
        }
    })
    //console.log(array)
    return array;
}

function parallelLabels(d){
    switch (d) {
        case "attr_o":
            return "Attractiveness";
        case "sinc_o":
            return "Sinceriness";
        case "intel_o":
            return "Intelligence";
        case "amb_o":
            return "Ambition";
        case "fun_o":
            return "Funiness";
        case "shar_o":
            return "Shared Interests";
        default:
            break;
    }
}

function parallelText(d){
    return "Attractiveness: " + d.attr_o + "</br>" 
    + "Sinceriness: " + d.sinc_o + "</br>"
    + "Intelligence: " + d.intel_o + "</br>" 
    + "Ambition: " + d.amb_o + "</br>" 
    + "Funiness: " + d.fun_o + "</br>" 
    + "Shared Interests: " + d.shar_o;
}

function createParallelCoordinates(id){
    const svg = d3
        .select(id)
        .attr("width", widthBigger + margin.left + margin.right + 100)
        .attr("height", heightBigger + margin.top + margin.bottom)
        .append("g")
        .attr("id", "gParallel")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.json("data.json").then(function (data) {
        //console.log("=====DATA ON CREATE=====")
        data = filterDatav2(data)
        //console.log("========================")

        var dimensions = Object.keys(data[0]).filter(function(d) { return d == "attr_o" || d == "sinc_o" || d == "intel_o" || d == "amb_o" || d == "fun_o" || d == "shar_o" });
        
        // For each dimension, I build a linear scale. I store all in a y object
        const y = {}
        for (i in dimensions) {
          name = dimensions[i]
          y[name] = d3.scaleLinear()
            .domain( [1, 10] )
            .range([heightBigger, 50])
        }

        // Build the X scale -> it find the best position for each Y axis
        x = d3.scalePoint()
          .range([0, widthBigger-margin.left-margin.right])
          .padding(0)
          .domain(dimensions);

        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        var Tooltip = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("height", "85px")
            .style("width", "130px")

        

        // Draw the lines
        svg
          .selectAll("myPath")
          .data(data, (d) => d.id)
          .join("path")
          .attr("d",  path)
          .attr("class", "myPath")
          .attr("fill", "none")
          .attr("stroke", (d) =>  lineColor(d.gender))
          .attr("stroke-opacity", 0.5)
          .attr("stroke-width", 1.5)
          .on("mouseover", function(event,d) {
            d3.select(this)
              .transition()
              .duration(200)
              .attr("stroke-width", 6)
              .attr("stroke-opacity", 1)
              .attr("stroke", "red")
            Tooltip.transition()
              .duration(200)
              .style("opacity", .9);
            Tooltip.html(parallelText(d))
              .style("left", (event.pageX + 20) + "px")
              .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", function(event,d) {
            Tooltip.style("left", (event.pageX + 20) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            Tooltip.transition()
                .duration(200)
                .style("opacity", 0);
            d3.select(this)
            .transition()
            .duration(100)
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.5)
            .attr("stroke", (d) =>  lineColor(d.gender))
        })
        
        //svg.append("text").attr("x", widthBigger).attr("y", 20).text("Importance of").style("font-size", "20px").attr("alignment-baseline","middle")
        //svg.append("text").attr("x", widthBigger).attr("y", 40).text(".. in a partner").style("font-size", "20px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", widthBigger/3).attr("y", -3).text("Importance of .. in a partner").style("font-size", "20px").attr("alignment-baseline","middle").attr("font-weight", "bold")


          
    
        //Legend
        svg.append("circle").attr("cx",widthBigger - 50).attr("cy",130).attr("r", 6).style("fill", "#74c7fd")
        .on("click", () => {
            currentGender = 0;
            callUpdates();
        })
        svg.append("circle").attr("cx",widthBigger - 50).attr("cy",160).attr("r", 6).style("fill", "#fb74fd")
        .on("click", () => {
            currentGender = 1;
            callUpdates();
        })
        svg.append("circle").attr("cx",widthBigger - 50).attr("cy",190).attr("r", 6).style("fill", "#808080")
        .on("click", () => {
            currentGender = -1;
            callUpdates();
        })

        svg.append("text").attr("x", widthBigger - 30).attr("y", 135).text("Male participants").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", widthBigger - 30).attr("y", 165).text("Female participants").style("font-size", "15px").attr("alignment-baseline","middle")
        svg.append("text").attr("x", widthBigger - 30).attr("y", 195).text("All participants").style("font-size", "15px").attr("alignment-baseline","middle")


        // Draw the axis:
        svg.selectAll("myAxis")
          // For each dimension of the dataset I add a 'g' element:
          .data(dimensions).enter()
          .append("g")
          // I translate this element to its right position on the x axis
          .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
          // And I build the axis with the call function
          //.each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
          // Add axis title
          .append("text")
            .style("text-anchor", "middle")
            .attr("y", 25)
            .text(parallelLabels)
            .style("fill", "black")

        //console.log(parallelCoordsSliders)
        var sliderAttr = d3
            .sliderLeft()
            .min(1)
            .max(10)
            .width(200)
            .height(heightBigger-50)
            .ticks(10)
            .tickValues([1,2,3,4,5,6,7,8,9,10])
            .step(1)
            .default([1, 10])
            .fill('#1a4b8e')
            .on('end', val => {
                currentAttr = val;
                callUpdates();
            });

        var sliderSinc = d3
            .sliderLeft()
            .min(1)
            .max(10)
            .width(200)
            .height(heightBigger-50)
            .ticks(10)
            .tickValues([1,2,3,4,5,6,7,8,9,10])
            .step(1)
            .default([1, 10])
            .fill('#1a4b8e')
            .on('end', val => {
                currentSinc = val;
                callUpdates();
            });

        var sliderIntel = d3
            .sliderLeft()
            .min(1)
            .max(10)
            .width(200)
            .height(heightBigger-50)
            .ticks(10)
            .tickValues([1,2,3,4,5,6,7,8,9,10])
            .step(1)
            .default([1, 10])
            .fill('#1a4b8e')
            .on('end', val => {
                currentIntel = val;
                callUpdates();
            });

        var sliderFun = d3
            .sliderRight()
            .min(1)
            .max(10)
            .width(200)
            .height(heightBigger-50)
            .ticks(10)
            .tickValues([1,2,3,4,5,6,7,8,9,10])
            .step(1)
            .default([1, 10])
            .fill('#1a4b8e')
            .on('end', val => {
                currentFun = val;
                callUpdates();
            });


        var sliderAmb = d3
            .sliderRight()
            .min(1)
            .max(10)
            .width(200)
            .height(heightBigger-50)
            .ticks(10)
            .tickValues([1,2,3,4,5,6,7,8,9,10])
            .step(1)
            .default([1, 10])
            .fill('#1a4b8e')
            .on('end', val => {
                currentAmb = val;
                callUpdates();
            });

        var sliderShar = d3
            .sliderRight()
            .min(1)
            .max(10)
            .width(200)
            .height(heightBigger-50)
            .ticks(10)
            .tickValues([1,2,3,4,5,6,7,8,9,10])
            .step(1)
            .default([1, 10])
            .fill('#1a4b8e')
            .on('end', val => {
                currentShar = val;
                callUpdates();
            });

        var x_pos = x("attr_o") + 100 ;
        var gRange = d3
          .select(id)
          .append('svg')
          .attr('width', 200)
          .attr('height', 450)
          .append('g')
          .attr('transform', 'translate('+ x_pos.toString() +',65)');
        
        x_pos = x("sinc_o") + 100 ;
        var gSinc = d3
            .select(id)
            .append('svg')
            .attr('width', 400)
            .attr('height', 450)
            .append('g')
            .attr('transform', 'translate(' + x_pos.toString() + ',65)')

        x_pos = x("intel_o") + 100 ;
        var gIntel = d3
            .select(id)
            .append('svg')
            .attr('width', 600)
            .attr('height', 450)
            .append('g')
            .attr('transform', 'translate(' + x_pos.toString() + ',65)')

        x_pos = x("fun_o") + 100 ;
        var gFun = d3
            .select(id)
            .append('svg')
            .attr('width', 800)
            .attr('height', 450)
            .append('g')
            .attr('transform', 'translate(' + x_pos.toString() + ',65)')
        
        x_pos = x("amb_o") + 100 ;
        var gAmb = d3
            .select(id)
            .append('svg')
            .attr('width', 1000)
            .attr('height', 450)
            .append('g')
            .attr('transform', 'translate(' + x_pos.toString() + ',65)')
        
        x_pos = x("shar_o") + 100 ;
        var gShar = d3
            .select(id)
            .append('svg')
            .attr('width', 1200)
            .attr('height', 450)
            .append('g')
            .attr('transform', 'translate(' + x_pos.toString() + ',65)')


        gRange.call(sliderAttr);
        gSinc.call(sliderSinc);
        gIntel.call(sliderIntel);
        gFun.call(sliderFun);
        gAmb.call(sliderAmb);
        gShar.call(sliderShar);
            
    });
}

function updateParallelCoordinates(gender, goals, combinations, ageGap, ageOGap, attr, sinc, intel, amb, fun, shar){
    //console.log("Gender parallel: " + gender)
    d3.json("data.json").then(function (data) {
        data = data.filter(function(elem){
            return elem.age >= ageGap[0] && elem.age <= ageGap[1] && elem.age_o >= ageOGap[0] && elem.age_o <= ageOGap[1]
                   && elem.attr_o >= attr[0] && elem.attr_o <= attr[1] && elem.sinc_o >= sinc[0] && elem.sinc_o <= sinc[1] && elem.intel_o >= intel[0] && elem.intel_o <= intel[1]
                   && elem.amb_o >= amb[0] && elem.amb_o <= amb[1] && elem.fun_o >= fun[0] && elem.fun_o <= fun[1] && elem.shar_o >= shar[0] && elem.shar_o <= shar[1];
        })
        //gender is specified
        if(gender != -1){
            //goals are specified
            if(goals.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && goals.includes(elem.goal) && elem.match == 1;
                })
            } if(combinations.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && checkBubbles(elem, combinations) && elem.match == 1;
                })
            }  else { //goals are not specified
                data = data.filter(function(elem){
                    return elem.gender == gender && elem.match == 1;
                })
            }
        } else { //gender is not specified
            //goals are specified
            if(goals.length != 0){
                data = data.filter(function(elem){
                    return goals.includes(elem.goal) && elem.match == 1;
                })
            } if(combinations.length != 0){
                data = data.filter(function(elem){
                    return checkBubbles(elem, combinations) && elem.match == 1;
                })
            } else { //goals and gender are not specified
                data = data.filter(function(elem){
                    return elem.match == 1;
                })
            }
        }

        var array = [];
        const svg = d3.select("#gParallel");

        console.log("=====DATA=====")
        data = filterDatav2(data);
        console.log("==============")

        var dimensions = Object.keys(data[0]).filter(function(d) { return d == "attr_o" || d == "sinc_o" || d == "intel_o" || d == "amb_o" || d == "fun_o" || d == "shar_o" });
        
        // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
        function path(d) {
            return d3.line()(dimensions.map(function(p) { return [x(p), y[p](d[p])]; }));
        }

        // For each dimension, I build a linear scale. I store all in a y object
        // For each dimension, I build a linear scale. I store all in a y object
        const y = {}
        for (i in dimensions) {
          var name = dimensions[i]
          y[name] = d3.scaleLinear()
            .domain( [1, 10] )
            .range([heightBigger, 50])
        }

        // Build the X scale -> it find the best position for each Y axis
        x = d3.scalePoint()
          .range([0, widthBigger-margin.left-margin.right])
          .padding(0)
          .domain(dimensions);
        

        svg
            .selectAll("path.myPath")
            .data(data, (d) => d.id)
            .join(
                (enter) => {
                    lines = enter
                        .append("path")
                        .attr("class", "myPath")
                        .attr("d",  x(0))
                        .attr("fill", "none")
                        .attr("stroke", (d) =>  lineColor(d.gender))
                        .attr("stroke-opacity", 0.5)
                        .attr("stroke-width", 2)
                    lines
                        .transition()
                        .duration(3000)
                        .attr("d",  path)
                }, 
                (update) => {
                    update
                        .transition()
                        .duration(3000)
                        .attr("d",  path)
                },
                (exit) => {
                    exit.remove();
                }
            )
    });
}

/**
 * ===================================================================================
 * -------------------------------------BAR CHART-------------------------------------
 * ===================================================================================
 */

function barChartColor(d){
    var toReturn;
    switch (d.id) {
        case 1:
            toReturn = "#ff8166";
            break;
        case 2:
            toReturn = "#ecd024";
            break;
        case 3:
            toReturn = "#2c84cd";
            break;
        case 4:
            toReturn = "#cd2ccb";
            break;
        case 5:
            toReturn = "#f38b1d";
            break;
        case 6:
            toReturn = "#4dde12";
        default:
            break;
    }
    return toReturn;
}

function createGoalBarChart(id){
    const svg = d3
        .select(id)
        .attr("width", widthSmaller*1.4 + margin.left + margin.right)
        .attr("height", heightSmaller + margin.top + margin.bottom)
        .append("g")
        .attr("id", "gGoal")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.json("data.json").then(function (data) {

        var percentageData = updateGoalData(data);
        
        //var keys = percentageData.map((d) => {return d.goal})
        console.log("antes", data)

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(percentageData, (d) => d.percentage + 10 > 100 ? 100 : d.percentage + 10)])
            .range([0 , widthSmaller*1.45]);

        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(0, ${heightSmaller})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));
        
        const y = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0, heightSmaller])
            .padding(0.1);

        svg
            .append("g")
            .attr("id", "gYAxis")
            .call(d3.axisLeft(y).tickSizeOuter(0));

        var Tooltip = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("padding", "5px")

        svg
            .selectAll("rect.rectValue")
            .data(percentageData, (d) => d.id)
            .join("rect")
            .attr("class", "rectValue barItemValue")
            .attr("x", (d) => x(0))
            .attr("y", (d) => y(d.goal))
            .attr("width", (d) => x(d.percentage))
            .attr("height", y.bandwidth())
            .attr("fill", barChartColor)
            .on("mouseover", function(event,d) {
                Tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
                Tooltip.html(d.goal + "<br/>" + (d.percentage).toFixed(2) + "%")
                  .style("left", (event.pageX + 20) + "px")
                  .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", function(event,d) {
                Tooltip.style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                Tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this)
                    .attr("stroke", "none")
            })
            .on("click", (event, d) => {
                //console.log("clicked bar")
                var id = d.id
                //clicked bar is already selected, need to deselect
                if(currentSelectedBars.includes(id)){
                    //console.log("Popping bar: " + id)
                    //array.pop doesn't work because it always removes the last element
                    const index = currentSelectedBars.indexOf(id);
                    if (index > -1) {
                        currentSelectedBars.splice(index, 1);
                    }
                    //console.log("Current selected bars: " + currentSelectedBars.length)
                    //no bars are selected, show all data normally
                    if(currentSelectedBars.length == 0){
                        d3.selectAll(".barItemValue")
                          .attr("opacity", 1);
                    } else { //there are still bars selected, highlight them
                        d3.selectAll(".barItemValue")
                          .filter(function(d) {
                                return currentSelectedBars.includes(d.id);
                        })
                          .attr("opacity", 1);
                    
                        d3.selectAll(".barItemValue")
                          .filter(function(d) {
                                return !(currentSelectedBars.includes(d.id));
                        })
                          .attr("opacity", 0.3);
                    }
                } else { //selecting bar that wasn't selected before
                    //console.log("Pushing bar: " + id)
                    currentSelectedBars.push(id)
                    //TRATAR DO CASO EM QUE O UTILIZADOR SELECIONA TODAS AS BARRAS
                    //console.log("Current selected bars: " + currentSelectedBars.length)
                    d3.selectAll(".barItemValue")
                      .filter(function(d) {
                                return currentSelectedBars.includes(d.id);
                     })
                     .attr("opacity", 1);
                    
                    d3.selectAll(".barItemValue")
                      .filter(function(d) {
                            return !(currentSelectedBars.includes(d.id));
                    })
                    .attr("opacity", 0.3);
                }
                updateBubbleChart(currentGender, currentSelectedBars, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
                updateSlopeGraph(currentGender, currentSelectedBars, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
                updateParallelCoordinates(currentGender, currentSelectedBars, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
                
            })

        svg
           .append("text")
           .attr("class", "x label")
           .attr("text-anchor", "middle")
           .attr("x", widthSmaller - 140)
           .attr("y", heightSmaller + 35)
           .text("Percentage of participants");
    });
}

function updateGoalBarChart(gender, combinations, ageGap, ageOGap, attr, sinc, intel, amb, fun, shar){
    //console.log("=======BAR CHART=======")
   // console.log("Age Gap: " + ageGap)
   // console.log("Age OGap: " + ageOGap)
    //console.log("Gender: " + gender + " Combinations specified: " + combinations.length)
    //console.log("=======================")
    d3.json("data.json").then(function (data) {
        //update according ages
        data = data.filter(function(elem){
            return elem.age >= ageGap[0] && elem.age <= ageGap[1] && elem.age_o >= ageOGap[0] && elem.age_o <= ageOGap[1]
                   && elem.attr_o >= attr[0] && elem.attr_o <= attr[1] && elem.sinc_o >= sinc[0] && elem.sinc_o <= sinc[1] && elem.intel_o >= intel[0] && elem.intel_o <= intel[1]
                   && elem.amb_o >= amb[0] && elem.amb_o <= amb[1] && elem.fun_o >= fun[0] && elem.fun_o <= fun[1] && elem.shar_o >= shar[0] && elem.shar_o <= shar[1];
        })
        //if gender is specified
        if(gender != -1){
            //if shar_o and imprace are specified
            if(combinations.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && checkBubbles(elem, combinations);
                })
            } else { //share_o and imprace are not specified
                data = data.filter(function(elem){
                    return elem.gender == gender;
                })
            }
        } else { //gender is not specified
            if(combinations.length != 0){ //share_o and imprace are specified
                data = data.filter(function(elem){
                    return checkBubbles(elem, combinations);
                })
            } else { //share_o and imprace are not specified
                data = data
            }
        }

        const svg = d3.select("#gGoal");

        var percentageData = updateGoalData(data);
        //console.log("percentage data",data)

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(percentageData, (d) => d.percentage + 10 > 100 ? 100 : d.percentage + 10)])
            .range([0 , widthSmaller*1.45]);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0, heightSmaller])
            .padding(0.1);

        svg.select("#gYAxis").call(d3.axisLeft(y).tickSizeOuter(0));
        
        svg
            .selectAll("rect.rectValue")
            .data(percentageData, (d) => d.id)
            .join(
                (enter) => {
                 rects = enter
                    .append("rect")
                    .attr("class", "rectValue")
                    .attr("x", x(0))
                    .attr("y", (d) => y(d.goal))
                    .attr("width", (d) => x(0))
                    .attr("height", y.bandwidth())
                    .attr("fill", barChartColor)
                rects
                    .transition()
                    .duration(1500)
                    .attr("width", (d) => x(d.percentage))
                },
                (update) => { 
                  update
                    .transition()
                    .duration(1500)
                    .attr("x", x(0))
                    .attr("y", (d) => y(d.goal))
                    .attr("width", (d) => x(d.percentage))
                    .attr("height", y.bandwidth());
                },
                (exit) => { 
                    exit.remove();
                }
            );
    });
}

function updateGoalData(data){
    var goal1 = 0;
    var goal2 = 0;
    var goal3 = 0;
    var goal4 = 0;
    var goal5 = 0;
    var goal6 = 0;

    data.forEach(element => {
        switch (element.goal) {
            case 1:
                goal1 += 1;
                break;
            case 2:
                goal2 += 1;
                break;
            case 3:
                goal3 += 1;
                break;
            case 4:
                goal4 += 1;
                break;
            case 5:
                goal5 += 1;
                break;
            case 6:
                goal6 += 1;
                break;
            default:
                break;
        }
    });
    var total = goal1 + goal2 + goal3 + goal4 + goal5 + goal6;
    var percentageData = [
        {
            id: 1,
            goal: "Fun night out", 
            percentage: goal1/total*100
        },
        {
            id: 2,
            goal: "Meet new people",
            percentage: goal2/total*100
        },
        {
            id: 3,
            goal: "Get a date",
            percentage: goal3/total*100
        },
        {
            id: 4,
            goal: "Serious relationship",
            percentage: goal4/total*100
        },
        {
            id: 5,
            goal: "To say I did it",
            percentage: goal5/total*100
        },
        {
            id: 6,
            goal: "Other",
            percentage: goal6/total*100
        }
    ];
    
    return percentageData;
}

/**
 * ===================================================================================
 * -------------------------------------BUBBLE CHART-------------------------------------
 * ===================================================================================
 */

function sameValuesData(data) {
    var array = [];
    var count = 0;
    for (var i = 0; i < 10; i++) {
        for (var j = 0; j < 10; j++) {
            var newData = data.filter((d) => {return d.imprace == i && d.shar_o == j})
            var object = {
                id: count,
                x: j,
                y: i,
                amount: newData.length
            }
            count++;
            if (newData.length != 0) {
                array.push(object)
                //console.log(newData.length)
            }
        }
    }
    //console.log(array)
    return array;
}


function bubbleSize(value) {
    if (value == 8) {
        return 4
    }
    else {
        //for every 100 people, size increases 0.8
        return (value-8)*0.8/100+4
    }
}

function checkBubbles(d, array){
    var flag = false;
    array.forEach(element => {
        if (element.x == d.shar_o && element.y == d.imprace) {
            flag = true;
        }
    });
    return flag;
}



function createBubbleChart(id) {
    const svg = d3
        .select(id)
        .attr('width',  widthSmaller*1.2 + margin.left + margin.right)
        .attr('height',  heightSmaller + margin.top + margin.bottom)
        //append grouping element 'g' that allows us to apply margins
        .append("g")
        .attr("id","gBubbleChart")
        .attr('transform', `translate(${margin.left}, ${margin.top})`);
    

    d3.json("data.json").then(function (data) {
        var array = sameValuesData(data);
        //console.log(array)
        
        const x = d3
            .scaleLinear()
            .domain([10, 0])
            .range([widthSmaller*1.35, 0]);
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(0, ${heightSmaller})`)
            .call(d3.axisBottom(x));
        svg
            .append("text")
            .attr("class", "x label")
            .attr("text-anchor", "middle")
            .attr("x", widthSmaller - 120)
            .attr("y", heightSmaller + 35)
            .text("Importance of Shared Interests");
    
        const y = d3
            .scaleLinear()
            .domain([0, 10])
            .range([heightSmaller, 0]);
        svg
            .append("g")
            .attr("id", "gYAxis")
            .call(d3.axisLeft(y).tickFormat(d => d!=-1 ? d : null));
        
        window.onclick = function(event){
            console.log("=== CLICK ===")
            var point = d3.pointer(event);
            //console.log(point[0]);
            var x = point[0]
            var y = point[1]
            console.log("x: " + x + " y: " + y)
            if (checkOutsideClick(x,y) == 1) {
                onClickOutside(currentGender);
            }
            console.log("============")
        }
            
        var Tooltip = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("height", "45px")
            .style("width", "200px")
        svg
            .selectAll("circle.circleValues") 
            .data(array, (d) => d.id) 
            .join("circle")
            .attr("class", "circleValues itemValue")
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            //default size of 4 for min value (amount = 8)
            .attr("r", (d) => bubbleSize(d.amount))
            .attr("fill", "#4dde12")
            .attr("opacity", 0.9)
            
            .on("mouseover", function(event,d) {
                Tooltip.transition()
                  .duration(200)
                  .style("opacity", 1)
                d3.select(this)
                  .style("fill", "#3b7a57")                
            })
            .on("mousemove", function(event,d) {
                if (d.x >= 6) {
                    Tooltip.html("Number of participants: " + d.amount + "<br>" +  "Importance of Shared Interests: " + d.x + "<br>" + "Importance of Partner's Race: " + d.y)
                    .style("left", (event.pageX - 220) + "px")
                    .style("top", (event.pageY - 28) + "px")
                }
                else {
                    Tooltip.html("Number of participants: " + d.amount + "<br>" +  "Importance of Shared Interests: " + d.x + "<br>" + "Importance of Partner's Race: " + d.y)
                    .style("left", (event.pageX + 20) + "px")
                    .style("top", (event.pageY - 28) + "px")
                } 
            })
            .on("mouseout", function(d) {
                Tooltip.transition()
                    .duration(200)
                    .style("opacity", 0);
                d3.select(this)
                    .style("fill", "#4dde12")   
            })
            .on("click", (event, d) => onClickBubbles(event, d));      
                

        svg
            .append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("y", -45)
            .attr("x", -40)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("Importance of Partner's Race");
        });
        
}




function onClickBubbles(event, d){
    //combination we're analyzing
    var combination = { x: d.x, y: d.y };
    if(currentSelectedBubbles.includes(d.id)) { //if bubble already selected
        //remove it from array of bubbles selected
        const index = currentSelectedBubbles.indexOf(d.id);
        if (index > -1) {
            currentSelectedBubbles.splice(index, 1);
        }
        //remove it from array of combinations selected
        const index2 = bubbleCombinations.findIndex(elem => elem.x == combination.x && elem.y == combination.y);
        if (index2 > -1) {
            bubbleCombinations.splice(index2, 1);
        }

        //if no bubbles selected
        if(currentSelectedBubbles.length == 0) { 
            //reset to default
            d3.selectAll(".itemValue").attr("opacity", 0.9);
        } else {
            //bubbles that aren't selected stay 0.2 opacity
            d3.selectAll(".itemValue").attr("opacity", 0.2);
            
            //bubbles that are still selected stay 0.9 opacity
            d3.selectAll(".itemValue")
              .filter(function(d){
                return currentSelectedBubbles.includes(d.id);
              })
              .attr("opacity", 0.9);
        }

    } else { //selecting bubble for first time
        //add to array of selected bubbles
        currentSelectedBubbles.push(d.id);
        //add to array of selected combinations
        bubbleCombinations.push(combination);

        //bubbles that aren't selected stay 0.2 opacity
        d3.selectAll(".itemValue").attr("opacity", 0.3);

        //bubbles that are selected stay 0.9 opacity
        d3.selectAll(".itemValue")
            .filter(function(d){
                return currentSelectedBubbles.includes(d.id);
            })
            .attr("opacity", 0.9);
    }
    //buttonClick(d.id, d.amount)
    //updateGoalBarChart(currentGender, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);
    //updateSlopeGraph(currentGender, currentSelectedBars, bubbleCombinations, currentAge, currentAgeO, currentAttr, currentSinc, currentIntel, currentAmb, currentFun, currentShar);;
    callUpdates();
}


function onClickOutside(){
    console.log(currentSelectedBubbles);
    console.log(bubbleCombinations)
    while (currentSelectedBubbles.length != 0) {
        currentSelectedBubbles.pop();
        bubbleCombinations.pop();
    }
    callUpdates();
}

function checkOutsideClick(x , y){
    return (
        x > clientWidth/1.44 && x < clientWidth/1.30 && y > clientHeight/6.38 && y < clientHeight/1.82 //area 1
    ) || (x > clientWidth/1.08 && x < clientWidth && y > clientHeight/6.38 && y < clientHeight/1.82)  //area 2
    || (x > clientWidth/1.44 && x < clientWidth && y > clientHeight/6.38 && y < clientHeight/5.08) //area 3
    || (x > clientWidth/1.44 && x < clientWidth && y > clientHeight/2.05 && y < clientHeight/1.82) //area 4
}

function updateBubbleChart(gender, goals, ageGap, ageOGap, attr, sinc, intel, amb, fun, shar) {
    //console.log("======= BUBBLE ========")
    //console.log("Gender: " + gender + " Goals: " + goals.length)
    //console.log("Age Gap: " + ageGap)
    //console.log("Age OGap: " + ageOGap)
    //console.log("=======================")
    //update according ages
    d3.json("data.json").then(function (data) {
        data = data.filter(function(elem){
            return elem.age >= ageGap[0] && elem.age <= ageGap[1] && elem.age_o >= ageOGap[0] && elem.age_o <= ageOGap[1]
                   && elem.attr_o >= attr[0] && elem.attr_o <= attr[1] && elem.sinc_o >= sinc[0] && elem.sinc_o <= sinc[1] && elem.intel_o >= intel[0] && elem.intel_o <= intel[1]
                   && elem.amb_o >= amb[0] && elem.amb_o <= amb[1] && elem.fun_o >= fun[0] && elem.fun_o <= fun[1] && elem.shar_o >= shar[0] && elem.shar_o <= shar[1];
        })
        //gender is specified
        if(gender != -1){
            //goals are specified
            if(goals.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && goals.includes(elem.goal);
                })
            } else { //goals are not specified
                data = data.filter(function(elem){
                    return elem.gender == gender;
                })
            }
        } else { //gender is not specified
            //goals are specified
            if(goals.length != 0){
                data = data.filter(function(elem){
                    return goals.includes(elem.goal);
                })
            } else { //goals and gender are not specified
                data = data
            }
        }
        const svg = d3.select("#gBubbleChart");

        var array = sameValuesData(data);
        //console.log(array)
        var allBubbles = array.map((d) => d.id);
        

        //if selected bubble is not in the new data, remove it from the array of selected bubbles
        currentSelectedBubbles.forEach(element => {
            if(!allBubbles.includes(element)){
                const index = currentSelectedBubbles.indexOf(element);
                if (index > -1) {
                    currentSelectedBubbles.splice(index, 1);
                }

                //remove it from array of combinations selected
                bubbleCombinations.forEach(elem => {
                    const index2 = currentSelectedBubbles.findIndex(elem2 => elem.x == elem2.x && elem.y == elem2.y);
                    if (index2 <= -1) {
                        console.log("Combination not found in new data")
                        bubbleCombinations.splice(index2, 1);
                    }
                })
            }
        });

        //console.log(currentSelectedBubbles)

        const x = d3
            .scaleLinear()
            .domain([10, 0])
            .range([widthSmaller*1.35, 0]);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3
            .scaleLinear()
            .domain([0, 10])
            .range([heightSmaller, 0]);

        svg.select("#gYAxis").call(d3.axisLeft(y).tickFormat(d => d!=-1 ? d : null));

        var Tooltip = d3.select("body")
            .append("div")
            .style("opacity", 0)
            .attr("class", "tooltip")
            .style("background-color", "white")
            .style("border", "solid")
            .style("border-width", "1px")
            .style("border-radius", "5px")
            .style("height", "76px")
            .style("width", "170px")
        
        
        svg
            .selectAll("circle.circleValues") 
            .data(array, (d) => d.id) 
            .join(
            (enter) => {
                circles = enter
                    .append("circle")
                    .attr("class", "circleValues itemValue")
                    .attr("cx", (d) => x(d.x))
                    .attr("cy", (d) => y(d.y))
                    .attr("r", 0)
                    .attr("fill", "#4dde12")
                    .attr("opacity", 0.8)                    
                    .on("mouseover", function(event,d) {
                        Tooltip.transition()
                          .duration(200)
                          .style("opacity", 1)
                        d3.select(this)
                          .style("fill", "#3b7a57")                
                    })
                    .on("mousemove", function(event,d) {
                        if (d.x > 7) {
                            Tooltip.html("Nr of participants: " + d.amount + "<br>" +  "Importance of Shared Interests: " + d.x + "<br>" + "Importance of Partner's Race: " + d.y)
                            .style("left", (event.pageX - 180) + "px")
                            .style("top", (event.pageY-28) + "px")
                        }
                        else {
                            Tooltip.html("Nr of participants: " + d.amount + "<br>" +  "Importance of Shared Interests: " + d.x + "<br>" + "Importance of Partner's Race: " + d.y)
                            .style("left", (event.pageX + 20) + "px")
                            .style("top", (event.pageY - 28) + "px")
                        } 
                    })
                    .on("mouseout", function(d) {
                        Tooltip.transition()
                            .duration(200)
                            .style("opacity", 0);
                        d3.select(this)
                            .style("fill", "#4dde12")   
                    })
                    .on("click", (event, d) => onClickBubbles(event, d));   
                circles
                    .transition()
                    .duration(1000)
                    .attr("r", (d) => bubbleSize(d.amount));                
                
            },
            (update) => {
                update
                .transition()
                .duration(1000)
                .attr("cx", (d) => x(d.x))
                .attr("cy", (d) => y(d.y))
                .attr("r", (d) => bubbleSize(d.amount));
            },
            (exit) => {
                exit.remove();
            }
        );

        updateBubbleOpacity()
    });
}

function updateBubbleOpacity(){
    if(currentSelectedBubbles.length != 0) {
        d3.selectAll(".itemValue")
          .filter(function(d){
            return !currentSelectedBubbles.includes(d.id);
          })
          .attr("opacity", 0.2);
    } else {
        d3.selectAll(".itemValue").attr("opacity", 0.8);
    }
}
