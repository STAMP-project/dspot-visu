

// Translates MIDI input to parameters
let MIDIInputScales = [];
//Translates values for visual represenation.
let visualScales = [];
//Scale to locate the center of each amplification unit
// let centers;

// Holds the values of the amplification parameters
let inputValues = [];

//Holds the results after executing the amplification algorithm with the given parameters
let outputValues = [];

//Creates an arc path given the endAngle.
let arc;

//The drawing surface
let canvas;

//Point scale containing the center points of the space for each unit
let centers;

//TODO: Separate graphics creation from the rest.
//TODO: There might be a need to have two graphic managers in the same page just to keep the state of the board.
function initializeGraphics(baseline) {
  const svg = d3.select('body')
                      .append('svg')
                        .attr('width', window.innerWidth)
                        .attr('height', window.innerHeight);
  canvas = svg.append('g');
  
  const TARGETS = baseline.length;
  const TARGET_DOMAIN = d3.range(0, TARGETS);
  const UNIT_WIDTH = window.innerWidth/TARGETS;
  const PADDING = 10;
  const TOP = PADDING;
  const LABEL_HEIGHT = 25;
  const BOTTOM = window.innerHeight - PADDING;
  const MIDDLE = (BOTTOM - TOP) * .66; //Line dividing the output and input visual feedback

  const MAX_BAR_HEIGHT = MIDDLE - PADDING/2 - TOP;
  const TOP_TESTS_BAR = MIDDLE + PADDING/2;
  const MAX_TESTS_HEIGHT = BOTTOM - 2*LABEL_HEIGHT - TOP_TESTS_BAR; //TODO: Check why it should be 2*LABEL_HEIGHT

  centers = d3.scalePoint().padding(0.5).range([PADDING, window.innerWidth -  PADDING]).domain(TARGET_DOMAIN);

  visualScales = baseline.map(item => {
    return {
      hKilled: d3.scaleLinear().range([0, MAX_BAR_HEIGHT]).domain([0, item.maxKilled]),
      yKilled: d3.scaleLinear().range([TOP + MAX_BAR_HEIGHT, TOP]).domain([0, item.maxKilled]),
      hCovered: d3.scaleLinear().range([0, MAX_BAR_HEIGHT]).domain([0, item.maxCovered]),
      yCovered: d3.scaleLinear().range([TOP + MAX_BAR_HEIGHT, TOP]).domain([0, item.maxCovered]),
      hTests: d3.scaleLinear().range([0, MAX_TESTS_HEIGHT]).domain([0, item.maxTests]),
      yTests: d3.scaleLinear().range([TOP_TESTS_BAR + MAX_TESTS_HEIGHT, TOP_TESTS_BAR]).domain([0, item.maxTests]),
      angle: d3.scaleLinear().range([7 * Math.PI / 6, 17*Math.PI/6]).domain([0, item.maxAssertions])
    };
  });

  MIDIInputScales = baseline.map(item => {
    return {
      slider: d3.scaleQuantize().domain([0, 127]).range(d3.range(item.maxTests + 1)),
      knob: d3.scaleQuantize().domain([0, 127]).range(d3.range(item.maxAssertions + 1))
    };
  });

  inputValues = baseline.map(item => { return {tests: 0, assertions: 0}; });
  outputValues = baseline.map(item => { return {killed: item.origKilled, covered: item.origCovered}; });

  const BAR_WIDTH = 30;

  const RADIUS = 50; //TODO: This value should be set according to the space available
  arc = d3.arc().innerRadius(RADIUS*0.7).outerRadius(RADIUS).startAngle(5*Math.PI/6);

  canvas.selectAll('rect.mutants-killed')
            .data(TARGET_DOMAIN)
            .enter()
            .append('rect')
              .attr('class', 'mutants-killed')
              .attr('x', d => centers(d))
              .attr('y', d => TOP + MAX_BAR_HEIGHT)
              .attr('height', 0)
              .attr('width', BAR_WIDTH);
  
  canvas.selectAll('rect.mutants-covered')
          .data(TARGET_DOMAIN)
          .enter()
          .append('rect')
            .attr('class', 'mutants-covered')
            .attr('x', d => centers(d) - BAR_WIDTH)
            .attr('y', d => TOP + MAX_BAR_HEIGHT)
            .attr('height', 0)
            .attr('width', BAR_WIDTH);

  canvas.selectAll('rect.tests-input')
          .data(TARGET_DOMAIN)
          .enter()
          .append('rect')
            .attr('class', 'tests-input')
            .attr('x', d => centers(d) + centers.step()/4 - BAR_WIDTH/2)
            .attr('y', d => TOP_TESTS_BAR + MAX_TESTS_HEIGHT )
            .attr('height', 0)
            .attr('width', BAR_WIDTH);
  
  canvas.selectAll('text.tests-input')
          .data(TARGET_DOMAIN)
          .enter()
          .append('text')
            .attr('class', 'tests-input')
            .attr('text-anchor', 'middle')
            .attr('font-family', 'sans-serif')
            .attr('font-size', '25px')
            .attr('x', d => centers(d) + centers.step()/4 - BAR_WIDTH/2)
            .attr('y', BOTTOM - LABEL_HEIGHT);
  
  canvas.selectAll('path.assertions-input')
          .data(TARGET_DOMAIN)
          .enter()
          .append('path')
            .attr('class', 'assertions-input')
            .attr('d', (d, i) => arc({endAngle: 0}))
            .attr('transform', d => 'translate(' + (centers(d) - centers.step()/4) + ',' + ((MIDDLE+BOTTOM)/2) + ')');

  canvas.selectAll('text.assertions-input')
              .data(TARGET_DOMAIN)
              .enter()
              .append('text')
                .attr('class', 'assertions-input')
                .attr('text-anchor', 'middle')
                .attr('font-family', 'sans-serif')
                .attr('font-size', '30px')
                .attr('x', d => centers(d) - centers.step()/4)
                .attr('y', (MIDDLE + BOTTOM + LABEL_HEIGHT)/2);
  
  updateGraphics();
}

function updateGraphics() {
  canvas.selectAll('rect.mutants-killed')
        .data(outputValues)
        .transition()
          .duration(500)
          .attr('height', (d,i) => visualScales[i].hKilled(d.killed))
          .attr('y', (d,i) =>  visualScales[i].yKilled(d.killed));

  canvas.selectAll('rect.mutants-covered')
          .data(outputValues)
          .transition()
            .duration(500)
            .attr('height', (d,i) => visualScales[i].hCovered(d.covered))
            .attr('y', (d,i) =>  visualScales[i].yCovered(d.covered));

  canvas.selectAll('rect.tests-input')
          .data(inputValues)
          .transition()
            .duration(500)
            .attr('height', (d,i) => visualScales[i].hTests(d.tests))
            .attr('y', (d,i) => visualScales[i].yTests(d.tests));

  canvas.selectAll('path.assertions-input')
          .data(inputValues)
          .transition()
          .duration(0)
            .attr('d', (d,i) => arc({endAngle: visualScales[i].angle(d.assertions)}));

  canvas.selectAll('text.tests-input')
    .data(inputValues)
    .text(d => d.tests)
    .attr('x', (d,i) => centers(i) + centers.step()/4);
  canvas.selectAll('text.assertions-input').data(inputValues).text(d => d.assertions);
}

$.ajax('/data/baseline').then(initializeGraphics);

function onInput(command, note, velocity) {
  let input = translateMIDIMessage(note, velocity);
  if(!input) {
    return; //Ignore messages from other buttons
  }

  let previousValues = inputValues[input.target];
  if(previousValues.tests == input.tests && previousValues.assertions == input.assertions)
    return;
  
  previousValues.tests = input.tests;
  previousValues.assertions = input.assertions;

  //Update input values
  // inputValues[input.target].tests = input.tests;
  // inputValues[input.target].assertions = input.assertions;

  updateGraphics();

  console.log("Requesting");
  console.log(input);

  //Request values
  $.ajax({
    url: '/data/result/' + input.target + '/' + input.tests + '/' + input.assertions,
    type: 'GET',
    dataType: 'json',
    success: function (data) {
      console.log("Response");
      console.log(data);
      outputValues[input.target] = data;
      updateGraphics();
    },
    error: (xhr, err) => {
      console.error("Error callback");
      console.error(err);
    }
  });
}

function translateMIDIMessage(note, velocity) {
  let unit;
  let isSlider = (note >= 0 && note <= 7);

  if(note >= 0 && note <= 7)
    unit = note
  else if (note >= 16 && note <= 23)
    unit = note - 16;
  else
    return null;

  if(unit >= inputValues.length)
    return null;

  return {
    target: unit,
    tests: (isSlider)?MIDIInputScales[note].slider(velocity):inputValues[unit].tests,
    assertions: (isSlider)?inputValues[note].assertions:MIDIInputScales[unit].knob(velocity)
  };
}

//Device input
NanoKontrolInput.error.register((error) => { console.error(error.message); });
NanoKontrolInput.message.register(onInput);
NanoKontrolInput.connect();
