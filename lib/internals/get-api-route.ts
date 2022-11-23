import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from '../prisma';

export default async function getApiRoute(req: NextApiRequest, res: NextApiResponse, next: Function) {
    const { _path, ...query } = <{ _path: string[], [key: string]: string | string[] }>req.query

    if (_path.length === 0) {
        res.status(400).send("API id is missing")
    }

    const [apiId, ...remainingPath] = _path
    try {
        const apiRoute = await prisma.apiRoute.findUnique({
            where: {
                id: apiId,
            },
            include: {
                project: {
                    select: {
                        id: true,
                        Secret: true,
                    },
                },
            },
            rejectOnNotFound: true
        })

        req.query = query
        next({ apiRoute, path: remainingPath })
    } catch (err) {
        console.log(err)
        return res.status(400).send("Invalid endpoint")
    }
}