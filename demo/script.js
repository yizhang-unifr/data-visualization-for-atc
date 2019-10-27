$(document).ready(function (){
    var w = 1920;
    var h = 960;

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

            g.selectAll('circle')
            .data(aircrafts)
            .enter()
            .append('circle')
            .attr('cx', function(d){
                if(d.long&&d.lat){
                    return projection([d.long,d.lat])[0];
                }
            })
            .attr('cy',function(d){
                if (d.long&&d.lat){
                    return projection([d.long,d.lat])[1];
                }
            })
            .attr('r',function(d){
                if (d.alt) {
                    return Math.log(parseInt(d.alt)/1.25)/1.5;
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



        });
    });

});

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  