import TrendLineChart from './components/TrendLineChart'
import { useChartData } from './data/useChartData'

function Dashboards() {
    const data = useChartData()

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
            <TrendLineChart data={data} />
        </div>
    );
}

export default Dashboards;