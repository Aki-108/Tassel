// ==UserScript==
// @name         Post Charts
// @namespace    http://tampermonkey.net/
// @version      1.2
// @description  Shows statistics of a post.
// @author       Aki108
// @match        https://www.pillowfort.social/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=pillowfort.social
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let likesData = [], reblogsData = [], commentsData = [], timeGraphData = [], weekGraphData = [[new Date(),0,0,0]], hourGraphData = [[new Date(),0,0,0]];
    let GraphObjects = [];

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

    if (document.URL.split("/")[3] !== "posts") return;
    loadScript_gkgyjoep("https://unpkg.com/dygraphs@2.2.1/dist/dygraph.min.js")
        .then(() => init_gkgyjoep());
    loadStyle_gkgyjoep("https://unpkg.com/dygraphs@2.2.1/dist/dygraph.min.css");

    /* Initialize */
    function init_gkgyjoep() {
        let tabs = document.getElementsByClassName("nav-tabs");
        if (!tabs.length) return;

        //add tab button
        let chartTab = document.createElement("li");
        chartTab.setAttribute("role", "presentation");
        chartTab.innerHTML = `<a href="" role="tab" data-toggle="tab" aria-controls="Charts">Charts</a>`
        chartTab.addEventListener("click", showControlls_gkgyjoep);
        tabs[0].appendChild(chartTab);
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
            </div>
        `;
        timeGraphData.push([new Date(tasselJsonManager.post.json.created_at), 0, 0, 0]);//start of data
        timeGraphData.push([new Date(), null, null, null]);//end of data
        graph_gkgyjoep();

        document.getElementById("tasselNoteChartsTopLine").children[0].addEventListener("click", function() {loadData_gkgyjoep(0)});
        document.getElementById("tasselNoteChartsTopLine").children[2].addEventListener("click", function() {loadData_gkgyjoep(1)});
        document.getElementById("tasselNoteChartsTopLine").children[4].addEventListener("click", function() {loadData_gkgyjoep(2)});
        document.getElementById("tasselNoteChartsTopLine").children[1].addEventListener("click", function() {toggleSet_gkgyjoep(0)});
        document.getElementById("tasselNoteChartsTopLine").children[3].addEventListener("click", function() {toggleSet_gkgyjoep(1)});
        document.getElementById("tasselNoteChartsTopLine").children[5].addEventListener("click", function() {toggleSet_gkgyjoep(2)});
    }

    /* Create Dygraph objects */
    function graph_gkgyjoep() {
        let gLabels = ["Date", "Comments", "Reblogs", "Likes"],
            gColors = ["#36C","#3C6","#C36"],
            gLineColor = document.body.classList.contains("dark-theme") ? "#d9dbe0" : "#2b2b2b";

        GraphObjects[0] = new Dygraph(
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

        GraphObjects[1] = new Dygraph(
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

                    let created_at = new Date(tasselJsonManager.post.json.created_at).getDay();
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

        GraphObjects[2] = new Dygraph(
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

                    let created_at = new Date(tasselJsonManager.post.json.created_at).getHours();
                    highlight_period(created_at-0.5, created_at+0.5);
                }
            }
        );
        Object.values(document.getElementById("hourGraph").getElementsByClassName("dygraph-axis-label dygraph-axis-label-x")).forEach(function(item, index) {
            item.innerHTML = (index < 10 ? "0" : "") + index + ":00";
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
                GraphObjects[0].updateOptions({'file':timeGraphData});
                gatherWeekdays_gkgyjoep();
                GraphObjects[1].updateOptions({'file':weekGraphData});
                gatherHours_gkgyjoep();
                GraphObjects[2].updateOptions({'file':hourGraphData});
                toggleSet_gkgyjoep(type);
            }
        });
    }

    /* Toggle visiblity within the charts */
    //index 0: comments; 1: reblogs; 2: likes
    function toggleSet_gkgyjoep(index) {
        let vis = GraphObjects[0].visibility();
        vis[index] = !vis[index];
        GraphObjects[0].updateOptions({'visibility':vis});
        GraphObjects[1].updateOptions({'visibility':vis});
        GraphObjects[2].updateOptions({'visibility':vis});
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
})();
