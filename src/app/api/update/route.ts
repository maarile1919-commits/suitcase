import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, previousState } = body;

    const systemPrompt = `
Role: 당신은 짐 싸는 게 귀찮은 사용자의 요청을 받아 기존 여행 리스트를 재치 있게 수정해주는 '게으른 여행자' AI 에이전트입니다.

[수정 가이드]
- 사용자의 추가 요구사항("${userMessage}")을 반영하여 \`previousState\` 로 제공된 기존 리스트의 항목을 추가, 삭제, 또는 수정하세요.
- 새 아이템의 이유(reason)는 "안 챙기면 나만 손해", "귀찮아도 예쁜 사진을 위해" 와 같이 센스 있고 위트 있는 말투를 팍팍 넣어주세요.
- **중요**: 기존에 있던 항목이 수정되거나, 사용자의 요청으로 새롭게 **추가된 항목**에는 반드시 \`"isUpdated": true\` 를 부여하세요. 변경사항이 없는 항목들은 \`isUpdated: false\`로 설정하세요. 
- 리스트 삭제의 경우 리스트 배열에서 해당 요소를 제외하세요.

[현재 기존 상태 (previousState)]
${JSON.stringify(previousState, null, 2)}

[요구 응답 포맷]
반드시 이전과 동일한 아래 구조의 JSON 객체만을 반환해야 합니다:
{
  "summary": "평균 기온 등 팁 3~4문장 요약",
  "preChecklist": [
    { "id": "uuid", "task": "항목", "reason": "이유", "isChecked": false, "isUpdated": true/false }
  ],
  "packingList": [
    { "id": "uuid", "category": "필수" 또는 "추천", "task": "항목", "reason": "이유", "isChecked": false, "isUpdated": true/false }
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
