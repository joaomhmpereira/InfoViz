const margin = { top: 20, right: 30, bottom: 40, left: 90 };
const width = 1000 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

function init(){
    //createParallelCoordinates("#chart1");
    createGoalBarChart("#chart1");
    d3.select("#male").on("click", () => {
        //updateParallelCoordinates(0);
        updateGoalBarChart(0);
    })
    d3.select("#female").on("click", () => {
        //updateParallelCoordinates(1);
        updateGoalBarChart(1);
    })
    d3.select("#all").on("click", () => {
        //updateParallelCoordinates(-1);
        updateGoalBarChart(-1);
    })
}

function color(d){
    if(d["gender"] == 0){
        return "lightblue";
    }else{
        return "pink";
    }
}

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

    d3.json("SD_With_Derived.json").then(function (data) {
        
        var percentageData = updateGoalData(data);
        console.log(percentageData)

        const x = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0,width])
            .padding(0.1);
        
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(x).tickSizeOuter(0));
        
        const y = d3.scaleLinear().domain([50, 0]).range([0, height]);

        svg
            .append("g")
            .attr("id", "gYAxis")
            .call(d3.axisLeft(y));

        svg
            .selectAll("rect.rectValue")
            .data(percentageData, (d) => d.id)
            .join("rect")
            .attr("class", "rectValue")
            .attr("x", (d) => x(d.goal))
            .attr("y", (d) => y(d.percentage))
            .attr("width", x.bandwidth())
            .attr("height", (d) => height - y(d.percentage))
            .attr("fill", barChartColor)

    });
}

function updateGoalBarChart(gender){
    console.log("Clicked: " + gender)
    d3.json("SD_With_Derived.json").then(function (data) {
        if(gender != -1){
            data = data.filter(function(elem){
                return elem.gender == gender;
            })
        } else {
            data = data
        }

        const svg = d3.select("#gGoal");

        var percentageData = updateGoalData(data);
        console.log(percentageData)

        const x = d3
            .scaleBand()
            .domain(percentageData.map((d) => d.goal))
            .range([0,width])
            .padding(0.1);
        
        svg.select("#gXAxis").call(d3.axisBottom(x).tickSizeOuter(0));

        const y = d3.scaleLinear().domain([50, 0]).range([0, height]);
        svg.select("#gYAxis").call(d3.axisLeft(y));

        svg
            .selectAll("rect.rectValue")
            .data(percentageData, (d) => d.id)
            .join(
                (enter) => {
                 rects = enter
                    .append("rect")
                    .attr("class", "rectValue")
                    .attr("x", (d) => x(d.goal))
                    .attr("y", (d) => y(0))
                    .attr("width", x.bandwidth())
                    .attr("height", (d) => y(0))
                    .attr("fill", barChartColor)
                rects
                    .transition()
                    .duration(1500)
                    .attr("height", (d) => height - y(d.percentage))
                rects.append("title").text((d) => d.percentage.toFixed(2) + "%")
                },
                (update) => { 
                  update
                    .transition()
                    .duration(1500)
                    .attr("x", (d) => x(d.goal))
                    .attr("y", (d) => y(d.percentage))
                    .attr("width", x.bandwidth())
                    .attr("height", (d) => height - y(d.percentage));
                },
                (exit) => { exit
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
            goal: "Seemed like a fun night out", 
            percentage: goal1/total*100
        },
        {
            id: 2,
            goal: "To meet new people",
            percentage: goal2/total*100
        },
        {
            id: 3,
            goal: "To get a date",
            percentage: goal3/total*100
        },
        {
            id: 4,
            goal: "Looking for a serious relationship",
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