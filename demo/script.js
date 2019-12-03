$(document).ready(function (){
    var w = 1080;
    var h = 720;
    var fi = 360;

    var projection = d3.geoConicConformal()
    .parallels([35, 65])
    .rotate([-21, -1])
    .scale(w*7.5)
    .center([-12, 46])
    .translate([w/2, h/2])
    .clipExtent([[-3800, -2000], [3800, 2500]])
    .precision(100);

    var path = d3.geoPath().projection(projection);
    var svg = d3.select('#map')
                .append('svg')
                .attr('width',w)
                .attr('height',h);
    var rank = d3.select('#rank')

    svg.append('rect')
       .attr('width',w)
       .attr('height',h)
       .attr('fill','white');
    
    var g = svg.append('g');

    
    d3.json('world-50m.v1.json', function(error,data){
        if(error) console.log(error);

        g.append('path')
         .datum(topojson
            .feature(data, data.objects.countries))
         .attr('d',path)

        var zoom = d3.zoom().scaleExtent([0.25,5])
                            .on('zoom',function(){
            
            g.attr('transform',d3.event.transform);
            g.select('path')
             .attr('d',path.projection(projection));
             /*
            var group = g.selectAll('g')
            group.attr('transform',d3.event.transform);
            group.selectAll('path')
            .attr('d',path.projection(projection));
            */
        });
        svg.call(zoom);
        

    /*
    d3.json("ch-cantons.json", function(error, swiss) {
        if (error) throw error;
      
        var cantons = topojson.feature(swiss, swiss.objects.cantons);
      
        svg.append("path")
            .datum(cantons)
            .attr("class", "canton")
            .attr("d", path);
      
        svg.append("path")
            .datum(topojson.mesh(swiss, swiss.objects.cantons, function(a, b) { return a !== b; }))
            .attr("class", "canton-boundary")
            .attr("d", path);
        
        var zoom = d3.zoom().scaleExtent([0.25,5])
                            .on('zoom',function(){
            
            g.attr('transform',d3.event.transform);
            g.selectAll('path')
             .attr('d',path.projection(projection));
        });

        svg.call(zoom);
        */
        
        d3.json(getFileByIndex(fi), function(error,data){
            if (error) console.log(error);
            data.data = dataFilter(data.data);
            var aircrafts = data.data; 
            var time = data.id;
            var hue = 0;
            topTen = topNPairs(aircrafts,10);
            
            console.log(topTen);

            var tbody = rank.select('table')
            .append('tbody')
            var rows = tbody.selectAll('tr')
            .data(topTen)
            .enter()
            .append('tr');

            var cells = rows.selectAll('td')
            .data(function(d,i){
                var index = i+1;
                var d1 = d.d1.id;
                var d2 = d.d2.id;
                var dist = d.dist;
                return [i+1,d1,d2,dist];
            })
            .enter()
            .append('td')
            .text(function(d){
                return d;
            });

            var stca = getSTCA(topTen);
            // var mtca = getMTCA(topTen);
            
            aircrafts.map(function(d){
                hue = d.alt*210/48000+40;
                d.color = 'hsl(' + hue + ', 100%, 50%)';
                d.complementaryColor = 'hsl(' + (hue+180) + ', 100%, 50%)'; 
            });

            g.append('g')
            .attr('id','stca')
            .selectAll('path')
            .data(stca).enter()
            .append('path')
            .attr('d',function(d,i){
                var circumference = 6371000 * Math.PI * 2;
                var angle = 5000 / circumference * 360;
                var circle = d3.geoCircle().center([d.long,d.lat]).radius(angle)
                console.log(circle())
                return path(circle());
            })
            .attr('class','flowline')
            .attr('stroke','rgba(255, 174, 66, 1)')
            .attr('stroke-width','1')
            .attr('fill','none')
            .attr('fill-opacity','0')
            .style('stroke','red')
            .style('stroke-width','0.75px')
            .style('stroke-dasharray','2 2 2')
            
        

            g.selectAll('.flight')
            .data(aircrafts,d=>d.id)
            .enter()
            .append('g')
            .attr('id', d=>d.id)
            .attr('class','flight')
            //add anchor of aircrafts
            .append('circle')
            .attr('cx', getX)
            .attr('cy',getY)
            .attr('r',function(d){
                if (d.alt>10) {
                    return Math.log(parseInt(d.alt)/1.25)/4;
                }else {
                    return 0.25
                }
            })
            .style('fill', function(d){
                return d.color;
            })
            .on('mouseover', function(d){
                comlementaryColor = 'hsl('+ (d.color+180) +',100%,50%)'

                 d3.select(this).style('fill', '#3c3c3c')
                   .style('stroke', d.color)
                   .style('stroke-width', '0.2em');
                 d3.select('#id').text(d.id);

                 d3.select('#reg').text(d.reg);
                 d3.select('#from').text((d.from?d.from:"N/A"));
                 d3.select('#to').text((d.to?d.to:"N/A"));
                 d3.select('#alt').text(d.alt);
                 d3.select('#lat').text(d.lat);
                 d3.select('#long').text(d.long);
                 d3.select('#time').text(d.time);
                 d3.select('#tooltip')
                   .style('left',(d3.event.pageX + 20)+'px')
                   .style('top',(d3.event.pageY - 80)+'px')
                   .style('display','block')
                   .transition().duration(300).ease(d3.easeLinear)
                   .style('opacity',0.8)
                   .style('background-color',d.color)
                   .style('color', d.complementaryColor)
             })
             .on('mouseout',function(d){
                 d3.select(this).style('fill', d.color)
                 .style('stroke', 'none')
                 .style('stroke-width', '0');;
                 d3.select('#tooltip')
                   .transition().duration(300).ease(d3.easeLinear)
                   .style('opacity',0)
                   .transition().duration(10).ease(d3.easeLinear)
                   .style('display','none')
                   .style('background-color','#eeeeee')
             });
             
            //add path
             g.selectAll('.flight')
             .data(aircrafts,d=>d.id)
             .append('path')
             .attr('d',function(d,i){
                var old_d = d3.select(this).attr('d');
                var x = getX(d);
                var y = getY(d);
                if(old_d==null || old_d==undefined){
                    var new_d = "M"+x.toString()+" "+y.toString(); 
                } else {
                    var arr = old_d.split(" ");
                    var new_d = arr.concat('L'+x.toString(),y.toString()).join(" ");
                } 
                return new_d
            })
            .attr('k','') 
            .attr('fill','none')
            .attr('fill-opacity','0')
            .attr('stroke',d=>d.color)
            .attr('stroke-width','.5px')

             // add line
             g.selectAll('.flight')
             .data(aircrafts,d=>d.id)
             .append('line')

             d3.selectAll(".flowline")
                     .each(animate);
             

        });
        

        
        

        
           

        var button = d3.select('#map')
                 .append('button')
                 .attr('type','button')
                 .attr('id','floating-button')
                 .text('Click me')
                 .on('click', function() { 
                     fi++;
                     var file = getFileByIndex(fi);
                     if (file){
                        return d3.json(file,update);
                     }
                    });

        function getX(d){
            if(d.long&&d.lat){
                return projection([d.long,d.lat])[0];
            }
        }
        
        function getY(d){
            if(d.long&&d.lat){
                return projection([d.long,d.lat])[1];
            }
        }

        function update(error,data) {
            // var w = 1080;
            // var h = 720;
            if (error) console.log(error);
            var aircrafts_data = dataFilter(data.data);
            var hue = 0;
            var svg = d3.select('#map').select('svg');

            var topTen = topNPairs(aircrafts_data,10);
            console.log(topTen);
            
            rank.select('table')
            .selectAll('tbody').remove();

            var tbody = rank.select('table')
            .append('tbody')
            var rows = tbody.selectAll('tr')
            .data(topTen)
            .enter()
            .append('tr');

            var cells = rows.selectAll('td')
            .data(function(d,i){
                var index = i+1;
                var d1 = d.d1.id;
                var d2 = d.d2.id;
                var dist = d.dist;
                return [i+1,d1,d2,dist];
            })
            .enter()
            .append('td')
            .text(function(d){
                return d;
            });

            var g = svg.select('g');
            



            aircrafts_data.map(function(d){
                hue = d.alt*210/48000+40;
                d.color = 'hsl(' + hue + ', 100%, 50%)';
                d.complementaryColor = 'hsl(' + (hue+180) + ', 100%, 50%)'; 
            });
        
            var t = d3.transition().duration(750);
            var aircrafts = g.selectAll(".flight")
                             .data(aircrafts_data,d=>d.id);
            var aircraftsEnter = aircrafts
                                 .enter()
                                 .append("g")
                                .attr('class','flight')
                                .attr('id',function(d){
                                    return d.id
                                });

            var stca_data = getSTCA(topTen);

            var stca = g.select('#stca')
            stca.selectAll('path')
            .data(stca_data)
            .attr('d',function(d,i){
                var circumference = 6371000 * Math.PI * 2;
                var angle = 5000 / circumference * 360;
                var circle = d3.geoCircle().center([d.long,d.lat]).radius(angle)
                console.log(circle())
                return path(circle());
            })
            .attr('class','flowline')
            .attr('stroke','rgba(255, 174, 66, 1)')
            .attr('stroke-width','1')
            .attr('fill','none')
            .attr('fill-opacity','0')
            .style('stroke','red')
            .style('stroke-width','0.75px')
            .style('stroke-dasharray','2 1 1')

            // enter circle
            aircraftsEnter.append('circle')
                     // .transition(t)
                     .attr('cx', getX)
                     .attr('cy',getY)
                     .attr('r',function(d){
                        if (d.alt>10) {
                            return Math.log(parseInt(d.alt)/1.25)/4;
                        }else {
                            return 0.25
                        }
                     })
                     .style('fill', function(d){
                        return d.color;
                     })
                     .on('mouseover', function(d){
                        d.complementaryColor = 'hsl('+ (d.color+180) +',100%,50%)'
        
                         d3.select(this).style('fill', '#3c3c3c')
                           .style('stroke', d.color)
                           .style('stroke-width', '0.2em');
                         d3.select('#id').text(d.id);
        
                         d3.select('#reg').text(d.reg);
                         d3.select('#from').text((d.from?d.from:"N/A"));
                         d3.select('#to').text((d.to?d.to:"N/A"));
                         d3.select('#alt').text(d.alt);
                         d3.select('#lat').text(d.lat);
                         d3.select('#long').text(d.long);
                         d3.select('#time').text(d.time);
                         d3.select('#tooltip')
                           .style('left',(d3.event.pageX + 20)+'px')
                           .style('top',(d3.event.pageY - 80)+'px')
                           .style('display','block')
                           .transition().duration(300).ease(d3.easeLinear)
                           .style('opacity',0.8)
                           .style('background-color',d.color)
                           .style('color', d.complementaryColor)
                     })
                      .on('mouseout',function(d){
                         d3.select(this).style('fill', d.color)
                         .style('stroke', 'none')
                         .style('stroke-width', '0');;
                         d3.select('#tooltip')
                           .transition().duration(300).ease(d3.easeLinear)
                           .style('opacity',0)
                           .transition().duration(10).ease(d3.easeLinear)
                           .style('display','none')
                           .style('background-color','#eeeeee')
                      })
                      .merge(aircrafts)
                      .selectAll('circle').data(aircrafts_data,d=>d.id)
                      // .transition(t)
                      .attr('cx', getX)
                      .attr('cy',getY)
                      .attr('r',function(d){
                         if (d.alt>10) {
                             return Math.log(parseInt(d.alt)/1.25)/4;
                         }else {
                             return 0.25
                         }
                      });

            // enter path
            aircraftsEnter.append('path')
                          .attr('d',function(d){
                                var old_d = d3.select(this).attr('g');
                                var x = getX(d);
                                var y = getY(d);
                                if(old_d==null || old_d==undefined){
                                    var d = "M"+x+" "+y; 
                                } else {
                                    var d = old_d.split(" ").concat('L'+x,y).join(" ");
                                } 
                                return d
                            })
                            .attr('k','')
                            .merge(aircrafts)
                            .selectAll('path').data(aircrafts_data,d=>d.id)
                            .attr('d',function(d,i){
                                var old_d = d3.select(this).attr('d');
                                var x = getX(d);
                                var y = getY(d);
                                if(old_d==null || old_d==undefined){
                                    var new_d = "M"+x+" "+y; 
                                } else {
                                    var arr = old_d.split(" ");
                                    var new_d = arr.concat('L'+x.toString(),y.toString()).join(" ");
                                } 
                                return new_d
                            })
                            .attr('k',function(d,i){
                                var  k = d3.select(this).attr('k');
                                var current_d = d3.select(this).attr('d');
                                var arr = current_d.split(' ');
                                if (arr.length>3){
                                    var x1_str = arr[arr.length-4];
                                    var y1_str = arr[arr.length-3];
                                    var x2_str = arr[arr.length-2];
                                    var y2_str = arr[arr.length-1];
                                    x1_str = x1_str.substring(1,x1_str.length);
                                    x2_str = x2_str.substring(1,x2_str.length);
                                    var x1 = parseFloat(x1_str);
                                    var y1 = parseFloat(y1_str);
                                    var x2 = parseFloat(x2_str);
                                    var y2 = parseFloat(y2_str);
                                    if (x1!=x2){
                                        k = (y2-y1)/(x2-x1)
                                    } else if (x1==x2 && y1!=y2){
                                        k = NaN
                                    } 
                                }
                                return k
                            })
                            .attr('stroke',d=>d.color)
                            .attr('stroke-width','.5px')
                            .attr('stroke-dasharray','2 2 2')
                            .attr('stroke-opacity','0.75')
                            .attr('fill-opacity','0');
                            
            // enter line as trends
            aircraftsEnter.append('line')
                          .merge(aircrafts)
                          .selectAll('line').data(aircrafts_data,d=>d.id)
                          .attr('x1', function(d,i){
                                  var x1 = getX(d);
                                  return x1.toString();
                          })
                          .attr('x2', function(d,i){
                            var current_k = d3.select(this.parentNode).select('path').attr('k');
                            var current_d = d3.select(this.parentNode).select('path').attr('d'); 
                            var arr = current_d.split(" ");
                            if (current_k!="" && arr.length>3){
                              var x1_str = arr[arr.length-4];
                              var y1_str = arr[arr.length-3];
                              var x2_str = arr[arr.length-2];
                              var y2_str = arr[arr.length-1];
                              x1_str = x1_str.substring(1,x1_str.length);
                              x2_str = x2_str.substring(1,x2_str.length);
                              var x1 = parseFloat(x1_str);
                              var y1 = parseFloat(y1_str);
                              var x2 = parseFloat(x2_str);
                              var y2 = parseFloat(y2_str);
                              if (current_k!=NaN){
                                  x2 = x2+(x2-x1)*0.25
                              } // else x2 remains
                            } else {
                                var x2 = getX(d);
                            }
                            return x2.toString();
                          })
                          .attr('y1',function(d,i){
                                var y1 = getY(d);
                                return y1.toString();   
                          })
                          .attr('y2',function(d,i){
                            var current_k = d3.select(this.parentNode).select('path').attr('k');
                            var current_d = d3.select(this.parentNode).select('path').attr('d'); 
                            var arr = current_d.split(" ");
                            if (current_k!="" && arr.length>3){
                              var x1_str = arr[arr.length-4];
                              var y1_str = arr[arr.length-3];
                              var x2_str = arr[arr.length-2];
                              var y2_str = arr[arr.length-1];
                              x1_str = x1_str.substring(1,x1_str.length);
                              x2_str = x2_str.substring(1,x2_str.length);
                              var x1 = parseFloat(x1_str);
                              var y1 = parseFloat(y1_str);
                              var x2 = parseFloat(x2_str);
                              var y2 = parseFloat(y2_str);
                              if (current_k!=NaN){
                                  y2 = y2 + current_k*(x2-x1)*0.25
                              } else {
                                  y2 = y2 + (y2-y1)*0.25
                              }
                            } else {
                                var y2 = getY(d);
                            }
                            return y2.toString();
                          })
                          .attr('stroke','green')
                          .attr('stroke-width','0.5px')
                          .attr('fill','none')
                          .attr('fill-opacity','0')
                    

            // for exit
            aircrafts.exit()
                     .transition(t)
                     .style("fill-opacity",1e-6)
                     .remove();
            
                     
            /*        
            aircrafts.select('line')
            .enter()
            .append('line')
            .attr('x1', function(d){
                var d = d3.select(this.parentNode).select(g).attr('d');
                var d_arr = d.split(" ")
                return 0 
            })
            */
     
        }

    });

});

function getFileByIndex(index){
    var path = '../atc-data/';
    var timeConvert = (n)=>{
        let hours = (n/60);
        let rhours = Math.floor(hours);
        let minutes = n%60;
        if (hours<10){
            if(minutes<10){
                return "0"+rhours.toString()+"0"+minutes.toString();
            } else {
                return "0"+rhours.toString()+minutes.toString(); 
            }
        } else {
            if(minutes<10){
                return rhours.toString()+"0"+minutes.toString();
            } else {
                return rhours.toString()+minutes.toString(); 
            } 
        }
    }
    return  path+timeConvert(index)+'Z.json'  

}

function dataFilter(data){
    var res = data.filter(d=> d.long!=-1 && d.lat!=-1 )
    return res
}


function distance(lat1, lon1, lat2, lon2, unit='M') {
	if ((lat1 == lat2) && (lon1 == lon2)) {
		return 0;
	}
	else {
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		if (dist > 1) {
			dist = 1;
		}
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist;
	}
}

function distance3D(lat1,lon1,alt1,lat2,lon2,alt2){ // all units are km
    var distance2D = distance(lat1, lon1, lat2, lon2, 'K');
    var res = Math.sqrt(Math.pow((alt2-alt1),2)+Math.pow(distance2D,2))
    return res
}

function distOfAC(d1,d2){
    if (d1.alt >=0 && d2.alt>=0 ){
        return distance3D(d1.lat,d1.long,d1.alt*0.0003048,d2.lat,d2.long,d2.alt*0.0003048) // 1 feet = 0.0003048 km
    } else {
        return distance(d1.lat,d1.long,d2.lat,d2.long,'K')
    }
}

function topNPairs(original_data, n){
    var data = original_data.slice(0)
    var topN = new Array();
        for (i=0;i<data.length;i++){
            var ref = data.shift();
            for (j=0; j<data.length; j++){
                var d1 = ref
                var d2 = data[j]
                var dist = distOfAC(d1,d2)
                var ele = {
                    d1:d1,
                    d2:d2,
                    dist:dist
                }
                    if (topN.length<n){
                        topN.push(ele)
                        topN.sort(function(a,b){
                            return a.dist-b.dist
                        });
                    } else {
                        if (dist<topN[topN.length-1].dist){
                            topN.pop();
                            topN.push(ele);
                            topN.sort(function(a,b){
                                return a.dist-b.dist
                            });
                        } 
                    }
            }
        }
    return topN;
}

function getSTCA(top){
    var arr = top.filter(d=>d.dist<5);
    var res = [];
    arr.forEach(e => {
        var d1 = e.d1;
        var d2 = e.d2;
        d1.stca = e.dist;
        d2.stca = e.dist;
        res.push(d1);
        res.push(d2);
    });
    return res;
    
}

function animate(){
    d3.select(this)
      .transition()
      .ease(d3.easeLinear)
      .duration(1000)
      .styleTween("stroke-dashoffset", function() {
        return d3.interpolate(0, 14);
      })
      .on('end', animate);
  }

