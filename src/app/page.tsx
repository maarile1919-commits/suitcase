"use client";

import { useState } from "react";
import { Plus, X, Plane, MapPin, Users, Sparkles, AlertCircle, Sun, CreditCard, FileCheck, CheckCircle2, Circle } from "lucide-react";

export default function Home() {
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  // States for form
  const [destinations, setDestinations] = useState([
    { id: 1, startDate: "", endDate: "", location: "" }
  ]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [theme, setTheme] = useState("");

  // States for AI Result
  const [resultData, setResultData] = useState<any>(null);
  const [localPreChecklist, setLocalPreChecklist] = useState<any[]>([]);
  const [localPackingList, setLocalPackingList] = useState<any[]>([]);

  const handleAddDestination = () => {
    const last = destinations[destinations.length - 1];
    setDestinations([
      ...destinations,
      { 
        id: Date.now(), 
        startDate: last ? last.startDate : "", 
        endDate: last ? last.endDate : "", 
        location: last ? last.location : "" 
      }
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

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destinations, peopleCount, theme })
      });
      const data = await response.json();
      
      if (response.ok) {
        setResultData(data);
        setLocalPreChecklist(data.preChecklist || []);
        setLocalPackingList(data.packingList || []);
        setStep(2);
      } else {
        alert("분석 중 오류가 발생했습니다: " + (data.error || "알 수 없는 오류"));
      }
    } catch (e) {
      alert("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCheck = (id: string, listType: 'pre' | 'pack') => {
    if (listType === 'pre') {
      setLocalPreChecklist(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
    } else {
      setLocalPackingList(prev => prev.map(item => item.id === id ? { ...item, isChecked: !item.isChecked } : item));
    }
  };

  if (step === 2 && resultData) {
    const destinationsContext = destinations.map(d => d.location).join(" → ");
    
    return (
      <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
        <header className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-primary flex items-center gap-2">
            PackWise <Plane className="w-8 h-8 -rotate-45" />
          </h1>
          <button 
             onClick={() => setStep(1)}
             className="px-4 py-2 bg-white border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition text-sm shadow-sm"
           >
             여행 정보 수정
           </button>
        </header>

        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Banner */}
          <div className="bg-gradient-to-r from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
               <Plane className="w-32 h-32" />
             </div>
             <p className="text-primary-100 font-medium mb-1">AI 맞춤형 여행 준비 완료</p>
             <h2 className="text-2xl md:text-3xl font-bold mb-3">{destinationsContext} 여행을 준비해볼까요?</h2>
             <div className="flex flex-wrap gap-4 text-sm font-medium bg-white/10 p-3 rounded-xl inline-flex backdrop-blur-sm shadow-sm">
               <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {peopleCount}명</span>
               {theme && <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> 테마: {theme}</span>}
             </div>
          </div>

          {/* AI Summary Section */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-md transition">
             <div className="flex items-center gap-2 mb-4 text-primary font-bold text-xl">
               <div className="bg-primary/10 p-2 rounded-lg"><Sparkles className="w-5 h-5" /></div> 여행지 AI 요약
             </div>
             <p className="text-gray-700 text-base leading-relaxed whitespace-pre-wrap">{resultData.summary}</p>
          </div>

          {/* Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
             {/* Pre-Checklist */}
             <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
               <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                   <AlertCircle className="w-5 h-5 text-primary" /> 사전 체크 리스트
                 </h3>
               </div>
               <div className="p-4 space-y-2 flex-1">
                 {localPreChecklist.map((item) => (
                   <div 
                     key={item.id} 
                     onClick={() => toggleCheck(item.id, 'pre')}
                     className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${item.isChecked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50/80'}`}
                   >
                     <div className="mt-0.5 shrink-0 transition-transform active:scale-95">
                       {item.isChecked ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-gray-300" />}
                     </div>
                     <div>
                       <p className={`font-semibold transition-all ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.task}</p>
                       <p className={`text-xs font-medium mt-1 inline-block px-2 py-0.5 rounded transition-all ${item.isChecked ? 'bg-gray-100 text-gray-400' : 'bg-primary/5 text-primary/80'}`}>{item.reason}</p>
                     </div>
                   </div>
                 ))}
                 {localPreChecklist.length === 0 && <p className="text-gray-400 text-sm text-center py-4">항목이 없습니다.</p>}
               </div>
             </div>

             {/* Packing List */}
             <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden flex flex-col">
               <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                 <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                   <div className="bg-primary text-white text-xs px-2 py-0.5 rounded-full ml-1">AI 권장</div> 짐싸기 리스트
                 </h3>
               </div>
               <div className="p-4 space-y-6 flex-1 max-h-[800px] overflow-y-auto">
                 
                 {/* 필수 품목 */}
                 <div>
                   <h4 className="text-sm font-bold text-gray-500 mb-3 ml-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> 필수 리스트
                   </h4>
                   <div className="space-y-2">
                     {localPackingList.filter(i => i.category === '필수').map((item) => (
                       <div 
                         key={item.id} 
                         onClick={() => toggleCheck(item.id, 'pack')}
                         className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${item.isChecked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50/80'}`}
                       >
                         <div className="mt-0.5 shrink-0 transition-transform active:scale-95">
                           {item.isChecked ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-gray-300" />}
                         </div>
                         <div className="w-full">
                           <p className={`font-semibold text-sm transition-all ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.task}</p>
                           <p className={`text-xs font-medium mt-1.5 inline-block px-2 py-0.5 rounded break-keep transition-all ${item.isChecked ? 'bg-gray-100 text-gray-400' : 'bg-primary/5 text-primary/80'}`}>{item.reason}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

                 {/* 추천 품목 */}
                 <div>
                   <h4 className="text-sm font-bold text-gray-500 mb-3 ml-2 flex items-center gap-2">
                     <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span> 있으면 좋은 추천
                   </h4>
                   <div className="space-y-2">
                     {localPackingList.filter(i => i.category !== '필수').map((item) => (
                       <div 
                         key={item.id} 
                         onClick={() => toggleCheck(item.id, 'pack')}
                         className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-colors ${item.isChecked ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50/80'}`}
                       >
                         <div className="mt-0.5 shrink-0 transition-transform active:scale-95">
                           {item.isChecked ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-gray-300" />}
                         </div>
                         <div className="w-full">
                           <p className={`font-semibold text-sm transition-all ${item.isChecked ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.task}</p>
                           <p className={`text-xs font-medium mt-1.5 inline-block px-2 py-0.5 rounded break-keep transition-all ${item.isChecked ? 'bg-gray-100 text-gray-400' : 'bg-primary/5 text-primary/80'}`}>{item.reason}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>

               </div>
             </div>
          </div>
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
