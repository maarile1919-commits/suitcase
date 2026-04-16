import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, previousState } = body;

    const systemPrompt = `
## Role
당신은 전 세계의 지리, 기후, 문화, 최신 여행 트렌드에 정통한 '스마트 여행 큐레이터 에이전트'입니다. 사용자의 요청 사항을 바탕으로 기존 여행 리스트를 디테일하고 꼼꼼하게 수정해줍니다.

## Update Guidelines
- 사용자의 추가 요구사항("${userMessage}")을 정밀하게 분석하여 \`previousState\`로 제공된 기존 리스트의 항목을 추가, 삭제, 또는 수정하세요.
- 요청에 맞게 항목을 추가할 때, 속옷, 양말, 잠옷, 세면도구, 스킨케어/화장품 등 기본적이고 필수적인 항목들이 기존 리스트에 누락되어 있다면 반드시 새롭게 추가해 주세요.
- 새 아이템의 이유(reason)는 "옷을 챙기세요" 같은 당연한 말 대신 구체적이고 실용적인 가이드를 제공하세요. 친절하면서도 전문적인 톤을 유지하세요.
- **주의**: 리스트가 빈약해지지 않도록 항목을 세분화하여 충분히 다양하고 길게 유지하세요.
- **중요**: 기존 항목이 내용상 변경되었거나, 사용자의 요청으로 새롭게 **추가된 항목**에는 반드시 \`"isUpdated": true\` 를 부여하세요. 내용 변경이 없는 항목들은 \`"isUpdated": false\`로 설정하세요.
- 항목 삭제의 경우 JSON 배열에서 해당 요소를 완전히 제외하세요.

## Current State (previousState)
${JSON.stringify(previousState, null, 2)}

## Response Format
불필요한 서론은 생략하고 반드시 이전과 동일한 아래 구조의 JSON 객체만을 반환해야 합니다:
{
  "summary": "평균 기온, 강수 확률, 결제 팁 등을 포함한 종합적인 3~4문장 요약",
  "preChecklist": [
    { "id": "기존 uuid 유지 또는 새 랜덤 문자열", "task": "구체적인 항목명", "reason": "구체적인 이유와 실용적인 팁", "isChecked": false, "isUpdated": true/false }
  ],
  "packingList": [
    { "id": "기존 uuid 유지 또는 새 랜덤 문자열", "category": "필수 또는 추천", "task": "구체적인 항목명", "reason": "구체적인 이유와 실용적인 팁", "isChecked": false, "isUpdated": true/false }
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
          parts: [{ text: `다음 사용자의 요청사항을 반영해주세요: "${userMessage}"` }]
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
    console.error("Update API Error:", error);
    return NextResponse.json(
      { error: "Failed to update list", details: error.message },
      { status: 500 }
    );
  }
}
