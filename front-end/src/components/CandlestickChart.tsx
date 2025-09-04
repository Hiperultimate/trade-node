import { createChart, ColorType, CandlestickSeries, UTCTimestamp } from "lightweight-charts";
import { useEffect, useRef } from "react";


type Candle = {
  time: UTCTimestamp; // UNIX timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
};

function CandlestickChart({ candleData }: {candleData : Candle[]}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chartContainerRef.current || !candleData || candleData.length === 0) {
      return
    }
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "black" },
        textColor: "white",
      },
      grid: {
        vertLines: { color: "rgba(197, 203, 206, 0.2)" },
        horzLines: { color: "rgba(197, 203, 206, 0.2)" },
      },
      width: chartContainerRef.current.clientWidth,
      height: chartContainerRef.current.clientHeight,
    });

    chart.timeScale().fitContent();

    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#26a69a",
      wickUpColor: "#26a69a",
      borderVisible: false,
      downColor: "#ef5350",
      borderDownColor: "#ef5350",
      wickDownColor: "#ef5350",
    });
    // ✅ Transform your API data
    const formattedData = candleData.sort((a:Candle,b:Candle)=>a.time-b.time);
    // console.log(formattedData, "from formatted data");

    candleSeries.setData(formattedData);
    // resize handler
    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [candleData]);

  return <div ref={chartContainerRef} style={{ width: "100%", height: "100%" }} />;
}

export default CandlestickChart;

