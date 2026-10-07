export { };

declare global {
    interface Window {
        desktop: {
            platform: string;

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