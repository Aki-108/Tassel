// ==UserScript==
// @name         Post Charts
// @version      1.6
// @description  Shows statistics of a post.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let settings = JSON.parse(localStorage.getItem("tasselSettings2")).postCharts || {fundingChartLength: 7, fundingProgressFormat: 2};
    let likesData = [], reblogsData = [], commentsData = [], timeGraphData = [], weekGraphData = [[new Date(),0,0,0]], hourGraphData = [[new Date(),0,0,0]], sourceData = [], sourceDataEdited = [], sourceGraphData = [[0,0]], sourceGraphTitles = [];
    let GraphObjects = {};
    let barWidth = 610;

    const loadScript_gkgyjoep = src => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script')
            script.type = 'text/javascript'
            script.onload = resolve
            script.onerror = reject
            script.src = src
            document.head.append(script)
        })
    }

    const loadStyle_gkgyjoep = src => {
        return new Promise((resolve, reject) => {
            const style = document.createElement('link')
            style.type = 'text/css'
            style.rel = "stylesheet"
            style.onload = resolve
            style.onerror = reject
            style.href = src
            document.head.append(style)
        })
    }

    loadScript_gkgyjoep("https://unpkg.com/dygraphs@2.2.1/dist/dygraph.min.js")
        .then(() => init_gkgyjoep());
    loadStyle_gkgyjoep("https://unpkg.com/dygraphs@2.2.1/dist/dygraph.min.css");

    /* Initialize */
    function init_gkgyjoep() {
        initTassel_gkgyjoep();

        //funding progress
        initFundingSidebar_gkgyjoep();
        initFundingPage_gkgyjoep();
        loadFundingData();

        //post charts
        if (document.URL.split("/")[3] !== "posts") return;
        let tabs = document.getElementsByClassName("nav-tabs");
        if (!tabs.length) return;

        //add tab button
        let chartTab = document.createElement("li");
        chartTab.setAttribute("role", "presentation");
        chartTab.innerHTML = `<a href="" role="tab" data-toggle="tab" aria-controls="Charts">Charts</a>`
        chartTab.addEventListener("click", showControlls_gkgyjoep);
        tabs[0].appendChild(chartTab);
    }

    function loadFundingData() {
        let now = new Date();
        async function getText(file) {
            let x = await fetch(file);
            let fileContent = await x.text();
            let formatedData = [];
            fileContent = fileContent.split("\n").map(function(row) {return row.split(",");});
            let firstDay = new Date(`${now.getFullYear()} ${now.getMonth()+1} 01`).getTime();
            let lastDay = new Date(`${now.getFullYear()} ${now.getMonth()+2} 00`).getTime()+86399999;
            if (isNaN(lastDay)) {
                let nextDay = firstDay;
                for (let day = 20; day < 40; day++) {
                    nextDay = new Date(`${now.getFullYear()} ${now.getMonth()+1} ${day+1}`).getTime()+86399999;
                    if (isNaN(nextDay)) break;
                    lastDay = new Date(`${now.getFullYear()} ${now.getMonth()+1} ${day}`).getTime()+86399999;;
                }
            }
            let monthLength = lastDay - firstDay;
            for (let i = 1; i < fileContent.length-1; i++) {
                let time = new Date(fileContent[i][0].substring(0,19));
                formatedData.push([time, parseInt(fileContent[i][1])/monthLength*(time.getTime()-firstDay), parseInt(fileContent[i][2])]);
            }

            //sidebar
            let shortenedData = [...formatedData];
            let tenAgo = now.getTime() - 7*86400000; //x days in ms
            for (let i = 0; i < 99999; i++) {
                if (shortenedData[0][0].getTime() < tenAgo) shortenedData.shift();
                else break;
            }
            if (GraphObjects.fundingSidebar) GraphObjects.fundingSidebar.updateOptions({'file':shortenedData});

            if (settings.fundingProgressFormat == 1) {
                document.getElementsByClassName("donate-link")[0].getElementsByClassName("sidebar-bottom-num")[0].innerHTML = "$"+Math.round(formatedData[formatedData.length-1][1]);
            } else if (settings.fundingProgressFormat == 2) {
                let delta = formatedData[formatedData.length-1][2] - formatedData[formatedData.length-1][1];
                delta = Math.round(delta);
                delta = (delta < 0 ? "" : "+") + delta + "$";
                document.getElementsByClassName("donate-link")[0].getElementsByClassName("sidebar-bottom-num")[0].innerHTML = delta;
            }

            //funding page
            let fullData = [...formatedData];
            fullData.push([new Date(lastDay), parseInt(fileContent[fileContent.length-2][1]), null]);
            if (GraphObjects.fundingPage) GraphObjects.fundingPage.updateOptions({'file':fullData});
        }
        getText(`https://raw.githubusercontent.com/anacedragon/pf-funding-data/refs/heads/main/funds-${now.getFullYear()}-${now.getMonth()+1 < 10 ? "0" : ""}${now.getMonth()+1}.csv`);
    }

    /* Create the chart in the sidebar */
    function initFundingSidebar_gkgyjoep() {
        let formatedData = [[new Date(),0,0]];
        let graphArea = document.createElement("div");
        if (settings.disableFundingProgressChart) graphArea.classList.add("hidden");
        graphArea.id = "fundingSidebarGraph";
        document.getElementsByClassName("donate-link")[0].getElementsByClassName("sidebar-bottom-num")[0].after(graphArea);
        let gLineColor = document.body.classList.contains("dark-theme") ? "#bdbdbd00" : "#58b6dd00",
            gColors = document.body.classList.contains("dark-theme") ? ["#CF698F", "#bdbdbd"] : ["#F377B3", "#58b6dd"];

        GraphObjects.fundingSidebar = new Dygraph(
            document.getElementById("fundingSidebarGraph"),
            formatedData,
            {
                //Sized
                width: 50,
                height: 21,
                highlightCircleSize: 0,
                strokeWidth: 1,
                axisLineWidth: 1,
                axisLabelWidth: -5,

                //Labeling
                legend: 'never',
                axisLabelFontSize: 0,
                xLabelHeight: 0,
                yLabelHeight: 0,

                //Other
                interactionModel: {},
                rollPeriod: 0,
                stepPlot: true,
                fillGraph: false,
                includeZero: false,
                colors: gColors,
                connectSeparatedPoints: false,
                drawGrid: false,
                axisLineColor: gLineColor,
                axes: {
                    x: {
                        pixelsPerLabel: 100,
                        axisLabelWidth: 100,
                    }
                }
            }
        );
    }

    /* Create the chart on the donation page */
    function initFundingPage_gkgyjoep() {
        if (new URL(document.URL).pathname != "/donations") return;
        let formatedData = [[new Date(),0,0]];
        let graphArea = document.createElement("div");
        graphArea.id = "fundingPageGraph";
        document.getElementById("creditCardForm").getElementsByClassName("info-text")[0].after(graphArea);
        let graphLabels = document.createElement("div");
        graphLabels.id = "fundingGraphLabels";
        graphArea.after(graphLabels);
        let info = document.createElement("p");
        info.classList.add("info-text", "padding10");
        info.innerHTML = `The historic funding data is provided by <i>anacedragon</i>. More charts can be found on their <a href="https://interstellarj.neocities.org/pillowfort/">neocities site</a>.`;
        graphLabels.after(info);

        let gLabels = ["Time", "Ideal", "Funding"],
            gLineColor = document.body.classList.contains("dark-theme") ? "#d9dbe0" : "#2b2b2b",
            gColors = document.body.classList.contains("dark-theme") ? ["#CF698F", "#bdbdbd"] : ["#DE237E", "#337ab7"];

        GraphObjects.fundingPage = new Dygraph(
            document.getElementById("fundingPageGraph"),
            formatedData,
            {
                //Sized
                width: document.getElementById("creditCardForm").getElementsByClassName("progress")[0].clientWidth,
                height: document.getElementById("creditCardForm").getElementsByClassName("progress")[0].clientWidth / 2,
                highlightCircleSize: 10,
                strokeWidth: 2,

                //Labeling
                labels: gLabels,
                legend: 'always',
                labelsDiv: fundingGraphLabels,

                //Other
                rollPeriod: 0,
                stepPlot: false,
                fillGraph: true,
                includeZero: true,
                colors: gColors,
                connectSeparatedPoints: true,
                gridLineColor: gLineColor,
                axisLineColor: gLineColor,
                panEdgeFraction: 0.00001,
                axes: {
                    x: {
                        valueFormatter: function(ms) {
                            let d = new Date(ms),
                                yyyy = d.getFullYear(),
                                dd = d.getDate(),
                                hh = d.getHours(),
                                mm = d.getMinutes();
                            let months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            //01 Jan 2000 01:00
                            return (dd < 10 ? '0' : '') + dd + ' ' + months[d.getMonth()] + ' ' + yyyy + ' ' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
                        }
                    },
                    y: {
                        axisLabelFormatter: function(val) {
                            return "$" + val;
                        },
                        valueFormatter: function(val) {
                            return "$" + Math.round(val);
                        }
                    }
                },
                series: {
                    'Funding': {
                        stepPlot: true
                    }
                }
            }
        );
    }

    /* Generate the page that holds the charts */
    function showControlls_gkgyjoep() {
        //hide other open tabs
        Object.values(document.getElementsByClassName("tab-pane")).forEach(function(item) {
            item.classList.remove("active");
        });

        //open tab if it exists
        let chartPane = document.getElementById("tasselCharts");
        if (chartPane) {
            chartPane.classList.add("active");
            return;
        }

        //create tab if it doesn't exist
        chartPane = document.createElement("div");
        chartPane.id = "tasselCharts";
        chartPane.setAttribute("role", "tabpanel");
        chartPane.classList.add("tab-pane", "active");
        document.getElementById("post-comments-section").appendChild(chartPane);

        chartPane.innerHTML = `
            <div id="tasselChartPaneBox">
                <div id="tasselNoteChartsTopLine">
                    <button class="tasselButton">Load Comments</button>
                    <button class="tasselButton" style="display:none;">Toggle Comments</button>
                    <button class="tasselButton">Load Reblogs</button>
                    <button class="tasselButton" style="display:none;">Toggle Reblogs</button>
                    <button class="tasselButton">Load Likes</button>
                    <button class="tasselButton" style="display:none;">Toggle Likes</button>
                </div>
                <div id="tasselNoteChartsProgress">
                    <div id="tasselNoteChartsProgressBar">0%</div>
                </div>
                <hr>
                <div id="timeGraph"></div>
                <div id="timeGraphLabels"></div>
                <div>
                    <p>Controls: Drag to zoom. Shift-Drag to pan. Double-Click to zoom out.</p>
                </div>
                <hr>
                <div id="weekGraph"></div>
                <div id="weekGraphLabels"></div>
                <div>
                    <p>This is a stacked chart – the height of the bar equals the total number of shown notes, not the number of an individual category. The grey background indicates the weekday on which the post was created.</p>
                </div>
                <hr>
                <div id="hourGraph"></div>
                <div id="hourGraphLabels"></div>
                <div>
                    <p>This is a stacked chart – the height of the bar equals the total number of shown notes, not the number of an individual category. The grey background indicates the hour in which the post was created.</p>
                </div>
                <hr>
                <div id="tasselNoteChartsTopLine2">
                    <button id="tasselNoteChartsSourceButton" class="tasselButton">Load Sources</button>
                </div>
                <div id="tasselNoteChartsProgress2">
                    <div id="tasselNoteChartsProgressBar2">0%</div>
                </div>
                <div id="sourceGraph"></div>
                <div id="sourceGraphLabels"></div>
                <div>
                    <p>The grey background indicates the original source of the post.</p>
                </div>
            </div>
        `;
        timeGraphData.push([new Date(tasselJsonManager.post.json.publish_at), 0, 0, 0]);//start of data
        timeGraphData.push([new Date(), null, null, null]);//end of data
        graph_gkgyjoep();

        document.getElementById("tasselNoteChartsTopLine").children[0].addEventListener("click", function() {loadData_gkgyjoep(0)});
        document.getElementById("tasselNoteChartsTopLine").children[2].addEventListener("click", function() {loadData_gkgyjoep(1)});
        document.getElementById("tasselNoteChartsTopLine").children[4].addEventListener("click", function() {loadData_gkgyjoep(2)});
        document.getElementById("tasselNoteChartsTopLine").children[1].addEventListener("click", function() {toggleSet_gkgyjoep(0)});
        document.getElementById("tasselNoteChartsTopLine").children[3].addEventListener("click", function() {toggleSet_gkgyjoep(1)});
        document.getElementById("tasselNoteChartsTopLine").children[5].addEventListener("click", function() {toggleSet_gkgyjoep(2)});
        document.getElementById("tasselNoteChartsSourceButton").addEventListener("click", function() {loadSources_gkgyjoep(1)});
    }

    /* Create Dygraph objects */
    function graph_gkgyjoep() {
        let gLabels = ["Date", "Comments", "Reblogs", "Likes"],
            gColors = ["#36C","#3C6","#C36"],
            gLineColor = document.body.classList.contains("dark-theme") ? "#d9dbe0" : "#2b2b2b";

        GraphObjects.postNotesDate = new Dygraph(
            document.getElementById("timeGraph"),
            timeGraphData,
            {
                //Sized
                width: 610,
                height: 350,
                highlightCircleSize: 10,
                strokeWidth: 2,
                axisLineWidth: 2,
                axisLabelWidth: 70,

                //Labeling
                labels: gLabels,
                legend: 'always',
                title: 'Notes Over Time',
                labelsDiv: timeGraphLabels,

                //Other
                rollPeriod: 0,
                stepPlot: true,
                fillGraph: true,
                includeZero: true,
                colors: gColors,
                visibility: [false, false, false],
                connectSeparatedPoints: true,
                gridLineColor: gLineColor,
                axisLineColor: gLineColor,
                axes: {
                    x: {
                        valueFormatter: function(ms) {
                            let d = new Date(ms),
                                yyyy = d.getFullYear(),
                                dd = d.getDate(),
                                hh = d.getHours(),
                                mm = d.getMinutes();
                            let months = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                            //01 Jan 2000 01:00
                            return (dd < 10 ? '0' : '') + dd + ' ' + months[d.getMonth()] + ' ' + yyyy + ' ' + (hh < 10 ? '0' : '') + hh + ':' + (mm < 10 ? '0' : '') + mm;
                        }
                    }
                }
            }
        );

        GraphObjects.postNotesWeek = new Dygraph(
            document.getElementById("weekGraph"),
            weekGraphData,
            {
                //Sized
                width: 610,
                height: 350,
                highlightCircleSize: 10,
                strokeWidth: 2,
                axisLineWidth: 2,
                axisLabelWidth: 70,

                //Labeling
                labels: gLabels,
                legend: 'always',
                title: 'Notes Per Weekday',
                labelsDiv: weekGraphLabels,
                pixelsPerLabel: 50,

                //Other
                rollPeriod: 0,
                stepPlot: true,
                fillGraph: true,
                includeZero: true,
                colors: gColors,
                visibility: [false, false, false],
                connectSeparatedPoints: true,
                stackedGraph: true,
                plotter: barChartPlotter_gkgyjoep,
                dateWindow: [-0.5, 6.5],
                interactionModel: {},
                gridLineColor: gLineColor,
                axisLineColor: gLineColor,

                axes: {
                    x: {
                        valueFormatter: function(x) {
                            let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                            return days[x];
                        }
                    }
                },
                underlayCallback: function(canvas, area, g) {
                    canvas.fillStyle = document.body.classList.contains("dark-theme") ? "rgb(52, 54, 57, 1.0)" : "rgba(200, 200, 200, 1.0)";

                    function highlight_period(x_start, x_end) {
                        var canvas_left_x = g.toDomXCoord(x_start);
                        var canvas_right_x = g.toDomXCoord(x_end);
                        var canvas_width = canvas_right_x - canvas_left_x;
                        canvas.fillRect(canvas_left_x, area.y, canvas_width, area.h);
                    }

                    let created_at = new Date(tasselJsonManager.post.json.publish_at).getDay();
                    highlight_period(created_at-0.5, created_at+0.5);
                },
                drawCallback: function() {
                    Object.values(document.getElementById("weekGraph").getElementsByClassName("dygraph-axis-label dygraph-axis-label-x")).forEach(function(item, index) {
                        let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
                        item.innerHTML = days[index];
                    });
                }
            }
        );

        GraphObjects.postNotesHours = new Dygraph(
            document.getElementById("hourGraph"),
            hourGraphData,
            {
                //Sized
                width: 610,
                height: 350,
                highlightCircleSize: 10,
                strokeWidth: 2,
                axisLineWidth: 2,
                axisLabelWidth: 50,

                //Labeling
                labels: gLabels,
                legend: 'always',
                title: 'Notes Per Hour',
                labelsDiv: hourGraphLabels,
                pixelsPerLabel: 50,

                //Other
                rollPeriod: 0,
                stepPlot: true,
                fillGraph: true,
                includeZero: true,
                colors: gColors,
                visibility: [false, false, false],
                connectSeparatedPoints: true,
                stackedGraph: true,
                plotter: barChartPlotter_gkgyjoep,
                dateWindow: [-0.5, 23.5],
                interactionModel: {},
                gridLineColor: gLineColor,
                axisLineColor: gLineColor,

                axes: {
                    x: {
                        axisLabelFormatter: function(d, gran, opts) {
                            return (d < 10 ? "0" : "") + d + ":00";
                        },
                        valueFormatter: function(x) {
                            return (x < 10 ? "0" : "") + x + ":00";
                        }
                    }
                },
                underlayCallback: function(canvas, area, g) {
                    canvas.fillStyle = document.body.classList.contains("dark-theme") ? "rgb(52, 54, 57, 1.0)" : "rgba(200, 200, 200, 1.0)";

                    function highlight_period(x_start, x_end) {
                        var canvas_left_x = g.toDomXCoord(x_start);
                        var canvas_right_x = g.toDomXCoord(x_end);
                        var canvas_width = canvas_right_x - canvas_left_x;
                        canvas.fillRect(canvas_left_x, area.y, canvas_width, area.h);
                    }

                    let created_at = new Date(tasselJsonManager.post.json.publish_at).getHours();
                    highlight_period(created_at-0.5, created_at+0.5);
                }
            }
        );
        Object.values(document.getElementById("hourGraph").getElementsByClassName("dygraph-axis-label dygraph-axis-label-x")).forEach(function(item, index) {
            item.innerHTML = (index < 10 ? "0" : "") + index + ":00";
        });

        GraphObjects.postNotesSource = new Dygraph(
            document.getElementById("sourceGraph"),
            sourceGraphData,
            {
                //Sized
                width: 610,
                height: 350,
                highlightCircleSize: 10,
                strokeWidth: 2,
                axisLineWidth: 2,
                axisLabelWidth: 50,

                //Labeling
                labels: ["Source", "Likes"],
                legend: 'always',
                title: 'Likes by Source',
                labelsDiv: sourceGraphLabels,
                pixelsPerLabel: 50,

                //Other
                rollPeriod: 0,
                stepPlot: true,
                fillGraph: true,
                includeZero: true,
                colors: ["#C36"],
                visibility: [false],
                connectSeparatedPoints: true,
                stackedGraph: false,
                plotter: barChartPlotter_gkgyjoep,
                dateWindow: [-0.5, 4.5],
                /*interactionModel: {},*/
                gridLineColor: gLineColor,
                axisLineColor: gLineColor,

                axes: {
                    x: {
                        axisLabelFormatter: function(d, gran, opts) {
                            if (sourceGraphTitles[d]) return sourceGraphTitles[d][0];
                            else return "";
                        },
                        valueFormatter: function(x) {
                            if (sourceGraphTitles[x]) return sourceGraphTitles[x][0] + " (" + sourceGraphTitles[x][1] + ")";
                            else return "";
                        }
                    }
                },
                drawCallback: function(canvas, area, g) {
                    let labels = Object.values(document.getElementById("sourceGraph").getElementsByClassName("dygraph-axis-label-x"));
                    labels.forEach(function(item) {
                        item.style.width = barWidth + "px";
                    });
                },
                underlayCallback: function(canvas, area, g) {
                    canvas.fillStyle = document.body.classList.contains("dark-theme") ? "rgb(52, 54, 57, 1.0)" : "rgba(200, 200, 200, 1.0)";

                    function highlight_period(x_start, x_end) {
                        var canvas_left_x = g.toDomXCoord(x_start);
                        var canvas_right_x = g.toDomXCoord(x_end);
                        var canvas_width = canvas_right_x - canvas_left_x;
                        canvas.fillRect(canvas_left_x, area.y, canvas_width, area.h);
                    }

                    let created_at = sourceGraphTitles.findIndex(function(item) {
                        return item[0] === tasselJsonManager.post.json.username
                    });
                    highlight_period(created_at-0.5, created_at+0.5);
                },
                zoomCallback: function(minDate, maxDate, yRange) {
                    if (GraphObjects.postNotesSource) GraphObjects.postNotesSource.updateOptions({dateWindow: [-0.5, 4.5]});
                }
            }
        );
        Object.values(document.getElementById("sourceGraph").getElementsByClassName("dygraph-axis-label dygraph-axis-label-x")).forEach(function(item, index) {
            if (sourceGraphTitles[item.innerHTML]) item.innerHTML = sourceGraphTitles[item.innerHTML][0];
            else item.innerHTML = "";
        });
    }

    /* Draw a bar-chart on the canvas */
    //src: https://dygraphs.com/tests/plotters.html
    function barChartPlotter_gkgyjoep(e) {
        let ctx = e.drawingContext;
        let points = e.points;
        let y_bottom = e.dygraph.toDomYCoord(0);

        ctx.fillStyle = e.color;

        // This determines the bar width.
        let min_sep = Infinity;
        for (let i = 1; i < points.length; i++) {
            let sep = points[i].canvasx - points[i - 1].canvasx;
            if (sep < min_sep) min_sep = sep;
        }
        let bar_width = Math.floor(2.0 / 3 * min_sep);
        if (points.length === 1) bar_width = Math.min(bar_width, 305);
        barWidth = bar_width;

        // Do the actual plotting.
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            let center_x = p.canvasx;

            ctx.fillRect(center_x - bar_width / 2, p.canvasy,
                         bar_width, y_bottom - p.canvasy);

            ctx.strokeRect(center_x - bar_width / 2, p.canvasy,
                           bar_width, y_bottom - p.canvasy);
        }
    }

    /* Switch to progress bar */
    //index 0: comments; 1: reblogs; 2: likes
    function loadData_gkgyjoep(index) {
        //hide buttons
        let topLine = document.getElementById("tasselNoteChartsTopLine");
        topLine.children[index*2].style.display = "none";
        topLine.children[index*2+1].style.display = "block";
        topLine.style.display = "none";

        //show progress bar
        let progress = document.getElementById("tasselNoteChartsProgress");
        progress.style.display = "block";
        progress.children[0].style.width = 0;
        progress.children[0].innerHTML = "0%";

        getJsonPages_gkgyjoep(index, 1);
    }

    /* Fetch a page of notes */
    //type 0: comments; 1: reblogs; 2: likes
    function getJsonPages_gkgyjoep(type, page) {
        let url = `https://www.pillowfort.social/posts/${tasselJsonManager.post.postId}/`;
        switch (type) {
            case 0: url += `comments?pageNum=${page}`; break;
            case 1: url += `reblogs?p=${page}`; break;
            case 2: url += `likes?p=${page}`; break;
        }

        $.getJSON(url, function(data) {
            let dataAvailable = data.reblog_batch || data.likes_batch || (data.comments ? data.comments.length : false);

            //...if there is data on the page
            if (dataAvailable) {
                let percent = 0;
                switch (type) {
                    case 0:
                        commentsData.push(...unpackComments_gkgyjoep(data.comments));
                        percent = Math.round(commentsData.length/data.total_count*100);
                        break;
                    case 1:
                        reblogsData.push(...data.reblog_batch);
                        percent = Math.round(reblogsData.length/data.total_reblogs*100);
                        break;
                    case 2:
                        likesData.push(...data.likes_batch);
                        percent = Math.round(likesData.length/data.total_likes*100);
                        break;
                }
                percent = Math.min(percent, 100); //don't overshoot after rounding
                document.getElementById("tasselNoteChartsProgressBar").style.width = percent + "%";
                document.getElementById("tasselNoteChartsProgressBar").innerHTML = percent + "%";
                //start loading the next page
                getJsonPages_gkgyjoep(type, page+1);

            //...if there is no data on the page
            } else {
                document.getElementById("tasselNoteChartsProgressBar").style.width = "100%";
                document.getElementById("tasselNoteChartsProgressBar").innerHTML = "100%";
                document.getElementById("tasselNoteChartsTopLine").style.display = "flex";
                document.getElementById("tasselNoteChartsProgress").style.display = "none";
                switch (type) {
                    case 0: prepareData_gkgyjoep(commentsData, 1); break;
                    case 1: prepareData_gkgyjoep(reblogsData, 2); break;
                    case 2: prepareData_gkgyjoep(likesData, 3); break;
                }

                //update graph objects with new data and make the data set visible
                GraphObjects.postNotesDate.updateOptions({'file':timeGraphData});
                gatherWeekdays_gkgyjoep();
                GraphObjects.postNotesWeek.updateOptions({'file':weekGraphData});
                gatherHours_gkgyjoep();
                GraphObjects.postNotesHours.updateOptions({'file':hourGraphData});
                toggleSet_gkgyjoep(type);
            }
        });
    }

    /* Toggle visiblity within the charts */
    //index 0: comments; 1: reblogs; 2: likes
    function toggleSet_gkgyjoep(index) {
        let vis = GraphObjects.postNotesDate.visibility();
        vis[index] = !vis[index];
        GraphObjects.postNotesDate.updateOptions({'visibility':vis});
        GraphObjects.postNotesWeek.updateOptions({'visibility':vis});
        GraphObjects.postNotesHours.updateOptions({'visibility':vis});
    }

    /* Undo the nesting of comment threads */
    function unpackComments_gkgyjoep(comment) {
        if (comment.length === 0) return [];
        let list = [...comment];
        comment.forEach(function(item) {
            list.push(...unpackComments_gkgyjoep(item.children))
        });
        return list;
    }

    /* Format and merge datasets */
    //itemPos 1: comments; 2: reblogs; 3: likes
    function prepareData_gkgyjoep(dataSet, itemPos) {
        //format dataset to a time-count dataset
        let data = dataSet;
        if (itemPos === 1) {//comments have to be sorted, for the rest reversing is enough
            data.sort(function(a, b) {
                return a.id - b.id;
            });
        } else data.reverse();
        data = dataSet.map(function(item, index) {
            return [new Date(item.created_at), index+1];
        });

        //merge new data with existing data
        let combined = [timeGraphData[0]];//start when post was created
        for (let a = 0, dataIndex = 0, graphIndex = 1; a < data.length+timeGraphData.length; a++) {

            //no more new data left --> fill with last value
            if (dataIndex >= data.length) {
                for (; graphIndex < timeGraphData.length; graphIndex++) {
                    let newEntry = [...timeGraphData[graphIndex]];
                    newEntry[itemPos] = combined[combined.length-1][itemPos];
                    combined.push(newEntry);
                }
                break;
            }

            //no more old data left --> fill with last values
            if (graphIndex >= timeGraphData.length) {
                for (; dataIndex < data.length; dataIndex++) {
                    let newEntry = [...combined[combined.length-1]];
                    newEntry[0] = data[dataIndex][0];
                    newEntry[itemPos] = data[dataIndex][1];
                    combined.push(newEntry);
                }
                break;
            }

            //new data is next in chronological order
            if (data[dataIndex][0].getTime() < timeGraphData[graphIndex][0].getTime()) {
                let newEntry = [...combined[combined.length-1]];
                newEntry[0] = data[dataIndex][0];
                newEntry[itemPos] = data[dataIndex][1];
                combined.push(newEntry);
                dataIndex++;
            }

            //old data is next in chronological order
            else if (data[dataIndex][0].getTime() > timeGraphData[graphIndex][0].getTime()) {
                let newEntry = [...timeGraphData[graphIndex]];
                newEntry[itemPos] = combined[combined.length-1][itemPos];
                combined.push(newEntry);
                graphIndex++;
            }

            //both data are from the same time
            else {
                let newEntry = [...timeGraphData[graphIndex]];
                newEntry[itemPos] = data[dataIndex][1];
                combined.push(newEntry);
                dataIndex++;
                graphIndex++;
            }
        }
        combined.push([new Date(), timeGraphData[timeGraphData.length-1][1], timeGraphData[timeGraphData.length-1][2], timeGraphData[timeGraphData.length-1][3]]);//end now
        timeGraphData = combined;
    }

    /* Group notes by weekday */
    function gatherWeekdays_gkgyjoep() {
        weekGraphData = [[0,0,0,0], [1,0,0,0], [2,0,0,0], [3,0,0,0], [4,0,0,0], [5,0,0,0], [6,0,0,0]];
        let last = [0,0,0,0];
        timeGraphData.forEach(function(item, index) {
            for (let a = 1; a < 4; a++) {
                if (!item[a]) continue;
                weekGraphData[item[0].getDay()][a] += item[a] - last[a];
                last[a] = item[a];
            }
        });
    }

    /* Group notes by hour */
    function gatherHours_gkgyjoep() {
        hourGraphData = [];
        for (let a = 0; a < 24; a++) hourGraphData.push([a,0,0,0]);
        let last = [0,0,0,0];
        timeGraphData.forEach(function(item, index) {
            for (let a = 1; a < 4; a++) {
                if (!item[a]) continue;
                hourGraphData[item[0].getHours()][a] += item[a] - last[a];
                last[a] = item[a];
            }
        });
    }

    /* Gather data from all like pages */
    function loadSources_gkgyjoep(page) {
        if (page === 1) {
            document.getElementById("tasselNoteChartsTopLine2").style.display = "none";
            //show progress bar
            let progress = document.getElementById("tasselNoteChartsProgress2");
            progress.style.display = "block";
            progress.children[0].style.width = 0;
            progress.children[0].innerHTML = "0%";
        }

        $.getJSON(`https://www.pillowfort.social/posts/${tasselJsonManager.post.postId}/likes?p=${page}`, function(data) {
            if (data.likes_batch === null || data.likes_batch.length === 0) {
                sortSources_gkgyjoep();
                return;
            }

            let likePageButtons = document.getElementsByTagName("dir-pagination-controls")[2];
            let pages = Object.values(likePageButtons.getElementsByTagName("li"));
            tasselJsonManager.likes.maxPage = pages.length > 2 ? pages[pages.length-2].textContent : 1;

            let percent = Math.min(Math.round(page * 50 / tasselJsonManager.likes.maxPage, 50)); //don't overshoot after rounding
            document.getElementById("tasselNoteChartsProgressBar2").style.width = percent + "%";
            document.getElementById("tasselNoteChartsProgressBar2").innerHTML = percent + "%";

            for (let like of data.likes_batch) {
                if (like.liked_via_reblog_id === null) {
                    like.liked_via_reblog_id = 0;
                }
                if (sourceData[like.liked_via_reblog_id]) {
                    sourceData[like.liked_via_reblog_id]++;
                } else {
                    sourceData[like.liked_via_reblog_id] = 1;
                }
            }
            window.setTimeout(function() {
                loadSources_gkgyjoep(page + 1);
            }, 1000);
        });
    }

    /* Format data from like pages */
    function sortSources_gkgyjoep() {
        let writeIndex = 0;
        if (sourceData.length === 0) {
            document.getElementById("tasselNoteChartsProgressBar2").style.width = "100%";
            document.getElementById("tasselNoteChartsProgressBar2").innerHTML = "100%";
            document.getElementById("tasselNoteChartsProgress2").style.display = "none";
            return;
        }
        sourceData.forEach(function(item, index) {
            if (item > 0) {
                sourceDataEdited[writeIndex] = [index, item];
                writeIndex++;
            }
        });

        sourceDataEdited.forEach(function(item, index) {
            if (item[0] === 0) {//for the cases older than Pillowfort is keeping track of this data
                item[0] = `<abbr title="This data is older than Pillowfort's records.">???</abbr>`;
                item[2] = null;
                if (index+1 == sourceDataEdited.length) updateSourceGraph_gkgyjoep();
            } else {
                window.setTimeout(function() {
                    $.getJSON('https://www.pillowfort.social/posts/'+item[0]+'/json', function(data) {
                        let percent = Math.min(Math.round((index+1) * 50 / sourceDataEdited.length, 50)) + 50; //don't overshoot after rounding
                        document.getElementById("tasselNoteChartsProgressBar2").style.width = percent + "%";
                        document.getElementById("tasselNoteChartsProgressBar2").innerHTML = percent + "%";

                        if (data.community_id) {
                            item[0] = data.comm_name;
                            item[2] = data.community_id;
                        } else {
                            item[0] = data.username;
                            item[2] = null;
                        }
                        if (index+1 == sourceDataEdited.length) updateSourceGraph_gkgyjoep();
                    }).fail(function(value) {
                        item[0] = value.statusText;
                        if (index+1 == sourceDataEdited.length) updateSourceGraph_gkgyjoep();
                    });
                }, index*1000);
            }
        });
        //sourceDataEdited
        //[0]: title
        //[1]: value
        //[2]: community id
    }

    /* Display data in graph */
    function updateSourceGraph_gkgyjoep() {
        //sort by name
        sourceDataEdited = sourceDataEdited.sort(function(a, b) {
            return b[0].localeCompare(a[0]);
        });
        //combine entries with the same name
        for (let index = 0; index < sourceDataEdited.length - 1; index++) {
            //for communities
            if (sourceDataEdited[index][2] === sourceDataEdited[index + 1][2] && sourceDataEdited[index][2] != null) {
                sourceDataEdited[index + 1][1] += sourceDataEdited[index][1];
                sourceDataEdited[index][1] = 0;
                sourceDataEdited[index][3] = "repeat";
            //for users
            } else if (sourceDataEdited[index][2] === null && sourceDataEdited[index + 1][2] === null && sourceDataEdited[index][0] === sourceDataEdited[index + 1][0]) {
                sourceDataEdited[index + 1][1] += sourceDataEdited[index][1];
                sourceDataEdited[index][1] = 0;
                sourceDataEdited[index][3] = "repeat";
            }
        }
        sourceDataEdited = sourceDataEdited.filter(function(item) {
            return item[3] != "repeat";
        });
        //sort by amount of likes
        sourceDataEdited = sourceDataEdited.sort(function(a, b) {
            return b[1] - a[1];
        });
        //limit length of list
        let maxLimit = 0;
        sourceGraphData = [];
        sourceDataEdited.forEach(function(item, index) {
            if (index < 50) {
                maxLimit = item[1];
                sourceGraphData.push([sourceGraphData.length, item[1]]);
                sourceGraphTitles.push([item[0], item[2] === null ? "user" : "community"]);
            } else if (item[1] === maxLimit) {
                sourceGraphData.push([sourceGraphData.length, item[1]]);
                sourceGraphTitles.push([item[0], item[2] === null ? "user" : "community"]);
            }
        });
        GraphObjects.postNotesSource.updateOptions({'file':sourceGraphData, 'visibility': [true],'dateWindow':[-0.5, 4.5]});
        document.getElementById("tasselNoteChartsProgress2").style.display = "none";
    }

    /* Generate charts of loaded posts */
    function analysePosts_gkgyjoep() {
        this.classList.add("hidden", "tasselModalExpanded");
        let gColors = document.body.classList.contains("dark-theme") ? ["#6F96BC"] : ["#2C405A"],
            gLineColor = document.body.classList.contains("dark-theme") ? "#d9dbe0" : "#2b2b2b";
        let chartWidth = Math.min(document.body.clientWidth - 200, 800);
        if (document.body.clientWidth <= 800) chartWidth = document.body.clientWidth - 100;
        let content = document.getElementById("tasselModalContent");
        let visiblePosts = tasselJsonManager.feed.posts.filter(function(post) {
            return !post.tassel || !post.tassel.hidden;// && !post.tassel.collapsed;
        });

        block_authors: {
            let authors = [];
            visiblePosts.forEach(function(post) {
                let author = post.original_username || post.username;
                let authorId = post.original_post_user_id || post.user_id;
                let authorIcon = post.avatar_url;
                let result = authors.find(function(entry) {
                    return entry.id === authorId;
                });
                if (result) result.count++;
                else authors.push({id: authorId, username: author, avatar: authorIcon, count: 1});
            });
            authors = authors.sort(function(a, b) {
                return b.count - a.count;
            });
            let authorLabels = [];
            authors = authors.map(function(author, index) {
                authorLabels[index] = [author.username, author.avatar];
                return [index, author.count];
            });

            let chart = document.createElement("div");
            chart.classList.add("tasselModalChart");
            content.appendChild(chart);
            let label = document.createElement("div");
            label.classList.add("tasselModalChartLabel");
            content.appendChild(label);

            let gLabels = ["author", "count"];
            GraphObjects.analysisTags = new Dygraph(
                chart,
                authors,
                {
                    //Sized
                    width: chartWidth,
                    height: chartWidth/3*2,
                    highlightCircleSize: 10,
                    strokeWidth: 2,
                    axisLineWidth: 2,
                    axisLabelWidth: 70,

                    //Labeling
                    labels: gLabels,
                    legend: 'always',
                    title: `Authors (${authors.length})`,
                    labelsDiv: label,

                    //Other
                    rollPeriod: 0,
                    stepPlot: true,
                    fillGraph: true,
                    includeZero: true,
                    colors: gColors,
                    connectSeparatedPoints: true,
                    stackedGraph: true,
                    plotter: barChartPlotter_gkgyjoep,
                    dateWindow: [-0.5, 5.5],
                    gridLineColor: gLineColor,
                    axisLineColor: gLineColor,
                    axes: {
                        x: {
                            axisLabelFormatter: function(x, gran, opts) {
                                if (!authorLabels[x]) return "";
                                return authorLabels[x][0];
                            },
                            valueFormatter: function(x) {
                                if (!authorLabels[x]) return "";
                                let label = `<img src="${authorLabels[x][1]}" style="width: 20px; height: 20px; margin-right: 5px;">${authorLabels[x][0]}`;
                                return label;
                            }
                        }
                    }
                }
            );
        }

        block_rebloggers: {
            let rebloggers = [];
            visiblePosts.forEach(function(post) {
                if (!post.reblogged_from_post_id) return;
                let result = rebloggers.find(function(entry) {
                    return entry.username === post.username;
                });
                if (result) result.count++;
                else rebloggers.push({username: post.username, count: 1});

                if (post.reblog_copy_info) post.reblog_copy_info.forEach(function(info) {
                    let result = rebloggers.find(function(entry) {
                        return entry.username === info.reblogged_by;
                    });
                    if (result) result.count++;
                    else rebloggers.push({username: info.username, count: 1});
                });
            });
            rebloggers = rebloggers.sort(function(a, b) {
                return b.count - a.count;
            });
            let rebloggerLabels = [];
            rebloggers = rebloggers.map(function(reblogger, index) {
                rebloggerLabels[index] = reblogger.username;
                return [index, reblogger.count];
            });

            let chart = document.createElement("div");
            chart.classList.add("tasselModalChart");
            content.appendChild(chart);
            let label = document.createElement("div");
            label.classList.add("tasselModalChartLabel");
            content.appendChild(label);

            let gLabels = ["reblogger", "count"];
            GraphObjects.analysisTags = new Dygraph(
                chart,
                rebloggers,
                {
                    //Sized
                    width: chartWidth,
                    height: chartWidth/3*2,
                    highlightCircleSize: 10,
                    strokeWidth: 2,
                    axisLineWidth: 2,
                    axisLabelWidth: 70,

                    //Labeling
                    labels: gLabels,
                    legend: 'always',
                    title: `Rebloggers (${rebloggers.length})`,
                    labelsDiv: label,

                    //Other
                    rollPeriod: 0,
                    stepPlot: true,
                    fillGraph: true,
                    includeZero: true,
                    colors: gColors,
                    connectSeparatedPoints: true,
                    stackedGraph: true,
                    plotter: barChartPlotter_gkgyjoep,
                    dateWindow: [-0.5, 5.5],
                    gridLineColor: gLineColor,
                    axisLineColor: gLineColor,
                    axes: {
                        x: {
                            axisLabelFormatter: function(x, gran, opts) {
                                return rebloggerLabels[x];
                            },
                            valueFormatter: function(x) {
                                return rebloggerLabels[x];
                            }
                        }
                    }
                }
            );
        }

        block_community: {
            let communities = [];
            visiblePosts.forEach(function(post) {
                if (!post.community_id) return;
                let result = communities.find(function(entry) {
                    return entry.community === post.comm_name;
                });
                if (result) result.count++;
                else communities.push({community: post.comm_name, count: 1});

                if (post.reblog_copy_info) post.reblog_copy_info.forEach(function(info) {
                    let result = communities.find(function(entry) {
                        return entry.community === info.community;
                    });
                    if (result) result.count++;
                    else communities.push({community: info.community, count: 1});
                });
            });
            communities = communities.sort(function(a, b) {
                return b.count - a.count;
            });
            let communityLabels = [];
            communities = communities.map(function(community, index) {
                communityLabels[index] = community.community;
                return [index, community.count];
            });

            let chart = document.createElement("div");
            chart.classList.add("tasselModalChart");
            content.appendChild(chart);
            let label = document.createElement("div");
            label.classList.add("tasselModalChartLabel");
            content.appendChild(label);

            let gLabels = ["community", "count"];
            GraphObjects.analysisTags = new Dygraph(
                chart,
                communities,
                {
                    //Sized
                    width: chartWidth,
                    height: chartWidth/3*2,
                    highlightCircleSize: 10,
                    strokeWidth: 2,
                    axisLineWidth: 2,
                    axisLabelWidth: 70,

                    //Labeling
                    labels: gLabels,
                    legend: 'always',
                    title: `Communities (${communities.length})`,
                    labelsDiv: label,

                    //Other
                    rollPeriod: 0,
                    stepPlot: true,
                    fillGraph: true,
                    includeZero: true,
                    colors: gColors,
                    connectSeparatedPoints: true,
                    stackedGraph: true,
                    plotter: barChartPlotter_gkgyjoep,
                    dateWindow: [-0.5, 5.5],
                    gridLineColor: gLineColor,
                    axisLineColor: gLineColor,
                    axes: {
                        x: {
                            axisLabelFormatter: function(x, gran, opts) {
                                return communityLabels[x];
                            },
                            valueFormatter: function(x) {
                                return communityLabels[x];
                            }
                        }
                    }
                }
            );
        }

        /*block_tags: {
            let tags = [];
            visiblePosts.forEach(function(post) {
                post.tags.forEach(function(tag) {
                    let result = tags.find(function(entry) {
                        return entry.tag === tag;
                    });
                    if (result) result.count++;
                    else tags.push({tag: tag, count: 1});
                });
            });
            tags = tags.sort(function(a, b) {
                return b.count - a.count;
            });
            let tagLabels = [];
            tags = tags.map(function(tag, index) {
                tagLabels[index] = tag.tag;
                return [index, tag.count];
            });

            let chart = document.createElement("div");
            chart.classList.add("tasselModalChart");
            content.appendChild(chart);
            let label = document.createElement("div");
            label.classList.add("tasselModalChartLabel");
            content.appendChild(label);

            let gLabels = ["tag", "count"];
            GraphObjects.analysisTags = new Dygraph(
                chart,
                tags,
                {
                    //Sized
                    width: chartWidth,
                    height: chartWidth/3*2,
                    highlightCircleSize: 10,
                    strokeWidth: 2,
                    axisLineWidth: 2,
                    axisLabelWidth: 70,

                    //Labeling
                    labels: gLabels,
                    legend: 'always',
                    title: 'Tags',
                    labelsDiv: label,

                    //Other
                    rollPeriod: 0,
                    stepPlot: true,
                    fillGraph: true,
                    includeZero: true,
                    colors: gColors,
                    connectSeparatedPoints: true,
                    stackedGraph: true,
                    plotter: barChartPlotter_gkgyjoep,
                    dateWindow: [-0.5, 5.5],
                    gridLineColor: gLineColor,
                    axisLineColor: gLineColor,
                    axes: {
                        x: {
                            axisLabelFormatter: function(x, gran, opts) {
                                return tagLabels[x];
                            },
                            valueFormatter: function(x) {
                                return tagLabels[x];
                            }
                        }
                    }
                }
            );
        }*/

        block_types: {
            let postTypes = [{type: "text", count: 0},{type: "picture", count: 0},{type: "video", count: 0},{type: "embed", count: 0}];
            visiblePosts.forEach(function(post) {
                let result = postTypes.find(function(entry) {
                    return entry.type === post.post_type;
                });
                if (result) result.count++;
                else postTypes.push({type: post.post_type, count: 1});
            });
            postTypes = postTypes.map(function(entry, index) {
                return [index, entry.count];
            });

            let chart = document.createElement("div");
            chart.classList.add("tasselModalChart");
            content.appendChild(chart);
            let label = document.createElement("div");
            label.classList.add("tasselModalChartLabel");
            content.appendChild(label);

            let gLabels = ["type", "count"];
            GraphObjects.analysisVisibility = new Dygraph(
                chart,
                postTypes,
                {
                    //Sized
                    width: chartWidth,
                    height: chartWidth/3*2,
                    highlightCircleSize: 10,
                    strokeWidth: 2,
                    axisLineWidth: 2,
                    axisLabelWidth: 70,

                    //Labeling
                    labels: gLabels,
                    legend: 'always',
                    title: 'Post Types',
                    labelsDiv: label,

                    //Other
                    rollPeriod: 0,
                    stepPlot: true,
                    fillGraph: true,
                    includeZero: true,
                    colors: gColors,
                    connectSeparatedPoints: true,
                    stackedGraph: true,
                    plotter: barChartPlotter_gkgyjoep,
                    dateWindow: [-0.5, 3.5],
                    interactionModel: {},
                    gridLineColor: gLineColor,
                    axisLineColor: gLineColor,
                    axes: {
                        x: {
                            axisLabelFormatter: function(x, gran, opts) {
                                if (x == 0) return "text";
                                if (x == 1) return "picture";
                                if (x == 2) return "video";
                                if (x == 3) return "embed";
                                return "";
                            },
                            valueFormatter: function(x) {
                                if (x == 0) return "text";
                                if (x == 1) return "picture";
                                if (x == 2) return "video";
                                if (x == 3) return "embed";
                                return "";
                            }
                        }
                    }
                }
            );
        }

        block_visibility: {
            let visibilities = [{type: "visible", count: 0},{type: "collapsed", count: 0},{type: "hidden", count: 0}];
            tasselJsonManager.feed.posts.forEach(function(post) {
                let visibility = "visible";
                if (post.tassel) {
                    if (post.tassel.hidden) visibility = "hidden";
                    else if (post.tassel.collapsed) visibility = "collapsed";
                }
                let result = visibilities.find(function(entry) {
                    return entry.type === visibility;
                });
                if (result) result.count++;
                else visibilities.push({type: visibility, count: 1});
            });
            visibilities = visibilities.map(function(entry, index) {
                return [index, entry.count];
            });

            let chart = document.createElement("div");
            chart.classList.add("tasselModalChart");
            content.appendChild(chart);
            let label = document.createElement("div");
            label.classList.add("tasselModalChartLabel");
            content.appendChild(label);

            let gLabels = ["visibility", "count"];
            GraphObjects.analysisVisibility = new Dygraph(
                chart,
                visibilities,
                {
                    //Sized
                    width: chartWidth,
                    height: chartWidth/3*2,
                    highlightCircleSize: 10,
                    strokeWidth: 2,
                    axisLineWidth: 2,
                    axisLabelWidth: 70,

                    //Labeling
                    labels: gLabels,
                    legend: 'always',
                    title: 'Post Visibility',
                    labelsDiv: label,

                    //Other
                    rollPeriod: 0,
                    stepPlot: true,
                    fillGraph: true,
                    includeZero: true,
                    colors: gColors,
                    connectSeparatedPoints: true,
                    stackedGraph: true,
                    plotter: barChartPlotter_gkgyjoep,
                    dateWindow: [-0.5, 2.5],
                    interactionModel: {},
                    gridLineColor: gLineColor,
                    axisLineColor: gLineColor,
                    axes: {
                        x: {
                            axisLabelFormatter: function(x, gran, opts) {
                                if (x == 0) return "visible";
                                if (x == 1) return "collapsed";
                                if (x == 2) return "hidden";
                                return "";
                            },
                            valueFormatter: function(x) {
                                if (x == 0) return "visible";
                                if (x == 1) return "collapsed";
                                if (x == 2) return "hidden";
                                return "";
                            }
                        }
                    }
                }
            );
        }
    }

    /* Add elements to the Tassel menu */
    function initTassel_gkgyjoep() {
        let tasselSidebar = document.getElementById("tasselModalSidebar");
        if (tasselSidebar == null) return;
        let button = document.createElement("button");
        button.classList.add("tasselModalSidebarEntry");
        button.id = "tasselModalSidebarPostCharts";
        button.style.order = "1603";
        button.innerHTML = "Post Charts";
        tasselSidebar.appendChild(button);
        document.getElementById("tasselModalSidebarPostCharts").addEventListener("click", displaySettings_gkgyjoep);
    }

    /* Create Tassel settings menu */
    function displaySettings_gkgyjoep() {
        //deselect other menu items and select this one
        let content = document.getElementById("tasselModalContent");
        content.innerHTML = "";
        let sidebarEntries = document.getElementsByClassName("tasselModalSidebarEntry");
        Object.values(sidebarEntries).forEach(function(data, index) {
            data.classList.remove("active");
        });
        document.getElementById("tasselModalSidebarPostCharts").classList.add("active");

        //add a little note
        let info0 = document.createElement("p");
        info0.innerHTML = "Changes will become active after a page reload.";
        content.appendChild(info0);
        content.appendChild(document.createElement("hr"));

        //add settings
        content.appendChild(createSwitch_gkgyjoep('Disable funding progress chart', settings.disableFundingProgressChart ? "checked" : ""));
        content.lastChild.children[0].addEventListener("change", function() {
            settings.disableFundingProgressChart = this.checked;
            saveSettings_gkgyjoep();
        });

        let label1 = document.createElement("label");
        label1.setAttribute("for", "tasselPostChartsFundingLength");
        label1.innerHTML = `Chart the last
            <input id="tasselPostChartsFundingLength" type="number" min="1" max="31" step="1" value="${settings.fundingChartLength}"></input>
            days of funding.
            ${createInfoButton_gkgyjoep("A short range makes jumps in funding more obvious.")}
        `;
        content.appendChild(label1);
        let input1 = document.getElementById("tasselPostChartsFundingLength");
        input1.addEventListener("change", function() {
            settings.fundingChartLength = this.value;
            saveSettings_gkgyjoep();
        });

        //selection of funding progress
        let info2 = document.createElement("label");
		info2.style.fontWeight = "normal";
        info2.innerHTML = "Display funding progress as ";
        let select2 = document.createElement("select");
        select2.id = "tasselPostChartsFundingDropdown";
        select2.innerHTML = `
          <option value="0">percentag</option>
          <option value="1">dollar</option>
          <option value="2">difference</option>
        `;
        info2.appendChild(select2);
        content.appendChild(info2);
        content.appendChild(document.createElement("br"));
        //save settings when changed
        document.getElementById("tasselPostChartsFundingDropdown").addEventListener("change", function() {
            settings.fundingProgressFormat = document.getElementById("tasselPostChartsFundingDropdown").value*1;
            saveSettings_gkgyjoep();
        });
        //show the selected option in the menu, not the default
        let selector2 = document.getElementById("tasselPostChartsFundingDropdown");
        let selection = settings.fundingProgressFormat;
        for (let a = 0; a < selector2.children.length; a++) {
            if (selection == selector2.children[a].value) selector2.children[a].selected = true;
        }
        content.appendChild(document.createElement("hr"));

        //charts for loaded posts
        let info3 = document.createElement("p");
        info3.innerHTML = "Here you can analyse the posts that are on the current Pillowfort page.";
        content.appendChild(info3);
        let button3 = document.createElement("button");
        button3.innerHTML = `Analyse ${tasselJsonManager.feed.posts.length} posts`;
        button3.classList.add("tasselButton");
        button3.addEventListener("click", analysePosts_gkgyjoep);
        content.appendChild(button3);
    }

    function saveSettings_gkgyjoep() {
        let file = JSON.parse(localStorage.getItem("tasselSettings2") || "{}");
        file.postCharts = settings;
        localStorage.setItem("tasselSettings2", JSON.stringify(file));
    }

    function createInfoButton_gkgyjoep(content) {
        let html = document.createElement("div");
        let button = document.createElement("button");
        button.classList.add("tasselInfoButton");
        button.innerHTML = "i";
        html.appendChild(button);
        let info = document.createElement("div");
        info.classList.add("tasselInfoBox");
        info.innerHTML = `<p>${content}</p>`;
        html.appendChild(info);
        return html.innerHTML;
    }

    function createSwitch_gkgyjoep(title="", state="") {
        let id = "tasselSwitch" + Math.random();
        let toggle = document.createElement("div");
        toggle.classList.add("tasselToggle");
        toggle.innerHTML = `
          <input id="${id}" type="checkbox" ${state}>
          <label for="${id}">${title}</label>
        `;
        return toggle;
    }
})();
