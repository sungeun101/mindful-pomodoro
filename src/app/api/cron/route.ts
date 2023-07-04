// export async function GET(request) {
//   return new Response("Hello world!", {
//     status: 200,
//   });
// }

import { NextApiRequest, NextApiResponse } from "next";
import handleScheduledTask from "./handleScheduledTask";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  await handleScheduledTask(req, res);
};

export default handler;
