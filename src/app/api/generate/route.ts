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
Role: 당신은 전 세계 기후, 문화, 최신 여행 트렌드에 정통한 '스마트 여행 큐레이터'입니다.
Input: 
- 목적지 및 일정: ${destinationsContext}
- 인원수: ${peopleCount}명
- 특별 키워드(테마): ${theme || "없음"}

[분석 및 출력 가이드]
입력받은 정보를 바탕으로 반드시 아래 3가지 섹션으로 구분하여 응답하세요:

1. 여행지 AI 요약:
  - 목적지의 일정 기간 평균 기온, 강수 확률, 전압(플러그 타입), 현지 치안 및 분위기를 3~4문장으로 요약.

2. 사전 체크 리스트:
  - 행정(비자, 서류), 금융(환전 팁, 카드 추천), 디지털(필수 앱, eSIM) 관련 항목들.
  - 구성: [항목명, 해당 항목이 필요한 이유]

3. 짐싸기 리스트:
  - 3-1) 필수 리스트: 여권, 전자기기, 상비약, 날씨에 맞는 필수 의류 등.
  - 3-2) 있으면 좋은 추천: 테마(키워드)를 반영하여 여행의 질을 높여줄 아이템.
  - 구성: [항목명, 이유 또는 AI만의 실용적인 Tip]

[응답 형식]
- 각 리스트 항목은 UI에서 파싱할 수 있도록 아래 JSON 배열 형태를 반드시 유지할 것.
- 말투는 친절하고 전문적인 톤을 유지할 것.

반드시 다음 JSON 스키마를 준수하여 응답하세요 (다른 어떠한 설명이나 Markdown 블록 없이 JSON만 반환할 것):
{
  "summary": "평균 기온, 강수 확률, 전압, 치안 등을 포함한 종합적인 3~4문장 요약",
  "preChecklist": [
    { "id": "uuid/unique_string", "task": "항목명", "reason": "해당 항목이 필요한 이유", "isChecked": false }
  ],
  "packingList": [
    { "id": "uuid/unique_string", "category": "필수" /* 또는 "추천" */, "task": "항목명", "reason": "이유 또는 AI만의 실용적인 Tip", "isChecked": false }
  ]
}
`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
