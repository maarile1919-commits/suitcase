"use client";

import { useState } from "react";
import { Plus, X, Plane, MapPin, Users, Sparkles, Loader2 } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  // States for form
  const [destinations, setDestinations] = useState([
    { id: 1, startDate: "", endDate: "", location: "" }
  ]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [theme, setTheme] = useState("");

  const handleAddDestination = () => {
    setDestinations([
      ...destinations,
      { id: Date.now(), startDate: "", endDate: "", location: "" }
    ]);
  };

  const handleRemoveDestination = (id: number) => {
    if (destinations.length > 1) {
      setDestinations(destinations.filter(d => d.id !== id));
    }
  };

  const handleDestinationChange = (id: number, field: string, value: string) => {
    setDestinations(destinations.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleSubmit = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 2000);
  };

  if (step === 2) {
    return (
      <main className="max-w-4xl mx-auto p-6 md:p-12 min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center border border-gray-100 w-full animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
             <Sparkles className="w-10 h-10 text-primary" />
           </div>
           <h2 className="text-3xl font-bold mb-4 text-gray-800">여행 준비물 리스트 완성!</h2>
           <p className="text-gray-500 mb-8 text-lg">AI가 분석한 맞춤형 짐싸기 리스트가 여기에 표시됩니다.</p>
           
           {/* Dummy List View */}
           <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left border border-gray-100 max-w-2xl mx-auto space-y-4">
             <div className="flex items-center gap-3 text-gray-700 font-medium">
               <div className="w-2 h-2 bg-primary rounded-full"></div> 여권 및 항공권
             </div>
             <div className="flex items-center gap-3 text-gray-700 font-medium">
               <div className="w-2 h-2 bg-primary rounded-full"></div> 상비약 (감기약, 소화제)
             </div>
             <div className="flex items-center gap-3 text-gray-700 font-medium">
               <div className="w-2 h-2 bg-primary rounded-full"></div> 편안한 런닝화
             </div>
           </div>

           <button 
             onClick={() => setStep(1)}
             className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition"
           >
             정보 수정하기
           </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto p-6 md:p-12 min-h-screen flex flex-col justify-center">
      {/* Header */}
      <header className="text-center mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
        <h1 className="text-5xl md:text-6xl font-extrabold text-primary mb-4 flex items-center justify-center gap-3">
          PackWise <Plane className="w-12 h-12 -rotate-45" />
        </h1>
        <p className="text-xl text-gray-500 font-medium">당신의 완벽한 짐싸기 파트너</p>
      </header>

      {/* Main Input Card */}
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both">
        
        {/* Destinations */}
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <div className="bg-primary/10 p-2 rounded-lg">
              <MapPin className="text-primary w-5 h-5" />
            </div>
            여행지 및 일정
          </label>
          
          <div className="space-y-4">
            {destinations.map((dest, index) => (
              <div key={dest.id} className="flex flex-col md:flex-row gap-3 relative bg-gray-50/50 p-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                <div className="flex-1 flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="date" 
                      value={dest.startDate}
                      onChange={(e) => handleDestinationChange(dest.id, 'startDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                      placeholder="시작일"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="date" 
                      value={dest.endDate}
                      onChange={(e) => handleDestinationChange(dest.id, 'endDate', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                      placeholder="종료일"
                    />
                  </div>
                </div>
                <div className="flex-[1.5] flex gap-2 w-full">
                  <input 
                    type="text" 
                    value={dest.location}
                    onChange={(e) => handleDestinationChange(dest.id, 'location', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                    placeholder="국가 및 도시 (예: 영국 런던)"
                  />
                  {destinations.length > 1 && (
                    <button 
                      onClick={() => handleRemoveDestination(dest.id)}
                      className="p-3 text-red-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors shrink-0"
                      aria-label="행 삭제"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={handleAddDestination}
            className="w-full py-3.5 flex items-center justify-center gap-2 text-primary font-semibold hover:bg-primary/5 rounded-xl transition border-2 border-dashed border-primary/20 hover:border-primary/40"
          >
            <Plus className="w-5 h-5" /> 행 추가
          </button>
        </div>

        {/* People Count + Travel Theme */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
               <div className="bg-primary/10 p-2 rounded-lg">
                <Users className="text-primary w-5 h-5" />
              </div> 
              인원수
            </label>
            <div className="relative">
              <select 
                value={peopleCount}
                onChange={(e) => setPeopleCount(Number(e.target.value))}
                className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none bg-gray-50/50 hover:border-primary/20 font-medium text-gray-700 transition-all cursor-pointer"
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1}명</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                ▼
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Sparkles className="text-primary w-5 h-5" />
              </div>
              여행 테마
            </label>
            <input 
              type="text" 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:border-primary/20 transition-all"
              placeholder="물놀이, 등산, 효도관광 등 자유롭게 입력하세요"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className={`w-full py-4.5 min-h-[60px] rounded-xl text-white font-bold text-xl transition-all flex items-center justify-center gap-3 shadow-xl ${
              isLoading 
                ? "bg-primary/80 cursor-wait shadow-primary/20" 
                : "bg-primary hover:bg-[#0095CC] hover:-translate-y-1 shadow-primary/30 active:scale-[0.98]"
            }`}
          >
            {isLoading ? (
              <>
                {/* Airplane animation flying sideways loop */}
                <Plane className="w-7 h-7 animate-bounce" />
                <span className="animate-pulse">AI가 최적의 리스트를 구성 중입니다...</span>
              </>
            ) : (
              "가보자!"
            )}
          </button>
        </div>
      </div>
    </main>
  );
}
