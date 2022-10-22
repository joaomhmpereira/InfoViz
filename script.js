const margin = { top: 20, right: 30, bottom: 40, left: 100 };
const width = document.documentElement.clientWidth/3.8 - margin.left - margin.right;
const height = document.documentElement.clientHeight/2.6 - margin.top - margin.bottom;

var currentSelectedBars = [];
var sharToCheck = [];
var impraceToCheck = [];
var currentGender = -1;

function init(){
    //createParallelCoordinates("#chart1");
    createBubbleChart("#chart2svg");
    createGoalBarChart("#chart4svg");
    d3.select("#male").on("click", () => {
        //updateParallelCoordinates(0);
        currentGender = 0;
        updateGoalBarChart(currentGender, sharToCheck, impraceToCheck);
        updateBubbleChart(currentGender, currentSelectedBars);
    })
    d3.select("#female").on("click", () => {
        //updateParallelCoordinates(1);
        currentGender = 1;
        updateGoalBarChart(currentGender, sharToCheck, impraceToCheck);
        updateBubbleChart(currentGender, currentSelectedBars);
    })
    d3.select("#all").on("click", () => {
        //updateParallelCoordinates(-1);
        currentGender = -1;
        updateGoalBarChart(currentGender, sharToCheck, impraceToCheck);
        updateBubbleChart(currentGender, currentSelectedBars);
    })
    d3.selectAll(".barItemValue").on("click", (d) => {
        console.log("clicked bar" + d.id)
    })
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
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("id", "gGoal")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.json("data.json").then(function (data) {
        
        var percentageData = updateGoalData(data);
        //console.log(percentageData)

        var keys = percentageData.map((d) => {return d.goal})
        //console.log(keys)

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(percentageData, (d) => d.percentage + 10 > 100 ? 100 : d.percentage + 10)])
            .range([0 , width]);

        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));
        
        const y = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0, height])
            .padding(0.1);

        svg
            .append("g")
            .attr("id", "gYAxis")
            .call(d3.axisLeft(y).tickSizeOuter(0));

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
                updateBubbleChart(currentGender, currentSelectedBars);
                
            })

        svg
           .append("text")
           .attr("class", "x label")
           .attr("text-anchor", "end")
           .attr("x", width - 140)
           .attr("y", height + 35)
           .text("Percentage of participants");
    });
}

function updateGoalBarChart(gender, shar_o, imprace){
    console.log("Gender: " + gender + " Shar_o: " + shar_o.length + " Imprace: " + imprace.length)
    d3.json("data.json").then(function (data) {
        //if gender is specified
        if(gender != -1){
            //if shar_o and imprace are specified
            if(shar_o.length != 0 && imprace.length != 0){
                data = data.filter(function(elem){
                    return elem.gender == gender && shar_o.includes(elem.shar_o)  && imprace.includes(elem.imprace);
                })
            } else { //share_o and imprace are not specified
                data = data.filter(function(elem){
                    return elem.gender == gender;
                })
            }
        } else { //gender is not specified
            if(shar_o.length != 0 && imprace.length != 0){ //share_o and imprace are specified
                data = data.filter(function(elem){
                    return shar_o.includes(elem.shar_o)  && imprace.includes(elem.imprace);
                })
            } else { //share_o and imprace are not specified
                data = data
            }
        }

        const svg = d3.select("#gGoal");

        var percentageData = updateGoalData(data);
        console.log(percentageData)

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(percentageData, (d) => d.percentage + 10 > 100 ? 100 : d.percentage + 10)])
            .range([0 , width]);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0, height])
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

function updateGoalBarChartPopulation(id, amount){
    //console.log("Clicked: " + gender)
    d3.json("SD_With_Derived.json").then(function (data) {
        

        const svg = d3.select("#gGoal");

        var array = newData(data, id)
        var percentageData = newGoalData(data, array[0].x, array[0].y);
        //console.log("goal bar",percentageData)

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(percentageData, (d) => d.percentage + 10 > 100 ? 100 : d.percentage + 10)])
            .range([0 , width]);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0, height])
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
    return array;
}

function newData(data, id) {
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
            if (object.id == id) {
                array.push(object)
            }
        }
    }
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

function createBubbleChart(id) {
    const svg = d3
        .select(id)
        .attr('width',  width + margin.left + margin.right)
        .attr('height',  height + margin.top + margin.bottom)
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
            .range([width, 0]);
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x));
        svg
            .append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width - 95)
            .attr("y", height + 35)
            .text("Importance of Shared Interests");
    
        const y = d3
            .scaleLinear()
            .domain([-1, 10])
            .range([height, 0]);
        svg
            .append("g")
            .attr("id", "gYAxis")
            .call(d3.axisLeft(y).tickFormat(d => d!=-1 ? d : null));
        svg
            .selectAll("circle.circleValues") 
            .data(array, (d) => d.id) 
            .join("circle")
            .on("click", (event, d) => buttonClick(d.id, d.amount))
            .attr("class", "circleValues itemValue")
            .attr("cx", (d) => x(d.x))
            .attr("cy", (d) => y(d.y))
            //default size of 4 for min value (amount = 8)
            .attr("r", (d) => bubbleSize(d.amount))
            .attr("fill", "#4dde12")
            .attr("opacity", 0.9)
            .on("mouseover", (event, d) => handleMouseOver(d))
            .on("mouseleave", (event, d) => handleMouseLeave())
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

function updateBubbleChart(gender, goals) {
    console.log("Gender: " + gender + " Goals: " + goals.length)
    d3.json("data.json").then(function (data) {
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

        const x = d3
            .scaleLinear()
            .domain([10, 0])
            .range([width, 0]);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3
            .scaleLinear()
            .domain([-1, 10])
            .range([height, 0]);

        svg.select("#gYAxis").call(d3.axisLeft(y).tickFormat(d => d!=-1 ? d : null));
        
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
                    .on("mouseover", (event, d) => handleMouseOver(d))
                    .on("mouseleave", (event, d) => handleMouseLeave());                    
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
    });
}


function updateBubbleChartPopulation(id, amount) {
    d3.json("SD_With_Derived.json").then(function (data) {
        
        const svg = d3.select("#gBubbleChart");

        var array = newData(data, id);
        //console.log(array)

        const x = d3
            .scaleLinear()
            .domain([10, 0])
            .range([width, 0]);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3
            .scaleLinear()
            .domain([-1, 10])
            .range([height, 0]);

        svg.select("#gYAxis").call(d3.axisLeft(y).tickFormat(d => d!=-1 ? d : null));
        
        svg
            .selectAll("circle.circleValues") 
            .data(array, (d) => d.id) 
            .join(
            (enter) => {
                circles = enter
                    .append("circle")
                    .attr("class", "circleValues itemValue")
                    .attr("cx", (d) => x(d.x))
                    .attr("cy", (d) => y(0))
                    .attr("r", 0)
                    .attr("fill", "#4dde12")
                    .attr("opacity", 0.8)
                    .on("mouseover", (event, d) => handleMouseOver(d))
                    .on("mouseleave", (event, d) => handleMouseLeave())
                 
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
    });
}


function handleMouseOver(item) {
    d3.selectAll(".itemValue")
      .filter(function (d, i) {
        return d.amount == item.amount && item.id == d.id;
      })
      
      .attr("r", bubbleSize(item.amount))
      .style("fill", "#3b7a57")
      .attr("title", "update")
      .append("title").text(function(d) { return item.amount; });
      console.log("item-amount: " + item.amount)
  }
  
function handleMouseLeave() {
    d3.selectAll(".itemValue").style("fill", "#4dde12");
}


function buttonClick(id, amount) {
    //clicked = 1;
    updateBubbleChartPopulation(id, amount);
    updateGoalBarChartPopulation(id, amount);
}



function newGoalData(data, shar_o, imprace) {
    //console.log("imprace", imprace)
    //console.log("shar_o", shar_o)
    var goal1 = 0;
    var goal2 = 0;
    var goal3 = 0;
    var goal4 = 0;
    var goal5 = 0;
    var goal6 = 0;

    data.forEach(element => {
        if (element.imprace == imprace && element.shar_o == shar_o) {
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