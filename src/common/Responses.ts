/** @format */
import { Context, TypedResponse } from "hono";
import { StatusCode } from "hono/utils/http-status";

export interface IPaging {
   page: number;
   limit: number;
   total?: number;
}

export interface ICustomResponse {
   status: number;
   message: string;
   data: any;
   paging?: IPaging;
}

export function CustomResponse(c: Context, status: StatusCode, message: string, data: any = undefined, paging: IPaging | undefined = undefined) {
   return c.json(
      {
         status,
         message,
         data,
         paging,
      },
      status
   );
}

export function OKResponse(c: Context) {
   return CustomResponse(c, 200, "OK");
}

export function MessageResponse(c: Context, message: string) {
   return CustomResponse(c, 200, message);
}

export function DataResponse(c: Context, data: any, message: any, paging: IPaging | undefined = undefined) {
   return CustomResponse(c, 200, message, data, paging);
}

export function NotFoundResponse(c: Context, message = "Not found") {
   return CustomResponse(c, 404, message);
}

export function MissingFieldResponse(c: Context, message = "Missing field") {
   return CustomResponse(c, 400, message);
}

export function InvalidRequest(c: Context, message = "Invalid request") {
   return CustomResponse(c, 400, message);
}

export function ForbiddenRequest(c: Context, message = "Forbidden") {
   return CustomResponse(c, 403, message);
}

export function TooManyRequest(c: Context, message = "Too many requests") {
   return CustomResponse(c, 429, message);
}

export function InternalErrorResponse(c: Context, message = "Internal server error") {
   return CustomResponse(c, 500, message);
}

export function UnauthorizedResponse(c: Context, message = "Unauthorized") {
   return CustomResponse(c, 401, message);
}
