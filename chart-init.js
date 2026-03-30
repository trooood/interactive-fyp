// initialise chart to set up correct ranges

var initData = {
    values: [
        {
            key: "init1",
            values: [
                { key: "x", value: -0.006 },
                { key: "y", value: 0 },
                { key: "z", value: 0 },
                { key: "color", value: 0 },
                { key: "size", value: 0 }
            ]
        },
        {
            key: "init2",
            values: [
                { key: "x", value: 0.006 },
                { key: "y", value: 0 },
                { key: "z", value: 0 },
                { key: "color", value: 0 },
                { key: "size", value: 0 }
            ]
        },
        {
            key: "init3",
            values: [
                { key: "x", value: 0 },
                { key: "y", value: 0.00045 },
                { key: "z", value: 0 },
                { key: "color", value: 0 },
                { key: "size", value: 0 }
            ]
        },
        {
            key: "init4",
            values: [
                { key: "x", value: 0 },
                { key: "y", value: 0.0375 },
                { key: "z", value: 0 },
                { key: "color", value: 0 },
                { key: "size", value: 0 }
            ]
        },
        {
            key: "init5",
            values: [
                { key: "x", value: 0 },
                { key: "y", value: 0 },
                { key: "z", value: -0.006 },
                { key: "color", value: 0 },
                { key: "size", value: 0 }
            ]
        },
        {
            key: "init6",
            values: [
                { key: "x", value: 0 },
                { key: "y", value: 0 },
                { key: "z", value: 0.006 },
                { key: "color", value: 0 },
                { key: "size", value: 0 }
            ]
        },
    ]
};

// define initialize function globally
var initialize = function() {
    chartHolder.datum(initData).call(myChart);
};