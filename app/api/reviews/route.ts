import axios from "axios";
import * as cheerio from "cheerio";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const url = `https://www.imdb.com/title/${id}/reviews`;

  const { data } = await axios.get(url);

  const $ = cheerio.load(data);

  const reviews: string[] = [];

  $(".text.show-more__control").each((i, el) => {
    reviews.push($(el).text());
  });

  return Response.json(reviews.slice(0,10));
}