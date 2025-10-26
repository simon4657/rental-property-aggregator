import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Building2, Download, Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Scraper() {
  const { user, loading: authLoading } = useAuth();
  const [selectedSources, setSelectedSources] = useState<("591" | "sinyi" | "yungching")[]>([
    "591",
    "sinyi",
    "yungching",
  ]);
  const [csvData, setCsvData] = useState("");
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: number;
    errorMessages: string[];
  } | null>(null);

  const utils = trpc.useUtils();

  const scraperMutation = trpc.scraper.runScraper.useMutation({
    onSuccess: (result) => {
      utils.properties.list.invalidate();
      toast.success(`爬蟲完成！新增 ${result.new} 筆，重複 ${result.duplicate} 筆`);
    },
    onError: (error) => {
      toast.error(`爬蟲失敗：${error.message}`);
    },
  });

  const importMutation = trpc.scraper.importCSV.useMutation({
    onSuccess: (result) => {
      utils.properties.list.invalidate();
      setImportResult(result);
      if (result.success > 0) {
        toast.success(`成功匯入 ${result.success} 筆資料`);
      }
      if (result.errors > 0) {
        toast.error(`${result.errors} 筆資料匯入失敗`);
      }
    },
    onError: (error) => {
      toast.error(`匯入失敗：${error.message}`);
    },
  });

  const handleSourceToggle = (source: "591" | "sinyi" | "yungching") => {
    setSelectedSources((prev) =>
      prev.includes(source) ? prev.filter((s) => s !== source) : [...prev, source]
    );
  };

  const handleRunScraper = () => {
    if (selectedSources.length === 0) {
      toast.error("請至少選擇一個資料來源");
      return;
    }
    scraperMutation.mutate({ sources: selectedSources });
  };

  const handleImportCSV = () => {
    if (!csvData.trim()) {
      toast.error("請輸入 CSV 資料");
      return;
    }
    setImportResult(null);
    importMutation.mutate({ csvData });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCsvData(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const downloadTemplate = () => {
    const template = `公寓網址,地址,縣市,行政區,樓層數,租金價格,房間數,屋齡,是否有電梯,靠近捷運,來源,備註
https://example.com/property1,台北市大安區復興南路一段100號,台北市,大安區,5/12,28000,2房1廳1衛,15,是,捷運大安站,範例來源,範例備註`;
    
    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "rental_properties_template.csv";
    link.click();
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>需要登入</CardTitle>
            <CardDescription>請先登入以使用爬蟲功能</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
              登入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-900">資料抓取與匯入</h1>
                <p className="text-sm text-slate-600">從各租賃網站抓取資料或匯入 CSV 檔案</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/admin">
                <Button variant="outline">管理後台</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">返回首頁</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Web Scraper Card */}
          <Card>
            <CardHeader>
              <CardTitle>網站爬蟲</CardTitle>
              <CardDescription>從租賃網站自動抓取物件資訊</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>注意事項</AlertTitle>
                <AlertDescription>
                  由於各租賃網站有反爬蟲機制，此功能為示範框架。實際使用需要根據目標網站調整實作細節。
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                <Label>選擇資料來源</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="source-591"
                      checked={selectedSources.includes("591")}
                      onCheckedChange={() => handleSourceToggle("591")}
                    />
                    <Label htmlFor="source-591" className="cursor-pointer">
                      591 租屋網
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="source-sinyi"
                      checked={selectedSources.includes("sinyi")}
                      onCheckedChange={() => handleSourceToggle("sinyi")}
                    />
                    <Label htmlFor="source-sinyi" className="cursor-pointer">
                      信義房屋
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="source-yungching"
                      checked={selectedSources.includes("yungching")}
                      onCheckedChange={() => handleSourceToggle("yungching")}
                    />
                    <Label htmlFor="source-yungching" className="cursor-pointer">
                      永慶房仲
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleRunScraper}
                disabled={scraperMutation.isPending || selectedSources.length === 0}
                className="w-full"
              >
                {scraperMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    執行中...
                  </>
                ) : (
                  "開始抓取"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* CSV Import Card */}
          <Card>
            <CardHeader>
              <CardTitle>CSV 匯入</CardTitle>
              <CardDescription>批量匯入物件資料</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>CSV 資料</Label>
                  <Button variant="ghost" size="sm" onClick={downloadTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    下載範本
                  </Button>
                </div>
                <Textarea
                  placeholder="貼上 CSV 資料或上傳檔案..."
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={8}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">或上傳 CSV 檔案</Label>
                <div className="flex gap-2">
                  <input
                    id="file-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById("file-upload")?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    選擇檔案
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleImportCSV}
                disabled={importMutation.isPending || !csvData.trim()}
                className="w-full"
              >
                {importMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    匯入中...
                  </>
                ) : (
                  "開始匯入"
                )}
              </Button>

              {importResult && (
                <Alert variant={importResult.errors > 0 ? "destructive" : "default"}>
                  {importResult.errors > 0 ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  <AlertTitle>匯入結果</AlertTitle>
                  <AlertDescription>
                    <div className="space-y-1">
                      <p>成功：{importResult.success} 筆</p>
                      <p>失敗：{importResult.errors} 筆</p>
                      {importResult.errorMessages.length > 0 && (
                        <div className="mt-2 text-xs max-h-32 overflow-y-auto">
                          {importResult.errorMessages.map((msg, i) => (
                            <div key={i}>{msg}</div>
                          ))}
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Instructions Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>使用說明</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">CSV 格式要求</h3>
              <p className="text-sm text-slate-600 mb-2">
                CSV 檔案必須包含以下欄位（第一行為標題）：
              </p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
                <li>公寓網址（必填）</li>
                <li>地址（必填）</li>
                <li>縣市（必填）</li>
                <li>行政區（必填）</li>
                <li>租金價格（必填，數字）</li>
                <li>樓層數（選填）</li>
                <li>房間數（選填）</li>
                <li>屋齡（選填，數字）</li>
                <li>是否有電梯（選填，填「是」或「否」）</li>
                <li>靠近捷運（選填）</li>
                <li>來源（選填）</li>
                <li>備註（選填）</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">爬蟲功能說明</h3>
              <p className="text-sm text-slate-600">
                由於租賃網站通常有反爬蟲機制，此功能提供的是一個可擴展的框架。若要實際使用，需要：
              </p>
              <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside mt-2">
                <li>研究目標網站的 API 或 HTML 結構</li>
                <li>處理身份驗證、Cookie 和請求標頭</li>
                <li>實作速率限制以避免被封鎖</li>
                <li>定期維護以應對網站結構變更</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

