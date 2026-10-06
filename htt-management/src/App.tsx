import {
  ArrowRight,
  Check,
  Download,
  Plus,
  Search,
} from "lucide-react";

import { Badge } from "./components/ui/Badge";
import { Button } from "./components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
} from "./components/ui/Card";
import { Input } from "./components/ui/Input";

function App() {
  return (
    <main className="min-h-screen bg-[var(--color-background)] p-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary)] text-sm font-semibold text-white">
              HT
            </div>

            <span className="text-xs font-semibold tracking-[0.16em] text-[var(--color-primary)]">
              HTT MANAGEMENT
            </span>
          </div>

          <h1 className="font-display text-4xl text-[var(--color-text-primary)]">
            Design System
          </h1>

          <p className="mt-2 text-[var(--color-text-secondary)]">
            Foundation components for the HTT management
            and accounting platform.
          </p>
        </header>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl">
                Brand colours
              </h2>
            </CardHeader>

            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <Colour
                  name="Forest"
                  value="#12352D"
                  background="#12352D"
                  light
                />

                <Colour
                  name="Copper"
                  value="#B96D3A"
                  background="#B96D3A"
                  light
                />

                <Colour
                  name="Warm White"
                  value="#F4F1EB"
                  background="#F4F1EB"
                />

                <Colour
                  name="Ink"
                  value="#20231F"
                  background="#20231F"
                  light
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl">
                Buttons
              </h2>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-3">
              <Button>
                <Plus size={16} />
                Create invoice
              </Button>

              <Button variant="accent">
                Record payment
                <ArrowRight size={16} />
              </Button>

              <Button variant="secondary">
                <Download size={16} />
                Export
              </Button>

              <Button variant="ghost">
                Cancel
              </Button>

              <Button variant="danger">
                Delete
              </Button>

              <Button disabled>
                Disabled
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl">
                Status
              </h2>
            </CardHeader>

            <CardContent className="flex gap-3">
              <Badge>Draft</Badge>
              <Badge variant="success">Paid</Badge>
              <Badge variant="warning">Pending</Badge>
              <Badge variant="danger">Overdue</Badge>
              <Badge variant="info">Sent</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl">
                Form controls
              </h2>
            </CardHeader>

            <CardContent>
              <div className="max-w-md space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Customer
                  </label>

                  <Input placeholder="Search customer..." />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Invoice number
                  </label>

                  <Input value="INV-10241" readOnly />
                </div>

                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
                  />

                  <Input
                    className="pl-9"
                    placeholder="Search products, invoices or customers..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
                <Check size={18} />
              </div>

              <div>
                <div className="font-medium">
                  Design foundation ready
                </div>

                <div className="text-sm text-[var(--color-text-secondary)]">
                  Electron + React + TypeScript + Tailwind
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

interface ColourProps {
  name: string;
  value: string;
  background: string;
  light?: boolean;
}

function Colour({
  name,
  value,
  background,
  light,
}: ColourProps) {
  return (
    <div
      className="flex h-28 flex-col justify-end rounded-xl p-4"
      style={{
        background,
        color: light ? "#ffffff" : "#20231f",
        border:
          background === "#F4F1EB"
            ? "1px solid #ddd7cd"
            : undefined,
      }}
    >
      <strong>{name}</strong>

      <span className="mt-1 text-xs opacity-70">
        {value}
      </span>
    </div>
  );
}

export default App;