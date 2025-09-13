// Types for Cloudflare Tech Detection API

export interface CloudflareTechnology {
  app: string;
  confidenceTotal: number;
  categories?: Array<{ name: string }>;
}

export interface CloudflareScanResult {
  task?: {
    uuid?: string;
    time?: string;
    url?: string;
    domain?: string;
    success?: boolean;
  };
  page?: {
    url?: string;
    domain?: string;
  };
  meta?: {
    processors?: {
      wappa?: {
        data?: CloudflareTechnology[];
      };
    };
  };
}

export interface CloudflareSearchResult {
  task: {
    uuid: string;
    time: string;
    url: string;
    domain: string;
  };
  result: string;
  meta?: {
    processors?: {
      wappa?: {
        data?: CloudflareTechnology[];
      };
    };
  };
}

export interface CloudflareSearchResponse {
  results: CloudflareSearchResult[];
}

export interface CloudflareSubmitResponse {
  uuid?: string;
  result?: {
    tasks: Array<{
      uuid: string;
    }>;
  };
}
