import React, { useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  RotateCcw,
  Eye,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  type EntityType,
  type BulkUploadResult,
  ENTITY_COLUMNS,
  getEntityLabel,
  useBulkUpload,
} from "@/services/bulkUpload";

const ENTITY_OPTIONS: { value: EntityType; label: string }[] = [
  { value: "departments", label: "Departments" },
  { value: "competencies", label: "Competencies" },
  { value: "roles", label: "Roles" },
  { value: "employees", label: "Employees" },
];

const ACCEPTED_EXTENSIONS = [".xlsx", ".csv"];
const MAX_FILE_SIZE_MB = 10;

function getFileExtension(name: string): string {
  return name.slice(name.lastIndexOf(".")).toLowerCase();
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const StepIndicator: React.FC<{ step: number; label: string; done?: boolean; active?: boolean }> = ({
  step,
  label,
  done,
  active,
}) => (
  <div className="flex items-center gap-2">
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold",
        done
          ? "bg-success text-success-foreground"
          : active
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground"
      )}
    >
      {done ? <CheckCircle2 className="h-4 w-4" /> : step}
    </span>
    <span className={cn("text-sm font-medium", active ? "text-foreground" : "text-muted-foreground")}>
      {label}
    </span>
  </div>
);

export default function BulkUploadPage() {
  const [searchParams] = useSearchParams();
  const initialEntity = (searchParams.get("entity") as EntityType) || null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [entity, setEntity] = useState<EntityType | "">(initialEntity || "");
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [showFormatHelp, setShowFormatHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useBulkUpload();

  const reset = () => {
    setStep(1);
    setEntity(initialEntity || "");
    setFile(null);
    setResult(null);
    setShowFormatHelp(false);
    uploadMutation.reset();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const ext = getFileExtension(selected.name);
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      toast.error("Invalid file type", { description: "Please select an .xlsx or .csv file" });
      return;
    }
    if (selected.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      toast.error("File too large", { description: `Maximum size is ${MAX_FILE_SIZE_MB} MB` });
      return;
    }
    setFile(selected);
  };

  const handleValidate = async () => {
    if (!entity || !file) return;
    try {
      const res = await uploadMutation.mutateAsync({ entity, file, dryRun: true });
      setResult(res);
      setStep(2);
      if (res.error_count === 0) {
        toast.success("Validation passed", { description: `${res.success_count} rows ready to import` });
      } else {
        toast.warning("Validation found errors", { description: `${res.error_count} row(s) need fixing` });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error("Validation failed", { description: msg });
    }
  };

  const handleImport = async () => {
    if (!entity || !file) return;
    try {
      const res = await uploadMutation.mutateAsync({ entity, file, dryRun: false });
      setResult(res);
      setStep(3);
      toast.success("Import complete", { description: `${res.created_ids.length} ${getEntityLabel(entity as EntityType).toLowerCase()}(s) created` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast.error("Import failed", { description: msg });
    }
  };

  const columns = entity ? ENTITY_COLUMNS[entity as EntityType] : null;
  const hasResult = !!result;
  const hasErrors = (result?.error_count ?? 0) > 0;

  return (
    <AppLayout>
      <PageHeader
        title="Bulk Upload"
        subtitle="Import data from spreadsheet files"
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Bulk Upload" },
        ]}
        actions={
          <Button variant="outline" asChild className="gap-1.5">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
          </Button>
        }
      />

      {/* Step indicators */}
      <div className="flex items-center gap-6 mb-8">
        <StepIndicator step={1} label="Select & Upload" done={step > 1} active={step === 1} />
        <div className="h-px flex-1 bg-border/50" />
        <StepIndicator step={2} label="Review" done={step > 2} active={step === 2} />
        <div className="h-px flex-1 bg-border/50" />
        <StepIndicator step={3} label="Complete" active={step === 3} />
      </div>

      {/* Step 1: Select entity + file */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Entity selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Entity Type</label>
                <Select value={entity} onValueChange={(v) => { setEntity(v as EntityType); setFile(null); }}>
                  <SelectTrigger className="max-w-sm">
                    <SelectValue placeholder="Select what to upload..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File input */}
              {entity && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">File</label>
                  <div
                    className={cn(
                      "flex flex-col items-center justify-center rounded-card border-2 border-dashed p-8 transition-colors",
                      file
                        ? "border-success/50 bg-success/5"
                        : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    {file ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileSpreadsheet className="h-10 w-10 text-success" />
                        <p className="text-sm font-medium text-foreground">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                          className="mt-1"
                        >
                          Remove file
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground mb-3">
                          Drag & drop or click to select a file
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".xlsx,.csv"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Choose file
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Expected format help */}
              {entity && columns && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFormatHelp(!showFormatHelp)}
                    className="gap-1.5 text-muted-foreground"
                  >
                    <Info className="h-4 w-4" />
                    {showFormatHelp ? "Hide" : "Show"} expected format
                  </Button>
                  {showFormatHelp && (
                    <div className="rounded-card bg-muted/30 border border-border/50 p-4 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Required columns</p>
                        <div className="flex flex-wrap gap-1.5">
                          {columns.required.map((col) => (
                            <span key={col} className="text-xs font-medium px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">Optional columns</p>
                        <div className="flex flex-wrap gap-1.5">
                          {columns.optional.map((col) => (
                            <span key={col} className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                              {col}
                            </span>
                          ))}
                        </div>
                      </div>
                      {entity === "competencies" && (
                        <p className="text-xs text-muted-foreground">
                          Category must be one of: <span className="font-medium">technical, soft_skills, safety, regulatory, process</span>
                        </p>
                      )}
                      {entity === "employees" && (
                        <p className="text-xs text-muted-foreground">
                          Format dates as <span className="font-medium">YYYY-MM-DD</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Validate button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleValidate}
                  disabled={!entity || !file || uploadMutation.isPending}
                  className="gap-1.5"
                >
                  {uploadMutation.isPending ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  Validate
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Review results */}
      {step === 2 && hasResult && (
        <div className="space-y-6 animate-fade-in">
          {/* Summary */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    {getEntityLabel(entity as EntityType)} Upload — Validation Results
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {result.total_rows} row(s) in file
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-success tabular-nums">{result.success_count}</p>
                    <p className="text-[10px] text-muted-foreground">Valid</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-2xl font-bold tabular-nums", hasErrors ? "text-destructive" : "text-muted-foreground")}>
                      {result.error_count}
                    </p>
                    <p className="text-[10px] text-muted-foreground">Errors</p>
                  </div>
                </div>
              </div>

              {!hasErrors && (
                <Alert className="mt-4 border-success/20 bg-success/5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <AlertDescription className="text-xs text-success">
                    All {result.success_count} rows validated successfully. Ready to import.
                  </AlertDescription>
                </Alert>
              )}

              {hasErrors && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    {result.error_count} row(s) have errors. Fix them in your file and re-upload, or proceed to import only valid rows.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Errors table */}
          {hasErrors && result.errors.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-sm font-semibold text-foreground mb-4">Errors</h4>
                <div className="max-h-80 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead className="w-40">Field</TableHead>
                        <TableHead>Message</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.errors.map((err, i) => (
                        <TableRow key={i}>
                          <TableCell className="tabular-nums font-medium">{err.row}</TableCell>
                          <TableCell>
                            {err.field ? (
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {err.field}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">{err.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview table */}
          {result.preview.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h4 className="text-sm font-semibold text-foreground mb-4">Preview (first 5 rows)</h4>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(result.preview[0]).map((key) => (
                          <TableHead key={key} className="whitespace-nowrap capitalize">
                            {key.replace(/_/g, " ")}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.preview.slice(0, 5).map((row, i) => (
                        <TableRow key={i}>
                          {Object.values(row).map((val, j) => (
                            <TableCell key={j} className="text-sm whitespace-nowrap">
                              {val === null ? <span className="text-muted-foreground">—</span> : String(val)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => { setStep(1); setResult(null); }} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleImport}
              disabled={uploadMutation.isPending}
              className="gap-1.5"
            >
              {uploadMutation.isPending ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Import{hasErrors ? ` (${result.success_count} valid rows)` : ""}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Complete */}
      {step === 3 && hasResult && (
        <div className="space-y-6 animate-fade-in">
          <Card>
            <CardContent className="p-8 text-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
              <h3 className="text-lg font-semibold text-foreground">Import Complete</h3>
              <p className="text-sm text-muted-foreground">
                {result.created_ids.length} {getEntityLabel(entity as EntityType).toLowerCase()}(s) imported successfully.
              </p>

              {/* Progress bar */}
              <Progress value={100} className="h-2 max-w-xs mx-auto" />

              <div className="flex items-center justify-center gap-3 pt-4">
                <Button variant="outline" onClick={reset} className="gap-1.5">
                  <RotateCcw className="h-4 w-4" /> Upload Another
                </Button>
                <Button asChild className="gap-1.5">
                  <Link to={`/${entity}`}>
                    View {ENTITY_OPTIONS.find((o) => o.value === entity)?.label}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppLayout>
  );
}
