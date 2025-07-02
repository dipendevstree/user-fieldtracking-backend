import { Response } from 'express';
export declare const error: (languageCode: string, res: any, message: string, statusCode?: number, data?: any) => any;
export declare const success: (languageCode: string, res: any, message: string, statusCode?: number, data?: any) => any;
export declare const customSuccess: (res: Response, response: any) => Response<any, Record<string, any>>;
export declare const customResponse: (languageCode: string, res: any, message: string, statusCode?: number, data?: any) => any;
export declare const paginationResponse: (languageCode: string, res: any, message: string, statusCode?: number, data?: any) => any;
export declare const CustomError: (languageCode: string, res: any, code: string, statusCode: number, data: any, message: string) => any;
export declare const notFound: (languageCode: string, res: any, code: string, statusCode?: number) => any;
export declare const unAuthentication: (languageCode: string, res: any, message: string, statusCode?: number, data?: any) => any;
