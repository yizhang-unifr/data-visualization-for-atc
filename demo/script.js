$(document).ready(function (){
    var w = 1920;
    var h = 960;
    var fi = 1;

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
            g.selectAll('path')
             .attr('d',path.projection(projection));
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

        d3.json('../atc-data/0000Z.json', function(error,data){
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
             .attr('d',function(d){
                var old_d = d3.select(this).attr('d');
                var x = getX(d);
                var y = getY(d);
                if(old_d==null || old_d==undefined){
                    var d = "M"+x.toString()+" "+y.toString(); 
                } else {
                    var d = old_d.split(" ").concat('L'+x.toString(),y.toString()).join(" ");
                } 
                return d
            })
            .attr('stroke',d=>d.color)
            .attr('stroke-width','.5px');

             //add path
            

            /*
             var t = d3.timer(function(elapsed) {
                if (elapsed > 2000) {
                    // do someting
                }
                console.log('started again') 
                t.restart();
              }, 150);
              */



        });

        var button = d3.select('body')
                 .append('button')
                 .attr('type','button')
                 .attr('id','floating-button')
                 .text('Click me')
                 .on('click', function() { 
                     var file = getFileByIndex(fi);
                     d3.json(file,update);
                     fi++;
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
            // for exit
            aircrafts.exit()
                     .transition(t)
                     .style("fill-opacity",1e-6)
                     .remove();
            // for update aircrafts
            aircrafts.selectAll('circle')
                     .transition(t)
                     .attr('cx', getX)
                     .attr('cy',getY)
                     .attr('r',function(d){
                        if (d.alt>10) {
                            return Math.log(parseInt(d.alt)/1.25)/1.5;
                        }else {
                            return 0.5
                        }
                     })
            aircrafts.selectAll('path')
                    .attr('d',function(data){
                        var old_d = d3.select(this).attr('d');
                        return old_d; 
                    })
                    .transition(t)
                    .attr('d',function(data){
                        var old_d = d3.select(this).attr('d');
                        var x = getX(data);
                        var y = getY(data);
                        if(old_d==null || old_d==undefined){
                            var new_d = "M"+x+" "+y; 
                        } else {
                            var new_d = old_d.split(" ").concat('L'+x,y).join(" ");
                        } 
                        return new_d
                    })

                    .attr('stroke',d=>d.color)
                    .attr('stroke-width','.5px')
                    .attr('stroke-dasharray','4 1')
                    .style('fill-opacity:0');
                     
        
            aircrafts.select('circle')
                     .enter()
                     .append('circle')
                     .transition(t)
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
        
            // for enter
            aircrafts.select('path')
                     .enter()
                     .append('path')
                     .attr('d',function(d){
                        var old_d = this.attr('g');
                        var x = getX(d);
                        var y = getY(d);
                        if(old_d==null || old_d==undefined){
                            var d = "M"+x+" "+y; 
                        } else {
                            var d = old_d.split(" ").concat('L'+x,y).join(" ");
                        } 
                        return d
                    })
                    .attr('stroke',d=>d.color)
                    .attr('stroke-width',1.5)
                    .attr('fill','none');
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
  