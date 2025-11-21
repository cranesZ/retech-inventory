declare global {
  interface Window {
    api: {
      storage: {
        read: (key: string) => Promise<any>;
        write: (key: string, data: any) => Promise<boolean>;
        delete: (key: string) => Promise<boolean>;
      };
      dialog: {
        openFile: (options: any) => Promise<any>;
      };
      system: {
        getAppPath: () => Promise<string>;
      };
    };
  }
}

export {};
