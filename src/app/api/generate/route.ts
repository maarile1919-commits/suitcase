import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { destinations, peopleCount, theme } = body;

    // Build the context string from destinations array
    const destinationsContext = destinations
      .map((d: any) => `${d.location} (${d.startDate} ~ ${d.endDate})`)
      .join(", ");

    const systemPrompt = `
Role: 당신은 전 세계 기후, 문화, 최신 여행 트렌드에 정통한 '스마트 여행 큐레이터'입니다.
Input: 
- 목적지 및 일정: ${destinationsContext}
- 인원수: ${peopleCount}명
- 특별 키워드(테마): ${theme || "없음"}

분석 및 출력 가이드:
1. 기상/의류: 지정된 일정 기간의 목적지 평균 기온과 강수 확률을 분석하여 "옷" 대신 "15도 내외 일교차에 대비한 가디건과 경량패딩"처럼 구체적으로 제안할 것.
2. 행정/디지털: 해당 국가의 비자(K-ETA, ESTA 등), 전압(돼지코 타입), 반드시 설치해야 할 현지 앱(교통, 지도, 결제)을 명시할 것.
3. 금융: 현지에서 트래블로그/월렛 사용이 유리한지, Apple Pay/Google Pay 도입 현황, 현금 비중(%)을 추천할 것.
4. 짐싸기 리스트: [필수]와 [추천]으로 구분하고, 사용자의 특별 키워드가 '물놀이'라면 스노클링 장비나 방수팩을, '고산지대'라면 고산병 약을 리스트에 반드시 포함할 것.
5. 말투: 친절하고 전문적인 톤으로 작성할 것.

반드시 다음 JSON 스키마를 준수하여 응답하세요 (다른 어떠한 설명이나 Markdown 블록 없이 JSON만 반환할 것):
{
  "summary": {
    "weather": "기상 및 의류 팁 한 줄 요약",
    "admin": "행정 및 디지털 팁 한 줄 요약",
    "finance": "금융 팁 한 줄 요약"
  },
  "preChecklist": [
    { "id": "uuid/unique_string", "category": "행정/디지털", "task": "할 일 항목", "reason": "추천 이유", "isChecked": false }
  ],
  "packingList": [
    { "id": "uuid/unique_string", "category": "필수 또는 추천", "task": "챙길 물건", "reason": "추천 이유", "isChecked": false }
  ]
}
`;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "API key is not configured" },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemPrompt,
    });

    // We can just send a trigger message, because all instructions are in the system prompt.
    const result = await model.generateContent("나의 여행을 위한 맞춤형 분석을 제시해주세요.");
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Generate API Error:", error);
    return NextResponse.json(
      { error: "Failed to generate AI list", details: error.message },
      { status: 500 }
    );
  }
}
