////// JS CONSTANTS //////
let arrData, arrFlightList;
let depData, depFlightList;
let combinedFlightList;
let gotArr = false;
let gotDep = false;
let gotAirport = false;
let searchDirection = "arr";
let nowTime = new Date();
let today = new Date('2022-07-24T00:00:00Z'); // set to "FAKE" today
let searchDate = new Date();
let airportList = [];
let mapmode = 1; // 1 = density, 2 = delays
let treemode = 1; // 1 = % of delays, 2 = average delays
let dataDate = "";

const depschColor = "#7EA6A9", depactColor = "#024B52", depdelColor = "#EEC87F", depactdelColor = "#31868E";
const arrschColor = "#A2C563", arrlanColor = "#334F00", arrdelColor = "#EEC87F", arrlandelColor = "#537614";
const canColor = "#c7522a", arrdepColor = "#71677C";


///// JS FOR NAVBAR ///////
/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function dropDown() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown if the user clicks outside of it
window.onclick = function(e) {
  if (!e.target.matches('.dropbtn')) {
  var myDropdown = document.getElementById("myDropdown");
    if (myDropdown.classList.contains('show')) {
      myDropdown.classList.remove('show');
    }
  }
}

window.onscroll = function() {stickyFunction()};

let navbar = document.getElementById("navbar");
let sticky = navbar.offsetTop;

function stickyFunction() {
  if (window.pageYOffset >= sticky) {
    navbar.classList.add("sticky")
  } else {
    navbar.classList.remove("sticky");
  }
}


////// JS FOR DATA updating ///////
// set to FAKE today
//document.getElementById('setdate').value = new Date('2022-08-23T00:00:00Z').toISOString().split('T')[0];
document.getElementById('setdate').value = new Date().toISOString().split('T')[0];

function setTraffic(t){
  switch (t) {
  case 'arr':
    document.getElementById("menubutton").innerHTML='Arrivals <i class="fa fa-caret-down"></i>';
    searchDirection = "arr";
    updateChart(arrFlightList);
    updateTable(arrFlightList);
    updateMap(arrFlightList);
    updateAirlinesTree(arrFlightList);
    break;
  case 'dep':
    document.getElementById("menubutton").innerHTML='Departures <i class="fa fa-caret-down"></i>';
    searchDirection = "dep";
    updateChart(depFlightList);  
    updateTable(depFlightList);
    updateMap(depFlightList);
    updateAirlinesTree(depFlightList);
    break;
  case 'combined':
    document.getElementById("menubutton").innerHTML='Arr & Dep <i class="fa fa-caret-down"></i>';
    searchDirection = "combined";
    updateChart(combinedFlightList);
    updateTable(combinedFlightList);
    updateMap(combinedFlightList);
    updateAirlinesTree(combinedFlightList);
    break;
  }
}

// Calling once when loading
fetchNewData();

// JS FOR FETCHING DATA
async function fetchNewData(){
  
  let glitch = "https://paint-pepper-tellurium.glitch.me/";
  let repl = "https://arlandaServer.kitpaddle.repl.co";
  
  fetch('https://kitpaddle.github.io/hosting/airportlist.json').then(response => {
    return response.json();
  }).then(data => {
    
    airportList = data;
    //gotAirport = true;
    
  });
  
  let s = new Date(document.getElementById('setdate').value);
  searchDate = s.toISOString().split('T')[0];
  console.log(searchDate);
  
  fetch(glitch+'/swedavia/ARN/'+searchDate).then(response => {
    console.log(response);
    return response.json();
  })
    .then(data => {
      arrData = data.arrivalData;
      depData = data.departureData;
      dateData = data.date;
      dataLoaded();
    
    });
  
  /*
  //let s = searchDate.toISOString().split('T')[0];
  searchDate = new Date(document.getElementById('setdate').value);
  let s = searchDate.toISOString().split('T')[0];
  let temp;
  if (s == '2022-07-24') temp = 'Data.json';
  else if(s == '2022-07-23') temp = 'DataYesterday.json';
  else if(s == '2022-07-25') temp = 'DataTomorrow.json';
  console.log(temp);
  fetch('https://kitpaddle.github.io/hosting/arr'+temp).then(response => {
    return response.json();
  })
    .then(data => {
    arrData = data;
    gotArr = true;
    if(gotDep && gotAirport) dataLoaded();
  });

  fetch('https://kitpaddle.github.io/hosting/dep'+temp).then(response => {
    return response.json();
  })
    .then(data => {
    depData = data;
    gotDep = true;
    if(gotArr && gotAirport) dataLoaded();
  });
  
  */
  
}


function dataLoaded(){
  //nowTime = new Date("2022-07-24T16:25:55.000Z"); // Setting NOW time, when data was retrieved
  nowTime = new Date(); //MAYBE get NOW TIME with data from server?
  
  gotArr = false; gotDep = false; // Setting checks back to false
  let statusArr = []; // FOR TESTING PURPOSES ONLY 
  
  // CREATING DATA ARRAYS OF FLIGHTS AND SETTING KEYS THAT CAN BE USED FOR CHARTS
  
  // Filter off all DELETED flights
  arrFlightList = arrData.flights.filter(e => e.locationAndStatus.flightLegStatus !="DEL");
  depFlightList = depData.flights.filter(e => e.locationAndStatus.flightLegStatus !="DEL");
  
  // Rebrand all DELAYED flights that already have landed or departed
  arrFlightList.forEach(e =>{
    if(new Date(e.arrivalTime.actualUtc) > new Date(e.arrivalTime.scheduledUtc)){
      e.locationAndStatus.flightLegStatus = "ARRLANDEL";
    }
  });
  depFlightList.forEach(e =>{
    if(new Date(e.departureTime.actualUtc) > new Date(e.departureTime.scheduledUtc)){
      e.locationAndStatus.flightLegStatus = "DEPACTDEL";
    }
  });
  
  // Arrivals: Rebrand DELAYED flights
  arrFlightList.forEach(e =>{
    if((new Date(e.arrivalTime.estimatedUtc) > new Date(e.arrivalTime.scheduledUtc)) && (e.locationAndStatus.flightLegStatus == "SCH")){
      e.locationAndStatus.flightLegStatus = "ARRDEL";
    }
  });
  // Departures: Rebrand DELAYED flights
  depFlightList.forEach(e =>{
    if((new Date(e.departureTime.estimatedUtc) > new Date(e.departureTime.scheduledUtc)) && (e.locationAndStatus.flightLegStatus == "SCH")){
      e.locationAndStatus.flightLegStatus = "DEPDEL";
    }
  });
 
  // Rebrand Scheduled flights to ARR and DEP respectively
  arrFlightList.forEach(e =>{
    if(e.locationAndStatus.flightLegStatus == "SCH") e.locationAndStatus.flightLegStatus = "ARRSCH";
    e['direction'] = "arr"; //adding so i can use it in graphlist to know direction
  })
  depFlightList.forEach(e =>{
    if(e.locationAndStatus.flightLegStatus == "SCH") e.locationAndStatus.flightLegStatus = "DEPSCH";
    e['direction'] = "dep"; //adding so i can use it in graphlist to know direction
  })
  
 // console.log(arrFlightList[1]);
  
  //console.log(arrFlightList[180]);
  // Combined Traffic
  combinedFlightList = [...depFlightList, ...arrFlightList];
  
  console.log("Data Loaded for "+searchDate);
  // Set traffic direction to then call UPDATE on all content
  setTraffic(searchDirection);
}

function getUniqueValues(array){
  return Array.from(new Set(array));
}
function colorToRgb(hex){
  let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return "rgb("+parseInt(result[1], 16)+","+parseInt(result[2], 16)+","+parseInt(result[3], 16)+")";
}
function statusToColor(status){
  if(status=="LAN") return arrlanColor;
  if(status=="ARRLANDEL") return arrlandelColor;
  if(status=="ARRDEL") return arrdelColor;
  if(status=="ARRSCH") return arrschColor;
  if(status=="ACT") return depactColor;
  if(status=="DEPACTDEL") return depactdelColor;
  if(status=="DEPDEL") return depdelColor;
  if(status=="DEPSCH") return depschColor;
  if(status=="CAN") return canColor;
}

//////// JS FOR MAIN STAT WINDOW ////////

function updateTable(data){
  let html = "";
  let trafficontime=0, trafficdelayed=0, pdelay=0, schontime=0, schdelayed=0, cancelled=0, total=0, delaypercent=0, delaymean=0, delaymedian=0, domestic=0, airlines=0, airports=0;
  let delayminutes = [], airlinesarray = [], airportsarray = [];
  data.forEach( e =>{
    if(e.locationAndStatus.flightLegStatus == "LAN" || e.locationAndStatus.flightLegStatus == "ACT") trafficontime++;
    if(e.locationAndStatus.flightLegStatus == "ARRLANDEL"){
      trafficdelayed++;
      let diff = Math.abs(new Date(e.arrivalTime.actualUtc) - new Date(e.arrivalTime.scheduledUtc));
      delayminutes.push(Math.floor((diff/1000)/60));
    }
    if(e.locationAndStatus.flightLegStatus == "DEPACTDEL"){
      trafficdelayed++;
      let diff = Math.abs(new Date(e.departureTime.actualUtc) - new Date(e.departureTime.scheduledUtc));
      delayminutes.push(Math.floor((diff/1000)/60));
    } 
    if(e.locationAndStatus.flightLegStatus == "ARRSCH" || e.locationAndStatus.flightLegStatus == "DEPSCH") schontime++;
    if(e.locationAndStatus.flightLegStatus == "ARRDEL" || e.locationAndStatus.flightLegStatus == "DEPDEL") schdelayed++;
    if(e.locationAndStatus.flightLegStatus == "CAN") cancelled++;
    total++;
    airlinesarray.push(e.airlineOperator.name);
    if(e.direction == "arr"){
      airportsarray.push(e.flightLegIdentifier.departureAirportIcao);
      if(e.flightLegIdentifier.departureAirportIcao.slice(0,2)=="ES") domestic++;
    }
    if(e.direction == "dep"){
      airportsarray.push(e.flightLegIdentifier.arrivalAirportIcao);
      if(e.flightLegIdentifier.arrivalAirportIcao.slice(0,2)=="ES") domestic++;
    }
    
  });
  
  // Calculating Proprtion of delay
  pdelay = trafficdelayed/(trafficontime+trafficdelayed);
  
  // Calculating mean
  let t = 0;
  for (let i = 0; i < delayminutes.length; i++) {
    t += delayminutes[i];
  }
  delaymean = t / delayminutes.length;
  
  //Calculating median
  delayminutes.sort((a, b) => a - b);
  if (delayminutes.length % 2 === 0) {
    delaymedian = (delayminutes[delayminutes.length / 2 - 1] + delayminutes[delayminutes.length / 2]) / 2;
  }else delaymedian = delayminutes[(delayminutes.length - 1) / 2];
  
  // Getting nr of airlines and airports
  airlines = getUniqueValues(airlinesarray).length;
  airports = getUniqueValues(airportsarray).length;
  
  // Setting variables to zero if empty so interface shows 0 instead of NaN
  if(delayminutes.length < 1){
    pdelay = 0; delaymean = 0; delaymedian = 0;
  }
  
  switch (searchDirection){
    case 'arr':
      html+='<div class="tableitem">Landed (on-time):</div>';
      html+='<div class="tableitem">'+trafficontime+'</div>';
      html+='<div class="tableitem">Proportion of delayed flights:</div>';
      html+='<div class="tableitem">'+Math.round((pdelay)*1000)/10+'%</div>';
      html+='<div class="tableitem lightitem">Landed (delayed):</div>';
      html+='<div class="tableitem lightitem">'+trafficdelayed+'</div>';
      html+='<div class="tableitem lightitem">Mean delay:</div>';
      html+='<div class="tableitem lightitem">'+Math.round(delaymean*10)/10+' mins</div>';
      html+='<div class="tableitem">Scheduled (on-time):</div>';
      html+='<div class="tableitem">'+schontime+'</div>';
      html+='<div class="tableitem">Median delay:</div>';
      html+='<div class="tableitem">'+Math.round(delaymedian*10)/10+' mins</div>';
      html+='<div class="tableitem lightitem">Scheduled (delayed):</div>';
      html+='<div class="tableitem lightitem">'+schdelayed+'</div>';
      html+='<div class="tableitem lightitem">Nr of airlines:</div>';
      html+='<div class="tableitem lightitem">'+airlines+'</div>';
      html+='<div class="tableitem">Cancelled:</div>';
      html+='<div class="tableitem">'+cancelled+'</div>';
      html+='<div class="tableitem">Nr of airports served:</div>';
      html+='<div class="tableitem">'+airports+'</div>';
      html+='<div class="tableitem lightitem"><b>Total nr:</div>';
      html+='<div class="tableitem lightitem">'+(trafficontime+trafficdelayed+schontime+schdelayed+cancelled)+'</b></div>';
      html+='<div class="tableitem lightitem">Nr of domestic flights:</div>';
      html+='<div class="tableitem lightitem">'+domestic+' ('+Math.round((domestic/total)*1000)/10+'%)</div>';
      document.getElementById("tableheader").innerHTML = "Arrivals";
      document.getElementById("tableheader").style.backgroundColor = arrlandelColor;
      //document.getElementById("tableheader").style.backgroundImage = "";
      break;
    case 'dep':
      html+='<div class="tableitem">Departed (on-time):</div>';
      html+='<div class="tableitem">'+trafficontime+'</div>';
      html+='<div class="tableitem">Proportion of delayed flights:</div>';
      html+='<div class="tableitem">'+Math.round((pdelay)*1000)/10+'%</div>';
      html+='<div class="tableitem">Departed (delayed):</div>';
      html+='<div class="tableitem">'+trafficdelayed+'</div>';
      html+='<div class="tableitem">Mean delay:</div>';
      html+='<div class="tableitem">'+Math.round(delaymean*10)/10+' mins</div>';
      html+='<div class="tableitem">Scheduled (on-time):</div>';
      html+='<div class="tableitem">'+schontime+'</div>';
      html+='<div class="tableitem">Median delay:</div>';
      html+='<div class="tableitem">'+Math.round(delaymedian*10)/10+' mins</div>';
      html+='<div class="tableitem">Scheduled (delayed):</div>';
      html+='<div class="tableitem">'+schdelayed+'</div>';
      html+='<div class="tableitem">Nr of airlines:</div>';
      html+='<div class="tableitem">'+airlines+'</div>';
      html+='<div class="tableitem">Cancelled:</div>';
      html+='<div class="tableitem">'+cancelled+'</div>';
      html+='<div class="tableitem">Nr of airports served:</div>';
      html+='<div class="tableitem">'+airports+'</div>';
      html+='<div class="tableitem"><b>Total nr:</div>';
      html+='<div class="tableitem">'+(trafficontime+trafficdelayed+schontime+schdelayed+cancelled)+'</b></div>';
      html+='<div class="tableitem">Nr of domestic flights:</div>';
      html+='<div class="tableitem">'+domestic+' ('+Math.round((domestic/total)*1000)/10+'%)</div>';
      document.getElementById("tableheader").innerHTML = "Departures";
      document.getElementById("tableheader").style.backgroundColor = depactdelColor;
      //document.getElementById("tableheader").style.backgroundImage = "";
      break;
    case 'combined':
      html+='<div class="tableitem">Arr&Dep (on-time):</div>';
      html+='<div class="tableitem">'+trafficontime+'</div>';
      html+='<div class="tableitem">Proportion of delayed flights:</div>';
      html+='<div class="tableitem">'+Math.round((pdelay)*1000)/10+'%</div>';
      html+='<div class="tableitem">Arr&Dep (delayed):</div>';
      html+='<div class="tableitem">'+trafficdelayed+'</div>';
      html+='<div class="tableitem">Mean delay:</div>';
      html+='<div class="tableitem">'+Math.round(delaymean*10)/10+' mins</div>';
      html+='<div class="tableitem">Scheduled (on-time):</div>';
      html+='<div class="tableitem">'+schontime+'</div>';
      html+='<div class="tableitem">Median delay:</div>';
      html+='<div class="tableitem">'+Math.round(delaymedian*10)/10+' mins</div>';
      html+='<div class="tableitem">Scheduled (delayed):</div>';
      html+='<div class="tableitem">'+schdelayed+'</div>';
      html+='<div class="tableitem">Nr of airlines:</div>';
      html+='<div class="tableitem">'+airlines+'</div>';
      html+='<div class="tableitem">Cancelled:</div>';
      html+='<div class="tableitem">'+cancelled+'</div>';
      html+='<div class="tableitem">Nr of airports served:</div>';
      html+='<div class="tableitem">'+airports+'</div>';
      html+='<div class="tableitem"><b>Total nr:</div>';
      html+='<div class="tableitem">'+(trafficontime+trafficdelayed+schontime+schdelayed+cancelled)+'</b></div>';
      html+='<div class="tableitem">Nr of domestic flights:</div>';
      html+='<div class="tableitem">'+domestic+' ('+Math.round((domestic/total)*1000)/10+'%)</div>';
      document.getElementById("tableheader").innerHTML = "Arrivals & Departures";
      document.getElementById("tableheader").style.backgroundColor = arrdepColor;
      //document.getElementById("tableheader").style.backgroundImage = "linear-gradient(to right, "+colorToRgb(arrlandelColor)+" , "+colorToRgb(depactdelColor)+")";
      break;  
  }
  document.getElementById("table").innerHTML = html;
  
}

////////// JS FOR GRAPH //////////
// set the dimensions and margins of the graph

// Set margin Y X
const margin = {left:50, top:120, right: 50, bottom: 40},
      width = 460 - margin.left - margin.right,
      height = 460 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#divstat")
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
              .append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleTime().range([0,width]);
const y = d3.scaleLinear().range([height, 0]);

// Y-lines
const yLines = d3.axisLeft(y).tickSize(-width).tickFormat('').ticks(10);
let yGrid = svg.append("g").attr('class', 'axis-grid');

let yAxis = svg.append("g");
let xAxis = svg.append("g").attr("transform", `translate(0, ${height})`);

let Tooltip = d3.select("#divstat")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px");

function updateChart(data){
  
  
  // Getting DATE from ARRdata and setting to midnight for the X axis domain/range
  let min = new Date(arrData.to.flightArrivalDate);
  let offset = min.getTimezoneOffset();
  let timeMin = new Date(min.getTime()+(offset*60*1000));
  let timeMax = new Date(timeMin.getTime()+(24*3600*1000));
  
  // Add X-axis and set tick labels to HH:MM
  x.domain([timeMin, timeMax]);
  xAxis.call(d3.axisBottom(x).tickFormat(d3.timeFormat("%H:%M")).ticks());
  let tempo =[];
  const histogram = d3.histogram()
                      .value(function(d) { 
                        if(searchDirection=="arr") return new Date(d.arrivalTime.scheduledUtc);
                        else if(searchDirection =="dep") return new Date(d.departureTime.scheduledUtc);
                        else if(searchDirection =="combined"){
                          if("departureTime" in d) return new Date(d.departureTime.scheduledUtc);
                          else if("arrivalTime" in d) return new Date(d.arrivalTime.scheduledUtc);
                        }
                      })  //Set the value I want to use, here the time
                      .domain(x.domain())  // then the domain of the graphic
                      .thresholds(x.ticks(24)); // then the numbers of bins set to 24 hours
  
  
  // SET COLOR SCHEME and KEYS
  let colorScale;
  let k;
  if(searchDirection =="arr"){ //ARRIVALS
    /*k = ["ARRLANDEL","ARRDEL","ARRSCH","LAN","CAN"];
    colorScale = d3.scaleOrdinal().domain(k).range([arrlandelColor,arrdelColor,arrschColor,arrlanColor,canColor]);*/
    k = ["CAN","LAN","ARRLANDEL","ARRSCH","ARRDEL"];
    colorScale = d3.scaleOrdinal().domain(k).range([canColor,arrlanColor,arrlandelColor,arrschColor,arrdelColor]);
  }else if(searchDirection == "dep"){ //DEPARTURES
    k = ["CAN","ACT","DEPACTDEL","DEPSCH","DEPDEL"]
    colorScale = d3.scaleOrdinal().domain(k).range([canColor,depactColor,depactdelColor,depschColor,depdelColor]);
  }else if(searchDirection == "combined"){
    k = ["CAN","LAN","ARRLANDEL","ACT","DEPACTDEL","ARRSCH","DEPSCH","ARRDEL","DEPDEL"];
    colorScale = d3.scaleOrdinal().domain(k).range([canColor,arrlanColor,arrlandelColor,depactColor,depactdelColor,arrschColor,depschColor,arrdelColor,depdelColor]);
  }
  
  // And apply this function to data to get the bins
  const bins = histogram(data);
  
  // Reorganising data so it can become "stackable" for D3
  let stackData =[];
  for (let bin in bins) {
    let pushableObject = {};
    // add the time boundaries so we can use them when drawing later
    pushableObject.x0 = bins[bin].x0;
    pushableObject.x1 = bins[bin].x1;
    // for each bin, split the data into the different keys.
    // Here SHOW where to get the data for tke KEYS d.yadiyadayada
    bins[bin].forEach(function(d) {
        if (!pushableObject[d.locationAndStatus.flightLegStatus]) { pushableObject[d.locationAndStatus.flightLegStatus] = [d]}
        else pushableObject[d.locationAndStatus.flightLegStatus].push(d);
    })
    // if any of the keys didn't get represented in this bin, give them empty arrays for the stack function.
    k.forEach( function(key) {
        if (!pushableObject[key]) {
            pushableObject[key] = [];
        }
    })
    stackData.push(pushableObject);
  }
  //console.log(stackData[1]);
  
  //Create the "real" stack data for the Y coordinates for drawing the stacks
  let realStack = d3.stack()
    .keys(k)
    .value(function(d, key) {
        return d[key].length;  //Use the length of the stacks as the value
    });
  
  // Add Y axis, after histogram to get bins
  y.domain([0, d3.max(bins, function(d) { return d.length; })]);  
  yAxis.transition().duration(500).call(d3.axisLeft(y));
  

  // Add Y grid lines
  yGrid.transition().duration(500).call(yLines);
  
  // Add basis for chart
  let graph = svg.append("g").selectAll("bars"); 
  
  // Transition out and Remove all old rects for update
  svg.selectAll("rect")
     .transition().duration(300)
     .attr("y", d => height)
     .attr("height", 0) 
    .remove();
  
  let index = -1;
  // Draw new rects, in loops by colour
  graph
    .data(realStack(stackData))
    .join("g") // First loop through data, per key/colour
      .attr("fill", function (d) {return colorScale(d.key)})
      .attr("keyid", function(d) {return d.key})
      .selectAll("rect")
      .data(d => d)
      .join("rect") // Second inner loop through data, per rect
      // Transition the columns in. Add delay at end between each loop to stagger animation
  
      .transition().duration(500)
        .attr("stackid", (d,i) => i)
        .attr("x", (d,i) => x(stackData[i].x0)+1) 
        .attr("y", d => height) 
        .attr("width", function(d,i) { return x(stackData[i].x1) - x(stackData[i].x0)-1})
        .attr("height", 0) // Set to 0 before animation below
        .transition().duration(750) // animate height from bottom up
        .attr("height", d => y(d[0]) - y(d[1]))
        .attr("y", d => y(d[1]))
        .delay((d,i) => {return i*50}) //delay each pass for animation
  
        /* 
        * Data is stacked but with X timestamp in stackData array, so use that for x-values
        * Then use the "d3.stack" to stack that data and get the y-values for the different keys/colours
        * And use that for the column. And tadaa, nice graph
        */
  
    // Set mouse listeners on columns to ge tnr of flights
    svg.selectAll('rect').on("mousemove", function(event,d) {
                          //updateGraphHeading(d[1]-d[0]);
                        //Tooltip.html("Nr of flights: " + (d[1]-d[0]))
                        //       .style("left", event.x-(width/2)+30 + "px")
                        //       .style("top", event.y - height + "px"); 
                        })
                        .on("mouseover", function(event,d) {
                          //Tooltip.style("opacity", 1)
                          d3.select(this).style("stroke", "black")})
                        .on("mouseleave", function(event,d) {
                          //Tooltip.style("opacity", 0)
                        d3.select(this).style("stroke", "none")})
                        .on("click", function(event,d) {
                          let t = parseInt(d3.select(this).attr("stackid"));
                          let tk = d3.select(this.parentNode).attr("keyid");
                          updateGraphInfo(stackData[t][tk]);
                        });
    
  // LEGEND
  let legendKeys;
  let legendRange;
  switch(searchDirection){
    case "arr":
      legendKeys = ["Scheduled (on-time)","Scheduled (delayed)","Cancelled","Landed (on-time)","Landed (delayed)"];
      legendRange = [arrschColor,arrdelColor,canColor,arrlanColor,arrlandelColor];
      break;
    case "dep":
      legendKeys = ["Scheduled (on-time)","Scheduled (delayed)","Cancelled","Departed (on-time)","Departed (delayed)"];
      legendRange = [depschColor,depdelColor,canColor,depactColor,depactdelColor];
      break;
    case "combined":
      legendKeys = ["Arrivals","Scheduled (on-time)","Landed (on-time)","Landed (delayed)","Departures","Scheduled on-time","Departed (on-time)","Departed (delayed)","Both","Scheduled (delayed)","Cancelled"];
      legendRange = ["white",arrschColor,arrlanColor,arrlandelColor,"white",depschColor,depactColor,depactdelColor,"white",depdelColor,canColor];
      break;
  }

  // Usually you have a color scale in your chart already
  let legendcolor = d3.scaleOrdinal()
    .domain(legendKeys)
    .range(legendRange);
  
  svg.selectAll(".legend").remove();
  
  let legend = svg.selectAll('.legend')
        .data(legendKeys)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('id',function(d,i){ return d[i]; });

  legend.append('rect')
        .attr('x', function(d,i){ if(searchDirection=="combined") return -20 + Math.floor(i/4)*135;
                                  else return 15 + Math.floor(i/3)*170})
        .attr('y', function(d,i){ if(searchDirection=="combined") return -105 + Math.floor(i%4)*25;
                                  else return -86 + Math.floor(i%3)*25})
        .attr('width', '12px').attr('height', '12px')
        .style('fill', (d,i) => legendcolor(d));
  
  legend.append('text')
        .attr('x', function(d,i){ if(searchDirection=="combined") return -5 + Math.floor(i/4)*135;
                                  else return 30 + Math.floor(i/3)*170})
        .attr('y', function(d,i){ if(searchDirection=="combined") return -98 + Math.floor(i%4)*25;
                                  else return -79 + Math.floor(i%3)*25})
        .attr("font-family", "sans-serif")
        .attr("font-size", "12px")
        .style("fill", function(d){ return "black"})
        .text(function(d){ return d; })
        .style("alignment-baseline", "middle");

}


addListenersToGraphList();
/////// JS FOR GRAPH LIST ///////

function addListenersToGraphList(){
  let acc = document.getElementsByClassName("accordion");

  for (let i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function() {
      this.classList.toggle("active");
      /* Toggle between hiding and showing the active panel */
      var panel = this.nextElementSibling;
      if (panel.style.display === "block") {
        panel.style.display = "none";
      } else {
        panel.style.display = "block";
      }
    });
  }
}

/*
function updateGraphHeading(data){
  document.getElementById("graphheading").innerHTML = "Nr of flights: "+data;
  //document.getElementById("graphinfo").innerHTML = "<p>Hello</p>";
  //console.log(data);
}*/
function dateToLocal(d){
  if(d!=undefined){
    let s = new Date(d).toString().split(" ");
    let r = s[4].slice(0,5);
    return r;
  }else return "n/a";
}

function checkData(d){
  if(d!=undefined){
    return d;
  }else return("n/a");
}

function updateGraphInfo(data){
  let status = data[0].locationAndStatus.flightLegStatus;
  if(status=="CAN"){
    document.getElementById("graphheading").style.color = "black";
    document.getElementById("graphheading").style.backgroundColor = canColor;
  }else if(status=="ARRDEL"||status=="DEPDEL"){
    document.getElementById("graphheading").style.color = "black";
    document.getElementById("graphheading").style.backgroundColor = arrdelColor;
  }else if(status=="LAN"){
    document.getElementById("graphheading").style.color = "white";
    document.getElementById("graphheading").style.backgroundColor = arrlanColor;
  }else if(status=="ARRLANDEL"){
    document.getElementById("graphheading").style.color = "white";
    document.getElementById("graphheading").style.backgroundColor = arrlandelColor;
  }else if(status=="ARRSCH"){
    document.getElementById("graphheading").style.color = "black";
    document.getElementById("graphheading").style.backgroundColor = arrschColor;
  }else if(status=="ACT"){
    document.getElementById("graphheading").style.color = "white";
    document.getElementById("graphheading").style.backgroundColor = depactColor;
  }else if(status=="DEPACTDEL"){
    document.getElementById("graphheading").style.color = "white";
    document.getElementById("graphheading").style.backgroundColor = depactdelColor;
  }else if(status=="DEPSCH"){
    document.getElementById("graphheading").style.color = "black";
    document.getElementById("graphheading").style.backgroundColor = depschColor;
  }
  // Writing list size to HTML
  document.getElementById("graphheading").innerHTML = "Nr of flights: "+data.length;
  
  // Sorting list alphabetically with callsign
  data.sort((a, b) => {
    let nameA = a.flightLegIdentifier.callsign;
    let nameB = b.flightLegIdentifier.callsign; 
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
  });
    
  let html="";
  for (let i=0; i<data.length; i++){
    html+='<button class="accordion">'+data[i].flightLegIdentifier.callsign+' / '+data[i].airlineOperator.name+'</button>';
    html+='<div class="level2">';
      html+='<div class="flightgrid">';
        html+='<div class="flightitem lightitem">Flight nr:</div><div class="flightitem lightitem">'+data[i].flightId+'</div>';
        if(data[i].direction == "arr"){
          html+='<div class="flightitem">From:</div><div class="flightitem">'+data[i].departureAirportEnglish+'</div>';
          html+='<div class="flightitem lightitem">Scheduled arrival:</div><div class="flightitem lightitem">'+dateToLocal(data[i].arrivalTime.scheduledUtc)+'</div>';
          html+='<div class="flightitem">Estimated arrival:</div><div class="flightitem">'+dateToLocal(data[i].arrivalTime.estimatedUtc)+'</div>';
          html+='<div class="flightitem lightitem">Landed at:</div><div class="flightitem lightitem">'+dateToLocal(data[i].arrivalTime.actualUtc)+'</div>';
        }else{
          html+='<div class="flightitem">To:</div><div class="flightitem">'+data[i].arrivalAirportEnglish+'</div>';
          html+='<div class="flightitem lightitem">Scheduled departure:</div><div class="flightitem lightitem">'+dateToLocal(data[i].departureTime.scheduledUtc)+'</div>';
          html+='<div class="flightitem">Estimated departure:</div><div class="flightitem">'+dateToLocal(data[i].departureTime.estimatedUtc)+'</div>';
          html+='<div class="flightitem lightitem">Departed at:</div><div class="flightitem lightitem">'+dateToLocal(data[i].departureTime.actualUtc)+'</div>';
        }
    html+='<div class="flightitem">Terminal:</div><div class="flightitem">'+checkData(data[i].locationAndStatus.terminal)+'</div>';
    html+='<div class="flightitem lightitem">Gate:</div><div class="flightitem lightitem">'+checkData(data[i].locationAndStatus.gate)+'</div>';
    html+='</div></div>';
  }
  document.getElementById("graphinfo").innerHTML = html;
  addListenersToGraphList();
  console.log(data);
}

//////// JS FOR MAP //////////

function mapClick(nr){
  if(nr==1){
    document.getElementById("b2").checked = false;
    mapmode = 1;
  }
  else{
    document.getElementById("b1").checked = false;
    mapmode = 2;
  }
  
  switch (searchDirection){
    case "arr":
      updateMap(arrFlightList);
      break;
    case "dep":
      updateMap(depFlightList);
      break;
    case "combined":
      updateMap(combinedFlightList);
      break;
  }  
}

const startingPos =[59.651, 17.941];
const URL_WHITE = 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png';

// Creating MAP and baseMap Layer and adding them to the DIV
// So even if other layers take time to load map shows right away
const map = L.map('divmap', {
  center: startingPos,
  zoom: 4,
  fullscreenControl: true,
  fullscreenControlOptions: {position: 'topleft'},
  attributionControl: false,
  renderer: L.canvas()
});

L.control.attribution({
  position: 'bottomleft'
}).addTo(map);

// Creating Basemaps
const baseMapGrey = new L.tileLayer(URL_WHITE, {
  attribution: '&copy; <a href="https://carto.com/">CartoDB</a> & <a href="https://www.openstreetmap.org/copyright">OSM</a> kitpaddle',
  minZoom: 1,
  updateWhenIdle: true,
  keepBuffer: 5,
  edgeBufferTiles: 2
}).addTo(map);

// Creating layer to hold all map drawings
let airportLayer = L.layerGroup().addTo(map);
let legend = L.control({position: 'topright'});
function updateMap(data){
  
  airportLayer.clearLayers(); // Clear all old map layers
  map.removeControl(legend);
  
  let uarr = data.map( e =>{
    if(e.direction == "arr"){
       return e.flightLegIdentifier.departureAirportIcao;
    }
    if(e.direction == "dep"){
       return e.flightLegIdentifier.arrivalAirportIcao;
    }
  });
  let arr = getUniqueValues(uarr); // Get each airport once (dep or arr)
  let flights = [];
  // Go through the airports
  for (let i=0;i<arr.length;i++){
    let missingCheck=0; 
    // If a match is found, associate lat/long, name, city
    for (let j=0;j<airportList.length;j++){
      if(arr[i]==airportList[j].icao){
        missingCheck=1;
        let farr = [];
        let fdep = [];
        // And add what flights go to/from that airport
        data.forEach( e=>{
          if(e.direction == "arr"){
            if(arr[i] == e.flightLegIdentifier.departureAirportIcao){ // If flight at airport
              let delay = 0;
              if(e.locationAndStatus.flightLegStatus == "ARRLANDEL"){ // If flight delayed
                let diff = Math.abs(new Date(e.arrivalTime.actualUtc) - new Date(e.arrivalTime.scheduledUtc));
                delay = Math.floor((diff/1000)/60);
              }
              farr.push({'callsign':e.flightLegIdentifier.callsign, 'delay': delay, 'time': dateToLocal(e.arrivalTime.scheduledUtc), 'status':e.locationAndStatus.flightLegStatus});
            }
          }
          if(e.direction == "dep"){
            if(arr[i] == e.flightLegIdentifier.arrivalAirportIcao){
              let delay = 0;
              if(e.locationAndStatus.flightLegStatus == "DEPACTDEL"){ // If flight delayed
                let diff = Math.abs(new Date(e.departureTime.actualUtc) - new Date(e.departureTime.scheduledUtc));
                delay = Math.floor((diff/1000)/60);
              }
              fdep.push({'callsign':e.flightLegIdentifier.callsign, 'delay': delay, 'time': dateToLocal(e.departureTime.scheduledUtc), 'status':e.locationAndStatus.flightLegStatus});
            }
          }
        })
        flights.push({'icao': arr[i], 'name': airportList[j].name, 'city': airportList[j].city, 'country': airportList[j].country , 'latitude': parseFloat(airportList[j].latitude), 'longitude': parseFloat(airportList[j].longitude), 'flightsarr': farr, 'flightsdep': fdep});
      }
    }
    // A check to see if an airport is not in the airport database
    if(missingCheck==0) console.log("Missing airport for map: "+arr[i]);
  }
 
  // Go through each airport again to draw them to the map
  flights.forEach( e => {
    
    // Sort flights in chronological order
      e.flightsarr.sort((a, b) => {
        let nameA = a.time; let nameB = b.time; 
        if (nameA < nameB) { return -1; }
        if (nameA > nameB) { return 1; } });
      e.flightsdep.sort((a, b) => {
        let nameA = a.time; let nameB = b.time; 
        if (nameA < nameB) { return -1; }
        if (nameA > nameB) { return 1; } });

      let html = "<style> div.leaflet-popup-content {width:auto !important;}</style>"; //Resize popup auto for grid/flex
      html+= '<div class="popupcontainer">';
      html+= '<div><b>'+e.name + " (" + e.icao +")</b></div>";
      html+='<div class="tablecontainer">';
      if(searchDirection == "arr" || searchDirection == "combined"){
        html+='<div class="tablecolumn">';
        html+= "<div>Arrivals: "+e.flightsarr.length+"</div>";
        html+='<div class="rowsmall">Scheduled landing times at Arlanda and their respective delays</div>';
        for(let i=0; i<e.flightsarr.length;i++){
          html+= '<div class="tablerow"><div style="background-color:'+statusToColor(e.flightsarr[i].status)+'; margin:1px 0;"></div><div>'+e.flightsarr[i].callsign + "</div><div>" + e.flightsarr[i].time + "</div><div>" + e.flightsarr[i].delay + " min</div></div>";
        }
        html+='</div>';
      } 
      if(searchDirection == "dep" || searchDirection == "combined"){
        html+='<div class="tablecolumn">';
        html+= "<div>Departures: "+e.flightsdep.length+"</div>";
        html+='<div class="rowsmall">Scheduled departure times at Arlanda and their respective delays</div>';
        for(let i=0; i<e.flightsdep.length;i++){
          html+= '<div class="tablerow"><div style="background-color:'+statusToColor(e.flightsdep[i].status)+'; margin:1px 0;"></div><div>'+e.flightsdep[i].callsign + "</div><div>" + e.flightsdep[i].time + "</div><div>" + e.flightsdep[i].delay + " min</div></div>";
        }
        html+='</div>';
      } 
      html+='</div>';
      
    // Showing density of traffic per destination
    if(mapmode == 1){
      let mapcolor = colorToRgb(arrdepColor);
      if(e.flightsarr.length<1) mapcolor = colorToRgb(depactdelColor);
      if(e.flightsdep.length<1) mapcolor = colorToRgb(arrlandelColor);
      let n = e.flightsdep.length+e.flightsarr.length+2;

      L.Polyline.Arc([59.651, 17.941], [e.latitude, e.longitude], {
        weight: 1,
        opacity: 0.2,
        color: mapcolor,
        interactive: false,
        vertices: 500
      }).addTo(airportLayer);

      
      html+='</div>'; // Closing popupcontainer div
      let popup = L.popup().setContent(html);

      // SHOW NUMBER OF FLIGHTS
      L.circleMarker([e.latitude, e.longitude], {
        radius: n,
        weight: 2,
        color: mapcolor,
        opacity: 1,
        fillOpacity: 0.5,
        fillColor: mapcolor,
      }).addTo(airportLayer).bindPopup(popup);
    }
    // Showing color coded delays and how many are late
    if (mapmode==2){
      let allflights = [...e.flightsarr, ...e.flightsdep];
      let delaymedian = 0;
      let delaymean = 0;
      let delaypercent = 0;
      let percentflights = allflights.filter( e => e.delay!=0);
      let delayminutes = allflights.map(e => e.delay);
      delaypercent = Math.round(percentflights.length/allflights.length*1000)/10;
      delaymean = Math.round((delayminutes.reduce((a, b) => a + b, 0))/delayminutes.length*10)/10;
      if (percentflights.length == 0) delaymean = 0;
      
      let mapcolor = "rgb(44, 186, 0)";
      if(delaymean>5 && delaymean <20) mapcolor = "rgb(163, 255, 0)";
      if(delaymean>=20 && delaymean <40) mapcolor = "rgb(255, 244, 0)";
      if(delaymean>=40 && delaymean <60) mapcolor = "rgb(255, 167, 0)";
      if(delaymean>=60) mapcolor = "rgb(255, 0, 0)";
      let p = 2; // Coefficient for size or radius
      if(e.flightsarr.length == 0 || e.flightsdep.length == 0) p = 3;
      let n = (percentflights.length*p)+3;
      //let n = percentflights.length/allflights.length * 7 + 3;
      L.Polyline.Arc([59.651, 17.941], [e.latitude, e.longitude], {
        weight: 1,
        opacity: 0.2,
        color: "grey",
        interactive: false,
        vertices: 500
      }).addTo(airportLayer);
      html+= "<div>"+percentflights.length+"/"+allflights.length+" ("+delaypercent+"%) flights delayed  </div>";
      html+="<div>Average delay of "+delaymean+" min</div>";
      html+='</div>';
      let popup = L.popup().setContent(html);
      // SHOW NUMBER OF FLIGHTS
      L.circleMarker([e.latitude, e.longitude], {
        radius: n,
        weight: 2,
        color: "darkgrey",
        opacity: 0.7,
        fillOpacity: 1,
        fillColor: mapcolor,
      }).addTo(airportLayer).bindPopup(popup);
    }
  });
  
  // Legend for the map
  
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'legend');
    let leghtml = '';
    if(mapmode==1){
      leghtml+= '<div class="lrow">';
      leghtml+= "Nr of flights";
      leghtml+= '</div>';
      leghtml+= '<div class="lrow">';
      leghtml+= '<div class="irow"><div class="dot size1"></div><div>1</div></div>';
      leghtml+= '<div class="irow"><div class="dot size2"></div><div>5</div></div>';
      leghtml+= '<div class="irow"><div class="dot size3"></div><div>10</div></div>';
      leghtml+= '</div>';
      div.style.height = "55px";
    }
    if(mapmode==2){
      leghtml+= '<div class="lrow">';
      leghtml+= "Nr of delayed flights";
      leghtml+= '</div>';
      leghtml+= '<div class="lrow">';
      leghtml+= '<div class="irow"><div class="dot size1"></div><div>1</div></div>';
      leghtml+= '<div class="irow"><div class="dot size2"></div><div>5</div></div>';
      leghtml+= '<div class="irow"><div class="dot size3"></div><div>10</div></div>';
      leghtml+= '</div>';
      leghtml+= '<div class="lrow">';
      leghtml+= "Average delay time";
      leghtml+= '</div>';
      leghtml+= '<div class="crow">';
      leghtml+= '<div class="irow"><div class="dot dotgreen size2"></div><div>< 5 mins</div></div>';
      leghtml+= '<div class="irow"><div class="dot dotlightgreen size2"></div><div>5 - 20 mins</div></div>';
      leghtml+= '<div class="irow"><div class="dot dotyellow size2"></div><div>20 - 40 mins</div></div>';
      leghtml+= '<div class="irow"><div class="dot dotorange size2"></div><div>40 - 60 mins</div></div>';
      leghtml+= '<div class="irow"><div class="dot dotred size2"></div><div>> 60 mins</div></div>';
      leghtml+= '</div>';
      div.style.height = "183px";
      //l[0].style.height = "155px";
    }
    div.innerHTML = leghtml;
    return div;
  };

  legend.addTo(map);
  
}


//////// JS TREEMAP //////////

function treeClick(nr){
  if(nr==1){
    document.getElementById("t2").checked = false;
    treemode = 1;
  }
  else{
    document.getElementById("t1").checked = false;
    treemode = 2;
  }
  
  switch (searchDirection){
    case "arr":
      updateAirlinesTree(arrFlightList);
      break;
    case "dep":
      updateAirlinesTree(depFlightList);
      break;
    case "combined":
      updateAirlinesTree(combinedFlightList);
      break;
  }  
}

// Set margin Y X
const treemargin = {left:0, top: 0, right: 0, bottom: 70},
      treewidth = 750 - treemargin.left - treemargin.right,
      treeheight = 520 - treemargin.top - treemargin.bottom;

// append the svg object to the body of the page
const treesvg = d3.select("#airlinescontainer")
              .append("svg")
              .attr("width", treewidth + treemargin.left + treemargin.right)
              .attr("height", treeheight + treemargin.top + treemargin.bottom)
              .append("g")
              .attr("transform", `translate(${treemargin.left},${treemargin.top})`);

const treetip = d3.select("#airlinescontainer")
                  .append('div')
                  .attr('class', 'treetip')
                  .attr('id', 'treetip')
                  .style('opacity', 0);

let treeScale = d3.scaleLinear();
                         

function updateAirlinesTree(data){
  
  let airlines = [];
  
  let icaoarr = [...new Map(data.map(item =>
  [item.airlineOperator.icao, item])).values()];
  
  let totaldep = data.filter(e => e.direction == "dep").length;
  let totalarr = data.filter(e => e.direction == "arr").length;
  
  icaoarr.forEach( e => {
   let fdep = [], farr = []; 
   for(let i=0; i<data.length;i++){
     if(data[i].direction == "arr"){
       if(data[i].airlineOperator.icao == e.airlineOperator.icao){
         let delay = 0;
         if(data[i].locationAndStatus.flightLegStatus == "ARRLANDEL"){ // If flight delayed
           let diff = Math.abs(new Date(data[i].arrivalTime.actualUtc) - new Date(data[i].arrivalTime.scheduledUtc));
           delay = Math.floor((diff/1000)/60);
         }
         farr.push({'callsign':data[i].flightLegIdentifier.callsign, 'delay': delay, 'time': dateToLocal(data[i].arrivalTime.scheduledUtc), 'status':data[i].locationAndStatus.flightLegStatus});
       }
     }else if(data[i].direction == "dep"){
       if(data[i].airlineOperator.icao == e.airlineOperator.icao){
         let delay = 0;
         if(data[i].locationAndStatus.flightLegStatus == "DEPACTDEL"){ // If flight delayed
           let diff = Math.abs(new Date(data[i].departureTime.actualUtc) - new Date(data[i].departureTime.scheduledUtc));
           delay = Math.floor((diff/1000)/60);
         }
         fdep.push({'callsign':data[i].flightLegIdentifier.callsign, 'delay': delay, 'time': dateToLocal(data[i].departureTime.scheduledUtc), 'status':data[i].locationAndStatus.flightLegStatus});
       }
     }
   }
    let flights = farr.length + fdep.length;
    let percentd=0, arrdelaynr=0, depdelaynr=0, arrdelayminutes=0, depdelayminutes=0;
 
    if(farr.length>0){
      for(let i=0; i<farr.length; i++){
        if(farr[i].delay > 0){
          percentd++;
          arrdelaynr++;
          arrdelayminutes+= farr[i].delay
        }
      }
    }
    if(fdep.length>0){
      for(let i=0; i<fdep.length; i++){
        if(fdep[i].delay > 0){
          percentd++;
          depdelaynr++;
          depdelayminutes+= fdep[i].delay
        }
      }
    }
    percentd = percentd/(farr.length+fdep.length);
    
    airlines.push({'icao': e.airlineOperator.icao, 'name': e.airlineOperator.name, 'iata': e.airlineOperator.iata, 'size': flights,'delaypercent': percentd, 'flightsarr': farr, 'arrdelaynr': arrdelaynr, 'arrdelayminutes': arrdelayminutes,'flightsdep': fdep, 'depdelaynr': depdelaynr, 'depdelayminutes': depdelayminutes, 'totalarr': totalarr, 'totaldep': totaldep});
  });
  
  if(treemode==1){
    treeScale.domain([0,0.5,1]);
  }
  
  if(treemode==2){
    treeScale.domain([0,22,45]);
  }
  
  treeScale.range([arrlandelColor,"#7D7E15","#7F1B16"]);
  
  

  let nest = {'children': airlines}; // Nesting data so D3.HIERARCHY can read it (must be children)
  let root = d3.hierarchy(nest).sum(function(d){ return d.size})
  root.sort(function (a, b) {       // sort by "height", and if the same, by value
    //return b.height - a.height || b.value - a.value
    if(treemode==1)
      return a.data.delaypercent - b.data.delaypercent || b.value - a.value;
    if(treemode==2){
      if(searchDirection=="arr")
        return (a.data.arrdelayminutes/a.data.flightsarr.length) - (b.data.arrdelayminutes/b.data.flightsarr.length);
      if(searchDirection=="dep")
        return (a.data.depdelayminutes/a.data.flightsdep.length) - (b.data.depdelayminutes/b.data.flightsdep.length);
      if(searchDirection=="combined")
        return (a.data.depdelayminutes+a.data.arrdelayminutes)/(a.data.flightsdep.length+a.data.flightsarr.length) - (b.data.depdelayminutes+b.data.arrdelayminutes)/(b.data.flightsdep.length+b.data.flightsarr.length);
    }
  });
  

  // Then d3.treemap computes the position of each element of the hierarchy
  d3.treemap().tile(d3.treemapBinary)
    .size([treewidth, treeheight])
    .padding(2)
    (root)

  // use this information to add rectangles:
  treesvg
    .selectAll("rect")
    .data(root.leaves())
    .join("rect")
    .transition().duration(500)
    .attr('x', function (d) { return d.x0; })
    .attr('y', function (d) { return d.y0; })
    .attr('width', function (d) { return d.x1 - d.x0; })
    .attr('height', function (d) { return d.y1 - d.y0; })
    .style("stroke", "black")
    .style("fill", function(d){
      if(treemode==1)
       return treeScale(d.data.delaypercent);
      if(treemode==2){
        if(searchDirection=="arr")
          return treeScale(d.data.arrdelayminutes/d.data.flightsarr.length);
        if(searchDirection=="dep")
          return treeScale(d.data.depdelayminutes/d.data.flightsdep.length);
        if(searchDirection=="combined")
          return treeScale((d.data.depdelayminutes+d.data.arrdelayminutes)/(d.data.flightsdep.length+d.data.flightsarr.length));
      }
     
     });
  
  treesvg.selectAll('rect')
    .on('mousemove', function(event,d){
      d3.select(this).style('opacity', 0.7);
      let [x, y] = d3.pointer(event);
      treetip.style('opacity', 1);
      let divhtml = '<div class="tipcontainer">';
      divhtml+= '<div class="tipheading"><b>'+d.data.name+'</b></div>';
      divhtml+= '<div class="tipsubheading"><div>IATA: '+d.data.iata+'</div><div>ICAO: '+d.data.icao+'</div></div>';
      
      if(searchDirection == "arr"){
        divhtml+= '<div class=tiptable>';
        divhtml+= '<div>Arrivals:</div><div>'+Math.round((d.data.flightsarr.length/d.data.totalarr)*1000)/10+'% ('+d.data.flightsarr.length+'/'+d.data.totalarr+')</div>';
        divhtml+= '<div>Delayed:</div><div>'+Math.round((d.data.arrdelaynr/d.data.flightsarr.length)*1000)/10+'% ('+d.data.arrdelaynr+'/'+d.data.flightsarr.length+')</div>';
        divhtml+= '<div>Average delay:</div><div>'+Math.round((d.data.arrdelayminutes/d.data.flightsarr.length)*10)/10+'min</div>';
        divhtml+= '</div>';
      }
      if(searchDirection == "dep"){
        divhtml+= '<div class=tiptable>';
        divhtml+= '<div>Departures:</div><div>'+Math.round((d.data.flightsdep.length/d.data.totaldep)*1000)/10+'% ('+d.data.flightsdep.length+'/'+d.data.totaldep+')</div>';
        divhtml+= '<div>Delayed:</div><div>'+Math.round((d.data.depdelaynr/d.data.flightsdep.length)*1000)/10+'% ('+d.data.depdelaynr+'/'+d.data.flightsdep.length+')</div>';
        divhtml+= '<div>Average delay:</div><div>'+Math.round((d.data.depdelayminutes/d.data.flightsdep.length)*10)/10+'min</div>';
        divhtml+= '</div>';
      }
      if(searchDirection == "combined"){
        divhtml+= '<div class=tiptable>';
        divhtml+= '<div>Total Flights:</div><div>'+Math.round(((d.data.flightsdep.length+d.data.flightsarr.length)/(d.data.totaldep+d.data.totalarr))*1000)/10+'% ('+((d.data.flightsdep.length)+(d.data.flightsarr.length))+'/'+(d.data.totaldep+d.data.totalarr)+')</div>';
        divhtml+= '<div>Delayed:</div><div>'+Math.round(((d.data.depdelaynr+d.data.arrdelaynr)/(d.data.flightsdep.length+d.data.flightsarr.length))*1000)/10+'% ('+((d.data.depdelaynr)+(d.data.arrdelaynr))+'/'+(d.data.flightsdep.length+d.data.flightsarr.length)+')</div>';
        divhtml+= '<div>Average delay:</div><div>'+Math.round(((d.data.depdelayminutes+d.data.arrdelayminutes)/(d.data.flightsdep.length+d.data.flightsarr.length))*10)/10+'min</div>';
        divhtml+= '</div>';
      }
      
      divhtml+= '</div>';
      treetip.html(divhtml)
        .style('top', y+10 + 'px')
        .style("left", x+30+ "px")
    })
    .on('mouseout', function(event,d){
      treetip.style('opacity', 0);
       d3.select(this).style('opacity',1);
    });
  
  // clear text before all updates so it draws correctly
  treesvg.selectAll("text").remove();
  // and to add the text labels
  treesvg
    .selectAll("text")
    .data(root.leaves())
    .join("text")
      //.transition().duration(500)
      .attr("x", function(d){ return d.x0+3})    // +10 to adjust position (more right)
      .attr("y", function(d){ return d.y0+3})    // +20 to adjust position (lower)
      .text(function(d){ return d.data.icao })
      .attr("text-anchor", "start")
      .attr("alignment-baseline", "hanging")
      .attr("pointer-events", "none")
      .attr("font-size", function(d){ 
        if((d.x1-d.x0)<25 ) return "7px";
        if((d.x1-d.x0)>=25 && (d.x1-d.x0)<50 || d.y1-d.y0<25 ) return "10px";
        if((d.x1-d.x0)>=50 && (d.x1-d.x0)<90  ) return "12px";
        if((d.x1-d.x0)>=90  ) return "16px";
        
      })
      .attr("fill", "white");
  
    // Add LEGEND
  const legendH = 10;
  const legendW = 200;
  
  // Create Scale for legend and legend axis
  let xScaleLegend = d3.scaleLinear()
                         .range([0,legendW]);
  let xLegend = treesvg.append("g")
     .attr("transform", "translate("+(treewidth-legendW-100)+","+(treeheight+legendH+35)+")")
     .attr("id", "legendAxis");
  
  treesvg.selectAll(".tick").selectAll("line").remove();
  
  // Create "fake" legend data to fill the bar with gradient of its own values
  let legendData, def="";
  let xLegendAxis;
  if(treemode==1){
    xScaleLegend.domain([0, 100]);
    xLegendAxis = d3.axisBottom(xScaleLegend).tickValues([0, 25, 50, 75, 100]).tickFormat((x) => x+"%");
    legendData = d3.range(0, 100,100/200);
    def = "Percentage of delays by airline";
  } 
  if(treemode==2){
    xScaleLegend.domain([0, 45]);
    let tickLabels = ["0 min", "15 min", "30 min", "45+ min"];
    xLegendAxis = d3.axisBottom(xScaleLegend).tickValues([0, 15, 30, 45]).tickFormat((x,i) => tickLabels[i]);
    legendData = d3.range(0, 45,45/200);
    def = "Average delay by airline";
    
  } 
  //xLegendAxis.ticks().remove();
  xLegend.transition().duration(300).call(xLegendAxis);
  
  
  xLegend.append('text')
                .attr('x', legendW/2)
                .attr('y', -20)
                .attr('text-anchor', 'middle')
                .attr('fill', "black")
                .attr('font-size', '14px')
                .text(def);
  
  let legend = treesvg.append('g')
    .selectAll(".rects")
    .data(legendData)
    .enter()
    .append("rect")
    .attr('id', 'legend')
    .attr("y", treeheight+legendH/2+30)
    .attr("height", legendH)
    .attr("x", (d,i) => treewidth-legendW-100+i)
    .attr("width", 2) //width must be 2 or you get weird artifacts if 1px
    .attr("fill", function(d){
      if(treemode==1)
        return treeScale(d/100);
      if(treemode==2)
        return treeScale(d);
    }); //Fill with same colorScale used for data in graph

}