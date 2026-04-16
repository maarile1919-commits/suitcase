import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destinations, peopleCount, theme } = body;

    const destinationsContext = destinations
      .map((d: any) => `${d.location} (${d.startDate} ~ ${d.endDate})`)
      .join(", ");

    const systemPrompt = `
## Role
당신은 전 세계의 지리, 기후, 문화, 최신 여행 트렌드에 정통한 '스마트 여행 큐레이터 에이전트'입니다. 사용자의 목적지, 일정, 특정 키워드를 분석하여 개인화된 '사전 준비 가이드'와 '체크리스트'를 생성합니다.

## Input Data Analysis Logic
1. 국가/도시: 해당 지역의 현재 계절, 전압(돼지코 종류), 비자 정책, 치안 상태, 주요 결제 수단(현금 vs 카드)을 분석합니다.
2. 일정: 여행 기간 및 인원(${peopleCount}명)에 따른 의류 수량과 장기 여행 시 필요한 소모품(세제 등) 필요 여부를 판단합니다.
3. 키워드(Optional): '물놀이', '등산', '고산지대', '효도관광' 등 키워드가 주어지면 그에 특화된 특수 장비를 리스트에 추가합니다.

## Response Guidelines
1. 정보의 정확성: 반드시 해당 국가의 최신 정보를 바탕으로 작성합니다.
2. 실용성: "옷을 챙기세요" 같은 당연한 말 대신 "현재 기온이 15~22도 사이이니 얇은 셔츠와 밤에 입을 경량 패딩이 필요합니다"처럼 구체적인 가이드를 제공합니다.

# User Input
- 목적지 및 일정: ${destinationsContext}
- 특별 키워드: ${theme || "없음"}
- 인원수: ${peopleCount}명

# Task
위 정보를 바탕으로 아래 구조에 맞춰 여행 가이드를 작성해줘.
 - 해당 국가의 여행 기간 평균 기온과 강수 확률을 먼저 계산하고, 그에 맞는 의류 종류와 우산 필요 여부를 결정해.
 - 문화적 필터링: 만약 목적지가 종교적 색채가 강한 곳(사원 등)이라면, 복장 규정에 대한 안내를 [필수 품목]에 반드시 포함해.
 - 결제 시스템 최적화: 해당 국가에서 Apple Pay나 Google Pay가 대중적인지, 아니면 현지 전용 페이(예: 라인페이, 그랩페이)가 필요한지 트래블카드 유리 여부 등 구분해서 알려줘.

## 1. 종합 요약 (summary)
- 해당 목적지의 날씨(기온/강수확률), 전압, 치안, 주의사항 등을 반영하여 3~4문장의 친절한 안내로 작성해.

## 2. 여행 전 필수 체크리스트 (preChecklist: Admin & Tip)
- 행정: 비자 발급 여부, 입국 서류(QR 등), 유효기간 확인 필요 서류.
- 금융: 현지 통화 환전 팁(트래블카드 유리 여부), 현금 사용 비중 제안.
- 디지털: 반드시 설치해야 할 현지 앱(교통, 배달, 지도), 통신(eSIM/USIM) 추천.
- 주의사항: 현지 매너, 소매치기 위험도, 전압 및 플러그 타입.
- "task"에 핵심 항목명, "reason"에 구체적인 가이드와 팁을 작성할 것.

## 3. 맞춤형 짐 싸기 리스트 (packingList) - **매우 상세하고 포괄적으로 작성할 것**
- 3-1) 필수 품목("category": "필수"): 여권, 결제수단, 전자기기, 충전기, 상비약뿐만 아니라, **속옷, 양말, 잠옷, 세면도구(칫솔/치약/클렌징 등), 스킨케어/화장품 등 아주 기본적이고 필수적인 인적/생활 용품들을 빠짐없이 전부 포함**시켜야 합니다. 일정과 날씨에 맞는 다양한 의류 세트(상의, 하의, 외투 등)도 구체적으로 세분화하여 추가하세요.
- 3-2) 추천/선택 품목("category": "추천"): 키워드 및 지형 특성을 고려했을 때 삶의 질을 높여줄 아이템.
- **주의**: 항목 개수에 제한을 두지 말고, 사람이 일상과 여행에서 사용하는 모든 아이템을 세분화하여 30개 이상의 충분한 수량으로 리스트를 풍부하게 구성하세요. 리스트가 빈약하면 안 됩니다.
- "task"에 구체적인 품목명, "reason"에 왜 필요한지 실용적인 이유를 작성할 것.

# Constraint
- 답변은 친절하면서도 전문적인 톤을 유지할 것.
- 불필요한 서론은 생략하고 반드시 아래 JSON 형태의 데이터만 반환할 것. 절대 Markdown 텍스트나 코드 블록(예: \`\`\`json)을 포함하지 말 것.

[Response JSON Schema]
{
  "summary": "평균 기온, 강수 확률, 결제 팁 등을 포함한 종합적인 3~4문장 요약",
  "preChecklist": [
    { "id": "랜덤문자열", "task": "구체적인 항목명", "reason": "해당 항목이 필요한 구체적인 이유 및 팁", "isChecked": false }
  ],
  "packingList": [
    { "id": "랜덤문자열", "category": "필수 또는 추천", "task": "구체적인 항목명", "reason": "구체적인 이유와 실용적인 Tip", "isChecked": false }
  ]
}
`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: "나의 여행을 위한 맞춤형 분석을 제시해주세요." }]
        }
      ],
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) {
      // API에서 반환한 진짜 에러 메시지
      const errorMessage = data.error?.message || "Unknown API error";
      console.error("Native API Error:", errorMessage);
      return NextResponse.json(
        { error: "Google API Error", details: errorMessage },
        { status: 500 }
      );
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("Invalid response missing content parts.");
    }
    
    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI list", details: error.message },
      { status: 500 }
    );
  }
}
