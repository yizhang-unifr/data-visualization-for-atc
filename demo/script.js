$(document).ready(function (){
    var w = 1920;
    var h = 960;
    var fi = 0;

    var projection = d3.geoConicConformal()
    .parallels([35, 65])
    .rotate([-21, -1])
    .scale(w*7.5)
    .center([-12, 46])
    .translate([w/2, h/2])
    .clipExtent([[-3800, -2000], [3800, 2500]])
    .precision(100);

    var path = d3.geoPath().projection(projection);
    var svg = d3.select('body')
                .append('svg')
                .attr('width',w)
                .attr('height',h);

    
 

                 

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
            var aircrafts = data.data;
            var time = data.id;
            var hue = 0;

            aircrafts.map(function(d){
                hue += 0.618;
                d.color = 'hsl(' + hue + ', 100%, 50%)';
                d.complementaryColor = 'hsl(' + (hue+180) + ', 100%, 50%)'; 
            });

            g.selectAll('g')
            .data(aircrafts,d=>d.id)
            .enter()
            .append('g')
            .attr('id', d=>d.id)
            //add anchor of aircrafts
            .append('circle')
            .attr('cx', getX)
            .attr('cy',getY)
            .attr('r',function(d){
                if (d.alt>10) {
                    return Math.log(parseInt(d.alt)/1.25)/1.5;
                }else {
                    return 0.5
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
             g.selectAll('g')
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
            .attr('fill','none')
            .attr('fill-opacity','0')
            .attr('stroke',d=>d.color)
            .attr('stroke-width','.5px')
        });

        var button = d3.select('body')
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
            var w = 1920;
            var h = 960;
            if (error) console.log(error);
            var aircrafts_data = data.data;
            var hue = 0;
            var svg = d3.select('body').select('svg');

            var g = svg.select('g');
            aircrafts_data.map(function(d){
                hue += 0.618;
                d.color = 'hsl(' + hue + ', 100%, 50%)';
                d.complementaryColor = 'hsl(' + (hue+180) + ', 100%, 50%)'; 
            });
        
            var t = d3.transition().duration(750);
            var aircrafts = g.selectAll("g")
                             .data(aircrafts_data,d=>d.id);
            var aircraftsEnter = aircrafts.enter().append("g");

            // enter circle
            aircraftsEnter.append('circle')
                     // .transition(t)
                     .attr('cx', getX)
                     .attr('cy',getY)
                     .attr('r',function(d){
                        if (d.alt>10) {
                            return Math.log(parseInt(d.alt)/1.25)/1.5;
                        }else {
                            return 0.5
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
                             return Math.log(parseInt(d.alt)/1.25)/1.5;
                         }else {
                             return 0.5
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
        
                            .attr('stroke',d=>d.color)
                            .attr('stroke-width','.5px')
                            .attr('stroke-dasharray','4 2 2')
                            .attr('stroke-opacity','0.75')
                            .attr('fill-opacity','0')
                            /*
                            .attr('k',function(d){
                                var current_d = d3.select(this).attr('d');
                                if(current_d.split(" ").length<4){
                                    k = ""
                                } else {
                                    var arr = current_d.split(" ");
        
                                    var y2_str = arr[arr.length-1];
                                    var x2_str = arr[arr.length-2];
                                    x2_str = x2_str.substring(1,x2_str.length);
                                    var y2 = parseFloat(y2_str);
                                    var x2 = parseFloat(x2_str);
        
                                    var y1_str = arr[arr.length-3];
                                    var x1_str = arr[arr.length-4];
                                    x1_str = x1_str.substring(1,x1_str.length);
                                    var y1 = parseFloat(y1_str);
                                    var x1 = parseFloat(x1_str); 
                                    
                                    if (x1==x2){
                                        k = NaN;
                                    } else {
                                        k = (y2-y1)/(x2-x1);
                                    }
                                }  
                                return k
                            })*/;

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
  