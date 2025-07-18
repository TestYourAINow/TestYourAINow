export interface UploadedFile {
  name: string;
  size: number;
  url: string;
  path: string;
  uploadedAt: string; // 👈 tu avais "createdAt", mais partout ailleurs tu utilises uploadedAt
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
      type: "webhook" | "calendly";
      name: string;
      url: string;
      createdAt: string;
    };
