import { NextResponse } from "next/server";

export async function GET(request) {
  var url = new URL(request.url);
  var limit = url.searchParams.get("limit") || "10";

  try {
    var apiUrl = "https://api.openai.com/v1/chat/completions?limit=" + limit;

    var res = await fetch(apiUrl, {
      headers: {
        "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
      },
    });

    var data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
