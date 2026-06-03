import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Plus, X, Upload, Search, Copy, Download, Loader2, FileText, Link as LinkIcon, Sparkles } from "lucide-react";
import { analyzeApis } from "@/lib/api/analyze.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "API Harvester — Extraia specs de API para o Cursor" },
      { name: "description", content: "Cole links, arquivos ou anotações e gere um relatório técnico completo de APIs, endpoints, bibliotecas e DB pronto para colar no Cursor." },
      { property: "og:title", content: "API Harvester" },
      { property: "og:description", content: "Coleta automatizada de APIs com agentes de IA." },
    ],
  }),
  component: Index,
});

type UploadedFile = { name: string; content: string };

function Index() {
  const analyze = useServerFn(analyzeApis);
  const [urls, setUrls] = useState<string[]>([""]);
  const [notes, setNotes] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      const cleanUrls = urls.map((u) => u.trim()).filter(Boolean);
      return analyze({ data: { urls: cleanUrls, notes, files } });
    },
  });

  const updateUrl = (i: number, v: string) => {
    const next = [...urls];
    next[i] = v;
    setUrls(next);
  };
  const addUrl = () => setUrls([...urls, ""]);
  const removeUrl = (i: number) => setUrls(urls.filter((_, idx) => idx !== i));

  const onFiles = async (list: FileList | null) => {
    if (!list) return;
    const arr: UploadedFile[] = [];
    for (const f of Array.from(list).slice(0, 10)) {
      if (f.size > 1024 * 1024) continue;
      const content = await f.text();
      arr.push({ name: f.name, content });
    }
    setFiles((prev) => [...prev, ...arr].slice(0, 10));
  };

  const copyReport = () => {
    if (mutation.data?.markdown) navigator.clipboard.writeText(mutation.data.markdown);
  };
  const downloadMd = () => {
    if (!mutation.data?.markdown) return;
    const blob = new Blob([mutation.data.markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-spec-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const downloadJson = () => {
    if (!mutation.data?.structured) return;
    const blob = new Blob([JSON.stringify(mutation.data.structured, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `api-spec-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-10 bg-background/70">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/20 border border-primary/40 grid place-items-center">
            <Sparkles className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold tracking-tight">API Harvester</h1>
            <p className="text-xs text-muted-foreground">Coleta de specs de API → pronto para o Cursor</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 grid lg:grid-cols-5 gap-6">
        <section className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <LinkIcon className="size-4 text-primary" /> URLs de sistemas / docs
              </label>
              <button
                onClick={addUrl}
                className="text-xs text-primary hover:text-glow inline-flex items-center gap-1"
              >
                <Plus className="size-3" /> Adicionar
              </button>
            </div>
            <div className="space-y-2">
              {urls.map((u, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    type="url"
                    value={u}
                    onChange={(e) => updateUrl(i, e.target.value)}
                    placeholder="https://docs.exemplo.com/api"
                    className="flex-1 bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring/60"
                  />
                  {urls.length > 1 && (
                    <button
                      onClick={() => removeUrl(i)}
                      className="text-muted-foreground hover:text-destructive px-2"
                      aria-label="Remover"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <label className="text-sm font-medium mb-3 block">
              Cole textos, snippets ou múltiplas URLs (uma por linha)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Cole aqui qualquer informação adicional, ou várias URLs separadas por linha…"
              className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring/60 resize-y"
            />
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <label className="text-sm font-medium mb-3 block flex items-center gap-2">
              <FileText className="size-4 text-primary" /> Upload de arquivos (.json, .md, .txt, OpenAPI)
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-lg p-6 text-sm text-muted-foreground hover:border-primary/60 hover:text-foreground transition flex flex-col items-center gap-2"
            >
              <Upload className="size-5" />
              Clique para enviar (máx 10 arquivos, 1MB cada)
            </button>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept=".json,.yaml,.yml,.md,.txt,.openapi"
              className="hidden"
              onChange={(e) => onFiles(e.target.files)}
            />
            {files.length > 0 && (
              <ul className="mt-3 space-y-1">
                {files.map((f, i) => (
                  <li key={i} className="flex items-center justify-between bg-surface-2 px-3 py-1.5 rounded text-xs">
                    <span className="truncate">{f.name}</span>
                    <button
                      onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="size-3" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
            className="w-full bg-primary text-primary-foreground font-medium rounded-lg py-3 inline-flex items-center justify-center gap-2 hover:bg-glow transition disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_30px_-8px_var(--glow)]"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Coletando…
              </>
            ) : (
              <>
                <Search className="size-4" /> Search API
              </>
            )}
          </button>
        </section>

        <section className="lg:col-span-3">
          <div className="bg-card border border-border rounded-xl min-h-[600px] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border">
              <h2 className="text-sm font-medium">Relatório técnico</h2>
              {mutation.data && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-xs text-muted-foreground mr-2">
                    {mutation.data.sourcesCount} fontes
                    {mutation.data.openApiCount > 0 && ` · ${mutation.data.openApiCount} OpenAPI`}
                  </span>
                  <button
                    onClick={copyReport}
                    className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface-2 hover:bg-secondary border border-border"
                  >
                    <Copy className="size-3" /> Copiar MD
                  </button>
                  <button
                    onClick={downloadMd}
                    className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-surface-2 hover:bg-secondary border border-border"
                  >
                    <Download className="size-3" /> .md
                  </button>
                  <button
                    onClick={downloadJson}
                    className="text-xs inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-glow"
                  >
                    <Download className="size-3" /> .json p/ Cursor
                  </button>
                </div>
              )}
            </div>

            <div className="p-6 flex-1 overflow-auto">
              {mutation.isPending && (
                <div className="h-full grid place-items-center text-muted-foreground text-sm">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <p>Agentes coletando endpoints, libs, schemas e DB…</p>
                  </div>
                </div>
              )}
              {mutation.isError && (
                <div className="text-destructive text-sm bg-destructive/10 border border-destructive/30 rounded-md p-4">
                  {(mutation.error as Error).message}
                </div>
              )}
              {!mutation.data && !mutation.isPending && !mutation.isError && (
                <div className="h-full grid place-items-center text-center text-muted-foreground text-sm">
                  <div className="max-w-sm space-y-2">
                    <Sparkles className="size-8 mx-auto text-primary/60" />
                    <p>Adicione URLs, anotações ou arquivos e clique em <strong className="text-foreground">Search API</strong>.</p>
                    <p className="text-xs">O resultado será um Markdown estruturado pronto para colar no Cursor.</p>
                  </div>
                </div>
              )}
              {mutation.data && (
                <article className="prose-report">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{mutation.data.markdown}</ReactMarkdown>
                </article>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
