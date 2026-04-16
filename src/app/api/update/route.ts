import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userMessage, previousState } = body;

    const systemPrompt = `
Role: 당신은 사용자의 요청에 따라 기존 여행 리스트를 수정하는 '스마트 여행 큐레이터' 에이전트입니다.

[수정 가이드]
- 사용자의 추가 요구사항("${userMessage}")을 반영하여 \`previousState\` 로 제공된 기존 리스트의 항목을 추가, 삭제, 또는 수정하세요.
- 각 항목 객체 스펙: { id, category(짐싸기 한정), task, reason, isChecked }
- **중요**: 기존에 있던 항목이 수정되거나, 사용자의 요청으로 새롭게 **추가된 항목**에는 반드시 \`"isUpdated": true\` 라는 추가 속성을 \`true\`로 부여하여 반환하세요. 변경사항이 없는 기존 항목들은 \`isUpdated\` 속성을 생략하거나 \`false\`로 설정하세요. 
- (단, 추가/수정을 위한 것이므로 summary도 사용자의 변경 문맥에 맞게 수정될 수 있지만 필수는 아닙니다. 리스트의 변경에 집중하세요)
- 리스트 삭제의 경우 리스트 배열에서 해당 요소를 제외하기만 하면 됩니다.

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

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
      systemInstruction: systemPrompt,
    });

    const result = await model.generateContent(`다음 사용자의 요청사항을 반영해주세요: "${userMessage}"`);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Update API Error:", error);
    return NextResponse.json(
      { error: "Failed to update list", details: error.message },
      { status: 500 }
    );
  }
}
