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
    status?: string; // e.g., "Queued", "InProgress", "Finished"
    errors?: Array<{
      name: string;
      message: string;
      detail?: string;
      code?: number;
    }>;
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
    status?: string;
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
  visibility?: string;
  result?: {
    tasks: Array<{
      uuid: string;
    }>;
  };
}
