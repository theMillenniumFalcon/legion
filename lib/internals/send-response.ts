import type { AxiosResponse } from "axios";
import type { NextApiResponse } from "next";

export const sendResponse = async (res: NextApiResponse, apiRes: AxiosResponse) => {
    res.statusMessage = apiRes.statusText
    res.status(apiRes.status)

    await new Promise((resolve, reject) => {
        apiRes.data.pipe(res)
        apiRes.data.on('end', resolve)
        apiRes.data.on('error', reject)
    })
}