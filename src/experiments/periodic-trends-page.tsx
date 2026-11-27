'use client';

import { useState, useEffect } from 'react';
import {
  ExperimentContainer,
  DataGrid,
  DataPanel,
} from '@/components/experiment-ui';
import { PeriodicTrendsScene, ElementData } from '@/experiments/periodic-trends-scene';

const CATEGORY_COLORS: Record<string, string> = {
  "alkali-metal": "#ff6b6b",
  "alkaline-earth": "#ffa94d",
  "transition-metal": "#ffd43b",
  "post-transition": "#69db7c",
  "metalloid": "#4ecdc4",
  "nonmetal": "#4dabf7",
  "halogen": "#b197fc",
  "noble-gas": "#f783ac",
  "lanthanide": "#a5d8ff",
  "actinide": "#fcc2d7",
};

interface SceneData {
  selectedElement: ElementData | null;
  hoveredElement: ElementData | null;
}

export default function PeriodicTrendsPage() {
  const [data, setData] = useState<SceneData | null>(null);
  const [showDataPanel, setShowDataPanel] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Khắc phục lỗi hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleElementClick = (element: ElementData) => {
    console.log("Nguyên tố được chọn:", element);
  };

  const getCategoryNameVi = (category: string) => {
    const map: Record<string, string> = {
      "alkali-metal": "Kim loại kiềm",
      "alkaline-earth": "Kim loại kiềm thổ",
      "transition-metal": "Kim loại chuyển tiếp",
      "post-transition": "Kim loại sau chuyển tiếp",
      "metalloid": "Á kim",
      "nonmetal": "Phi kim",
      "halogen": "Halogen",
      "noble-gas": "Khí hiếm",
      "lanthanide": "Họ Lantan",
      "actinide": "Họ Acti",
    };
    return map[category] || category.replace(/-/g, " ");
  };

  const dataPanelContent = data && data.selectedElement ? (
    <>
      {/* Thông tin nguyên tố được chọn */}
      <div className="mb-4 p-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg border border-cyan-400/30">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-10 h-10 rounded flex items-center justify-center text-white font-bold text-lg"
            style={{
              backgroundColor: CATEGORY_COLORS[data.selectedElement.category] || "#06b6d4",
            }}
          >
            {data.selectedElement.symbol}
          </div>
          <div>
            <div className="text-sm font-bold text-cyan-300">{data.selectedElement.name}</div>
            <div className="text-xs text-cyan-400/70 capitalize">{getCategoryNameVi(data.selectedElement.category)}</div>
          </div>
        </div>
      </div>

      {/* Thuộc tính nguyên tố */}
      <DataGrid
        data={{
          soHieu: { value: data.selectedElement.number, unit: "Z", color: "#06b6d4", decimals: 0 },
          khoiLuong: { value: data.selectedElement.mass, unit: "amu", color: "#0891b2", decimals: 2 },
          nhom: { value: data.selectedElement.group, unit: "Nhóm", color: "#0e7490", decimals: 0 },
          chuKy: { value: data.selectedElement.period, unit: "Chu kỳ", color: "#164e63", decimals: 0 },
          banKinh: { value: data.selectedElement.atomicRadius, unit: "pm", color: "#22d3ee", decimals: 0 },
          doAmDien: {
            value: data.selectedElement.electronegativity ?? 0,
            unit: "",
            color: "#a855f7",
            decimals: data.selectedElement.electronegativity ? 2 : 0,
          },
          nangLuongIonHoa: { value: data.selectedElement.ionizationEnergy, unit: "kJ/mol", color: "#f97316", decimals: 0 },
        }}
        columns={2}
      />

      {/* Cấu hình electron */}
      <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
        <div className="text-xs text-gray-400 mb-1">Cấu hình Electron</div>
        <div className="text-xs text-cyan-400 font-mono break-all">{data.selectedElement.electronConfig}</div>
      </div>
    </>
  ) : (
    <div className="text-center text-gray-500 text-sm py-8">
      <div className="text-4xl mb-2">⏳</div>
      <div>Nhấp vào nguyên tố để xem dữ liệu</div>
    </div>
  );

  if (!mounted) return null;

  return (
    <>
      <ExperimentContainer
        title="Bảng Tuần Hoàn"
        description="Bảng tuần hoàn 3D tương tác với đầy đủ 118 nguyên tố"
        cameraPosition={[0, 0, 25]}
        backgroundColor="#050510"
        enableFog={false}
        controls={null}
        dataPanel={null}
      >
        <PeriodicTrendsScene
          onDataChange={setData}
          onElementClick={handleElementClick}
        />
      </ExperimentContainer>

      <DataPanel
        isVisible={showDataPanel}
        onToggle={() => setShowDataPanel(!showDataPanel)}
      >
        {dataPanelContent}
      </DataPanel>
    </>
  );
}
