import { Response } from "express";

export const throwInternalServerError = (res: Response, error: any) => {
    console.log(error);
    return res.status(500).json({ok: false, message:'Internal Server Error'});
}