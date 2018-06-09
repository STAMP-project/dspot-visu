const SIZE = 7;

const classification = {
    SURVIVED: 'not-detected',
    NO_COVERAGE: 'not-covered',
    KILLED: 'detected'
}

const svg = d3.select('body')
                      .append('svg')
                        .attr('width', window.innerWidth)
                        .attr('height', window.innerHeight);
  canvas = svg.append('g');

function createLayout(items) {
    const svg = d3.select('svg')
                    .attr('width', window.innerWidth)
                    .attr('height', window.innerHeight);
    const canvas = svg.select('#canvas');
    const columns = Math.floor(window.innerWidth / SIZE);
    const radius = SIZE/2 - 1
    canvas.selectAll('circle')
                .data(items)
                .enter()
                    .append('circle')
                        .attr('cx', (d,i) => radius + 1 + SIZE * (i % columns))
                        .attr('cy', (d,i) => radius + 1 + SIZE * i / columns)
                        .attr('r', radius)
                        .attr('class', d => classification[d.status])
                        ;
}

$.ajax({
    url: '/data/details/0/0/0',
    dataType: 'json',
    type: 'GET',
    success: function (data) {
        createLayout(data.mutants);
    },
    error: (xhr, err) => console.error(err)
});
