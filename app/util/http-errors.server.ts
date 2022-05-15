import { json } from "remix";

export const badRequest = <Data = unknown>(data: Data): Response =>
  json(data, { status: 400 });

export const unauthorized = <Data = unknown>(data: Data): Response =>
  json(data, { status: 401 });

export const forbidden = <Data = unknown>(data: Data): Response =>
  json(data, { status: 403 });

export const notFound = <Data = unknown>(data: Data): Response =>
  json(data, { status: 404 });
