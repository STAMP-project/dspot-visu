class DotsVisualization {

    constructor(container, options) {
        this.container = container;
        this.options = Object.assign({
            left: 0,
            right: 0,
            width: window.innerWidth,
            height: window.innerHeight
        }, options);
    }

    assignPositions() {
        let root = {id: "", children: []};
        for(let mutant of this.mutants) {
            let path = [mutant.class_name, mutant.method, mutant.id];
            let current = root;
            for(let step of path) {
                let child = current.children.find(n => n.id === step);
                if(child === undefined) {
                    child = {id: step, children: []}
                    current.children.push(child);
                }
                current = child;
            }
            current.children.push(mutant);
        }

        let hierarchy = d3.hierarchy(root).sum(n => 4).sort();
        let pack = d3.pack().size([ this.options.width, this.options.height]);

        let layout = pack(hierarchy);

        for(let item of layout.leaves()) {
            item.data.position = {x: item.x, y: item.y};             
        }

        this.layout = layout;
    }

    initialize(mutants) {
        this.mutants = mutants;
        this.assignPositions();

        // this.container.selectAll('circle.intermediate')
        //             .data(this.layout.descendants())
        //             .enter()
        //                 .append('circle')
        //                 .attr('class', (d, i) => 'intermediate ' + (d.depth == 1)? 'class' : 'method')
        //                 .attr('cx', d => d.x)
        //                 .attr('cy', d => d.y)
        //                 .attr('r', d => d.y)
        //                 .attr('stroke', 'black')
        //                 .attr('fill', 'transparent');
        this.container.selectAll('circle.class')
                    .data(this.layout.descendants().filter(d => d.depth == 1))
                    .enter()
                        .append('circle')
                            .attr('class', 'class')
                            .attr('cx', d => this.options.left + d.x)
                            .attr('cy', d => this.options.top + d.y)
                            .attr('r', d => d.r);

        this.container.selectAll('circle.method')
                    .data(this.layout.descendants().filter(d => d.depth == 2))
                    .enter()
                        .append('circle')
                            .attr('class', 'method')
                            .attr('cx', d => this.options.left + d.x)
                            .attr('cy', d => this.options.top + d.y)
                            .attr('r', d => d.r);

        this.container.selectAll('circle.mutant')
                    .data(this.mutants)
                    .enter()
                        .append('circle')
                            .attr('class', 'mutant placeholder')
                            .attr('cx', n => this.options.left + n.position.x)
                            .attr('cy', n => this.options.top + n.position.y)
                            .attr('r', 1);

    }

    statusToClass(mutant) {
        if(mutant.status.isDetected)
            return 'killed';
        if(mutant.status.isOnlyCovered)
            return 'covered';
        return 'placeholder';

    }

    statusToRadius(mutant) {
        if(mutant.status.isDetected)
            return 3;
        if(mutant.status.isOnlyCovered)
            return 2;
        return 1;

    }

    update() {
        console.log('Updating visualization');
        this.container.selectAll('circle.mutant')
                    .data(this.mutants)
                    .transition()
                    .duration(0)
                        .attr('class', (d, i) => 'mutant ' + this.statusToClass(d))
                        .attr('r', this.statusToRadius.bind(this));
    }
}