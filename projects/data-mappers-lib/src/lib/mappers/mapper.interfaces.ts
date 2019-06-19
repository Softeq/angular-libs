// Developed by Softeq Development Corporation
// http://www.softeq.com

export type JSONObject = any;

export interface DataMapper<ObjectView, SerializedView> {
  serialize(obj?: ObjectView): SerializedView;
  deserialize(json?: SerializedView): ObjectView;
}

export interface ETagSupport {
  etag?: string;
}

export type WithETag<T> = T & ETagSupport;
