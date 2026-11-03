export { };

declare global {
    interface Window {
        desktop: {
            platform: string;
            onSessionChanged?: (callback: (restart: boolean) => void) => () => void;
            openPage?: (route: string) => Promise<void>;

            exportStatementPdf: (
                options: {
                    defaultFileName:
                    string;
                },
            ) => Promise<{
                success: boolean;

                canceled?: boolean;

                filePath?: string;

                error?: string;
            }>;
        };
    }
}