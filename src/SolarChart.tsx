import * as React from 'react';
import { Chart } from 'react-google-charts';

interface ISolarChartProps {
    dataArray: object[];
}
class SolarChart extends React.Component<ISolarChartProps, {}> {
    private chartRef: any;
    constructor(props: any) {
        super(props);
    }
    public render() {
        return (
            <Chart ref={this.chartRef} chartType={"ComboChart"}
                data={this.props.dataArray}
                width="100%" legend_toggle={true} options={{
                    animation: {
                        duration: 1000,
                        easing: 'out'
                    },
                    hAxis: { title: 'Month' },
                    series: { 2: { type: 'line', targetAxisIndex: 1 } },
                    seriesType: 'area',
                    title: 'Verbrauchsprofil',
                    vAxis: { title: 'Batterieladung' },
                }} />
        );
    }

    // public componentDidUpdate() {
    //     if (this.chartRef) {
    //         this.chartRef.drawChart();
    //     }
    // }
}

export default SolarChart;
