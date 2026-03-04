import axios from "axios";

export async function GET(req: Request) {

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  const response = await axios.get(
    `http://www.omdbapi.com/?i=${id}&apikey=1deb7156`
  );

  return Response.json(response.data);
}