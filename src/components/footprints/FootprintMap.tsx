"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import * as echarts from "echarts";
import PasswordModal from "./PasswordModal";

const UNLIT_COLOR = "#1a1f3a";
const LIT_COLOR = "#f0a500";
const HOVER_COLOR = "#f5c842";

interface FootprintMapProps {
  cities: string[];
}

export default function FootprintMap({ cities }: FootprintMapProps) {
  const router = useRouter();
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const geoJsonRef = useRef<unknown>(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [showCityModal, setShowCityModal] = useState(false);
  const [geoError, setGeoError] = useState(false);

  // Track admin timeout
  const adminTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAdminTimer = useCallback(() => {
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
    adminTimerRef.current = setTimeout(() => {
      setIsAdmin(false);
    }, 5 * 60 * 1000); // 5 minutes
  }, []);

  const visitedSet = new Set(cities);

  const renderChart = useCallback(
    (geoJson: unknown) => {
      if (!chartRef.current) return;

      if (!chartInstance.current) {
        chartInstance.current = echarts.init(chartRef.current);
      }

      const chart = chartInstance.current;

      // Convert GeoJSON features to ECharts data
      const features = (geoJson as { features: Array<{ properties: { name: string } }> }).features;

      const mapData = features.map((f) => {
        const name = f.properties.name;
        const visited = visitedSet.has(name);
        return {
          name,
          itemStyle: {
            areaColor: visited ? LIT_COLOR : UNLIT_COLOR,
            borderColor: visited ? "#f5c842" : "#5a6090",
            borderWidth: 1,
          },
          label: {
            show: true,
            color: visited ? "#ffd966" : "#94a3b8",
            fontSize: 6,
            fontWeight: visited ? "bold" : "normal",
          },
          emphasis: {
            itemStyle: {
              areaColor: visited ? HOVER_COLOR : "#3a3f6a",
              borderColor: "#fff",
              borderWidth: 1.5,
            },
            label: { show: true, color: "#fff", fontSize: 10, fontWeight: "bold" },
          },
        };
      });

      chart.setOption({
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(15, 19, 40, 0.95)",
          borderColor: "rgba(255,255,255,0.1)",
          textStyle: { color: "#fff", fontSize: 13 },
          formatter: (params: { name: string }) => {
            const visited = visitedSet.has(params.name);
            if (visited) {
              return `<strong>${params.name}</strong><br/>✅ 已踏足`;
            }
            return `<strong>${params.name}</strong><br/>🌫️ 尚未踏足`;
          },
        },
        series: [
          {
            type: "map",
            map: "china",
            roam: true,
            scaleLimit: { min: 1, max: 5 },
            label: { show: false },
            itemStyle: {
              areaColor: UNLIT_COLOR,
              borderColor: "#5a6090",
              borderWidth: 1,
            },
            emphasis: {
              label: { show: true, color: "#fff", fontSize: 10, fontWeight: "bold" },
              itemStyle: { areaColor: "#3a3f6a", borderColor: "#fff", borderWidth: 1.5 },
            },
            data: mapData,
          },
        ],
      });

      // Click handler
      chart.off("click");
      chart.on("click", (params: { name: string }) => {
        const cityName = params.name;
        const visited = visitedSet.has(cityName);
        setSelectedCity(cityName);
        setShowCityModal(true);

        if (isAdmin) {
          // Admin mode: show action options for every click
        } else {
          // Browse mode: only allow entry for visited cities
          if (visited) {
            // Auto-navigate (or show confirm — let's auto-navigate)
            router.push(`/footprints/${encodeURIComponent(cityName)}`);
          }
        }
      });
    },
    [cities, isAdmin, router],
  );

  // Load GeoJSON and init chart
  useEffect(() => {
    let cancelled = false;
    const initChart = async () => {
      try {
        const res = await fetch("/geojson/china-cities.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const geoJson = await res.json();
        if (cancelled) return;
        geoJsonRef.current = geoJson;
        echarts.registerMap("china", geoJson as Parameters<typeof echarts.registerMap>[1]);
        renderChart(geoJson);
      } catch (err) {
        console.error("Failed to load GeoJSON:", err);
        if (!cancelled) setGeoError(true);
      }
    };
    initChart();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only, renderChart identity changes are irrelevant
  }, []);

  // Re-render when cities or admin mode changes
  useEffect(() => {
    if (geoJsonRef.current) {
      renderChart(geoJsonRef.current);
    }
  }, [cities, isAdmin, renderChart]);

  // Responsive resize — single listener, cleaned up on unmount
  useEffect(() => {
    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Dispose ECharts instance on unmount
  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  const handlePasswordSuccess = (password: string) => {
    setAdminPassword(password);
    setIsAdmin(true);
    setShowPasswordModal(false);
    resetAdminTimer();
  };

  const handleAdminExit = () => {
    setIsAdmin(false);
    if (adminTimerRef.current) clearTimeout(adminTimerRef.current);
  };

  const handleCityAction = async (action: "enter" | "add" | "remove") => {
    setShowCityModal(false);
    if (!selectedCity) return;

    if (action === "enter") {
      router.push(`/footprints/${encodeURIComponent(selectedCity)}`);
      return;
    }

    if (action === "add" || action === "remove") {
      try {
        const res = await fetch("/api/footprints", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            city: selectedCity,
            password: adminPassword,
          }),
        });
        const data = await res.json();
        if (data.success && data.cities) {
          // Trigger re-render — parent will pass updated cities
          // For local state, re-fetch
          window.location.reload();
        }
      } catch (err) {
        console.error("Failed to update city:", err);
      }
    }
  };

  return (
    <div className="relative w-full">
      {/* Admin toggle */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-2 p-2">
        {isAdmin ? (
          <button
            onClick={handleAdminExit}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            🔓 退出管理
          </button>
        ) : (
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            🔒 管理
          </button>
        )}
      </div>

      {/* Chart container */}
      {geoError ? (
        <div className="flex flex-col items-center justify-center flex-1" style={{ minHeight: 500 }}>
          <p className="text-white/50 mb-4">地图数据加载失败</p>
          <button
            onClick={() => { setGeoError(false); window.location.reload(); }}
            className="px-4 py-2 rounded-lg bg-white/10 text-white text-sm hover:bg-white/20 transition-colors"
          >
            重试
          </button>
        </div>
      ) : (
        <div ref={chartRef} className="w-full flex-1" style={{ minHeight: 500 }} />
      )}

      {/* Password modal */}
      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />

      {/* Admin action modal */}
      {showCityModal && isAdmin && selectedCity && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCityModal(false)} />
          <div className="relative bg-[#0f1325] border border-white/10 rounded-xl p-5 shadow-xl min-w-[200px]">
            <h4 className="text-white font-medium mb-3 text-center">{selectedCity}</h4>
            <div className="flex flex-col gap-2">
              {visitedSet.has(selectedCity) ? (
                <>
                  <button
                    onClick={() => handleCityAction("enter")}
                    className="px-4 py-2 rounded-lg text-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    📷 进入查看
                  </button>
                  <button
                    onClick={() => handleCityAction("remove")}
                    className="px-4 py-2 rounded-lg text-sm bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    🕯️ 熄灭
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCityAction("add")}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                >
                  ✨ 点亮
                </button>
              )}
              <button
                onClick={() => setShowCityModal(false)}
                className="px-4 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
