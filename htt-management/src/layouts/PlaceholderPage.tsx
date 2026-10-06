import { Card, CardContent } from "../components/ui/Card";

interface PlaceholderPageProps {
    title: string;
}

export function PlaceholderPage({
    title,
}: PlaceholderPageProps) {
    return (
        <div>
            <div className="mb-6">
                <h1 className="font-display text-3xl">
                    {title}
                </h1>

                <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
                    This module will be implemented in the next development phase.
                </p>
            </div>

            <Card>
                <CardContent className="flex min-h-[320px] items-center justify-center">
                    <div className="text-center">
                        <div className="font-display text-2xl">
                            {title}
                        </div>

                        <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                            Module coming soon
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}