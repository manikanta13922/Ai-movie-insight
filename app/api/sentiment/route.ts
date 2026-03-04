import { analyzeSentiment } from "@/lib/sentiment";

export async function POST(req: Request) {

  const body = await req.json();

  const reviews = body.reviews;

  const result = analyzeSentiment(reviews);

  return Response.json(result);
}