export interface UploadedFile {
  name: string;
  size: number;
  url: string;
  path: string;
  uploadedAt: string;
  isCloud: boolean;
}

export type AgentIntegration =
  | {
      type: "files";
      name: string;
      files: UploadedFile[];
      createdAt: string;
    }
  | {
      type: "webhook";
      name: string;
      url: string;
      description?: string;
      fields?: Array<{ key: string; value: string }>;
      createdAt: string;
    }
  | {
      type: "calendly";
      name: string;
      url?: string;
      description?: string;
      apiKey?: string;
      createdAt: string;
    };