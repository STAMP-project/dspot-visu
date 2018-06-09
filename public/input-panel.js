class InputPanel {

    constructor(container, options) {
        this.container = container;
        this.options = Object.assign({
            left: 0,
            top: 0,
            width: 100,
            height: window.innerHeight,
            padding: 5,
            font_size: 12,
            knob: {
                radius: 30
            },
            slider: {
                width: 30,
                height: 100
            }
        }, options); //TODO: Effect on nested objects?

        this.arc = d3.arc()
                    .innerRadius(this.options.knob.radius*0.3) //Parameter
                    .outerRadius(this.options.knob.radius)
                    .startAngle(5*Math.PI/6); //Parameter

    }

    positionScales() {

        let vertical = this.options.height >= this.options.width;
        console.log(this.options.height);

        let requiredUnitHeight = 2 * this.options.knob.radius + 3 * this.options.padding + this.options.slider.width;
        console.log(requiredUnitHeight);
        let availableUnitHeight = this.options.height/(vertical?this.tests.length:1);
        console.log(availableUnitHeight)
        let verticalMargin = (availableUnitHeight - requiredUnitHeight)/2;
        console.log(verticalMargin);

        let requiredUnitWidth = Math.max(2*this.options.knob.radius, this.options.slider.width);
        let availableUnitWidth = this.options.width/(vertical?1:this.tests.length);
        let horizontalMargin = (availableUnitWidth - requiredUnitHeight)/2;
        let top, left;
        
        if(vertical) {
            top = (i) => this.options.top +  i * availableUnitHeight;
            left = (i) => this.options.left; 
        }
        else {
            top = (i) => this.options.top;
            left = (i) => this.options.left + i * availableUnitWidth;
        }

        return {
            cy: (i) => top(i) + verticalMargin/2 + this.options.knob.radius,
            cx: (i) => left(i) + availableUnitWidth/2,
            ry: (i) => top(i) + verticalMargin/2  + 2 * this.options.knob.radius + this.options.font_size,
            rx: (i) => left(i) + availableUnitWidth/2 - this.options.slider.width/2
        };

    }


    initialize(tests) {
        this.tests = tests;
        const range = [7 * Math.PI / 6, 17*Math.PI/6];
        this.scales = tests.map(t => {
            return { 
                tests: d3.scaleLinear().range([this.options.slider.height, 0]).domain([0, t.tests - 1]), 
                assertions: d3.scaleLinear().range(range).domain([0, t.assertions - 1])
            };
        });

        const {cx, cy, rx, ry} = this.positionScales();
        let self = this;

        console.log('Creating the controls');
        // Create the controls

        this.container.selectAll('circle.placeholder')
                    .data(this.tests)
                    .enter()
                    .append('circle')
                        .attr('class', 'placeholder')
                        .attr('cx', (d, i) => cx(i))
                        .attr('cy', (d, i) => cy(i))
                        .attr('r', self.options.knob.radius)
                        .attr('fill', 'lightgray');

        this.container.selectAll('path.assertions-input')
                    .data(this.tests)
                    .enter()
                    .append('path')
                        .attr('class', 'assertions-input')
                        .attr('d', (d, i) => self.arc({endAngle: 0}))
                        .attr('transform', (d, i) => 'translate(' +  cx(i) + ',' + cy(i)  + ')'); 
        
        this.container.selectAll('rect.tests-input')
                        .data(this.tests)
                        .enter()
                        .append('rect')
                            .attr('class', 'tests-input')
                            .attr('x', (d, i) => rx(i))
                            .attr('y', (d, i) => ry(i))
                            .attr('width', (d, i) => self.options.slider.width)
                            .attr('height', (d, i) => self.options.slider.height);
        
        this.container.selectAll('rect.placeholder')
                    .data(this.tests)
                    .enter()
                    .append('rect')
                        .attr('class', 'placeholder')
                        .attr('x', (d, i) => rx(i))
                        .attr('y', (d, i) => ry(i))
                        .attr('width', (d, i) => self.options.slider.width)
                        .attr('height', (d, i) => self.options.slider.height/2)
                        .attr('fill', 'lightgray');

        console.log('Controls created');

    }

    update() {

        this.container.selectAll('path.assertions-input')
                    .data(this.tests)
                    .transition()
                        .duration(0)
                        .attr('d', (d, i) => this.arc({endAngle: this.scales[i].assertions(d.amplification.assertions)}));
        
        this.container.selectAll('rect.placeholder')
                    .data(this.tests)
                    .transition()
                        .duration(0)
                        .attr('height', (d, i) => this.scales[i].tests(d.amplification.tests));

    }

}